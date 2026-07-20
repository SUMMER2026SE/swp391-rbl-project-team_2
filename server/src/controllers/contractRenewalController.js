const { Op } = require('sequelize');
const { Contract, Room, User, Notification, RenewalRequest, Payment, OtpVerification } = require('../models');
const generateOtp = require('../utils/generateOtp');
const { sendOtpEmail } = require('../utils/sendEmail');

// =========================================================
// TENANT: Request Contract Renewal
// =========================================================
const tenantRequestRenewal = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const { requestedDurationMonths } = req.body;
    const tenantId = req.user.userId;

    if (!requestedDurationMonths || requestedDurationMonths < 1) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn số tháng gia hạn hợp lệ.' });
    }

    const contract = await Contract.findOne({
      where: { contract_id: contractId, tenant_id: tenantId, status: 'active' },
      include: [{ model: Room, as: 'room' }]
    });

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng.' });
    }

    // Find existing request
    let renewalReq = await RenewalRequest.findOne({
      where: { contract_id: contractId }
    });

    if (!renewalReq) {
      // Create new if T-60 job hasn't run yet
      renewalReq = await RenewalRequest.create({
        contract_id: contract.contract_id,
        tenant_id: contract.tenant_id,
        landlord_id: contract.landlord_id,
        requested_duration_months: requestedDurationMonths,
        status: 'PENDING_LANDLORD'
      });
    } else {
      if (renewalReq.status !== 'PENDING_INTENT') {
        return res.status(400).json({ success: false, message: 'Yêu cầu gia hạn đã tồn tại hoặc đã được xử lý.' });
      }
      // Update existing
      await renewalReq.update({
        requested_duration_months: requestedDurationMonths,
        status: 'PENDING_LANDLORD'
      });
    }

    // Notify landlord
    await Notification.create({
      user_id: contract.landlord_id,
      title: 'Yêu cầu gia hạn hợp đồng',
      message: `Khách thuê phòng "${contract.room?.room_number || contract.room_id}" yêu cầu gia hạn thêm ${requestedDurationMonths} tháng. Vui lòng xem xét và duyệt.`,
      notification_type: 'contract_renewal',
      related_id: renewalReq.id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${contract.landlord_id}`).emit('new_notification', {
        title: 'Yêu cầu gia hạn hợp đồng',
        type: 'contract_renewal'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Gửi yêu cầu gia hạn thành công.',
      data: renewalReq
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// LANDLORD: Review and Approve Renewal
// =========================================================
const landlordApproveRenewal = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { proposedNewRent, additionalTerms } = req.body;
    const landlordId = req.user.userId;

    const renewalReq = await RenewalRequest.findOne({
      where: { id: requestId, landlord_id: landlordId },
      include: [{ model: Contract, as: 'contract', include: [{ model: Room, as: 'room' }] }]
    });

    if (!renewalReq) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu gia hạn.' });
    }

    if (renewalReq.status !== 'PENDING_LANDLORD') {
      return res.status(400).json({ success: false, message: 'Yêu cầu này không ở trạng thái chờ duyệt.' });
    }

    const newRent = proposedNewRent || renewalReq.contract.monthly_rent;

    // Simulate 3rd party signature API call here
    // In a real app, this would get a signature URL
    
    await renewalReq.update({
      proposed_new_rent: newRent,
      additional_terms: additionalTerms,
      landlord_signed_at: new Date(),
      status: 'WAITING_TENANT_SIGN'
    });

    // Notify tenant
    await Notification.create({
      user_id: renewalReq.tenant_id,
      title: 'Chủ nhà đã duyệt gia hạn',
      message: `Chủ nhà đã duyệt yêu cầu gia hạn phòng "${renewalReq.contract.room?.room_number || renewalReq.contract.room_id}". Vui lòng kiểm tra giá mới và ký xác nhận.`,
      notification_type: 'contract_renewal',
      related_id: renewalReq.id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${renewalReq.tenant_id}`).emit('new_notification', {
        title: 'Chủ nhà đã duyệt gia hạn',
        type: 'contract_renewal'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Duyệt yêu cầu gia hạn thành công. Đang chờ khách thuê ký.',
      data: renewalReq
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// LANDLORD: Decline Renewal Request
// =========================================================
const landlordDeclineRenewal = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const landlordId = req.user.userId;

    const renewalReq = await RenewalRequest.findOne({
      where: { id: requestId, landlord_id: landlordId },
      include: [{ model: Contract, as: 'contract', include: [{ model: Room, as: 'room' }] }]
    });

    if (!renewalReq) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu gia hạn.' });
    }

    if (renewalReq.status !== 'PENDING_LANDLORD') {
      return res.status(400).json({ success: false, message: 'Yêu cầu này không ở trạng thái chờ duyệt.' });
    }

    await renewalReq.update({
      status: 'REJECTED'
    });

    const contract = renewalReq.contract;
    if (contract.room) {
      await contract.room.update({ available_from: contract.end_date });
    }

    // Notify tenant
    await Notification.create({
      user_id: renewalReq.tenant_id,
      title: 'Yêu cầu gia hạn bị từ chối',
      message: `Chủ nhà đã từ chối yêu cầu gia hạn phòng "${renewalReq.contract.room?.room_number || renewalReq.contract.room_id}". Hợp đồng sẽ kết thúc vào ngày ${renewalReq.contract.end_date.toLocaleDateString('vi-VN')}.`,
      notification_type: 'contract_renewal',
      related_id: renewalReq.id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${renewalReq.tenant_id}`).emit('new_notification', {
        title: 'Yêu cầu gia hạn bị từ chối',
        type: 'contract_renewal'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Đã từ chối yêu cầu gia hạn thành công.',
      data: renewalReq
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// TENANT: Send OTP for Signing Renewal
// =========================================================
const tenantSendOtpForRenewal = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const tenantId = req.user.userId;

    const renewalReq = await RenewalRequest.findOne({
      where: { contract_id: contractId, tenant_id: tenantId, status: 'WAITING_TENANT_SIGN' }
    });

    if (!renewalReq) {
      return res.status(404).json({ success: false, message: 'Yêu cầu gia hạn không khả dụng để ký.' });
    }

    const user = await User.findByPk(tenantId);

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes

    await OtpVerification.create({
      user_id: tenantId,
      otp_code: otpCode,
      purpose: 'sign_contract',
      expired_at: expiresAt,
    });

    await sendOtpEmail(user.email, otpCode, 'sign_contract');

    return res.status(200).json({
      success: true,
      message: 'Mã OTP đã được gửi đến email của bạn.',
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// TENANT: Sign and Complete Renewal
// =========================================================
const tenantSignRenewal = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const { otp, tenantSignature } = req.body;
    const tenantId = req.user.userId;

    if (!otp) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mã OTP.' });
    }

    const renewalReq = await RenewalRequest.findOne({
      where: { contract_id: contractId, tenant_id: tenantId, status: 'WAITING_TENANT_SIGN' },
      include: [{ model: Contract, as: 'contract', include: [{ model: Room, as: 'room' }] }]
    });

    if (!renewalReq) {
      return res.status(404).json({ success: false, message: 'Yêu cầu gia hạn không khả dụng để ký.' });
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
      return res.status(400).json({ success: false, message: 'Mã OTP không hợp lệ hoặc đã hết hạn.' });
    }

    // Mark OTP as used
    await otpRecord.update({ is_used: true });

    const originalContract = renewalReq.contract;
    const room = originalContract.room;

    // Calculate new end date based on original end_date and requested duration
    const newEndDate = new Date(originalContract.end_date);
    newEndDate.setMonth(newEndDate.getMonth() + renewalReq.requested_duration_months);

    // Create new Contract
    const contractNumber = `CT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const newContract = await Contract.create({
      room_id: originalContract.room_id,
      tenant_id: originalContract.tenant_id,
      landlord_id: originalContract.landlord_id,
      contract_number: contractNumber,
      start_date: originalContract.end_date, // Starts when old one ends
      end_date: newEndDate,
      monthly_rent: renewalReq.proposed_new_rent,
      deposit_amount: originalContract.deposit_amount, // Keep original deposit amount
      status: 'pending_active', // Or scheduled
      terms_and_conditions: renewalReq.additional_terms || originalContract.terms_and_conditions,
      tenant_agreed: true,
      tenant_signature: tenantSignature || originalContract.tenant_signature,
      landlord_name: originalContract.landlord_name,
      landlord_ic: originalContract.landlord_ic,
      landlord_ic_issue_date: originalContract.landlord_ic_issue_date,
      landlord_ic_issue_place: originalContract.landlord_ic_issue_place,
      landlord_permanent_address: originalContract.landlord_permanent_address,
      landlord_signature: originalContract.landlord_signature,
      tenant_name: originalContract.tenant_name,
      tenant_ic: originalContract.tenant_ic,
      tenant_ic_issue_date: originalContract.tenant_ic_issue_date,
      tenant_ic_issue_place: originalContract.tenant_ic_issue_place,
      tenant_permanent_address: originalContract.tenant_permanent_address,
    });

    // Update Request
    await renewalReq.update({
      tenant_signed_at: new Date(),
      status: 'COMPLETED',
      new_contract_id: newContract.contract_id
    });

    // Update Original Contract to indicate it will be renewed
    await originalContract.update({
      is_renewed: true,
      renewal_status: 'renewed',
      renewal_contract_id: newContract.contract_id
    });

    // Deposit Difference Logic (If rent increased)
    if (renewalReq.proposed_new_rent > originalContract.monthly_rent) {
      const depositDiff = renewalReq.proposed_new_rent - originalContract.monthly_rent;
      // We assume deposit is 1 month rent. Create invoice for difference.
      await Payment.create({
        room_id: room.room_id,
        tenant_id: tenantId,
        landlord_id: originalContract.landlord_id,
        contract_id: newContract.contract_id,
        amount: depositDiff,
        payment_type: 'deposit_adjustment',
        payment_method: 'vnpay', // or default
        status: 'pending',
        due_date: newContract.start_date, // Due before new contract starts
      });
      // Optionally notify tenant about this extra bill
    }

    // Clear upcoming vacancy date
    if (room) {
      await room.update({ available_from: null });
    }

    // Notify landlord
    await Notification.create({
      user_id: originalContract.landlord_id,
      title: 'Gia hạn thành công',
      message: `Khách thuê phòng "${room?.room_number || originalContract.room_id}" đã ký xác nhận gia hạn. Hợp đồng mới đã được tạo.`,
      notification_type: 'contract_renewal',
      related_id: renewalReq.id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${originalContract.landlord_id}`).emit('new_notification', {
        title: 'Gia hạn thành công',
        type: 'contract_renewal'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Ký xác nhận gia hạn thành công. Hợp đồng mới đã được tạo.',
      data: newContract
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  tenantRequestRenewal,
  landlordApproveRenewal,
  landlordDeclineRenewal,
  tenantSendOtpForRenewal,
  tenantSignRenewal
};
