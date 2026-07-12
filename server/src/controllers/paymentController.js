const crypto = require('crypto');
const { Op } = require('sequelize');
const { Payment, Contract, Room, User, RentalRequest, ViewingSchedule } = require('../models');
const payos = require('../utils/payos');

const vnp_TmnCode = process.env.VNP_TMN_CODE || '98KLJQXT';
const vnp_HashSecret = process.env.VNP_HASH_SECRET || '7HVTWYRFWK4H9EMWOLX9R7GH8VXKGKI8';
const vnp_Url = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const vnp_ReturnUrl_Base = process.env.VNP_RETURN_URL || 'http://localhost:5173/tenant/payment/return';

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

// =========================================================
// GET /api/landlord/payments
// Get all payments for landlord
// =========================================================
const getLandlordPayments = async (req, res, next) => {
  try {
    const landlordId = req.user.userId;
    const { status, paymentType, page = 1, limit = 10 } = req.query;

    const where = { landlord_id: landlordId };
    if (status) {
      where.status = status;
    }
    if (paymentType) {
      where.payment_type = paymentType;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [
        { model: Contract, as: 'contract', attributes: ['contract_id', 'contract_number'] },
        { model: Room, as: 'room', attributes: ['room_id', 'title', 'address'] },
        { model: User, as: 'tenant', attributes: ['user_id', 'full_name', 'email'] },
      ],
      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: rows.map(payment => ({
        paymentId: payment.payment_id,
        contractId: payment.contract_id,
        roomId: payment.room_id,
        tenantId: payment.tenant_id,
        amount: payment.amount,
        paymentType: payment.payment_type,
        status: payment.status,
        paymentMethod: payment.payment_method,
        transactionId: payment.transaction_id,
        dueDate: payment.due_date,
        paidDate: payment.paid_date,
        notes: payment.notes,
        platformFee: payment.platform_fee,
        refundAmount: payment.refund_amount,
        netAmount: payment.net_amount,
        payoutStatus: payment.payout_status,
        contract: payment.contract,
        room: payment.room,
        tenant: payment.tenant,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
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
// GET /api/landlord/payments/:paymentId
// Get payment details
// =========================================================
const getPaymentDetails = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const landlordId = req.user.userId;

    const payment = await Payment.findOne({
      where: { payment_id: paymentId, landlord_id: landlordId },
      include: [
        { model: Contract, as: 'contract', attributes: ['contract_id', 'contract_number', 'start_date', 'end_date'] },
        { model: Room, as: 'room', attributes: ['room_id', 'title', 'address', 'price_per_month'] },
        { model: User, as: 'tenant', attributes: ['user_id', 'full_name', 'email', 'phone'] },
      ],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        paymentId: payment.payment_id,
        contractId: payment.contract_id,
        roomId: payment.room_id,
        tenantId: payment.tenant_id,
        amount: payment.amount,
        paymentType: payment.payment_type,
        status: payment.status,
        paymentMethod: payment.payment_method,
        transactionId: payment.transaction_id,
        dueDate: payment.due_date,
        paidDate: payment.paid_date,
        notes: payment.notes,
        contract: payment.contract,
        room: payment.room,
        tenant: payment.tenant,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/landlord/payments/history/:contractId
// Get payment history for a contract
// =========================================================
const getContractPaymentHistory = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const landlordId = req.user.userId;

    // Verify contract ownership
    const contract = await Contract.findOne({
      where: { contract_id: contractId, landlord_id: landlordId },
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found.',
      });
    }

    const payments = await Payment.findAll({
      where: { contract_id: contractId },
      include: [
        { model: Room, as: 'room', attributes: ['room_id', 'title'] },
        { model: User, as: 'tenant', attributes: ['user_id', 'full_name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: payments.map(payment => ({
        paymentId: payment.payment_id,
        amount: payment.amount,
        paymentType: payment.payment_type,
        status: payment.status,
        paymentMethod: payment.payment_method,
        dueDate: payment.due_date,
        paidDate: payment.paid_date,
        notes: payment.notes,
        room: payment.room,
        tenant: payment.tenant,
        createdAt: payment.created_at,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/landlord/payments/statistics
// Get payment statistics
// =========================================================
const getPaymentStatistics = async (req, res, next) => {
  try {
    const landlordId = req.user.userId;
    const { startDate, endDate } = req.query;

    const where = { landlord_id: landlordId };
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // Total revenue
    const totalRevenue = await Payment.sum('amount', {
      where: { ...where, status: 'completed' },
    });

    // Pending payments
    const pendingAmount = await Payment.sum('amount', {
      where: { ...where, status: 'pending' },
    });

    // Payment count by status
    const paymentsByStatus = await Payment.findAll({
      attributes: ['status', [require('sequelize').fn('COUNT', require('sequelize').col('payment_id')), 'count']],
      where,
      group: ['status'],
      raw: true,
    });

    // Payment count by type
    const paymentsByType = await Payment.findAll({
      attributes: ['payment_type', [require('sequelize').fn('COUNT', require('sequelize').col('payment_id')), 'count']],
      where,
      group: ['payment_type'],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenue || 0,
        pendingAmount: pendingAmount || 0,
        paymentsByStatus: paymentsByStatus,
        paymentsByType: paymentsByType,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/tenant/payments/create_payment_url
// Create VNPay payment url for deposit
// =========================================================
const createPaymentUrl = async (req, res, next) => {
  try {
    const { amount, roomId, contractId, bankCode = 'NCB', language = 'vn' } = req.body;
    const tenantId = req.user.userId;

    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Verify contract if provided
    let contract = null;
    if (contractId) {
      contract = await Contract.findOne({ where: { contract_id: contractId, tenant_id: tenantId } });
      if (!contract) {
        return res.status(400).json({ success: false, message: 'Contract not found or does not belong to you.' });
      }
    }

    if (room.status === 'rented' && !contract) {
      return res.status(400).json({ success: false, message: 'This room has already been rented by another tenant.' });
    }

    // Find existing pending payment or create a new one
    let payment = null;
    if (contractId) {
      payment = await Payment.findOne({
        where: {
          contract_id: contractId,
          tenant_id: tenantId,
          status: 'pending'
        }
      });
    }

    const paymentMethod = req.body.paymentMethod || 'vnpay';

    if (!payment) {
      payment = await Payment.create({
        room_id: roomId,
        contract_id: contractId || null,
        tenant_id: tenantId,
        landlord_id: room.landlord_id,
        amount: amount,
        payment_type: 'deposit',
        payment_method: paymentMethod,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      });
    } else {
      payment.amount = amount;
      payment.payment_method = paymentMethod;
      payment.updated_at = new Date();
      await payment.save();
    }

    if (paymentMethod === 'payos') {
      const orderCode = payment.payment_id;
      const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : 'http://localhost:5173');
      const cancelUrl = `${origin}/tenant/payment/return?cancel=true&status=CANCELLED&orderCode=${orderCode}`;
      const returnUrl = `${origin}/tenant/payment/return?status=PAID&orderCode=${orderCode}`;
      const description = `Coc phong ${roomId}`.substring(0, 25);

      const paymentData = {
        orderCode,
        amount: Math.round(amount),
        description,
        cancelUrl,
        returnUrl,
      };

      const result = await payos.createPaymentLink(paymentData);
      
      await payment.update({
        transaction_id: result.paymentLinkId,
      });

      return res.status(200).json({ success: true, url: result.checkoutUrl });
    }

    const ipAddr = req.headers['x-forwarded-for'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        (req.connection?.socket ? req.connection.socket.remoteAddress : '127.0.0.1');

    let date = new Date();
    const createDate = date.getFullYear().toString() + 
        (date.getMonth() + 1).toString().padStart(2, '0') + 
        date.getDate().toString().padStart(2, '0') + 
        date.getHours().toString().padStart(2, '0') + 
        date.getMinutes().toString().padStart(2, '0') + 
        date.getSeconds().toString().padStart(2, '0');

    let orderId = payment.payment_id.toString() + '_' + Date.now().toString();
    
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_BankCode'] = bankCode;
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_IpAddr'] = ipAddr === '::1' ? '127.0.0.1' : ipAddr;
    vnp_Params['vnp_Locale'] = language;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan tien dat coc phong ' + roomId;
    vnp_Params['vnp_OrderType'] = 'other';
    const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null);
    vnp_Params['vnp_ReturnUrl'] = origin ? `${origin}/tenant/payment/return` : vnp_ReturnUrl_Base;
    vnp_Params['vnp_TxnRef'] = orderId;

    vnp_Params = sortObject(vnp_Params);

    let signData = Object.keys(vnp_Params).map(key => `${key}=${vnp_Params[key]}`).join('&');
    let hmac = crypto.createHmac("sha512", vnp_HashSecret);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    let vnpUrl = vnp_Url + '?' + Object.keys(vnp_Params).map(key => `${key}=${vnp_Params[key]}`).join('&');

    return res.status(200).json({ success: true, url: vnpUrl });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// =========================================================
// GET /api/tenant/payments/vnpay_return
// Handle VNPay return
// =========================================================
const vnpayReturn = async (req, res, next) => {
  try {
    let vnp_Params = req.query;

    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let signData = Object.keys(vnp_Params).map(key => `${key}=${vnp_Params[key]}`).join('&');
    let hmac = crypto.createHmac("sha512", vnp_HashSecret);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");     

    if (secureHash === signed) {
      let rawOrderId = vnp_Params['vnp_TxnRef'];
      let orderId = rawOrderId.split('_')[0];
      let rspCode = vnp_Params['vnp_ResponseCode'];
      let transactionNo = vnp_Params['vnp_TransactionNo'];

      const payment = await Payment.findByPk(orderId, {
        include: [
          { model: Room, as: 'room', attributes: ['title', 'address', 'ward', 'district', 'city'] },
          { model: User, as: 'landlordPayment', attributes: ['full_name', 'email', 'phone'] }
        ]
      });
      if (payment) {
        if (rspCode === '00') {
          await payment.update({ 
            status: 'completed', 
            transaction_id: transactionNo,
            paid_date: new Date(),
            updated_at: new Date()
          });

          // Cancel all other pending payments for this room
          const { Op } = require('sequelize');
          await Payment.update(
            { status: 'cancelled', updated_at: new Date() },
            { 
              where: { 
                room_id: payment.room_id, 
                payment_id: { [Op.ne]: payment.payment_id },
                status: 'pending' 
              } 
            }
          );

          if (payment.payment_type === 'viewing_deposit' && payment.viewing_schedule_id) {
            const { ViewingSchedule } = require('../models');
            await ViewingSchedule.update(
              { status: 'scheduled' }, 
              { where: { schedule_id: payment.viewing_schedule_id } }
            );
          } else if (payment.contract_id) {
            const contract = await Contract.findByPk(payment.contract_id);
            if (contract) {
              await contract.update({ status: 'active', tenant_agreed: true });
              
              const room = await Room.findByPk(contract.room_id);
              if (room) {
                await room.update({ status: 'rented' });
              }
              
              const { ViewingSchedule, Notification } = require('../models');
              const viewingSchedule = await ViewingSchedule.findOne({
                where: { room_id: contract.room_id, tenant_id: payment.tenant_id, status: 'contract_created' }
              });
              
              if (viewingSchedule) {
                await viewingSchedule.update({ status: 'completed', tenant_decision: 'rented' });
              }

              // Cancel all other active viewing schedules for this room
              const { Op } = require('sequelize');
              const otherSchedules = await ViewingSchedule.findAll({
                where: {
                  room_id: contract.room_id,
                  status: { [Op.in]: ['pending', 'scheduled', 'confirmed', 'completed', 'contract_requested', 'contract_created'] },
                  schedule_id: { [Op.ne]: viewingSchedule ? viewingSchedule.schedule_id : null }
                }
              });

              for (const sched of otherSchedules) {
                await sched.update({
                  status: 'cancelled',
                  notes: (sched.notes ? sched.notes + '\n' : '') + '[SYSTEM]: Room has been rented by another tenant.'
                });
                
                await Notification.create({
                  user_id: sched.tenant_id,
                  title: 'Viewing Cancelled',
                  message: `Your viewing schedule for "${room ? room.title : 'room'}" has been cancelled because the room was just rented by another tenant.`,
                  notification_type: 'viewing_schedule',
                  related_id: sched.schedule_id,
                });
              }

              // Cancel all other active rental requests for this room
              const { RentalRequest } = require('../models');
              const otherRequests = await RentalRequest.findAll({
                where: {
                  room_id: contract.room_id,
                  status: { [Op.in]: ['pending', 'approved', 'contract_requested', 'contract_created'] }
                }
              });

              for (const req of otherRequests) {
                await req.update({
                  status: 'cancelled',
                  rejection_reason: '[SYSTEM]: Room has been rented by another tenant.'
                });
                
                await Notification.create({
                  user_id: req.tenant_id,
                  title: 'Request Cancelled',
                  message: `Your rental request for "${room ? room.title : 'room'}" has been cancelled because the room was just rented by another tenant.`,
                  notification_type: 'rental_request',
                  related_id: req.request_id,
                });
              }

              // Cancel all other active contracts for this room
              const otherContracts = await Contract.findAll({
                where: {
                  room_id: contract.room_id,
                  status: { [Op.in]: ['draft', 'pending_signature'] },
                  contract_id: { [Op.ne]: contract.contract_id }
                }
              });

              for (const otherC of otherContracts) {
                await otherC.update({ status: 'cancelled' });
                
                await Notification.create({
                  user_id: otherC.tenant_id,
                  title: 'Contract Cancelled',
                  message: `Your rental contract for "${room ? room.title : 'room'}" has been cancelled because the room was just rented by another tenant.`,
                  notification_type: 'contract',
                  related_id: otherC.contract_id,
                });
              }

              await Notification.create({
                user_id: contract.landlord_id,
                title: 'Contract Signed & Paid',
                message: `Tenant has signed the rental contract and paid the deposit + 1st month rent for "${room ? room.title : 'room'}". The rental is now active.`,
                notification_type: 'contract',
                related_id: contract.contract_id,
              });
              
              const total = parseFloat(payment.amount);
              await payment.update({
                  platform_fee: total * 0.05,
                  net_amount: total * 0.95,
                  refund_amount: 0,
                  payout_status: 'pending'
              });
            }
          } else {
            const rentalRequest = await RentalRequest.findOne({
              where: {
                room_id: payment.room_id,
                tenant_id: payment.tenant_id,
                status: 'approved'
              }
            });

            if (rentalRequest) {
              await rentalRequest.update({ status: 'deposit_paid' });
            }

            const room = await Room.findByPk(payment.room_id);
            if (room) {
              await room.update({ status: 'rented' });

              // Cancel all other active viewing schedules for this room
              const { ViewingSchedule, Contract, Notification } = require('../models');
              const { Op } = require('sequelize');
              const otherSchedules = await ViewingSchedule.findAll({
                where: {
                  room_id: payment.room_id,
                  status: { [Op.in]: ['pending', 'scheduled', 'confirmed', 'completed', 'contract_requested', 'contract_created'] }
                }
              });

              for (const sched of otherSchedules) {
                await sched.update({
                  status: 'cancelled',
                  notes: (sched.notes ? sched.notes + '\n' : '') + '[SYSTEM]: Room has been rented by another tenant.'
                });
                
                await Notification.create({
                  user_id: sched.tenant_id,
                  title: 'Viewing Cancelled',
                  message: `Your viewing schedule for "${room.title}" has been cancelled because the room was just rented by another tenant.`,
                  notification_type: 'viewing_schedule',
                  related_id: sched.schedule_id,
                });
              }

              // Cancel all other active rental requests for this room
              const otherRequests = await RentalRequest.findAll({
                where: {
                  room_id: payment.room_id,
                  status: { [Op.in]: ['pending', 'approved', 'contract_requested', 'contract_created'] },
                  request_id: { [Op.ne]: rentalRequest ? rentalRequest.request_id : null }
                }
              });

              for (const req of otherRequests) {
                await req.update({
                  status: 'cancelled',
                  rejection_reason: '[SYSTEM]: Room has been rented by another tenant.'
                });
                
                await Notification.create({
                  user_id: req.tenant_id,
                  title: 'Request Cancelled',
                  message: `Your rental request for "${room.title}" has been cancelled because the room was just rented by another tenant.`,
                  notification_type: 'rental_request',
                  related_id: req.request_id,
                });
              }

              // Cancel all other active contracts for this room
              const otherContracts = await Contract.findAll({
                where: {
                  room_id: payment.room_id,
                  status: { [Op.in]: ['draft', 'pending_signature'] }
                }
              });

              for (const otherC of otherContracts) {
                await otherC.update({ status: 'cancelled' });
                
                await Notification.create({
                  user_id: otherC.tenant_id,
                  title: 'Contract Cancelled',
                  message: `Your rental contract for "${room.title}" has been cancelled because the room was just rented by another tenant.`,
                  notification_type: 'contract',
                  related_id: otherC.contract_id,
                });
              }
            }
          }
          
          const paymentData = payment.toJSON();
          paymentData.landlord = paymentData.landlordPayment;
          delete paymentData.landlordPayment;
          
          return res.status(200).json({ success: true, message: 'Payment success', code: rspCode, payment_id: orderId, data: paymentData });
        } else {
          await payment.update({ 
            status: 'failed',
            transaction_id: transactionNo,
            updated_at: new Date()
          });
          const paymentData = payment.toJSON();
          paymentData.landlord = paymentData.landlordPayment;
          delete paymentData.landlordPayment;
          return res.status(200).json({ success: false, message: 'Payment failed', code: rspCode, payment_id: orderId, data: paymentData });
        }
      } else {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/tenant/payments
// =========================================================
const getMyPayments = async (req, res, next) => {
  try {
    const tenantId = req.user.userId;
    const payments = await Payment.findAll({
      where: { tenant_id: tenantId },
      include: [
        { model: Room, as: 'room', attributes: ['title'] }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/tenant/payments/:id/cancel
// =========================================================
const cancelPayment = async (req, res, next) => {
  try {
    const tenantId = req.user.userId;
    const { id } = req.params;

    const payment = await Payment.findOne({
      where: { payment_id: id, tenant_id: tenantId },
      include: [{ model: ViewingSchedule, as: 'viewingSchedule' }]
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Payment is already cancelled' });
    }

    if (payment.status === 'completed') {
      const now = new Date();
      const paidDate = new Date(payment.paid_date || payment.created_at);
      const diffMins = (now - paidDate) / (1000 * 60);

      // Case 3: Tenant cancels after payment
      if (diffMins <= 30) {
        // Within 30 minutes: 100% refund
        payment.refund_amount = payment.amount;
        payment.platform_fee = 0;
        payment.net_amount = 0;
      } else {
        // After 30 minutes: 95% refund, 5% platform fee
        payment.refund_amount = parseFloat(payment.amount) * 0.95;
        payment.platform_fee = parseFloat(payment.amount) * 0.05;
        payment.net_amount = 0;
      }
      payment.status = 'refunded';

      // Also cancel the viewing schedule if it exists
      if (payment.viewing_schedule_id) {
        await ViewingSchedule.update(
          { status: 'cancelled' },
          { where: { schedule_id: payment.viewing_schedule_id } }
        );
      }
    } else {
      payment.status = 'cancelled';
      if (payment.viewing_schedule_id) {
        await ViewingSchedule.update(
          { status: 'cancelled' },
          { where: { schedule_id: payment.viewing_schedule_id } }
        );
      }
    }

    await payment.save();

    return res.status(200).json({
      success: true,
      message: 'Deposit cancelled successfully',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

const processPaymentSuccess = async (payment, transactionId) => {
  if (payment.status === 'completed') {
    return payment;
  }

  await payment.update({ 
    status: 'completed', 
    transaction_id: transactionId,
    paid_date: new Date(),
    updated_at: new Date()
  });

  // Cancel all other pending payments for this room
  await Payment.update(
    { status: 'cancelled', updated_at: new Date() },
    { 
      where: { 
        room_id: payment.room_id, 
        payment_id: { [Op.ne]: payment.payment_id },
        status: 'pending' 
      } 
    }
  );

  if (payment.payment_type === 'viewing_deposit' && payment.viewing_schedule_id) {
    const { ViewingSchedule } = require('../models');
    await ViewingSchedule.update(
      { status: 'scheduled' }, 
      { where: { schedule_id: payment.viewing_schedule_id } }
    );
  } else if (payment.contract_id) {
    const contract = await Contract.findByPk(payment.contract_id);
    if (contract) {
      await contract.update({ status: 'active', tenant_agreed: true });
      
      const room = await Room.findByPk(contract.room_id);
      if (room) {
        await room.update({ status: 'rented' });
      }
      
      const { ViewingSchedule, Notification } = require('../models');
      const viewingSchedule = await ViewingSchedule.findOne({
        where: { room_id: contract.room_id, tenant_id: payment.tenant_id, status: 'contract_created' }
      });
      
      if (viewingSchedule) {
        await viewingSchedule.update({ status: 'completed', tenant_decision: 'rented' });
      }

      // Cancel all other active viewing schedules for this room
      const otherSchedules = await ViewingSchedule.findAll({
        where: {
          room_id: contract.room_id,
          status: { [Op.in]: ['pending', 'scheduled', 'confirmed', 'completed', 'contract_requested', 'contract_created'] },
          schedule_id: { [Op.ne]: viewingSchedule ? viewingSchedule.schedule_id : null }
        }
      });

      for (const sched of otherSchedules) {
        await sched.update({
          status: 'cancelled',
          notes: (sched.notes ? sched.notes + '\n' : '') + '[SYSTEM]: Room has been rented by another tenant.'
        });
        
        await Notification.create({
          user_id: sched.tenant_id,
          title: 'Viewing Cancelled',
          message: `Your viewing schedule for "${room ? room.title : 'room'}" has been cancelled because the room was just rented by another tenant.`,
          notification_type: 'viewing_schedule',
          related_id: sched.schedule_id,
        });
      }

      // Cancel all other active rental requests for this room
      const { RentalRequest } = require('../models');
      const otherRequests = await RentalRequest.findAll({
        where: {
          room_id: contract.room_id,
          status: { [Op.in]: ['pending', 'approved', 'contract_requested', 'contract_created'] }
        }
      });

      for (const req of otherRequests) {
        await req.update({
          status: 'cancelled',
          rejection_reason: '[SYSTEM]: Room has been rented by another tenant.'
        });
        
        await Notification.create({
          user_id: req.tenant_id,
          title: 'Request Cancelled',
          message: `Your rental request for "${room ? room.title : 'room'}" has been cancelled because the room was just rented by another tenant.`,
          notification_type: 'rental_request',
          related_id: req.request_id,
        });
      }

      // Cancel all other active contracts for this room
      const otherContracts = await Contract.findAll({
        where: {
          room_id: contract.room_id,
          status: { [Op.in]: ['draft', 'pending_signature'] },
          contract_id: { [Op.ne]: contract.contract_id }
        }
      });

      for (const otherC of otherContracts) {
        await otherC.update({ status: 'cancelled' });
        
        await Notification.create({
          user_id: otherC.tenant_id,
          title: 'Contract Cancelled',
          message: `Your rental contract for "${room ? room.title : 'room'}" has been cancelled because the room was just rented by another tenant.`,
          notification_type: 'contract',
          related_id: otherC.contract_id,
        });
      }

      await Notification.create({
        user_id: contract.landlord_id,
        title: 'Contract Signed & Paid',
        message: `Tenant has signed the rental contract and paid the deposit + 1st month rent for "${room ? room.title : 'room'}". The rental is now active.`,
        notification_type: 'contract',
        related_id: contract.contract_id,
      });
      
      const total = parseFloat(payment.amount);
      await payment.update({
          platform_fee: total * 0.05,
          net_amount: total * 0.95,
          refund_amount: 0,
          payout_status: 'pending'
      });
    }
  } else {
    const { RentalRequest, Notification } = require('../models');
    const rentalRequest = await RentalRequest.findOne({
      where: {
        room_id: payment.room_id,
        tenant_id: payment.tenant_id,
        status: 'approved'
      }
    });

    if (rentalRequest) {
      await rentalRequest.update({ status: 'deposit_paid' });
    }

    const room = await Room.findByPk(payment.room_id);
    if (room) {
      await room.update({ status: 'rented' });

      const { ViewingSchedule } = require('../models');
      const otherSchedules = await ViewingSchedule.findAll({
        where: {
          room_id: payment.room_id,
          status: { [Op.in]: ['pending', 'scheduled', 'confirmed', 'completed', 'contract_requested', 'contract_created'] }
        }
      });

      for (const sched of otherSchedules) {
        await sched.update({
          status: 'cancelled',
          notes: (sched.notes ? sched.notes + '\n' : '') + '[SYSTEM]: Room has been rented by another tenant.'
        });
        
        await Notification.create({
          user_id: sched.tenant_id,
          title: 'Viewing Cancelled',
          message: `Your viewing schedule for "${room.title}" has been cancelled because the room was just rented by another tenant.`,
          notification_type: 'viewing_schedule',
          related_id: sched.schedule_id,
        });
      }

      const otherRequests = await RentalRequest.findAll({
        where: {
          room_id: payment.room_id,
          status: { [Op.in]: ['pending', 'approved', 'contract_requested', 'contract_created'] },
          request_id: { [Op.ne]: rentalRequest ? rentalRequest.request_id : null }
        }
      });

      for (const req of otherRequests) {
        await req.update({
          status: 'cancelled',
          rejection_reason: '[SYSTEM]: Room has been rented by another tenant.'
        });
        
        await Notification.create({
          user_id: req.tenant_id,
          title: 'Request Cancelled',
          message: `Your rental request for "${room.title}" has been cancelled because the room was just rented by another tenant.`,
          notification_type: 'rental_request',
          related_id: req.request_id,
        });
      }

      const otherContracts = await Contract.findAll({
        where: {
          room_id: payment.room_id,
          status: { [Op.in]: ['draft', 'pending_signature'] }
        }
      });

      for (const otherC of otherContracts) {
        await otherC.update({ status: 'cancelled' });
        
        await Notification.create({
          user_id: otherC.tenant_id,
          title: 'Contract Cancelled',
          message: `Your rental contract for "${room.title}" has been cancelled because the room was just rented by another tenant.`,
          notification_type: 'contract',
          related_id: otherC.contract_id,
        });
      }
    }
  }

  const updatedPayment = await Payment.findByPk(payment.payment_id, {
    include: [
      { model: Room, as: 'room', attributes: ['title', 'address', 'ward', 'district', 'city'] },
      { model: User, as: 'landlordPayment', attributes: ['full_name', 'email', 'phone'] }
    ]
  });

  return updatedPayment;
};

const payosReturn = async (req, res, next) => {
  try {
    const { status, orderCode } = req.query;

    const payment = await Payment.findByPk(orderCode);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (status === 'PAID' || req.query.code === '00') {
      const updatedPayment = await processPaymentSuccess(payment, payment.transaction_id || `payos_${orderCode}_${Date.now()}`);

      const paymentData = updatedPayment.toJSON();
      paymentData.landlord = paymentData.landlordPayment;
      delete paymentData.landlordPayment;

      return res.status(200).json({
        success: true,
        message: 'Payment success',
        code: '00',
        payment_id: orderCode,
        data: paymentData
      });
    } else {
      await payment.update({
        status: 'failed',
        updated_at: new Date()
      });

      return res.status(200).json({
        success: false,
        message: 'Payment cancelled or failed',
        code: '99',
        payment_id: orderCode
      });
    }
  } catch (error) {
    next(error);
  }
};

const payosWebhook = async (req, res, next) => {
  try {
    const verifiedData = payos.verifyPaymentWebhookData(req.body);
    const { orderCode, status } = verifiedData;

    const payment = await Payment.findByPk(orderCode);
    if (payment && (status === 'PAID' || status === 'completed')) {
      await processPaymentSuccess(payment, payment.transaction_id || `payos_webhook_${orderCode}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('PayOS webhook processing error:', error);
    return res.status(200).json({ success: false, message: error.message });
  }
};

const mockPayosCheckout = async (req, res, next) => {
  try {
    const { paymentId, amount } = req.query;
    const payment = await Payment.findByPk(paymentId, {
      include: [
        { model: Room, as: 'room' },
        { model: User, as: 'landlordPayment' }
      ]
    });

    if (!payment) {
      return res.status(404).send('<h1>Payment not found</h1>');
    }

    const formattedAmount = parseInt(amount).toLocaleString('vi-VN');
    const roomTitle = payment.room?.title || 'Phòng Trọ';
    const landlordName = payment.landlordPayment?.full_name || 'Smart Rental Partner';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PayOS VietQR Simulation Checkout</title>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .checkout-card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      width: 100%;
      max-width: 480px;
      padding: 32px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      text-align: center;
    }
    .header {
      margin-bottom: 24px;
    }
    .logo {
      font-weight: 800;
      font-size: 24px;
      color: #6366f1;
      letter-spacing: -0.5px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .logo-badge {
      background: #4f46e5;
      color: white;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 12px;
      text-transform: uppercase;
      font-weight: bold;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      margin-top: 12px;
      color: #f1f5f9;
    }
    .qr-container {
      background: white;
      padding: 16px;
      border-radius: 16px;
      display: inline-block;
      margin: 20px 0;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    .qr-image {
      width: 220px;
      height: 220px;
      display: block;
    }
    .details-box {
      background: rgba(15, 23, 42, 0.5);
      border-radius: 16px;
      padding: 18px;
      margin-bottom: 24px;
      text-align: left;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .detail-row:last-child {
      margin-bottom: 0;
    }
    .detail-label {
      color: #94a3b8;
    }
    .detail-value {
      color: #f1f5f9;
      font-weight: 600;
    }
    .amount {
      font-size: 24px;
      color: #10b981;
      font-weight: 800;
      text-align: center;
      margin: 12px 0 6px 0;
    }
    .buttons-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .btn {
      padding: 14px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      width: 100%;
    }
    .btn-primary {
      background: linear-gradient(90deg, #6366f1 0%, #4f46e5 100%);
      color: white;
    }
    .btn-primary:hover {
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: transparent;
      color: #94a3b8;
      border: 1px solid #334155;
    }
    .btn-secondary:hover {
      background: rgba(255,255,255,0.05);
      color: #f1f5f9;
    }
    .instruction {
      font-size: 12px;
      color: #64748b;
      margin-top: 16px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="checkout-card">
    <div class="header">
      <div class="logo">
        <span>payOS</span>
        <span class="logo-badge">VietQR Simulation</span>
      </div>
      <h2 class="title">Cổng Thanh Toán Mô Phỏng</h2>
    </div>

    <div class="qr-container">
      <img src="https://img.vietqr.io/image/vietinbank-1133224455-compact.png?amount=${amount}&addInfo=Coc%20phong%20${paymentId}&accountName=${encodeURIComponent(landlordName)}" alt="VietQR Code" class="qr-image">
    </div>

    <div class="amount">${formattedAmount} đ</div>

    <div class="details-box">
      <div class="detail-row">
        <span class="detail-label">Nhà cung cấp</span>
        <span class="detail-value">RentWise Escrow</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Mã hóa đơn</span>
        <span class="detail-value">#PAY-${paymentId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Phòng trọ</span>
        <span class="detail-value">${roomTitle}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Nội dung CK</span>
        <span class="detail-value">Coc phong ${paymentId}</span>
      </div>
    </div>

    <div class="buttons-container">
      <button class="btn btn-primary" onclick="triggerSuccess()">Xác Nhận Thanh Toán Thành Công</button>
      <button class="btn btn-secondary" onclick="triggerCancel()">Hủy Giao Dịch</button>
    </div>

    <div class="instruction">
      Mã VietQR ở trên được tạo tự động cho mục đích thử nghiệm.<br>
      Bấm nút "Xác Nhận Thanh Toán" để giả lập giao dịch chuyển khoản thành công từ phía khách hàng.
    </div>
  </div>

  <script>
    function triggerSuccess() {
      window.location.href = "http://localhost:5173/tenant/payment/return?status=PAID&orderCode=${paymentId}&code=00";
    }

    function triggerCancel() {
      window.location.href = "http://localhost:5173/tenant/payment/return?status=CANCELLED&orderCode=${paymentId}&cancel=true&code=99";
    }
  </script>
</body>
</html>
    `;
    return res.status(200).send(html);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLandlordPayments,
  getPaymentDetails,
  getContractPaymentHistory,
  getPaymentStatistics,
  createPaymentUrl,
  vnpayReturn,
  getMyPayments,
  cancelPayment,
  payosReturn,
  payosWebhook,
  mockPayosCheckout
};
