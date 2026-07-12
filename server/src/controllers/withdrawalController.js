const { UserBankDetail, WithdrawalRequest, Payment, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// =========================================================
// GET /api/landlord/bank-details
// =========================================================
const getBankDetails = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const bankDetails = await UserBankDetail.findOne({ where: { user_id: userId } });
    
    return res.status(200).json({
      success: true,
      data: bankDetails,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/landlord/bank-details
// =========================================================
const saveBankDetails = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { bank_name, account_number, account_holder_name, branch } = req.body;

    if (!bank_name || !account_number || !account_holder_name) {
      return res.status(400).json({
        success: false,
        message: 'Bank name, account number, and account holder name are required.',
      });
    }

    let bankDetails = await UserBankDetail.findOne({ where: { user_id: userId } });

    if (bankDetails) {
      await bankDetails.update({
        bank_name,
        account_number,
        account_holder_name,
        branch,
        updated_at: new Date(),
      });
    } else {
      bankDetails = await UserBankDetail.create({
        user_id: userId,
        bank_name,
        account_number,
        account_holder_name,
        branch,
      });
    }

    return res.status(200).json({
      success: true,
      data: bankDetails,
      message: 'Bank details saved successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/landlord/withdrawals
// =========================================================
const getWithdrawals = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Fetch withdrawals list
    const withdrawals = await WithdrawalRequest.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });

    // 1. Total net revenue from completed tenant deposits
    const totalRevenueRes = await Payment.sum('net_amount', {
      where: {
        landlord_id: userId,
        status: 'completed',
      },
    });
    const totalRevenue = parseFloat(totalRevenueRes || 0);

    // 2. Completed withdrawals
    const completedWithdrawalsRes = await WithdrawalRequest.sum('amount', {
      where: {
        user_id: userId,
        status: 'completed',
      },
    });
    const completedWithdrawals = parseFloat(completedWithdrawalsRes || 0);

    // 3. Pending/Processing withdrawals
    const pendingWithdrawalsRes = await WithdrawalRequest.sum('amount', {
      where: {
        user_id: userId,
        status: { [Op.in]: ['pending', 'processing'] },
      },
    });
    const pendingWithdrawals = parseFloat(pendingWithdrawalsRes || 0);

    // 4. Available balance to withdraw
    const availableBalance = totalRevenue - completedWithdrawals - pendingWithdrawals;

    return res.status(200).json({
      success: true,
      data: withdrawals,
      stats: {
        totalRevenue,
        completedWithdrawals,
        pendingWithdrawals,
        availableBalance: Math.max(0, availableBalance),
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/landlord/withdrawals
// =========================================================
const createWithdrawal = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.userId;
    const { amount } = req.body;

    const requestAmount = parseFloat(amount);
    if (isNaN(requestAmount) || requestAmount <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid withdrawal amount.',
      });
    }

    // Check bank details config
    const bankDetails = await UserBankDetail.findOne({
      where: { user_id: userId },
      transaction,
    });
    if (!bankDetails) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please configure your bank details in profile settings first.',
      });
    }

    // Dynamic balance check
    const totalRevenueRes = await Payment.sum('net_amount', {
      where: { landlord_id: userId, status: 'completed' },
      transaction,
    });
    const totalRevenue = parseFloat(totalRevenueRes || 0);

    const completedWithdrawalsRes = await WithdrawalRequest.sum('amount', {
      where: { user_id: userId, status: 'completed' },
      transaction,
    });
    const completedWithdrawals = parseFloat(completedWithdrawalsRes || 0);

    const pendingWithdrawalsRes = await WithdrawalRequest.sum('amount', {
      where: { user_id: userId, status: { [Op.in]: ['pending', 'processing'] } },
      transaction,
    });
    const pendingWithdrawals = parseFloat(pendingWithdrawalsRes || 0);

    const availableBalance = totalRevenue - completedWithdrawals - pendingWithdrawals;

    if (requestAmount > availableBalance) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Maximum you can withdraw is ${availableBalance.toLocaleString('vi-VN')} đ.`,
      });
    }

    // Create withdrawal request (Automatically completed in simulated demo mode)
    const withdrawal = await WithdrawalRequest.create({
      user_id: userId,
      amount: requestAmount,
      bank_name: bankDetails.bank_name,
      account_number: bankDetails.account_number,
      account_holder_name: bankDetails.account_holder_name,
      status: 'completed',
      transaction_proof_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
      admin_notes: 'Hệ thống tự động duyệt giải ngân (Môi trường thử nghiệm).',
      payout_date: new Date(),
    }, { transaction });

    // Associate completed payments that are not currently associated with a withdrawal request
    const eligiblePayments = await Payment.findAll({
      where: {
        landlord_id: userId,
        status: 'completed',
        payout_status: 'pending',
        withdrawal_id: null,
      },
      transaction,
    });

    for (const payment of eligiblePayments) {
      await payment.update({
        payout_status: 'completed',
        payout_date: new Date(),
        withdrawal_id: withdrawal.withdrawal_id,
      }, { transaction });
    }

    // Create system notification for the user
    const { Notification } = require('../models');
    await Notification.create({
      user_id: userId,
      title: 'Rút tiền tự động thành công',
      message: `Yêu cầu rút tiền ${requestAmount.toLocaleString('vi-VN')} đ của bạn đã được hệ thống tự động xử lý và chuyển về tài khoản ngân hàng thành công.`,
      notification_type: 'system',
      related_id: withdrawal.withdrawal_id,
    }, { transaction });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      data: withdrawal,
      message: 'Rút tiền thành công! Giao dịch đã được hệ thống tự động xử lý.',
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// =========================================================
// GET /api/admin/withdrawals
// =========================================================
const getAdminWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await WithdrawalRequest.findAll({
      include: [
        { model: User, as: 'user', attributes: ['user_id', 'full_name', 'email', 'phone'] }
      ],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: withdrawals,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/admin/withdrawals/:id/process
// =========================================================
const processWithdrawal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const withdrawal = await WithdrawalRequest.findByPk(id);

    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal request not found.' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot process a withdrawal with status: ${withdrawal.status}` });
    }

    await withdrawal.update({
      status: 'processing',
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      data: withdrawal,
      message: 'Withdrawal request is now processing.',
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/admin/withdrawals/:id/complete
// =========================================================
const completeWithdrawal = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { transaction_proof_url, admin_notes } = req.body;

    const withdrawal = await WithdrawalRequest.findByPk(id, { transaction });
    if (!withdrawal) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Withdrawal request not found.' });
    }

    if (withdrawal.status !== 'processing' && withdrawal.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: `Cannot complete a withdrawal with status: ${withdrawal.status}` });
    }

    await withdrawal.update({
      status: 'completed',
      transaction_proof_url: transaction_proof_url || null,
      admin_notes: admin_notes || null,
      updated_at: new Date(),
    }, { transaction });

    // Update associated payments to completed
    await Payment.update(
      {
        payout_status: 'completed',
        payout_date: new Date(),
        updated_at: new Date(),
      },
      {
        where: { withdrawal_id: withdrawal.withdrawal_id },
        transaction,
      }
    );

    // Create system notification for the user
    const { Notification } = require('../models');
    await Notification.create({
      user_id: withdrawal.user_id,
      title: 'Withdrawal Completed',
      message: `Your withdrawal request of ${parseFloat(withdrawal.amount).toLocaleString('vi-VN')} đ has been completed. The funds have been sent to your bank account.`,
      notification_type: 'system',
      related_id: withdrawal.withdrawal_id,
    }, { transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      data: withdrawal,
      message: 'Withdrawal request completed successfully.',
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// =========================================================
// PUT /api/admin/withdrawals/:id/reject
// =========================================================
const rejectWithdrawal = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;

    const withdrawal = await WithdrawalRequest.findByPk(id, { transaction });
    if (!withdrawal) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Withdrawal request not found.' });
    }

    if (withdrawal.status !== 'processing' && withdrawal.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: `Cannot reject a withdrawal with status: ${withdrawal.status}` });
    }

    await withdrawal.update({
      status: 'rejected',
      admin_notes: admin_notes || 'Rejected by Admin',
      updated_at: new Date(),
    }, { transaction });

    // Revert associated payments to pending and clear withdrawal_id
    await Payment.update(
      {
        payout_status: 'pending',
        withdrawal_id: null,
        updated_at: new Date(),
      },
      {
        where: { withdrawal_id: withdrawal.withdrawal_id },
        transaction,
      }
    );

    // Create system notification for the user
    const { Notification } = require('../models');
    await Notification.create({
      user_id: withdrawal.user_id,
      title: 'Withdrawal Rejected',
      message: `Your withdrawal request of ${parseFloat(withdrawal.amount).toLocaleString('vi-VN')} đ was rejected. Notes: ${admin_notes || 'Contact support.'}`,
      notification_type: 'system',
      related_id: withdrawal.withdrawal_id,
    }, { transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      data: withdrawal,
      message: 'Withdrawal request rejected.',
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// =========================================================
// GET /api/admin/finance/statistics
// =========================================================
const getAdminFinanceStats = async (req, res, next) => {
  try {
    // 1. Total Platform Fee (Admin Revenue)
    const totalRevenueRes = await Payment.sum('platform_fee', {
      where: { status: 'completed' }
    });
    const totalPlatformRevenue = parseFloat(totalRevenueRes || 0);

    // 2. Total Paid to Landlords
    const totalPaidRes = await WithdrawalRequest.sum('amount', {
      where: { status: 'completed' }
    });
    const totalPaid = parseFloat(totalPaidRes || 0);

    // 3. Pending Landlord Payouts
    const totalPendingRes = await WithdrawalRequest.sum('amount', {
      where: { status: { [Op.in]: ['pending', 'processing'] } }
    });
    const totalPending = parseFloat(totalPendingRes || 0);

    // 4. Total Escrow Balance (held in system)
    const totalEscrowCollectedRes = await Payment.sum('amount', {
      where: { status: 'completed' }
    });
    const totalEscrowCollected = parseFloat(totalEscrowCollectedRes || 0);
    
    // Net Escrow in system = Total Collected - Total Paid - Total Platform Revenue (already withdrawn/deducted)
    const totalEscrowBalance = totalEscrowCollected - totalPaid - totalPlatformRevenue;

    return res.status(200).json({
      success: true,
      data: {
        totalPlatformRevenue,
        totalPaid,
        totalPending,
        totalEscrowBalance: Math.max(0, totalEscrowBalance),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBankDetails,
  saveBankDetails,
  getWithdrawals,
  createWithdrawal,
  getAdminWithdrawals,
  processWithdrawal,
  completeWithdrawal,
  rejectWithdrawal,
  getAdminFinanceStats,
};
