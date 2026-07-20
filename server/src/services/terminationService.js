const { Op } = require('sequelize');
const { Contract, Room, User, TerminationRequest, TerminationRecord, Notification } = require('../models');

/**
 * Helper: Calculate remaining rent and total payout
 */
const calculateFinancialSettlement = (contract, terminationType, requestedTerminationDate, customRefund, customRetained, customCompensation) => {
  const monthlyRent = parseFloat(contract.monthly_rent) || 0;
  const depositAmount = parseFloat(contract.deposit_amount) || 0;
  
  const termDate = new Date(requestedTerminationDate);
  const endDate = new Date(contract.end_date);
  
  let remainingRent = 0; // Rent is charged for the whole month, no prorated refunds

  let depositRefund = 0;
  let depositRetained = 0;
  let compensation = 0;

  switch (terminationType) {
    case 'Mutual':
      depositRefund = customRefund !== undefined ? parseFloat(customRefund) : depositAmount;
      depositRetained = customRetained !== undefined ? parseFloat(customRetained) : (depositAmount - depositRefund);
      compensation = customCompensation !== undefined ? parseFloat(customCompensation) : 0;
      break;

    case 'TenantVoluntaryBreak':
      // Tenant breaks early voluntarily -> Landlord retains deposit
      depositRefund = customRefund !== undefined ? parseFloat(customRefund) : 0;
      depositRetained = customRetained !== undefined ? parseFloat(customRetained) : depositAmount;
      compensation = customCompensation !== undefined ? parseFloat(customCompensation) : 0;
      break;

    case 'LandlordViolationClaim':
      // Tenant claims Landlord breached -> Tenant gets deposit back
      depositRefund = customRefund !== undefined ? parseFloat(customRefund) : depositAmount;
      depositRetained = 0;
      compensation = customCompensation !== undefined ? parseFloat(customCompensation) : 0;
      break;

    case 'TenantViolationClaim':
    case 'UnilateralLandlord':
      // Landlord claims Tenant breached -> Landlord retains deposit
      depositRetained = customRetained !== undefined ? parseFloat(customRetained) : depositAmount;
      depositRefund = customRefund !== undefined ? parseFloat(customRefund) : 0;
      compensation = customCompensation !== undefined ? parseFloat(customCompensation) : 0;
      break;

    case 'LandlordArbitraryBreak':
      // Landlord breaks contract without tenant fault -> 100% deposit refund + 1x deposit breach penalty
      depositRefund = depositAmount;
      depositRetained = 0;
      compensation = customCompensation !== undefined ? parseFloat(customCompensation) : depositAmount;
      break;

    default:
      depositRefund = customRefund !== undefined ? parseFloat(customRefund) : depositAmount;
      depositRetained = customRetained !== undefined ? parseFloat(customRetained) : 0;
      compensation = customCompensation !== undefined ? parseFloat(customCompensation) : 0;
      break;
  }

  const totalPayoutToTenant = depositRefund + remainingRent + compensation;

  return {
    depositRefund: Math.max(0, depositRefund),
    depositRetained: Math.max(0, depositRetained),
    remainingRent: Math.max(0, remainingRent),
    compensation: Math.max(0, compensation),
    totalPayoutToTenant: Math.max(0, totalPayoutToTenant),
  };
};

/**
 * Submit a termination request (Mutual or Unilateral)
 */
const createTerminationRequest = async (userId, data, evidenceFiles = [], io = null) => {
  const { contractId, terminationType, reason, description, requestedTerminationDate, customRefund, customRetained, customCompensation } = data;

  // 1. Verify contract exists and is active
  const contract = await Contract.findOne({
    where: { contract_id: contractId },
    include: [{ model: Room, as: 'room' }],
  });

  if (!contract) {
    const error = new Error('Không tìm thấy hợp đồng.');
    error.status = 404;
    throw error;
  }

  if (contract.status !== 'active') {
    const error = new Error(`Chỉ có thể yêu cầu chấm dứt đối với hợp đồng đang hoạt động (ACTIVE). Trạng thái hiện tại: ${contract.status}`);
    error.status = 400;
    throw error;
  }

  // Validate requested termination date is not in the past
  const todayZero = new Date();
  todayZero.setHours(0, 0, 0, 0);

  const reqDate = new Date(requestedTerminationDate);
  reqDate.setHours(0, 0, 0, 0);

  if (isNaN(reqDate.getTime()) || reqDate < todayZero) {
    const error = new Error('Ngày chấm dứt hợp đồng mong muốn phải là hôm nay hoặc một ngày trong tương lai (không được chọn ngày trong quá khứ).');
    error.status = 400;
    throw error;
  }

  if (contract.end_date && reqDate > new Date(contract.end_date)) {
    const error = new Error('Ngày chấm dứt hợp đồng mong muốn không được vượt quá ngày hết hạn của hợp đồng.');
    error.status = 400;
    throw error;
  }

  // 2. Check authorization (Must be tenant or landlord of contract)
  const isTenant = contract.tenant_id === userId;
  const isLandlord = contract.landlord_id === userId;

  if (!isTenant && !isLandlord) {
    const error = new Error('Bạn không có quyền yêu cầu chấm dứt hợp đồng này.');
    error.status = 403;
    throw error;
  }

  // 3. Check duplicate pending requests
  const existingPending = await TerminationRequest.findOne({
    where: { contract_id: contractId, status: 'PENDING' },
  });

  if (existingPending) {
    const error = new Error('Hợp đồng này đang có một yêu cầu chấm dứt chờ xử lý.');
    error.status = 400;
    throw error;
  }

  // 4. Format evidence URLs
  const evidenceUrls = evidenceFiles.map(file => file.path || file.location || file.url || `/uploads/${file.filename}`);

  const isUnilateral = (terminationType === 'UnilateralLandlord' || terminationType === 'LandlordArbitraryBreak');

  // 5. Handle Immediate Unilateral Termination
  if (isUnilateral && isLandlord) {
    const settlement = calculateFinancialSettlement(
      contract,
      terminationType,
      requestedTerminationDate || new Date(),
      customRefund,
      customRetained,
      customCompensation
    );

    // Update contract status
    contract.status = 'terminated';
    contract.updated_at = new Date();
    await contract.save();

    // Update room status to available
    if (contract.room) {
      contract.room.status = 'available';
      contract.room.available_quantity = (contract.room.available_quantity || 0) + 1;
      await contract.room.save();
    }

    // Create accepted request
    const request = await TerminationRequest.create({
      contract_id: contractId,
      requested_by: userId,
      termination_type: terminationType,
      reason,
      description: description || null,
      evidence_urls: evidenceUrls,
      request_date: new Date(),
      requested_termination_date: requestedTerminationDate || new Date(),
      is_unilateral: true,
      status: 'ACCEPTED',
      reviewed_by: userId,
      review_date: new Date(),
      review_note: 'Đơn phương chấm dứt hợp đồng bởi Chủ nhà',
    });

    // Create termination record
    const record = await TerminationRecord.create({
      contract_id: contractId,
      request_id: request.request_id,
      termination_date: new Date(),
      final_reason: `[Đơn phương] ${reason}`,
      deposit_refund: settlement.depositRefund,
      deposit_retained: settlement.depositRetained,
      remaining_rent: settlement.remainingRent,
      compensation: settlement.compensation,
      total_payout_to_tenant: settlement.totalPayoutToTenant,
      final_note: description || null,
    });

    // Notify tenant
    const recipientId = contract.tenant_id;
    const notif = await Notification.create({
      user_id: recipientId,
      title: 'Hợp đồng đã bị chấm dứt đơn phương',
      message: `Chủ nhà đã đơn phương chấm dứt hợp đồng #${contract.contract_number}. Lý do: ${reason}`,
      notification_type: 'contract',
      related_id: contract.contract_id,
    });

    if (io) {
      io.to(`user_${recipientId}`).emit('new_notification', {
        title: notif.title,
        message: notif.message,
        type: 'contract',
        relatedId: contract.contract_id,
      });
    }

    return { request, record, immediate: true, settlement };
  }

  // 6. Handle Mutual or Claim Request (Requires Approval)
  const request = await TerminationRequest.create({
    contract_id: contractId,
    requested_by: userId,
    termination_type: terminationType,
    reason,
    description: description || null,
    evidence_urls: evidenceUrls,
    request_date: new Date(),
    requested_termination_date: requestedTerminationDate || new Date(),
    is_unilateral: false,
    status: 'PENDING',
  });

  const recipientId = isTenant ? contract.landlord_id : contract.tenant_id;
  const requesterRole = isTenant ? 'Khách thuê' : 'Chủ nhà';
  
  const notif = await Notification.create({
    user_id: recipientId,
    title: 'Yêu cầu chấm dứt hợp đồng mới',
    message: `${requesterRole} đã gửi yêu cầu chấm dứt hợp đồng #${contract.contract_number}. Lý do: ${reason}`,
    notification_type: 'contract',
    related_id: request.request_id,
  });

  if (io) {
    io.to(`user_${recipientId}`).emit('new_notification', {
      title: notif.title,
      message: notif.message,
      type: 'contract',
      relatedId: request.request_id,
    });
  }

  return { request, immediate: false };
};

/**
 * Approve a pending termination request
 */
const approveTerminationRequest = async (requestId, reviewerId, reviewNote, customValues = {}, io = null) => {
  const request = await TerminationRequest.findOne({
    where: { request_id: requestId, status: 'PENDING' },
    include: [
      {
        model: Contract,
        as: 'contract',
        include: [{ model: Room, as: 'room' }],
      },
    ],
  });

  if (!request) {
    const error = new Error('Không tìm thấy yêu cầu chấm dứt hợp đồng hoặc yêu cầu đã được xử lý.');
    error.status = 404;
    throw error;
  }

  const contract = request.contract;

  // Ensure reviewer is the opposite party
  if (request.requested_by === reviewerId) {
    const error = new Error('Bạn không thể tự duyệt yêu cầu chấm dứt hợp đồng do chính mình tạo ra.');
    error.status = 403;
    throw error;
  }

  const isContractParty = contract.tenant_id === reviewerId || contract.landlord_id === reviewerId;
  if (!isContractParty) {
    const error = new Error('Bạn không có quyền duyệt yêu cầu này.');
    error.status = 403;
    throw error;
  }

  // Calculate financial settlement
  const settlement = calculateFinancialSettlement(
    contract,
    request.termination_type,
    request.requested_termination_date,
    customValues.depositRefund,
    customValues.depositRetained,
    customValues.compensation
  );

  const needsRefund = settlement.totalPayoutToTenant > 0;

  // Update request
  request.status = 'ACCEPTED';
  request.reviewed_by = reviewerId;
  request.review_date = new Date();
  request.review_note = reviewNote || 'Đã chấp nhận yêu cầu chấm dứt';
  request.updated_at = new Date();
  await request.save();

  // If no refund needed, close contract and room immediately
  if (!needsRefund) {
    contract.status = 'terminated';
    contract.updated_at = new Date();
    await contract.save();

    if (contract.room) {
      contract.room.status = 'available';
      contract.room.available_quantity = (contract.room.available_quantity || 0) + 1;
      await contract.room.save();
    }
  }

  // Create record
  const record = await TerminationRecord.create({
    contract_id: contract.contract_id,
    request_id: request.request_id,
    termination_date: new Date(),
    final_reason: request.reason,
    deposit_refund: settlement.depositRefund,
    deposit_retained: settlement.depositRetained,
    remaining_rent: settlement.remainingRent,
    compensation: settlement.compensation,
    total_payout_to_tenant: settlement.totalPayoutToTenant,
    final_note: reviewNote || null,
    refund_status: needsRefund ? 'PENDING_REFUND' : 'COMPLETED',
  });

  // Notify requester
  const recipientId = request.requested_by;
  const notif = await Notification.create({
    user_id: recipientId,
    title: 'Yêu cầu chấm dứt hợp đồng đã được chấp nhận',
    message: needsRefund 
      ? `Yêu cầu chấm dứt hợp đồng #${contract.contract_number} đã được chấp nhận. Hệ thống đang chờ Chủ nhà hoàn tiền cọc cho bạn.`
      : `Yêu cầu chấm dứt hợp đồng #${contract.contract_number} của bạn đã được chấp nhận. Hợp đồng đã chính thức chấm dứt.`,
    notification_type: 'contract',
    related_id: contract.contract_id,
  });

  if (io) {
    io.to(`user_${recipientId}`).emit('new_notification', {
      title: notif.title,
      message: notif.message,
      type: 'contract',
      relatedId: contract.contract_id,
    });
  }

  return { request, record, settlement };
};

/**
 * Reject a pending termination request
 */
const rejectTerminationRequest = async (requestId, reviewerId, reviewNote, io = null) => {
  const request = await TerminationRequest.findOne({
    where: { request_id: requestId, status: 'PENDING' },
    include: [{ model: Contract, as: 'contract' }],
  });

  if (!request) {
    const error = new Error('Không tìm thấy yêu cầu chấm dứt hợp đồng hoặc yêu cầu đã được xử lý.');
    error.status = 404;
    throw error;
  }

  const contract = request.contract;

  if (request.requested_by === reviewerId) {
    const error = new Error('Bạn không thể tự từ chối yêu cầu do chính mình tạo ra.');
    error.status = 403;
    throw error;
  }

  const isContractParty = contract.tenant_id === reviewerId || contract.landlord_id === reviewerId;
  if (!isContractParty) {
    const error = new Error('Bạn không có quyền từ chối yêu cầu này.');
    error.status = 403;
    throw error;
  }

  // If it's a violation claim and the other party disagrees, it goes to DISPUTED (Admin solves)
  if (request.termination_type === 'TenantViolationClaim' || request.termination_type === 'LandlordViolationClaim') {
    request.status = 'DISPUTED';
  } else {
    request.status = 'REJECTED';
  }
  
  request.reviewed_by = reviewerId;
  request.review_date = new Date();
  request.review_note = reviewNote || (request.status === 'DISPUTED' ? 'Không đồng ý với cáo buộc vi phạm, chờ Admin giải quyết' : 'Đã từ chối yêu cầu chấm dứt');
  request.updated_at = new Date();
  await request.save();

  // Notify requester
  const recipientId = request.requested_by;
  const notif = await Notification.create({
    user_id: recipientId,
    title: 'Yêu cầu chấm dứt hợp đồng đã bị từ chối',
    message: `Yêu cầu chấm dứt hợp đồng #${contract.contract_number} đã bị từ chối. Lý do: ${reviewNote || 'Không có lý do cụ thể'}`,
    notification_type: 'contract',
    related_id: request.request_id,
  });

  if (io) {
    io.to(`user_${recipientId}`).emit('new_notification', {
      title: notif.title,
      message: notif.message,
      type: 'contract',
      relatedId: request.request_id,
    });
  }

  return { request };
};

/**
 * Raise a dispute for a termination request
 */
const disputeTerminationRequest = async (requestId, userId, disputeReason, io = null) => {
  const request = await TerminationRequest.findOne({
    where: { request_id: requestId },
    include: [{ model: Contract, as: 'contract' }],
  });

  if (!request) {
    const error = new Error('Không tìm thấy yêu cầu chấm dứt.');
    error.status = 404;
    throw error;
  }

  const contract = request.contract;
  const isContractParty = contract.tenant_id === userId || contract.landlord_id === userId;
  if (!isContractParty) {
    const error = new Error('Bạn không thuộc hợp đồng này.');
    error.status = 403;
    throw error;
  }

  request.status = 'DISPUTED';
  request.review_note = `[Tranh chấp bởi User #${userId}]: ${disputeReason}`;
  request.updated_at = new Date();
  await request.save();

  return { request };
};

/**
 * Get termination request by ID
 */
const getTerminationRequestById = async (requestId, userId) => {
  const request = await TerminationRequest.findOne({
    where: { request_id: requestId },
    include: [
      {
        model: Contract,
        as: 'contract',
        include: [
          { model: Room, as: 'room' },
          { model: User, as: 'tenant', attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url'] },
          { model: User, as: 'landlordContract', attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url'] },
        ],
      },
      { model: User, as: 'requester', attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url'] },
      { model: User, as: 'reviewer', attributes: ['user_id', 'full_name', 'email', 'phone', 'avatar_url'] },
      { model: TerminationRecord, as: 'record' },
    ],
  });

  if (!request) {
    const error = new Error('Không tìm thấy yêu cầu chấm dứt.');
    error.status = 404;
    throw error;
  }

  return request;
};

/**
 * Get user's termination history
 */
const getTerminationHistory = async (userId, userRole = 'Tenant') => {
  let contractWhere = {};
  if (userRole === 'Landlord' || userRole === 'landlord') {
    contractWhere = { landlord_id: userId };
  } else if (userRole === 'Tenant' || userRole === 'tenant') {
    contractWhere = { tenant_id: userId };
  } else {
    contractWhere = { [Op.or]: [{ landlord_id: userId }, { tenant_id: userId }] };
  }

  let requests = await TerminationRequest.findAll({
    include: [
      {
        model: Contract,
        as: 'contract',
        where: contractWhere,
        include: [
          { model: Room, as: 'room', attributes: ['room_id', 'title', 'address', 'ward', 'district', 'city'] },
          { model: User, as: 'tenant', attributes: ['user_id', 'full_name', 'phone', 'email'] },
          { model: User, as: 'landlordContract', attributes: ['user_id', 'full_name', 'phone', 'email'] },
        ],
      },
      { model: User, as: 'requester', attributes: ['user_id', 'full_name', 'email'] },
      { model: TerminationRecord, as: 'record' },
    ],
    order: [['created_at', 'DESC']],
  });

  if (requests.length === 0) {
    requests = await TerminationRequest.findAll({
      include: [
        {
          model: Contract,
          as: 'contract',
          where: {
            [Op.or]: [{ landlord_id: userId }, { tenant_id: userId }],
          },
          include: [
            { model: Room, as: 'room', attributes: ['room_id', 'title', 'address', 'ward', 'district', 'city'] },
            { model: User, as: 'tenant', attributes: ['user_id', 'full_name', 'phone', 'email'] },
            { model: User, as: 'landlordContract', attributes: ['user_id', 'full_name', 'phone', 'email'] },
          ],
        },
        { model: User, as: 'requester', attributes: ['user_id', 'full_name', 'email'] },
        { model: TerminationRecord, as: 'record' },
      ],
      order: [['created_at', 'DESC']],
    });
  }

  return requests;
};

/**
 * Get termination status for a contract
 */
const getTerminationByContractId = async (contractId) => {
  const requests = await TerminationRequest.findAll({
    where: { contract_id: contractId },
    include: [
      { model: User, as: 'requester', attributes: ['user_id', 'full_name', 'email'] },
      { model: User, as: 'reviewer', attributes: ['user_id', 'full_name', 'email'] },
      { model: TerminationRecord, as: 'record' },
    ],
    order: [['created_at', 'DESC']],
  });

  const record = await TerminationRecord.findOne({
    where: { contract_id: contractId },
  });

  return { requests, record };
};

/**
 * Upload Refund Proof (By Landlord)
 */
const uploadRefundProof = async (requestId, landlordId, fileUrl, io = null) => {
  const request = await TerminationRequest.findOne({
    where: { request_id: requestId, status: 'ACCEPTED' },
    include: [{ model: Contract, as: 'contract' }, { model: TerminationRecord, as: 'record' }]
  });

  if (!request || !request.record) {
    const error = new Error('Không tìm thấy bản ghi quyết toán hoặc yêu cầu chưa được chấp nhận.');
    error.status = 404;
    throw error;
  }

  const contract = request.contract;
  if (contract.landlord_id !== landlordId) {
    const error = new Error('Chỉ chủ nhà mới có quyền tải lên biên lai hoàn tiền.');
    error.status = 403;
    throw error;
  }

  if (request.record.refund_status !== 'PENDING_REFUND') {
    const error = new Error('Bản ghi này không ở trạng thái chờ hoàn tiền.');
    error.status = 400;
    throw error;
  }

  request.record.refund_proof_url = fileUrl;
  request.record.refund_status = 'REFUND_TRANSFERRED';
  await request.record.save();

  // Notify tenant
  const notif = await Notification.create({
    user_id: contract.tenant_id,
    title: 'Chủ nhà đã chuyển khoản tiền cọc',
    message: `Chủ nhà đã tải lên hóa đơn chuyển tiền hoàn cọc cho hợp đồng #${contract.contract_number}. Vui lòng kiểm tra và xác nhận.`,
    notification_type: 'contract',
    related_id: request.request_id,
  });

  if (io) {
    io.to(`user_${contract.tenant_id}`).emit('new_notification', {
      title: notif.title,
      message: notif.message,
      type: 'contract',
      relatedId: request.request_id,
    });
  }

  return request.record;
};

/**
 * Confirm Refund Receipt (By Tenant)
 */
const confirmRefundReceipt = async (requestId, tenantId, io = null) => {
  const request = await TerminationRequest.findOne({
    where: { request_id: requestId, status: 'ACCEPTED' },
    include: [{ model: Contract, as: 'contract', include: [{ model: Room, as: 'room' }] }, { model: TerminationRecord, as: 'record' }]
  });

  if (!request || !request.record) {
    const error = new Error('Không tìm thấy bản ghi quyết toán.');
    error.status = 404;
    throw error;
  }

  const contract = request.contract;
  if (contract.tenant_id !== tenantId) {
    const error = new Error('Chỉ người thuê mới có quyền xác nhận nhận tiền.');
    error.status = 403;
    throw error;
  }

  if (request.record.refund_status !== 'REFUND_TRANSFERRED') {
    const error = new Error('Chủ nhà chưa tải lên biên lai chuyển khoản.');
    error.status = 400;
    throw error;
  }

  request.record.refund_status = 'COMPLETED';
  await request.record.save();

  // Now fully terminate contract and room
  contract.status = 'terminated';
  contract.updated_at = new Date();
  await contract.save();

  if (contract.room) {
    contract.room.status = 'available';
    contract.room.available_quantity = (contract.room.available_quantity || 0) + 1;
    await contract.room.save();
  }

  // Notify landlord
  const notif = await Notification.create({
    user_id: contract.landlord_id,
    title: 'Khách thuê đã xác nhận nhận tiền',
    message: `Khách thuê đã nhận được tiền cọc hoàn lại của hợp đồng #${contract.contract_number}. Hợp đồng chính thức chấm dứt.`,
    notification_type: 'contract',
    related_id: request.request_id,
  });

  if (io) {
    io.to(`user_${contract.landlord_id}`).emit('new_notification', {
      title: notif.title,
      message: notif.message,
      type: 'contract',
      relatedId: request.request_id,
    });
  }

  return request.record;
};

module.exports = {
  calculateFinancialSettlement,
  createTerminationRequest,
  approveTerminationRequest,
  rejectTerminationRequest,
  disputeTerminationRequest,
  getTerminationRequestById,
  getTerminationHistory,
  getTerminationByContractId,
  uploadRefundProof,
  confirmRefundReceipt,
};
