const { Op } = require('sequelize');
const { Contract, Room, User, Notification, RenewalRequest, Payment, OtpVerification } = require('../models');
const generateOtp = require('../utils/generateOtp');
const { sendOtpEmail, sendContractEmail } = require('../utils/sendEmail');
const { generateContractPdfBuffer } = require('../utils/contractPdfGenerator');

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
      where: { 
        contract_id: contractId, 
        tenant_id: tenantId, 
        status: { [Op.in]: ['active', 'pre_booked_active'] } 
      },
      include: [{ model: Room, as: 'room' }]
    });

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng.' });
    }

    // Find existing pending/unprocessed request
    let renewalReq = await RenewalRequest.findOne({
      where: { 
        contract_id: contractId,
        status: { [Op.notIn]: ['COMPLETED', 'REJECTED'] }
      }
    });

    if (!renewalReq) {
      // Create new if no active pending request exists
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
    const { proposedNewRent, additionalTerms, landlordSignature } = req.body;
    const landlordId = req.user.userId;

    const renewalReq = await RenewalRequest.findOne({
      where: { id: requestId, landlord_id: landlordId },
      include: [{ model: Contract, as: 'contract', include: [{ model: Room, as: 'room' }] }]
    });

    if (!renewalReq) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu gia hạn.' });
    }

    if (renewalReq.status === 'COMPLETED') {
      return res.status(200).json({
        success: true,
        message: 'Yêu cầu gia hạn này đã được duyệt và hoàn tất trước đó.',
        data: renewalReq
      });
    }

    if (renewalReq.status !== 'PENDING_LANDLORD' && renewalReq.status !== 'WAITING_TENANT_SIGN') {
      return res.status(400).json({ success: false, message: 'Yêu cầu này không ở trạng thái chờ duyệt.' });
    }

    const originalContract = renewalReq.contract;
    const room = originalContract.room;

    // Calculate new end date based on original end_date and requested duration
    const newEndDate = new Date(originalContract.end_date);
    newEndDate.setMonth(newEndDate.getMonth() + renewalReq.requested_duration_months);

    const oldRent = parseFloat(originalContract.monthly_rent);
    const newRent = parseFloat(proposedNewRent || renewalReq.proposed_new_rent || originalContract.monthly_rent);

    // Update Original Contract directly (extending it)
    await originalContract.update({
      end_date: newEndDate,
      monthly_rent: newRent,
      terms_and_conditions: additionalTerms || renewalReq.additional_terms || originalContract.terms_and_conditions,
      landlord_signature: landlordSignature || originalContract.landlord_signature,
      is_renewed: true,
      renewal_status: 'renewed',
      status: 'active'
    });

    // Update Request to COMPLETED immediately
    await renewalReq.update({
      proposed_new_rent: newRent,
      additional_terms: additionalTerms || renewalReq.additional_terms,
      landlord_signed_at: new Date(),
      tenant_signed_at: new Date(),
      status: 'COMPLETED',
      new_contract_id: originalContract.contract_id
    });

    // Deposit Difference Logic (If rent increased)
    if (newRent > oldRent) {
      const depositDiff = newRent - oldRent;
      await Payment.create({
        room_id: room.room_id,
        tenant_id: originalContract.tenant_id,
        landlord_id: originalContract.landlord_id,
        contract_id: originalContract.contract_id,
        amount: depositDiff,
        payment_type: 'deposit_adjustment',
        payment_method: 'vnpay',
        status: 'pending',
        due_date: originalContract.end_date, // Starts when extension starts
      });
    }

    // Clear upcoming vacancy date
    if (room) {
      await room.update({ available_from: null });
    }

    // Notify tenant
    await Notification.create({
      user_id: renewalReq.tenant_id,
      title: 'Hợp đồng đã được gia hạn thành công',
      message: `Chủ nhà đã duyệt yêu cầu gia hạn phòng "${renewalReq.contract.room?.room_number || renewalReq.contract.room_id}". Hợp đồng ${originalContract.contract_number} đã được gia hạn thêm ${renewalReq.requested_duration_months} tháng.`,
      notification_type: 'contract_renewal',
      related_id: renewalReq.id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${renewalReq.tenant_id}`).emit('new_notification', {
        title: 'Hợp đồng đã được gia hạn thành công',
        type: 'contract_renewal'
      });
    }

    // Send PDF contract email to both tenant & landlord
    try {
      const pdfBuffer = await generateContractPdfBuffer({
        contractNumber: originalContract.contract_number,
        startDate: originalContract.start_date,
        endDate: originalContract.end_date,
        monthlyRent: originalContract.monthly_rent,
        depositAmount: originalContract.deposit_amount,
        termsAndConditions: originalContract.terms_and_conditions,
        landlordName: originalContract.landlord_name,
        landlordIc: originalContract.landlord_ic,
        landlordIcIssueDate: originalContract.landlord_ic_issue_date,
        landlordIcIssuePlace: originalContract.landlord_ic_issue_place,
        landlordPermanentAddress: originalContract.landlord_permanent_address,
        landlordSignature: originalContract.landlord_signature,
        tenantName: originalContract.tenant_name,
        tenantIc: originalContract.tenant_ic,
        tenantIcIssueDate: originalContract.tenant_ic_issue_date,
        tenantIcIssuePlace: originalContract.tenant_ic_issue_place,
        tenantPermanentAddress: originalContract.tenant_permanent_address,
        tenantSignature: originalContract.tenant_signature,
      });

      const tenantUser = await User.findByPk(originalContract.tenant_id);
      const landlordUser = await User.findByPk(originalContract.landlord_id);

      await sendContractEmail(tenantUser.email, pdfBuffer, originalContract.contract_number);
      await sendContractEmail(landlordUser.email, pdfBuffer, originalContract.contract_number);
    } catch (emailErr) {
      console.error('Error generating/sending renewal contract PDF email:', emailErr);
    }

    return res.status(200).json({
      success: true,
      message: 'Duyệt yêu cầu gia hạn và duy trì hợp đồng thành công.',
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
    const { reason } = req.body;
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
    const dateFormatted = contract.end_date ? new Date(contract.end_date).toLocaleDateString('vi-VN') : '';
    await Notification.create({
      user_id: renewalReq.tenant_id,
      title: 'Yêu cầu gia hạn bị từ chối',
      message: `Chủ nhà đã từ chối yêu cầu gia hạn phòng "${contract.room?.room_number || contract.room_id}". Lý do: ${reason || 'Không có lý do cụ thể'}. Hợp đồng sẽ kết thúc vào ngày ${dateFormatted}.`,
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
    // Send email asynchronously
    sendOtpEmail(user.email, otpCode, 'sign_contract').catch(err => console.error('Error sending OTP email:', err));
    console.log(`🔑 [RENEWAL OTP] Sent OTP ${otpCode} to ${user.email} for contract ${contractId}`);

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

    // Send PDF contract email to both tenant & landlord
    try {
      const pdfBuffer = await generateContractPdfBuffer({
        contractNumber: newContract.contract_number,
        startDate: newContract.start_date,
        endDate: newContract.end_date,
        monthlyRent: newContract.monthly_rent,
        depositAmount: newContract.deposit_amount,
        room: room || {},
        landlord: {},
        tenant: {},
        landlordName: newContract.landlord_name,
        landlordIc: newContract.landlord_ic,
        landlordIcIssueDate: newContract.landlord_ic_issue_date,
        landlordIcIssuePlace: newContract.landlord_ic_issue_place,
        landlordPermanentAddress: newContract.landlord_permanent_address,
        landlordSignature: newContract.landlord_signature,
        tenantName: newContract.tenant_name,
        tenantIc: newContract.tenant_ic,
        tenantIcIssueDate: newContract.tenant_ic_issue_date,
        tenantIcIssuePlace: newContract.tenant_ic_issue_place,
        tenantPermanentAddress: newContract.tenant_permanent_address,
        tenantSignature: newContract.tenant_signature,
      });

      const tenantUser = await User.findByPk(tenantId);
      const landlordUser = await User.findByPk(originalContract.landlord_id);

      if (tenantUser && tenantUser.email) {
        await sendContractEmail(tenantUser.email, newContract.contract_number, pdfBuffer);
      }
      if (landlordUser && landlordUser.email) {
        await sendContractEmail(landlordUser.email, newContract.contract_number, pdfBuffer);
      }
    } catch (emailErr) {
      console.error('❌ Failed to send renewal contract PDF email:', emailErr.message);
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
