const { Op } = require('sequelize');
const { ViewingSchedule, Room, User, Notification, Payment, Contract } = require('../models');
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

    const { count, rows } = await ViewingSchedule.findAndCountAll({
      where,
      include: [
        { model: Room, as: 'room', attributes: ['room_id', 'title', 'address', 'ward', 'district', 'city', 'price_per_month'] },
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
      message: `Your room viewing for "${schedule.room.title}" has been confirmed by the landlord. You can now decide to rent or report an issue.`,
      notification_type: 'viewing_schedule',
      related_id: schedule.schedule_id,
    });

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

    // If the room was temporarily reserved for this viewing, make it available again
    if (schedule.status === 'pending_payment' || schedule.status === 'scheduled') {
      const room = await Room.findByPk(schedule.room_id);
      if (room) {
        await room.update({ status: 'available' });
      }
    }

    schedule.status = 'no_show';
    schedule.updated_at = new Date();
    await schedule.save();

    // Tenant loses deposit: 95% goes to landlord, 5% platform fee
    const payment = await Payment.findOne({
      where: { viewing_schedule_id: schedule.schedule_id, status: 'completed' }
    });

    if (payment) {
      const total = parseFloat(payment.amount);
      payment.refund_amount = 0;
      payment.net_amount = total * (1 - PLATFORM_FEE_RATE);
      payment.platform_fee = total * PLATFORM_FEE_RATE;
      payment.payout_status = 'pending';
      await payment.save();
    }

    // Notify tenant
    await Notification.create({
      user_id: schedule.tenant_id,
      title: 'No-Show Recorded',
      message: `You did not attend the viewing for "${schedule.room.title}". Your deposit has been forfeited.`,
      notification_type: 'viewing_schedule',
      related_id: schedule.schedule_id,
    });

    return res.status(200).json({
      success: true,
      message: 'Tenant marked as no-show. Deposit forfeited.',
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

    const { count, rows } = await ViewingSchedule.findAndCountAll({
      where,
      include: [
        { model: Room, as: 'room', attributes: ['room_id', 'title', 'address', 'ward', 'district', 'city', 'price_per_month'] },
        { model: User, as: 'landlordSchedule', attributes: ['user_id', 'full_name', 'email', 'phone'] },
        { model: Payment, as: 'payments', attributes: ['payment_id', 'amount', 'status', 'payment_type'], required: false },
      ],
      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: rows.map(schedule => ({
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
      })),
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

    // Check if tenant already has a pending/scheduled viewing for this room
    const existingSchedule = await ViewingSchedule.findOne({
      where: {
        room_id: roomId,
        tenant_id: tenantId,
        status: { [Op.in]: ['pending_payment', 'scheduled'] },
      },
    });

    if (existingSchedule) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have an active viewing request for this room.' 
      });
    }

    // Deposit = 10% of room price
    const DEPOSIT_AMOUNT = Math.round(parseFloat(room.price_per_month) * 0.10);

    const paymentDeadline = new Date(Date.now() + PAYMENT_TIMEOUT_MINUTES * 60 * 1000);

    const schedule = await ViewingSchedule.create({
      room_id: roomId,
      tenant_id: tenantId,
      landlord_id: room.landlord_id,
      scheduled_date: new Date(scheduledDate),
      status: 'pending_payment',
      deposit_amount: DEPOSIT_AMOUNT,
      payment_deadline: paymentDeadline,
      notes: notes || null,
    });

    const payment = await Payment.create({
      room_id: roomId,
      tenant_id: tenantId,
      landlord_id: room.landlord_id,
      viewing_schedule_id: schedule.schedule_id,
      amount: DEPOSIT_AMOUNT,
      payment_type: 'viewing_deposit',
      payment_method: 'vnpay',
      status: 'pending',
      due_date: paymentDeadline,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Temporarily reserve the room so others cannot see or book it
    await room.update({ status: 'unavailable' });

    const ipAddr = req.headers['x-forwarded-for'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        (req.connection?.socket ? req.connection.socket.remoteAddress : '127.0.0.1');

    const vnpUrl = generateVnpayUrl(payment, ipAddr, roomId);

    return res.status(201).json({
      success: true,
      message: 'Viewing request created. Redirecting to payment...',
      url: vnpUrl,
      data: {
        scheduleId: schedule.schedule_id,
        depositAmount: DEPOSIT_AMOUNT,
        paymentDeadline: paymentDeadline,
        roomPrice: room.price_per_month,
        paymentId: payment.payment_id,
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
    const { scheduleId } = req.params;
    const tenantId = req.user.userId;
    const { message: tenantMessage, startDate, durationMonths } = req.body;

    if (!startDate || !durationMonths || durationMonths < 1 || durationMonths > 12) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid move-in date and duration (1-12 months).'
      });
    }

    const schedule = await ViewingSchedule.findOne({
      where: { schedule_id: scheduleId, tenant_id: tenantId },
      include: [{ model: Room, as: 'room' }],
    });

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Viewing schedule not found.' });
    }

    if (schedule.status !== 'confirmed') {
      return res.status(400).json({ 
        success: false, 
        message: 'You can only request a contract after your viewing has been confirmed by the landlord.' 
      });
    }

    // Calculate end date and validate start date
    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight
    
    if (start < today) {
      return res.status(400).json({
        success: false,
        message: 'Move-in date cannot be in the past.',
      });
    }

    const end = new Date(start);
    end.setMonth(end.getMonth() + parseInt(durationMonths));

    // Create a draft contract
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const contractNumber = `CT-${timestamp}-${random}`;

    const { Contract } = require('../models');
    
    // Check if a draft already exists
    let contract = await Contract.findOne({
      where: { room_id: schedule.room_id, tenant_id: tenantId, status: 'draft' }
    });

    if (!contract) {
      contract = await Contract.create({
        room_id: schedule.room_id,
        tenant_id: tenantId,
        landlord_id: schedule.landlord_id,
        contract_number: contractNumber,
        start_date: start,
        end_date: end,
        monthly_rent: schedule.room.price_per_month,
        deposit_amount: schedule.room.price_per_month, // Standard 1 month deposit
        status: 'draft'
      });
    } else {
      await contract.update({
        start_date: start,
        end_date: end,
        monthly_rent: schedule.room.price_per_month,
      });
    }

    schedule.tenant_decision = 'want_to_rent';
    schedule.status = 'contract_requested';
    if (tenantMessage) {
      schedule.notes = (schedule.notes ? schedule.notes + '\n' : '') + `[TENANT]: ${tenantMessage}`;
    }
    schedule.updated_at = new Date();
    await schedule.save();

    // Notify landlord
    await Notification.create({
      user_id: schedule.landlord_id,
      title: 'Contract Request',
      message: `Tenant wants to rent "${schedule.room.title}". Please review the draft contract and add terms.`,
      notification_type: 'contract',
      related_id: contract.contract_id,
    });

    return res.status(200).json({
      success: true,
      message: 'Contract request sent to landlord!',
      data: { 
        scheduleId: schedule.schedule_id, 
        status: schedule.status, 
        tenantDecision: schedule.tenant_decision 
      },
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

    if (schedule.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed viewing schedules can be disputed.',
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
// POST /api/landlord/viewing-schedules/:scheduleId/create-contract
// Landlord creates contract after tenant requests it
// =========================================================
const createContractFromViewing = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const landlordId = req.user.userId;
    const { startDate, endDate, monthlyRent, termsAndConditions } = req.body;

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
      });
    } else {
      await contract.update({
        terms_and_conditions: termsAndConditions || '',
        status: 'pending_signature',
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
// PUT /api/tenant/contracts/:contractId/sign
// Tenant signs the contract — finalize the rental
// =========================================================
const signContract = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const tenantId = req.user.userId;

    const contract = await Contract.findOne({
      where: { contract_id: contractId, tenant_id: tenantId },
      include: [{ model: Room, as: 'room' }],
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

    contract.status = 'active';
    contract.tenant_agreed = true;
    contract.updated_at = new Date();
    await contract.save();

    // Update room status to rented
    await Room.update(
      { status: 'rented', updated_at: new Date() },
      { where: { room_id: contract.room_id } }
    );

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

    // Notify landlord
    await Notification.create({
      user_id: contract.landlord_id,
      title: 'Contract Signed',
      message: `Tenant has signed the rental contract for "${contract.room.title}". The rental is now active.`,
      notification_type: 'contract',
      related_id: contract.contract_id,
    });

    return res.status(200).json({
      success: true,
      message: 'Contract signed successfully! The rental is now active.',
      data: {
        contractId: contract.contract_id,
        status: contract.status,
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
        { model: User, as: 'landlordContract', attributes: ['user_id', 'full_name', 'email', 'phone'] },
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
      })),
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
  createContractFromViewing,
  signContract,
  getTenantContracts,
};
