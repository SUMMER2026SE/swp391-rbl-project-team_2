const terminationService = require('../services/terminationService');

// =========================================================
// POST /api/termination/request
// Create termination request
// =========================================================
const createRequest = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const io = req.app.get('io');
    const evidenceFiles = req.files || [];

    const result = await terminationService.createTerminationRequest(userId, req.body, evidenceFiles, io);

    return res.status(201).json({
      success: true,
      message: result.immediate
        ? 'Hợp đồng đã được đơn phương chấm dứt thành công.'
        : 'Đã gửi yêu cầu chấm dứt hợp đồng thành công.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/termination/request/:id
// Get request detail by ID
// =========================================================
const getRequestDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const request = await terminationService.getTerminationRequestById(id, userId);

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/termination/history
// Get termination request history for current user
// =========================================================
const getHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.roleName || req.user.role || (req.user.roleId === 2 || req.user.role_id === 2 ? 'Landlord' : 'Tenant');

    const history = await terminationService.getTerminationHistory(userId, userRole);

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/termination/contract/:contractId
// Get termination requests and record by contract ID
// =========================================================
const getByContractId = async (req, res, next) => {
  try {
    const { contractId } = req.params;

    const result = await terminationService.getTerminationByContractId(contractId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/termination/request/:id/approve
// Approve termination request
// =========================================================
const approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviewerId = req.user.userId;
    const { reviewNote, depositRefund, depositRetained, compensation } = req.body;
    const io = req.app.get('io');

    const customValues = {
      depositRefund,
      depositRetained,
      compensation,
    };

    const result = await terminationService.approveTerminationRequest(id, reviewerId, reviewNote, customValues, io);

    return res.status(200).json({
      success: true,
      message: 'Đã chấp nhận yêu cầu chấm dứt hợp đồng thành công.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/termination/request/:id/reject
// Reject termination request
// =========================================================
const rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviewerId = req.user.userId;
    const { reviewNote } = req.body;
    const evidenceFiles = req.files || [];

    const result = await terminationService.rejectTerminationRequest(id, reviewerId, reviewNote, evidenceFiles, io);

    return res.status(200).json({
      success: true,
      message: 'Đã từ chối yêu cầu chấm dứt hợp đồng.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/termination/request/:id/dispute
// Raise dispute for a termination request
// =========================================================
const disputeRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { disputeReason } = req.body;
    const io = req.app.get('io');

    const result = await terminationService.disputeTerminationRequest(id, userId, disputeReason, io);

    return res.status(200).json({
      success: true,
      message: 'Đã gửi khiếu nại tranh chấp tới Ban quản trị hệ thống.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/termination/request/:id/refund/upload
// Landlord uploads refund proof
// =========================================================
const uploadRefundProof = async (req, res, next) => {
  try {
    const { id } = req.params;
    const landlordId = req.user.userId;
    const io = req.app.get('io');
    
    let fileUrl = req.body.fileUrl;
    if (req.file) {
      fileUrl = req.file.path || req.file.filename;
    }

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'Vui lòng tải lên ảnh chụp biên lai chuyển tiền.' });
    }

    const result = await terminationService.uploadRefundProof(id, landlordId, fileUrl, io);

    return res.status(200).json({
      success: true,
      message: 'Đã tải lên minh chứng hoàn tiền.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/termination/request/:id/refund/confirm
// Tenant confirms refund receipt
// =========================================================
const confirmRefundReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.userId;
    const io = req.app.get('io');

    const result = await terminationService.confirmRefundReceipt(id, tenantId, io);

    return res.status(200).json({
      success: true,
      message: 'Đã xác nhận nhận tiền. Hợp đồng đã chính thức chấm dứt.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getRequestDetail,
  getHistory,
  getByContractId,
  approveRequest,
  rejectRequest,
  disputeRequest,
  uploadRefundProof,
  confirmRefundReceipt,
};
