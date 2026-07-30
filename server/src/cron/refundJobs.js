const cron = require('node-cron');
const { Op } = require('sequelize');
const { Payment, ViewingSchedule, Room, Contract } = require('../models');

// Helper function to log job runs
const logJob = (jobName, message) => {
  console.log(`[CRON] ${jobName} - ${new Date().toISOString()}: ${message}`);
};

const initCronJobs = () => {
  // Case 1: Payment Timeout — auto-cancel after payment_deadline or 24 hours
  // Runs every 2 minutes for faster detection
  cron.schedule('*/2 * * * *', async () => {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Find contracts that are pending_payment and past 24 hours
      const expiredContracts = await Contract.findAll({
        where: {
          status: 'pending_payment',
          updated_at: { [Op.lt]: twentyFourHoursAgo }
        }
      });

      if (expiredContracts.length > 0) {
        logJob('Contract Payment Timeout (24h)', `Found ${expiredContracts.length} expired contracts pending payment.`);
        for (const contract of expiredContracts) {
          contract.status = 'cancelled';
          contract.updated_at = now;
          await contract.save();

          await Payment.update(
            { status: 'failed', updated_at: now },
            { where: { contract_id: contract.contract_id, status: 'pending' } }
          );

          await ViewingSchedule.update(
            { status: 'cancelled', updated_at: now },
            { where: { room_id: contract.room_id, tenant_id: contract.tenant_id, status: 'pending_payment' } }
          );

          await Room.update(
            { status: 'available' },
            { where: { room_id: contract.room_id } }
          );

          logJob('Contract Payment Timeout', `Cancelled contract #${contract.contract_number} and reset room #${contract.room_id} to available.`);
        }
      }
      
      // Find viewing schedules that are pending_payment and past their deadline or 24h
      const expiredSchedules = await ViewingSchedule.findAll({
        where: {
          status: 'pending_payment',
          [Op.or]: [
            { payment_deadline: { [Op.lt]: now } },
            { updated_at: { [Op.lt]: twentyFourHoursAgo } }
          ]
        }
      });

      if (expiredSchedules.length > 0) {
        logJob('Payment Timeout', `Found ${expiredSchedules.length} expired viewing schedules.`);
        
        for (const schedule of expiredSchedules) {
          // Cancel the viewing schedule
          schedule.status = 'cancelled';
          schedule.updated_at = now;
          await schedule.save();
          
          // Cancel any pending payments for this schedule
          await Payment.update(
            { status: 'failed', updated_at: now },
            { where: { viewing_schedule_id: schedule.schedule_id, status: 'pending' } }
          );

          // Revert room status to available
          await Room.update(
            { status: 'available' },
            { where: { room_id: schedule.room_id } }
          );

          logJob('Payment Timeout', `Cancelled schedule #${schedule.schedule_id} and associated payments.`);
        }
      }

      // Also check for orphan pending payments without viewing schedules
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
      const expiredPayments = await Payment.findAll({
        where: {
          status: 'pending',
          created_at: { [Op.lt]: fifteenMinsAgo },
          viewing_schedule_id: { [Op.not]: null }
        }
      });

      if (expiredPayments.length > 0) {
        logJob('Payment Timeout (orphan)', `Found ${expiredPayments.length} expired payments.`);
        
        for (const payment of expiredPayments) {
          payment.status = 'failed';
          await payment.save();
          
          await ViewingSchedule.update(
            { status: 'cancelled' },
            { where: { schedule_id: payment.viewing_schedule_id, status: 'pending_payment' } }
          );
          
          await Room.update(
            { status: 'available' },
            { where: { room_id: payment.room_id } }
          );
        }
      }
    } catch (error) {
      console.error('[CRON Error] Payment Timeout:', error);
    }
  });

  // Case 2: Landlord Timeout (24 hours no response)
  // Runs every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const timeoutSchedules = await ViewingSchedule.findAll({
        where: {
          status: 'pending_landlord_confirmation',
          created_at: { [Op.lt]: twentyFourHoursAgo }
        }
      });

      if (timeoutSchedules.length > 0) {
        logJob('Landlord Timeout', `Found ${timeoutSchedules.length} timeout schedules.`);
        
        for (const schedule of timeoutSchedules) {
          schedule.status = 'rejected';
          await schedule.save();

          // Find associated completed payment and refund 100%
          const payment = await Payment.findOne({
            where: { viewing_schedule_id: schedule.schedule_id, status: 'completed' }
          });
          
          if (payment) {
            payment.status = 'refunded';
            payment.refund_amount = payment.amount;
            payment.platform_fee = 0;
            payment.net_amount = 0;
            await payment.save();
          }
        }
      }
    } catch (error) {
      console.error('[CRON Error] Landlord Timeout:', error);
    }
  });

  // Case 3: Tenant No-show (72 hours after scheduled_date without landlord action)
  // Runs every hour at minute 30
  cron.schedule('30 * * * *', async () => {
    try {
      const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
      
      // Auto-expire scheduled viewings where the date has long passed
      const noShowSchedules = await ViewingSchedule.findAll({
        where: {
          status: 'scheduled',
          scheduled_date: { [Op.lt]: seventyTwoHoursAgo }
        }
      });

      if (noShowSchedules.length > 0) {
        logJob('Auto-Expire', `Found ${noShowSchedules.length} unresolved schedules past 72h.`);
        
        for (const schedule of noShowSchedules) {
          schedule.status = 'expired';
          await schedule.save();

          // 50% refund to tenant, 45% to landlord, 5% platform
          const payment = await Payment.findOne({
            where: { viewing_schedule_id: schedule.schedule_id, status: 'completed' }
          });
          
          if (payment) {
            const total = parseFloat(payment.amount);
            payment.status = 'refunded';
            payment.refund_amount = total * 0.50;
            payment.net_amount = total * 0.45;
            payment.platform_fee = total * 0.05;
            await payment.save();
          }
        }
      }
    } catch (error) {
      console.error('[CRON Error] Auto-Expire:', error);
    }
  });

  logJob('Init', 'All refund CRON jobs have been initialized.');
};

module.exports = initCronJobs;
