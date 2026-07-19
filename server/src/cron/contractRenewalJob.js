const cron = require('node-cron');
const { Op } = require('sequelize');
const { Contract, Room, User, Notification } = require('../models');

const runContractRenewalCheck = async () => {
  try {
    console.log('Running daily cron job: Checking for contracts expiring in 15 days...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + 15);
    
    const startOfTargetDate = new Date(targetDate);
    startOfTargetDate.setHours(0, 0, 0, 0);
    
    const endOfTargetDate = new Date(targetDate);
    endOfTargetDate.setHours(23, 59, 59, 999);

    const expiringContracts = await Contract.findAll({
      where: {
        status: 'active',
        is_renewed: false,
        end_date: {
          [Op.between]: [startOfTargetDate, endOfTargetDate],
        },
      },
      include: [
        { model: Room, as: 'room' },
        { model: User, as: 'tenant' },
      ],
    });

    console.log(`Found ${expiringContracts.length} contracts expiring in 15 days.`);

    for (const contract of expiringContracts) {
      const message = `Hợp đồng phòng "${contract.room?.title || contract.room_id}" của bạn sẽ hết hạn sau 15 ngày nữa (${contract.end_date.toLocaleDateString('vi-VN')}). Bạn có muốn gia hạn hợp đồng không? Hãy vào mục Hợp đồng để yêu cầu gia hạn.`;

      const notification = await Notification.create({
        user_id: contract.tenant_id,
        title: 'Sắp hết hạn hợp đồng',
        message: message,
        notification_type: 'contract_expiring',
        related_id: contract.contract_id,
      });

      if (global.io) {
        global.io.to(`user_${contract.tenant_id}`).emit('new_notification', {
          id: notification.notification_id,
          title: notification.title,
          message: notification.message,
          type: notification.notification_type,
          isRead: false,
          createdAt: notification.created_at
        });
      }

    }

    await runFutureContractTransitions();

    console.log('Daily cron job finished successfully.');
  } catch (error) {
    console.error('Error running checkExpiringContracts cron job:', error);
  }
};

const runFutureContractTransitions = async () => {
  try {
    console.log('Running daily cron job: Transitioning future and expiring contracts...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Find all active contracts that have ended (end_date < today)
    const expiredContracts = await Contract.findAll({
      where: {
        status: 'active',
        end_date: {
          [Op.lt]: today
        }
      },
      include: [{ model: Room, as: 'room' }]
    });

    for (const contract of expiredContracts) {
      await contract.update({ status: 'completed' });
      console.log(`Contract ${contract.contract_number} has expired. Status updated to completed.`);

      await Notification.create({
        user_id: contract.tenant_id,
        title: 'Hợp đồng hết hạn',
        message: `Hợp đồng phòng "${contract.room?.title || contract.room_id}" của bạn đã hết hiệu lực.`,
        notification_type: 'contract',
        related_id: contract.contract_id,
      });
    }

    // 2. Find all pre-booked contracts that start today or earlier (start_date <= today)
    const futureContracts = await Contract.findAll({
      where: {
        status: 'pre_booked_active',
        start_date: {
          [Op.lte]: today
        }
      },
      include: [{ model: Room, as: 'room' }]
    });

    for (const contract of futureContracts) {
      await contract.update({ status: 'active' });
      console.log(`Pre-booked contract ${contract.contract_number} is now active.`);

      const room = contract.room;
      if (room) {
        room.status = 'rented';
        
        // Clear or update available_from if needed
        const otherFuture = await Contract.findOne({
          where: {
            room_id: room.room_id,
            status: 'pre_booked_active',
            start_date: { [Op.gt]: today }
          }
        });
        if (!otherFuture) {
          room.available_from = null;
        } else {
          room.available_from = otherFuture.end_date;
        }
        await room.save();
      }

      await Notification.create({
        user_id: contract.tenant_id,
        title: 'Hợp đồng bắt đầu hiệu lực',
        message: `Hợp đồng phòng "${room?.title || contract.room_id}" của bạn bắt đầu có hiệu lực từ hôm nay.`,
        notification_type: 'contract',
        related_id: contract.contract_id,
      });
    }
  } catch (error) {
    console.error('Error running runFutureContractTransitions cron job:', error);
  }
};

// Run every day at 00:00 (midnight)
const checkExpiringContracts = () => {
  cron.schedule('0 0 * * *', runContractRenewalCheck);
};

module.exports = { checkExpiringContracts, runContractRenewalCheck, runFutureContractTransitions };
