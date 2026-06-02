const { Op } = require('sequelize');
const { Payment, Contract, Room, User } = require('../models');

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

module.exports = {
  getLandlordPayments,
  getPaymentDetails,
  getContractPaymentHistory,
  getPaymentStatistics,
};
