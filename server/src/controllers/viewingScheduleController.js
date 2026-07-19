const { Op } = require('sequelize');
const { ViewingSchedule, Room, User, Notification, Payment, Contract, OtpVerification } = require('../models');
const generateOtp = require('../utils/generateOtp');
const { sendOtpEmail, sendContractEmail } = require('../utils/sendEmail');
const crypto = require('crypto');
const vnp_TmnCode = process.env.VNP_TMN_CODE || '98KLJQXT';
const vnp_HashSecret = process.env.VNP_HASH_SECRET || '7HVTWYRFWK4H9EMWOLX9R7GH8VXKGKI8';
const vnp_Url = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const vnp_ReturnUrl = process.env.VNP_RETURN_URL || 'http://localhost:5173/tenant/payment/return';

const PAYMENT_TIMEOUT_MINUTES = 15; // Auto-cancel after 15 minutes
const PLATFORM_FEE_RATE = 0.05; // 5% commission

function sortObject(obj) {
  let sorted = {};
  let str = [];
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (let key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[decodeURIComponent(str[key])]).replace(/%20/g, "+");
  }
  return sorted;
}

function generateVnpayUrl(payment, ipAddr, roomId) {
  let date = new Date();
  const createDate = date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0') +
    date.getHours().toString().padStart(2, '0') +
    date.getMinutes().toString().padStart(2, '0') +
    date.getSeconds().toString().padStart(2, '0');

  let orderId = payment.payment_id.toString();

  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
  vnp_Params['vnp_Amount'] = Math.round(parseFloat(payment.amount)) * 100;
  vnp_Params['vnp_BankCode'] = 'NCB';
  vnp_Params['vnp_CreateDate'] = createDate;
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_IpAddr'] = ipAddr === '::1' ? '127.0.0.1' : ipAddr;
  vnp_Params['vnp_Locale'] = 'vn';
  vnp_Params['vnp_OrderInfo'] = 'Dat coc xem phong ' + roomId;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
  vnp_Params['vnp_TxnRef'] = orderId;

  vnp_Params = sortObject(vnp_Params);

  let signData = Object.keys(vnp_Params).map(key => `${key}=${vnp_Params[key]}`).join('&');
  let hmac = crypto.createHmac("sha512", vnp_HashSecret);
  let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
  vnp_Params['vnp_SecureHash'] = signed;
  let vnpUrl = vnp_Url + '?' + Object.keys(vnp_Params).map(key => `${key}=${vnp_Params[key]}`).join('&');

  return vnpUrl;
}

// =========================================================
// POST /api/landlord/viewing-schedules
// Create viewing schedule (by landlord)
// =========================================================
const createViewingSchedule = async (req, res, next) => {
  try {
    const { roomId, tenantId, scheduledDate, notes } = req.body;
    const landlordId = req.user.userId;

    if (!roomId || !tenantId || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Room ID, tenant ID, and scheduled date are required.',
      });
    }

    const room = await Room.findOne({
      where: { room_id: roomId, landlord_id: landlordId, is_deleted: false },
    });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    const tenant = await User.findOne({
      where: { user_id: tenantId, is_deleted: false },
    });

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }

    const schedule = await ViewingSchedule.create({
      room_id: roomId,
      tenant_id: tenantId,
      landlord_id: landlordId,
      scheduled_date: new Date(scheduledDate),
      status: 'scheduled',
      notes: notes || null,
    });

    await Notification.create({
      user_id: tenantId,
      title: 'Viewing Schedule Created',
      message: `A viewing has been scheduled for ${room.title}`,
      notification_type: 'viewing_schedule',
      related_id: schedule.schedule_id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${tenantId}`).emit('new_notification', {
        title: 'Viewing Schedule Created',
        message: `A viewing has been scheduled for ${room.title}`,
        type: 'viewing_schedule'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Viewing schedule created successfully!',
      data: {
        scheduleId: schedule.schedule_id,
        roomId: schedule.room_id,
        scheduledDate: schedule.scheduled_date,
        status: schedule.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/landlord/viewing-schedules
// Get all viewing schedules for landlord
// =========================================================
const getLandlordViewingSchedules = async (req, res, next) => {
  try {
    const landlordId = req.user.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const { Op } = require('sequelize');
    const where = {
      landlord_id: landlordId,
      status: { [Op.ne]: 'pending_payment' }
    };
    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { RoomImage } = require('../models');

    const { count, rows } = await ViewingSchedule.findAndCountAll({
      where,
      include: [
        {
          model: Room,
          as: 'room',
          attributes: ['room_id', 'title', 'address', 'ward', 'district', 'city', 'price_per_month', 'room_number'],
          include: [
            { model: RoomImage, as: 'images', attributes: ['image_url', 'is_primary'] }
          ]
        },
        { model: User, as: 'tenant', attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url'] },
      ],
      offset,
      limit: parseInt(limit),
      order: [['scheduled_date', 'ASC']],
    });

    const { Contract } = require('../models');

    const enhancedRows = await Promise.all(rows.map(async (schedule) => {
      let draftContract = null;
      if (schedule.status === 'contract_requested') {
        draftContract = await Contract.findOne({
          where: { room_id: schedule.room_id, tenant_id: schedule.tenant_id, status: 'draft' },
          attributes: ['start_date', 'end_date', 'monthly_rent']
        });
      }

      if (schedule.status === 'pending' && new Date(schedule.scheduled_date) < new Date()) {
        schedule.status = 'expired';
        schedule.notes = (schedule.notes ? schedule.notes + '\n' : '') + '[SYSTEM]: Viewing schedule expired due to no response from landlord.';
        await schedule.save();
      }

      return {
        scheduleId: schedule.schedule_id,
        roomId: schedule.room_id,
        tenantId: schedule.tenant_id,
        scheduledDate: schedule.scheduled_date,
        status: schedule.status,
        depositAmount: schedule.deposit_amount || (schedule.room ? schedule.room.price_per_month * 0.1 : 0),
        tenantDecision: schedule.tenant_decision,
        notes: schedule.notes,
        disputeReason: schedule.dispute_reason,
        room: schedule.room,
        tenant: schedule.tenant,
        createdAt: schedule.created_at,
        draftContract: draftContract
      };
    }));

    return res.status(200).json({
      success: true,
      data: enhancedRows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/landlord/viewing-schedules/:scheduleId
// Get viewing schedule details
// =========================================================
const getViewingScheduleDetails = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const landlordId = req.user.userId;

    const schedule = await ViewingSchedule.findOne({
      where: { schedule_id: scheduleId, landlord_id: landlordId },
      include: [
        { model: Room, as: 'room', attributes: ['room_id', 'title', 'address', 'price_per_month'] },
        { model: User, as: 'tenant', attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url'] },
      ],
    });

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Viewing schedule not found.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        scheduleId: schedule.schedule_id,
        roomId: schedule.room_id,
        tenantId: schedule.tenant_id,
        scheduledDate: schedule.scheduled_date,
        status: schedule.status,
        depositAmount: schedule.deposit_amount,
        tenantDecision: schedule.tenant_decision,
        notes: schedule.notes,
        disputeReason: schedule.dispute_reason,
        room: schedule.room,
        tenant: schedule.tenant,
        createdAt: schedule.created_at,
        updatedAt: schedule.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/landlord/viewing-schedules/:scheduleId
// Update viewing schedule status
// =========================================================
const updateViewingSchedule = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const { scheduledDate, status, notes } = req.body;
    const landlordId = req.user.userId;

    const schedule = await ViewingSchedule.findOne({
      where: { schedule_id: scheduleId, landlord_id: landlordId },
    });

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Viewing schedule not found.' });
    }

    if (scheduledDate) schedule.scheduled_date = new Date(scheduledDate);
    if (notes !== undefined) schedule.notes = notes;

    if (status) {
      schedule.status = status;

      // Landlord rejects or cancels - refund deposit and make room available again
      if (status === 'rejected' || status === 'cancelled') {
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

        // Restore room status to available
        if (schedule.room_id) {
          await Room.update({ status: 'available' }, { where: { room_id: schedule.room_id } });
        }
      }
    }

    schedule.updated_at = new Date();
    await schedule.save();

    // Notify tenant about status change
    if (status) {
      let statusTitle = 'Viewing Schedule Updated';
      let statusMessage = `Your viewing schedule status has been updated to ${status}.`;

      if (status === 'rejected') {
        statusTitle = 'Viewing Request Rejected';
        statusMessage = `Your viewing request has been rejected by the landlord.`;
      } else if (status === 'scheduled') {
        statusTitle = 'Viewing Request Approved';
        statusMessage = `Your viewing request has been approved and scheduled.`;
      } else if (status === 'cancelled') {
        statusTitle = 'Viewing Schedule Cancelled';
        statusMessage = `Your viewing schedule has been cancelled by the landlord.`;
      }

      await Notification.create({
        user_id: schedule.tenant_id,
        title: statusTitle,
        message: statusMessage,
        notification_type: 'viewing_schedule',
        related_id: schedule.schedule_id,
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user_${schedule.tenant_id}`).emit('new_notification', {
          title: statusTitle,
          message: statusMessage,
          type: 'viewing_schedule'
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Viewing schedule updated successfully!',
      data: {
        scheduleId: schedule.schedule_id,
        status: schedule.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/landlord/viewing-schedules/:scheduleId/confirm-viewing
// Landlord confirms that tenant has visited the room
// =========================================================
const confirmViewing = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const landlordId = req.user.userId;

    const schedule = await ViewingSchedule.findOne({
      where: { schedule_id: scheduleId, landlord_id: landlordId },
      include: [{ model: Room, as: 'room' }],
    });

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Viewing schedule not found.' });
    }

    if (schedule.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm viewing. Current status: ${schedule.status}. Only "scheduled" viewings can be confirmed.`
      });
    }

    schedule.status = 'confirmed';
    schedule.tenant_decision = 'pending';
    schedule.updated_at = new Date();
    await schedule.save();

    // Notify tenant
    await Notification.create({
      user_id: schedule.tenant_id,
      title: 'Viewing Confirmed',
      message: `Chủ nhà đã xác nhận bạn tới xem phòng "${schedule.room.title}". Bạn có muốn gửi yêu cầu thuê phòng này không?`,
      notification_type: 'viewing_confirmed',
      related_id: schedule.schedule_id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${schedule.tenant_id}`).emit('new_notification', {
        title: 'Viewing Confirmed',
        message: `Chủ nhà đã xác nhận bạn tới xem phòng "${schedule.room.title}". Bạn có muốn gửi yêu cầu thuê phòng này không?`,
        type: 'viewing_confirmed'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Tenant viewing confirmed! They can now decide to proceed with renting.',
      data: { scheduleId: schedule.schedule_id, status: schedule.status },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/landlord/viewing-schedules/:scheduleId/no-show
// Landlord marks tenant as no-show — tenant loses deposit
// =========================================================
const markNoShow = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const landlordId = req.user.userId;

    const schedule = await ViewingSchedule.findOne({
      where: { schedule_id: scheduleId, landlord_id: landlordId },
      include: [{ model: Room, as: 'room' }],
    });

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Viewing schedule not found.' });
    }

    if (schedule.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: `Cannot mark as no-show. Current status: ${schedule.status}.`
      });
    }

    schedule.status = 'no_show';
    schedule.updated_at = new Date();
    await schedule.save();

    // Notify tenant
    await Notification.create({
      user_id: schedule.tenant_id,
      title: 'No-Show Recorded',
      message: `You did not attend the viewing for "${schedule.room.title}".`,
      notification_type: 'viewing_schedule',
      related_id: schedule.schedule_id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${schedule.tenant_id}`).emit('new_notification', {
        title: 'No-Show Recorded',
        message: `You did not attend the viewing for "${schedule.room.title}".`,
        type: 'viewing_schedule'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Tenant marked as no-show.',
      data: { scheduleId: schedule.schedule_id, status: schedule.status },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// DELETE /api/landlord/viewing-schedules/:scheduleId
// Delete viewing schedule
// =========================================================
const deleteViewingSchedule = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const landlordId = req.user.userId;

    const schedule = await ViewingSchedule.findOne({
      where: { schedule_id: scheduleId, landlord_id: landlordId },
      include: [{ model: User, as: 'tenant' }],
    });

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Viewing schedule not found.' });
    }

    await schedule.destroy();

    // Revert room status to available
    const room = await Room.findByPk(schedule.room_id);
    if (room && room.status === 'unavailable') {
      await room.update({ status: 'available' });
    }

    await Notification.create({
      user_id: schedule.tenant_id,
      title: 'Viewing Schedule Cancelled',
      message: 'A viewing schedule has been cancelled',
      notification_type: 'viewing_schedule',
      related_id: schedule.schedule_id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${schedule.tenant_id}`).emit('new_notification', {
        title: 'Viewing Schedule Cancelled',
        message: 'A viewing schedule has been cancelled',
        type: 'viewing_schedule'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Viewing schedule deleted successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/tenant/viewing-schedules
// Get all viewing schedules for tenant
// =========================================================
const getTenantViewingSchedules = async (req, res, next) => {
  try {
    const tenantId = req.user.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { tenant_id: tenantId };
    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const { RoomImage } = require('../models');

    const { count, rows } = await ViewingSchedule.findAndCountAll({
      where,
      include: [
        {
          model: Room,
          as: 'room',
          attributes: ['room_id', 'title', 'address', 'ward', 'district', 'city', 'price_per_month'],
          include: [
            { model: RoomImage, as: 'images', attributes: ['image_url', 'is_primary'] }
          ]
        },
        { model: User, as: 'landlordSchedule', attributes: ['user_id', 'full_name', 'email', 'phone'] },
        { model: Payment, as: 'payments', attributes: ['payment_id', 'amount', 'status', 'payment_type'], required: false },
      ],
      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
    });

    const enhancedRows = await Promise.all(rows.map(async (schedule) => {
      if (schedule.status === 'pending' && new Date(schedule.scheduled_date) < new Date()) {
        schedule.status = 'expired';
        schedule.notes = (schedule.notes ? schedule.notes + '\n' : '') + '[SYSTEM]: Viewing schedule expired due to no response from landlord.';
        await schedule.save();
      }
      return {
        scheduleId: schedule.schedule_id,
        roomId: schedule.room_id,
        landlordId: schedule.landlord_id,
        scheduledDate: schedule.scheduled_date,
        status: schedule.status,
        depositAmount: schedule.deposit_amount || (schedule.room ? schedule.room.price_per_month * 0.1 : 0),
        tenantDecision: schedule.tenant_decision,
        paymentDeadline: schedule.payment_deadline,
        notes: schedule.notes,
        disputeReason: schedule.dispute_reason,
        room: schedule.room,
        landlord: schedule.landlordSchedule,
        payments: schedule.payments,
        createdAt: schedule.created_at,
      };
    }));

    return res.status(200).json({
      success: true,
      data: enhancedRows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/tenant/viewing-schedules
// Tenant requests a viewing schedule — deposit = 10% room price
// =========================================================
const requestViewing = async (req, res, next) => {
  try {
    const { roomId, scheduledDate, notes } = req.body;
    const tenantId = req.user.userId;

    // Verify tenant has a phone number
    const tenant = await User.findByPk(tenantId);
    if (!tenant || !tenant.phone) {
      return res.status(400).json({
        success: false,
        message: 'Bạn phải cập nhật số điện thoại trong trang cá nhân trước khi đặt lịch xem phòng.'
      });
    }

    if (!roomId || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Room ID and scheduled date are required.',
      });
    }

    const room = await Room.findOne({
      where: { room_id: roomId, is_deleted: false },
    });

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found.' });
    }

    // Check if room is available
    if (room.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'This room is not available for viewing.'
      });
    }

    const existingSchedule = await ViewingSchedule.findOne({
      where: {
        room_id: roomId,
        tenant_id: tenantId,
        status: { [Op.in]: ['pending', 'pending_payment', 'scheduled'] },
      },
    });

    if (existingSchedule) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active viewing request for this room.'
      });
    }

    const schedule = await ViewingSchedule.create({
      room_id: roomId,
      tenant_id: tenantId,
      landlord_id: room.landlord_id,
      scheduled_date: new Date(scheduledDate),
      status: 'pending',
      deposit_amount: 0,
      payment_deadline: null,
      notes: notes || null,
    });

    await Notification.create({
      user_id: room.landlord_id,
      title: 'New Viewing Request',
      message: `A tenant has requested a viewing for "${room.title}".`,
      notification_type: 'viewing_schedule',
      related_id: schedule.schedule_id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${room.landlord_id}`).emit('new_notification', {
        title: 'New Viewing Request',
        message: `A tenant has requested a viewing for "${room.title}".`,
        type: 'viewing_schedule'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Viewing request created successfully! Waiting for landlord approval.',
      data: {
        scheduleId: schedule.schedule_id,
        status: schedule.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/tenant/viewing-schedules/:scheduleId/pay
// Tenant retries payment for a pending_payment schedule
// =========================================================
const retryPayment = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const tenantId = req.user.userId;

    const schedule = await ViewingSchedule.findOne({
      where: { schedule_id: scheduleId, tenant_id: tenantId },
      include: [{ model: Room, as: 'room' }],
    });

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Viewing schedule not found.' });
    }

    if (schedule.status !== 'pending_payment') {
      return res.status(400).json({
        success: false,
        message: 'This schedule is not awaiting payment.'
      });
    }

    // Check if deadline has passed
    if (schedule.payment_deadline && new Date() > new Date(schedule.payment_deadline)) {
      return res.status(400).json({
        success: false,
        message: 'Payment deadline has expired. Please create a new viewing request.'
      });
    }

    // Find existing pending payment or create new one
    let payment = await Payment.findOne({
      where: {
        viewing_schedule_id: schedule.schedule_id,
        tenant_id: tenantId,
        status: 'pending'
      }
    });

    if (!payment) {
      payment = await Payment.create({
        room_id: schedule.room_id,
        tenant_id: tenantId,
        landlord_id: schedule.landlord_id,
        viewing_schedule_id: schedule.schedule_id,
        amount: schedule.deposit_amount,
        payment_type: 'viewing_deposit',
        payment_method: 'vnpay',
        status: 'pending',
        due_date: schedule.payment_deadline,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    const ipAddr = req.headers['x-forwarded-for'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      (req.connection?.socket ? req.connection.socket.remoteAddress : '127.0.0.1');

    const vnpUrl = generateVnpayUrl(payment, ipAddr, schedule.room_id);

    return res.status(200).json({
      success: true,
      message: 'Redirecting to payment...',
      url: vnpUrl,
      data: {
        scheduleId: schedule.schedule_id,
        paymentId: payment.payment_id,
        amount: schedule.deposit_amount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/tenant/viewing-schedules/:scheduleId/request-contract
// Tenant likes the room after viewing → request contract
// =========================================================
const requestContract = async (req, res, next) => {
  try {
    return res.status(400).json({
      success: false,
      message: 'Tạo hợp đồng chỉ được phép sau khi yêu cầu thuê phòng đã được phê duyệt. Vui lòng gửi yêu cầu thuê phòng trước.'
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/tenant/viewing-schedules/:scheduleId/dispute
// Tenant reports an issue with the room after viewing
// =========================================================
const disputeViewingSchedule = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const tenantId = req.user.userId;
    const { reason } = req.body;

    const schedule = await ViewingSchedule.findOne({
      where: { schedule_id: scheduleId, tenant_id: tenantId },
    });

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Viewing schedule not found.' });
    }

    if (schedule.status !== 'confirmed' && schedule.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed or completed viewing schedules can be disputed.',
      });
    }

    schedule.status = 'disputed';
    schedule.tenant_decision = 'disputed';
    schedule.dispute_reason = reason || 'No reason provided';
    schedule.updated_at = new Date();
    await schedule.save();

    // Notify admin (user_id=1 assumed admin)
    // Also notify landlord
    await Notification.create({
      user_id: schedule.landlord_id,
      title: 'Viewing Dispute',
      message: `Tenant has disputed the viewing. Reason: ${reason || 'Not provided'}. Admin will review.`,
      notification_type: 'viewing_schedule',
      related_id: schedule.schedule_id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${schedule.landlord_id}`).emit('new_notification', {
        title: 'Viewing Dispute',
        message: `Tenant has disputed the viewing. Reason: ${reason || 'Not provided'}. Admin will review.`,
        type: 'viewing_schedule'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Dispute submitted successfully. Admin will review the case.',
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/tenant/viewing-schedules/:scheduleId/cancel
// Tenant cancels the viewing schedule before viewing
// =========================================================
const cancelViewingScheduleTenant = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const tenantId = req.user.userId;

    const schedule = await ViewingSchedule.findOne({
      where: { schedule_id: scheduleId, tenant_id: tenantId },
      include: [{ model: Room, as: 'room' }]
    });

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Viewing schedule not found.' });
    }

    if (schedule.status !== 'pending_payment' && schedule.status !== 'pending' && schedule.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'You can only cancel schedules that are pending or scheduled.',
      });
    }

    schedule.status = 'cancelled';
    schedule.updated_at = new Date();
    await schedule.save();

    // Notify landlord
    const Notification = require('../models').Notification;
    await Notification.create({
      user_id: schedule.landlord_id,
      title: 'Viewing Schedule Cancelled',
      message: `Tenant has cancelled the viewing for "${schedule.room.title}".`,
      notification_type: 'viewing_schedule',
      related_id: schedule.schedule_id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${schedule.landlord_id}`).emit('new_notification', {
        title: 'Viewing Schedule Cancelled',
        message: `Tenant has cancelled the viewing for "${schedule.room.title}".`,
        type: 'viewing_schedule'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Viewing schedule cancelled successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/tenant/viewing-schedules/:scheduleId/decline
// Tenant declines to rent after viewing
// =========================================================
const declineViewingScheduleTenant = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const tenantId = req.user.userId;

    const schedule = await ViewingSchedule.findOne({
      where: { schedule_id: scheduleId, tenant_id: tenantId },
      include: [{ model: Room, as: 'room' }]
    });

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Viewing schedule not found.' });
    }

    if (schedule.status !== 'confirmed' && schedule.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only decline to rent after the viewing is confirmed or completed by landlord.',
      });
    }

    schedule.status = 'completed';
    schedule.tenant_decision = 'rejected';
    schedule.updated_at = new Date();
    await schedule.save();

    // Notify landlord
    const Notification = require('../models').Notification;
    await Notification.create({
      user_id: schedule.landlord_id,
      title: 'Tenant Declined to Rent',
      message: `Tenant has decided not to rent "${schedule.room.title}" after viewing.`,
      notification_type: 'viewing_schedule',
      related_id: schedule.schedule_id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${schedule.landlord_id}`).emit('new_notification', {
        title: 'Tenant Declined to Rent',
        message: `Tenant has decided not to rent "${schedule.room.title}" after viewing.`,
        type: 'viewing_schedule'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'You have declined to rent the room. Feedback sent to landlord.',
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/landlord/viewing-schedules/:scheduleId/create-contract
// Landlord creates contract after tenant requests it
// =========================================================
const createContractFromViewing = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const landlordId = req.user.userId;

    // Verify landlord's identity is verified
    const landlord = await User.findOne({
      where: { user_id: landlordId, is_deleted: false }
    });

    if (!landlord || landlord.verification_status !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Bạn phải xác thực căn cước công dân trước khi có thể tạo hợp đồng.'
      });
    }
    const {
      startDate,
      endDate,
      monthlyRent,
      termsAndConditions,
      landlordName,
      landlordIc,
      landlordIcIssueDate,
      landlordIcIssuePlace,
      landlordPermanentAddress,
      landlordSignature,
      assignedRoomNumber
    } = req.body;

    const schedule = await ViewingSchedule.findOne({
      where: { schedule_id: scheduleId, landlord_id: landlordId },
      include: [{ model: Room, as: 'room' }],
    });

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Viewing schedule not found.' });
    }

    if (schedule.status !== 'contract_requested') {
      return res.status(400).json({
        success: false,
        message: 'Tenant has not requested a contract for this viewing.',
      });
    }

    if (!assignedRoomNumber) {
      return res.status(400).json({ success: false, message: 'Please assign a physical room number for this contract.' });
    }

    if (schedule.room.available_quantity !== null && schedule.room.available_quantity <= 0) {
      return res.status(400).json({ success: false, message: 'This room type is out of stock.' });
    }

    if (!startDate && !termsAndConditions) { // keep some fallback for legacy requests if needed, but we'll enforce finding the draft contract.
      // actually let's just find the draft contract directly
    }

    const { Contract } = require('../models');

    // Find the draft contract created by the tenant
    let contract = await Contract.findOne({
      where: { room_id: schedule.room_id, tenant_id: schedule.tenant_id, status: 'draft' }
    });

    if (!contract) {
      // Legacy fallback in case there's no draft
      // Legacy fallback in case there's no draft
      let start = startDate ? new Date(startDate) : new Date();
      let end = endDate ? new Date(endDate) : new Date();
      if (!endDate) {
        end.setMonth(end.getMonth() + 6); // default 6 months
      }
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

      let signatureUrl = landlordSignature;
      if (landlordSignature && landlordSignature.startsWith('data:image') && process.env.CLOUDINARY_URL) {
        try {
          const { cloudinary } = require('../config/cloudinary');
          const uploadResponse = await cloudinary.uploader.upload(landlordSignature, {
            folder: 'signatures',
          });
          signatureUrl = uploadResponse.secure_url;
        } catch (error) {
          console.error("Cloudinary upload failed for signature, falling back to base64", error);
        }
      }

      contract = await Contract.create({
        room_id: schedule.room_id,
        tenant_id: schedule.tenant_id,
        landlord_id: landlordId,
        contract_number: `CT-${timestamp}-${random}`,
        start_date: start,
        end_date: end,
        monthly_rent: monthlyRent || schedule.room.price_per_month,
        deposit_amount: schedule.deposit_amount,
        status: 'pending_signature',
        terms_and_conditions: termsAndConditions || null,
        landlord_name: landlordName,
        landlord_ic: landlordIc,
        landlord_ic_issue_date: landlordIcIssueDate || null,
        landlord_ic_issue_place: landlordIcIssuePlace,
        landlord_permanent_address: landlordPermanentAddress,
        landlord_signature: signatureUrl,
        assigned_room_number: assignedRoomNumber
      });
    } else {
      let signatureUrl = landlordSignature;
      if (landlordSignature && landlordSignature.startsWith('data:image') && process.env.CLOUDINARY_URL) {
        try {
          const { cloudinary } = require('../config/cloudinary');
          const uploadResponse = await cloudinary.uploader.upload(landlordSignature, {
            folder: 'signatures',
          });
          signatureUrl = uploadResponse.secure_url;
        } catch (error) {
          console.error("Cloudinary upload failed for signature, falling back to base64", error);
        }
      }

      await contract.update({
        terms_and_conditions: termsAndConditions || '',
        status: 'pending_signature',
        landlord_name: landlordName,
        landlord_ic: landlordIc,
        landlord_ic_issue_date: landlordIcIssueDate || null,
        landlord_ic_issue_place: landlordIcIssuePlace,
        landlord_permanent_address: landlordPermanentAddress,
        landlord_signature: signatureUrl,
        assigned_room_number: assignedRoomNumber,
        updated_at: new Date()
      });
    }



    schedule.status = 'contract_created';
    schedule.updated_at = new Date();
    await schedule.save();

    // Notify tenant
    await Notification.create({
      user_id: schedule.tenant_id,
      title: 'Contract Created',
      message: `Landlord has created a rental contract for "${schedule.room.title}". Please review and sign.`,
      notification_type: 'contract',
      related_id: contract.contract_id,
    });

    return res.status(201).json({
      success: true,
      message: 'Contract created! Waiting for tenant signature.',
      data: {
        contractId: contract.contract_id,
        contractNumber: contract.contract_number,
        scheduleId: schedule.schedule_id,
        status: contract.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/tenant/contracts/:contractId/send-otp
// Tenant requests OTP to sign contract
// =========================================================
const sendContractOtp = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const tenantId = req.user.userId;

    const contract = await Contract.findOne({
      where: { contract_id: contractId, tenant_id: tenantId },
    });

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found.' });
    }

    if (contract.status !== 'pending_signature') {
      return res.status(400).json({
        success: false,
        message: 'This contract is not pending signature.',
      });
    }

    const tenant = await User.findByPk(tenantId);

    const otpCode = generateOtp();
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + 5);

    await OtpVerification.create({
      user_id: tenantId,
      otp_code: otpCode,
      purpose: 'sign_contract',
      expired_at: expiredAt,
    });

    await sendOtpEmail(tenant.email, otpCode, 'sign_contract');

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please check your inbox to sign the contract.',
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/tenant/contracts/:contractId/sign
// Tenant signs the contract — finalize the rental
// =========================================================
const signContract = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const { tenantSignature, otp, contractPdf } = req.body;
    const tenantId = req.user.userId;

    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required to sign the contract.' });
    }

    const contract = await Contract.findOne({
      where: { contract_id: contractId, tenant_id: tenantId },
      include: [
        { model: Room, as: 'room' },
        { model: User, as: 'landlordContract' }
      ],
    });

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found.' });
    }

    if (contract.status !== 'pending_signature') {
      return res.status(400).json({
        success: false,
        message: 'This contract is not pending signature.',
      });
    }

    // Verify OTP
    const otpRecord = await OtpVerification.findOne({
      where: {
        user_id: tenantId,
        otp_code: otp,
        purpose: 'sign_contract',
        is_used: false,
        expired_at: { [Op.gt]: new Date() },
      },
      order: [['otp_id', 'DESC']],
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP.',
      });
    }

    // Mark OTP as used
    await otpRecord.update({ is_used: true });

    contract.tenant_agreed = true;
    if (tenantSignature) {
      contract.tenant_signature = tenantSignature;
    }

    // Check if this is a renewal contract (is there an original contract pointing to this one?)
    const originalContract = await Contract.findOne({
      where: { renewal_contract_id: contract.contract_id }
    });

    const isRenewal = !!originalContract;

    if (isRenewal) {
      contract.status = 'active';
      contract.updated_at = new Date();
      
      // Update original contract to completed if it's not already
      if (originalContract.status === 'active') {
        originalContract.status = 'completed';
        await originalContract.save();
      }
    } else {
      contract.status = 'pending_payment'; // Wait for deposit payment before making active
      contract.updated_at = new Date();
    }

    await contract.save();

    // Send contract PDF email to landlord and tenant if provided
    if (contractPdf) {
      const tenantUser = await User.findByPk(tenantId);
      if (tenantUser && tenantUser.email) {
        await sendContractEmail(tenantUser.email, contract.contract_number, contractPdf);
      }
      if (contract.landlordContract && contract.landlordContract.email) {
        await sendContractEmail(contract.landlordContract.email, contract.contract_number, contractPdf);
      }
    }

    if (!isRenewal) {
      // Process deposit: 5% platform fee, 95% to landlord
      const viewingSchedule = await ViewingSchedule.findOne({
        where: { room_id: contract.room_id, tenant_id: tenantId, status: 'contract_created' }
      });

      if (viewingSchedule) {
        viewingSchedule.status = 'completed';
        viewingSchedule.tenant_decision = 'rented';
        viewingSchedule.updated_at = new Date();
        await viewingSchedule.save();

        const payment = await Payment.findOne({
          where: { viewing_schedule_id: viewingSchedule.schedule_id, status: 'completed' }
        });

        if (payment) {
          const total = parseFloat(payment.amount);
          payment.platform_fee = total * PLATFORM_FEE_RATE;
          payment.net_amount = total * (1 - PLATFORM_FEE_RATE);
          payment.refund_amount = 0;
          payment.payout_status = 'pending';
          await payment.save();
        }
      }

      const { RentalRequest } = require('../models');
      const rentalRequest = await RentalRequest.findOne({
        where: { room_id: contract.room_id, tenant_id: tenantId, status: 'contract_created' }
      });

      if (rentalRequest) {
        rentalRequest.status = 'completed';
        rentalRequest.updated_at = new Date();
        await rentalRequest.save();
      }
    }

    // Notify landlord that contract is signed
    await Notification.create({
      user_id: contract.landlord_id,
      title: isRenewal ? 'Contract Renewed' : 'Contract Signed (Pending Payment)',
      message: isRenewal 
        ? `Tenant has signed the renewal contract for "${contract.room.title}". The contract is now active.`
        : `Tenant has signed the rental contract for "${contract.room.title}". Waiting for deposit payment.`,
      notification_type: 'contract',
      related_id: contract.contract_id,
    });

    return res.status(200).json({
      success: true,
      message: isRenewal ? 'Contract renewed successfully!' : 'Contract signed successfully! Please proceed to payment.',
      data: {
        contractId: contract.contract_id,
        status: contract.status,
        isRenewal: isRenewal,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/tenant/contracts
// Tenant gets their contracts
// =========================================================
const getTenantContracts = async (req, res, next) => {
  try {
    const tenantId = req.user.userId;

    const contracts = await Contract.findAll({
      where: { tenant_id: tenantId },
      include: [
        { model: Room, as: 'room', attributes: ['room_id', 'title', 'address', 'ward', 'district', 'city', 'price_per_month', 'area_sqm', 'room_type', 'bedrooms', 'max_occupants'] },
        { model: User, as: 'landlordContract', attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: contracts.map(c => ({
        contractId: c.contract_id,
        contractNumber: c.contract_number,
        roomId: c.room_id,
        startDate: c.start_date,
        endDate: c.end_date,
        monthlyRent: c.monthly_rent,
        depositAmount: c.deposit_amount,
        status: c.status,
        tenantAgreed: c.tenant_agreed,
        termsAndConditions: c.terms_and_conditions,
        room: c.room,
        landlord: c.landlordContract,
        createdAt: c.created_at,
        tenantIc: c.tenant_ic,
        tenantName: c.tenant_name,
        tenantIcIssueDate: c.tenant_ic_issue_date,
        tenantIcIssuePlace: c.tenant_ic_issue_place,
        tenantPermanentAddress: c.tenant_permanent_address,
        tenantSignature: c.tenant_signature,
        landlordName: c.landlord_name,
        landlordIc: c.landlord_ic,
        landlordIcIssueDate: c.landlord_ic_issue_date,
        landlordIcIssuePlace: c.landlord_ic_issue_place,
        landlordPermanentAddress: c.landlord_permanent_address,
        landlordSignature: c.landlord_signature,
        is_renewed: c.is_renewed,
        isRenewed: c.is_renewed,
        renewalStatus: c.renewal_status,
        renewal_status: c.renewal_status,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const cancelContract = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const tenantId = req.user.userId;

    const contract = await Contract.findOne({
      where: { contract_id: contractId, tenant_id: tenantId }
    });

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found.' });
    }

    if (contract.status === 'active' || contract.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an active or completed contract.' });
    }
    
    contract.status = 'cancelled';
    await contract.save();

    // Revert room status to available
    const { Room } = require('../models');
    await Room.update(
      { status: 'available' },
      { where: { room_id: contract.room_id } }
    );

    return res.status(200).json({
      success: true,
      message: 'Contract cancelled successfully.',
    });
  } catch (error) {
    next(error);
  }
};

  // =========================================================
  // POST /api/tenant/contracts/:contractId/renew
  // Tenant requests contract renewal
  // =========================================================
  const renewContract = async (req, res, next) => {
    try {
      const { contractId } = req.params;
      const tenantId = req.user.userId;
      const { durationMonths } = req.body;

      const oldContract = await Contract.findOne({
        where: { contract_id: contractId, tenant_id: tenantId, status: 'active' },
        include: [{ model: Room, as: 'room' }]
      });

      if (!oldContract) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng đang hoạt động.' });
      }

      if (oldContract.is_renewed) {
        return res.status(400).json({ success: false, message: 'Hợp đồng này đã được gia hạn.' });
      }

      // Mark old as renewed
      oldContract.is_renewed = true;
      oldContract.renewal_status = 'renewed';
      await oldContract.save();

      // Create new draft contract
      const start = new Date(oldContract.end_date);
      const end = new Date(start);
      end.setMonth(end.getMonth() + parseInt(durationMonths || 12));

      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

      const newContract = await Contract.create({
        room_id: oldContract.room_id,
        tenant_id: oldContract.tenant_id,
        landlord_id: oldContract.landlord_id,
        contract_number: `CT-${timestamp}-${random}`,
        status: 'draft',
        start_date: start,
        end_date: end,
        monthly_rent: oldContract.monthly_rent,
        deposit_amount: oldContract.deposit_amount,
        tenant_name: oldContract.tenant_name,
        tenant_ic: oldContract.tenant_ic,
        tenant_ic_issue_date: oldContract.tenant_ic_issue_date,
        tenant_ic_issue_place: oldContract.tenant_ic_issue_place,
        tenant_permanent_address: oldContract.tenant_permanent_address,
        renewal_contract_id: oldContract.contract_id
      });

      // Notify landlord
      await Notification.create({
        user_id: oldContract.landlord_id,
        title: 'Yêu cầu gia hạn hợp đồng',
        message: `Khách thuê đã yêu cầu gia hạn hợp đồng phòng "${oldContract.room ? oldContract.room.title : oldContract.room_id}". Vui lòng kiểm tra và gửi lại hợp đồng.`,
        notification_type: 'contract',
        related_id: newContract.contract_id,
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user_${oldContract.landlord_id}`).emit('new_notification', {
          title: 'Yêu cầu gia hạn hợp đồng',
          message: `Khách thuê đã yêu cầu gia hạn hợp đồng phòng "${oldContract.room ? oldContract.room.title : oldContract.room_id}". Vui lòng kiểm tra và gửi lại hợp đồng.`,
          type: 'contract'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Đã gửi yêu cầu gia hạn. Vui lòng chờ chủ nhà duyệt.',
        data: newContract
      });

    } catch (error) {
      next(error);
    }
  };

  // =========================================================
  // POST /api/tenant/contracts/:contractId/decline-renewal
  // Tenant declines renewal (declares they will move out on contract expiry)
  // =========================================================
  const declineContractRenewal = async (req, res, next) => {
    try {
      const { contractId } = req.params;
      const tenantId = req.user.userId;

      const contract = await Contract.findOne({
        where: { contract_id: contractId, tenant_id: tenantId, status: 'active' },
        include: [{ model: Room, as: 'room' }]
      });

      if (!contract) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng đang hoạt động.' });
      }

      // Mark the contract as not renewing
      contract.is_renewed = false;
      contract.renewal_status = 'declined';
      await contract.save();

      // Update Room availability date to end_date + 1 day
      const room = await Room.findByPk(contract.room_id);
      if (room) {
        const nextDay = new Date(contract.end_date);
        nextDay.setDate(nextDay.getDate() + 1);
        room.available_from = nextDay.toISOString().substring(0, 10);
        await room.save();
      }

      // Notify landlord
      const { Notification } = require('../models');
      await Notification.create({
        user_id: contract.landlord_id,
        title: 'Khách thuê từ chối gia hạn',
        message: `Khách thuê phòng "${contract.room ? contract.room.title : contract.room_id}" đã xác nhận không gia hạn và sẽ chuyển đi vào ngày ${new Date(contract.end_date).toLocaleDateString('vi-VN')}. Phòng này hiện đã khả dụng để người khác đặt trước.`,
        notification_type: 'contract',
        related_id: contract.contract_id,
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user_${contract.landlord_id}`).emit('new_notification', {
          title: 'Khách thuê từ chối gia hạn',
          message: `Khách thuê phòng "${contract.room ? contract.room.title : contract.room_id}" đã xác nhận không gia hạn và sẽ chuyển đi vào ngày ${new Date(contract.end_date).toLocaleDateString('vi-VN')}.`,
          type: 'contract'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Bạn đã xác nhận không gia hạn hợp đồng thành công. Ngày trả phòng dự kiến: ' + new Date(contract.end_date).toLocaleDateString('vi-VN'),
      });
    } catch (error) {
      next(error);
    }
  };

  module.exports = {
    createViewingSchedule,
    getLandlordViewingSchedules,
    getViewingScheduleDetails,
    updateViewingSchedule,
    confirmViewing,
    markNoShow,
    deleteViewingSchedule,
    getTenantViewingSchedules,
    requestViewing,
    retryPayment,
    requestContract,
    disputeViewingSchedule,
    cancelViewingScheduleTenant,
    declineViewingScheduleTenant,
    createContractFromViewing,
    sendContractOtp,
    signContract,
    getTenantContracts,
    cancelContract,
    renewContract,
    declineContractRenewal,
  };
