const cron = require('node-cron');
const { Op } = require('sequelize');
const { Contract, Room, User, Notification, RenewalRequest } = require('../models');

const runContractRenewalCheck = async () => {
  console.log('Running daily cron job: Checking for contract renewals (60-30-10 rules)...');
  await checkT60Renewals();
  await checkT30Renewals();
  await checkT10Renewals();
  await runFutureContractTransitions();
  console.log('Daily cron job finished successfully.');
};

const checkT60Renewals = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + 60); // T-60
    
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
      ],
    });

    for (const contract of expiringContracts) {
      // Check if request already exists
      const existingReq = await RenewalRequest.findOne({ where: { contract_id: contract.contract_id } });
      if (existingReq) continue;

      // Create new PENDING_INTENT request
      await RenewalRequest.create({
        contract_id: contract.contract_id,
        tenant_id: contract.tenant_id,
        landlord_id: contract.landlord_id,
        requested_duration_months: 0,
        status: 'PENDING_INTENT'
      });

      const message = `Hợp đồng phòng "${contract.room?.room_number || contract.room_id}" của bạn sẽ hết hạn sau 60 ngày nữa (${contract.end_date.toLocaleDateString('vi-VN')}). Bạn có muốn gia hạn hợp đồng không? Vui lòng xác nhận trước 30 ngày.`;
      
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
  } catch (error) {
    console.error('Error in checkT60Renewals:', error);
  }
};

const checkT30Renewals = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + 30); // T-30

    const startOfTargetDate = new Date(targetDate);
    startOfTargetDate.setHours(0, 0, 0, 0);
    const endOfTargetDate = new Date(targetDate);
    endOfTargetDate.setHours(23, 59, 59, 999);

    const pendingRequests = await RenewalRequest.findAll({
      where: { status: 'PENDING_INTENT' },
      include: [{
        model: Contract, as: 'contract',
        where: {
          status: 'active',
          end_date: {
            [Op.between]: [startOfTargetDate, endOfTargetDate],
          }
        },
        include: [{ model: Room, as: 'room' }]
      }]
    });

    for (const req of pendingRequests) {
      await req.update({ status: 'EXPIRED' });
      
      const contract = req.contract;
      const room = contract.room;
      
      if (room) {
        await room.update({ available_from: contract.end_date });
      }

      await Notification.create({
        user_id: contract.landlord_id,
        title: 'Tenant không phản hồi gia hạn',
        message: `Tenant phòng "${room?.room_number || contract.room_id}" không phản hồi gia hạn. Phòng sẽ trống vào ngày ${contract.end_date.toLocaleDateString('vi-VN')}.`,
        notification_type: 'renewal_failed',
        related_id: contract.contract_id,
      });
      await Notification.create({
        user_id: contract.tenant_id,
        title: 'Hết hạn yêu cầu gia hạn',
        message: `Bạn đã không phản hồi yêu cầu gia hạn phòng "${room?.room_number || contract.room_id}". Hợp đồng sẽ không được gia hạn.`,
        notification_type: 'renewal_failed',
        related_id: contract.contract_id,
      });
    }
  } catch (error) {
    console.error('Error in checkT30Renewals:', error);
  }
};

const checkT10Renewals = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + 10); // T-10

    const startOfTargetDate = new Date(targetDate);
    startOfTargetDate.setHours(0, 0, 0, 0);
    const endOfTargetDate = new Date(targetDate);
    endOfTargetDate.setHours(23, 59, 59, 999);

    const pendingRequests = await RenewalRequest.findAll({
      where: { 
        status: {
          [Op.in]: ['PENDING_LANDLORD', 'WAITING_TENANT_SIGN']
        }
      },
      include: [{
        model: Contract, as: 'contract',
        where: {
          status: 'active',
          end_date: {
            [Op.between]: [startOfTargetDate, endOfTargetDate],
          }
        },
        include: [{ model: Room, as: 'room' }]
      }]
    });

    for (const req of pendingRequests) {
      await req.update({ status: 'EXPIRED' });
      
      const contract = req.contract;
      const room = contract.room;
      
      if (room) {
        await room.update({ available_from: contract.end_date });
      }

      await Notification.create({
        user_id: contract.landlord_id,
        title: 'Hủy gia hạn hợp đồng',
        message: `Quá hạn ký kết gia hạn phòng "${room?.room_number || contract.room_id}". Quá trình gia hạn bị hủy.`,
        notification_type: 'renewal_failed',
        related_id: contract.contract_id,
      });
      await Notification.create({
        user_id: contract.tenant_id,
        title: 'Hủy gia hạn hợp đồng',
        message: `Quá hạn chốt hợp đồng gia hạn phòng "${room?.room_number || contract.room_id}". Quá trình gia hạn bị hủy.`,
        notification_type: 'renewal_failed',
        related_id: contract.contract_id,
      });
    }
  } catch (error) {
    console.error('Error in checkT10Renewals:', error);
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
