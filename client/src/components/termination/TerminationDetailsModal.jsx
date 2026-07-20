import React, { useState } from 'react';
import { terminationService } from '../../services/terminationService';
import './Termination.css';
import { X } from 'lucide-react';

const TerminationDetailsModal = ({ request, currentUserId, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Review states
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [showDisputeInput, setShowDisputeInput] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  
  const [refundFile, setRefundFile] = useState(null);

  if (!request) return null;

  const contract = request.contract || {};
  const record = request.record || {};
  const isPending = request.status === 'PENDING';
  const isAccepted = request.status === 'ACCEPTED';
  const isRequester = request.requested_by === currentUserId;
  const isLandlord = contract.landlord_id === currentUserId;
  const isTenant = contract.tenant_id === currentUserId;
  const isOppositeParty = !isRequester && (isTenant || isLandlord);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('vi-VN');
    } catch (e) {
      return 'N/A';
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn CHẤP NHẬN yêu cầu chấm dứt hợp đồng này không? Hợp đồng sẽ chính thức chấm dứt.')) return;
    try {
      setLoading(true);
      setError(null);
      await terminationService.approveRequest(request.request_id, { reviewNote });
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Lỗi khi chấp nhận yêu cầu.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reviewNote.trim()) {
      setError('Vui lòng nhập lý do từ chối.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await terminationService.rejectRequest(request.request_id, { reviewNote });
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Lỗi khi từ chối yêu cầu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDispute = async () => {
    if (!disputeReason.trim()) {
      setError('Vui lòng nhập nội dung khiếu nại.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await terminationService.disputeRequest(request.request_id, { disputeReason });
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Lỗi khi gửi khiếu nại.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadRefund = async () => {
    if (!refundFile) {
      setError('Vui lòng chọn ảnh minh chứng chuyển khoản.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('refundProof', refundFile);
      await terminationService.uploadRefundProof(request.request_id, formData);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải lên minh chứng.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRefund = async () => {
    if (!window.confirm('Bạn xác nhận đã nhận đủ tiền hoàn cọc? Hợp đồng sẽ chính thức kết thúc.')) return;
    try {
      setLoading(true);
      setError(null);
      await terminationService.confirmRefundReceipt(request.request_id);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Lỗi khi xác nhận nhận tiền.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <span className="tm-badge tm-badge-accepted">Đã Chấp Nhận</span>;
      case 'REJECTED':
        return <span className="tm-badge tm-badge-rejected">Đã Từ Chối</span>;
      case 'DISPUTED':
        return <span className="tm-badge tm-badge-disputed">Đang Tranh Chấp</span>;
      default:
        return <span className="tm-badge tm-badge-pending">Chờ Duyệt</span>;
    }
  };

  const contractNum = contract?.contract_number || contract?.contractNumber || contract?.contract_id;
  const roomTitle = contract?.room?.title || contract?.roomTitle || contract?.assigned_room_number || `Phòng #${contract?.room_id || ''}`;

  return (
    <div className="tm-modal-backdrop" onClick={onClose}>
      <div className="tm-modal-card tm-modal-card-large" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="tm-modal-header">
          <div>
            <div style={{ display: 'flex', itemsCenter: 'center', gap: 10 }}>
              <h3>Chi tiết Yêu cầu Chấm dứt</h3>
              {getStatusBadge(request.status)}
            </div>
            <p>Mã yêu cầu: #{request.request_id} - Hợp đồng #{contractNum} ({roomTitle})</p>
          </div>
          <button type="button" onClick={onClose} className="tm-close-btn">
            <X size={18} />
          </button>
        </div>

        <div className="tm-modal-body">
          {error && (
            <div className="tm-alert tm-alert-danger">
              <span>{error}</span>
            </div>
          )}

          {/* Info grid */}
          <div className="tm-financial-grid" style={{ background: '#f8fafc', padding: 16, borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'block' }}>Người tạo yêu cầu:</span>
              <strong style={{ fontSize: 14, color: '#0f172a' }}>
                {request.requester?.full_name || `User #${request.requested_by}`}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'block' }}>Loại hình:</span>
              <strong style={{ fontSize: 14, color: '#0f172a' }}>
                {request.termination_type === 'Mutual' && 'Hai bên đồng thuận'}
                {request.termination_type === 'TenantVoluntaryBreak' && 'Khách thuê tự nguyện trước hạn'}
                {request.termination_type === 'LandlordViolationClaim' && 'Khách thuê khiếu nại chủ nhà'}
                {request.termination_type === 'TenantViolationClaim' && 'Chủ nhà khiếu nại khách thuê'}
                {request.termination_type === 'UnilateralLandlord' && 'Chủ nhà đơn phương hủy (Khách vi phạm)'}
                {request.termination_type === 'LandlordArbitraryBreak' && 'Chủ nhà tự ý thu hồi nhà sớm'}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'block' }}>Ngày tạo yêu cầu:</span>
              <strong style={{ fontSize: 14, color: '#0f172a' }}>
                {formatDate(request.request_date || request.created_at)}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'block' }}>Ngày chấm dứt mong muốn:</span>
              <strong style={{ fontSize: 14, color: '#0f172a' }}>
                {formatDate(request.requested_termination_date)}
              </strong>
            </div>
          </div>

          {/* Reason & Description */}
          <div className="tm-form-group">
            <div className="tm-form-label">Lý do chấm dứt:</div>
            <div style={{ padding: 14, background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe', fontSize: 14, fontWeight: 600, color: '#1e3a8a' }}>
              {request.reason}
            </div>
            {request.description && (
              <div style={{ padding: 14, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 14, color: '#475569' }}>
                {request.description}
              </div>
            )}
          </div>

          {/* Evidence Gallery */}
          {(() => {
            let safeEvidenceUrls = [];
            if (Array.isArray(request?.evidence_urls)) {
              safeEvidenceUrls = request.evidence_urls;
            } else if (typeof request?.evidence_urls === 'string' && request.evidence_urls.trim()) {
              try {
                const parsed = JSON.parse(request.evidence_urls);
                safeEvidenceUrls = Array.isArray(parsed) ? parsed : [request.evidence_urls];
              } catch (e) {
                safeEvidenceUrls = [request.evidence_urls];
              }
            }

            if (!safeEvidenceUrls.length) return null;

            return (
              <div className="tm-form-group">
                <div className="tm-form-label">File & Ảnh bằng chứng:</div>
                <div className="tm-preview-grid">
                  {safeEvidenceUrls.map((urlStr, idx) => {
                    if (typeof urlStr !== 'string') return null;
                    const fullUrl = urlStr.startsWith('http') || urlStr.startsWith('data:') 
                      ? urlStr 
                      : `http://localhost:5000${urlStr.startsWith('/') ? '' : '/'}${urlStr}`;
                    const isPdf = urlStr.match(/\.pdf(\?.*)?$/i);
                    const isImg = !isPdf && (urlStr.match(/\.(jpeg|jpg|gif|png|webp)/i) || urlStr.includes('cloudinary'));

                    return (
                      <a
                        key={idx}
                        href={fullUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="tm-preview-item"
                        style={{ width: 80, height: 80, textDecoration: 'none' }}
                      >
                        {isImg ? (
                          <img src={fullUrl} alt={`Evidence ${idx}`} />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 4, fontSize: 10, color: '#475569', background: '#f1f5f9' }}>
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>File #{idx + 1}</span>
                          </div>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Financial Settlement Record or Preview */}
          {record && (record.termination_id || record.deposit_refund !== undefined) ? (
            <div className="tm-financial-box" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', marginTop: 16 }}>
              <div className="tm-financial-box-title" style={{ color: '#065f46', borderBottom: '1px solid #a7f3d0', paddingBottom: 8 }}>
                Bảng Quyết toán Tài chính Chấm dứt
              </div>

              <div className="tm-financial-grid" style={{ fontSize: 13, color: '#064e3b' }}>
                <div>Tiền cọc hoàn lại: <strong style={{ color: '#047857' }}>{formatCurrency(record.deposit_refund)}</strong></div>
                <div>Tiền cọc giữ lại: <strong>{formatCurrency(record.deposit_retained)}</strong></div>
                <div>Tiền phạt / bồi thường: <strong>{formatCurrency(record.compensation)}</strong></div>
              </div>

              <div style={{ borderTop: '1px solid #a7f3d0', paddingTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 800, fontSize: 15, color: '#065f46' }}>
                <span>Tổng tiền Tenant nhận lại:</span>
                <span style={{ fontSize: 18, color: '#047857' }}>{formatCurrency(record.total_payout_to_tenant)}</span>
              </div>
            </div>
          ) : isPending ? (() => {
             const depositAmount = contract.deposit_amount || contract.depositAmount || contract.deposit || 0;
             let depositRefund = 0;
             let depositRetained = 0;
             const termType = request.termination_type;

             if (termType === 'TenantVoluntaryBreak') {
               depositRefund = 0;
               depositRetained = depositAmount;
             } else if (termType === 'LandlordViolationClaim' || termType === 'LandlordArbitraryBreak') {
               depositRefund = depositAmount;
               depositRetained = 0;
             } else if (termType === 'TenantViolationClaim' || termType === 'UnilateralLandlord') {
               depositRefund = 0;
               depositRetained = depositAmount;
             } else {
               depositRefund = depositAmount;
               depositRetained = 0;
             }

             return (
               <div className="tm-financial-box" style={{ background: '#fffbeb', borderColor: '#fde68a', marginTop: 16 }}>
                 <div className="tm-financial-box-title" style={{ color: '#92400e', borderBottom: '1px solid #fde68a', paddingBottom: 8 }}>
                   Bảng Quyết toán Tài chính Dự kiến (Khi Chấp Nhận)
                 </div>
                 <div className="tm-financial-grid" style={{ fontSize: 13, color: '#92400e' }}>
                   <div>Tiền cọc hoàn lại: <strong style={{ color: '#b45309' }}>{formatCurrency(depositRefund)}</strong></div>
                   <div>Tiền cọc giữ lại: <strong>{formatCurrency(depositRetained)}</strong></div>
                 </div>
               </div>
             );
          })() : null}

          {/* Review note */}
          {request.review_note && (
            <div className="tm-alert tm-alert-info">
              <div>
                <strong>Ghi chú xử lý:</strong> {request.review_note}
              </div>
            </div>
          )}

          {/* Review Actions */}
          {isPending && isOppositeParty && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
              {!showRejectInput ? (
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', width: '100%' }}>
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(true)}
                    className="tm-btn tm-btn-secondary"
                    style={{ color: '#dc2626', background: '#fef2f2' }}
                  >
                    Từ Chối
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={loading}
                    className="tm-btn tm-btn-success"
                  >
                    Chấp Nhận Chấm Dứt
                  </button>
                </div>
              ) : (
                <div className="tm-form-group">
                  <textarea
                    rows={2}
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Nhập lý do từ chối..."
                    className="tm-textarea"
                  />
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => setShowRejectInput(false)}
                      className="tm-btn tm-btn-secondary"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={loading}
                      className="tm-btn tm-btn-danger"
                    >
                      Xác nhận Từ chối
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}



          {/* Refund Flow UI */}
          {request.status === 'ACCEPTED' && record?.refund_status === 'PENDING_REFUND' && isLandlord && (
            <div className="tm-form-group" style={{ background: '#fffbeb', padding: 16, borderRadius: 12, border: '1px solid #fde68a', marginTop: 16 }}>
              <h4 style={{ color: '#92400e', marginBottom: 8 }}>Chờ Hoàn Tiền Cọc</h4>
              <p style={{ fontSize: 13, color: '#b45309', marginBottom: 12 }}>
                Bạn cần chuyển khoản <strong>{formatCurrency(record.total_payout_to_tenant)}</strong> cho Khách thuê. Sau khi chuyển xong, vui lòng tải ảnh biên lai lên đây để hệ thống đóng hồ sơ.
              </p>
              <input type="file" accept="image/*" onChange={(e) => setRefundFile(e.target.files[0])} style={{ marginBottom: 12, fontSize: 13 }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleUploadRefund}
                  disabled={loading || !refundFile}
                  className="tm-btn tm-btn-primary"
                  style={{ background: '#d97706' }}
                >
                  Tải Biên Lai Lên
                </button>
              </div>
            </div>
          )}

          {request.status === 'ACCEPTED' && record?.refund_status === 'PENDING_REFUND' && isTenant && (
            <div className="tm-alert" style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#92400e', marginTop: 16 }}>
              <strong>Đang chờ Chủ nhà chuyển khoản hoàn tiền cọc.</strong> Bạn sẽ nhận được thông báo sau khi Chủ nhà tải biên lai lên.
            </div>
          )}

          {request.status === 'ACCEPTED' && record?.refund_status === 'REFUND_TRANSFERRED' && (
            <div className="tm-form-group" style={{ background: '#f0fdf4', padding: 16, borderRadius: 12, border: '1px solid #bbf7d0', marginTop: 16 }}>
              <h4 style={{ color: '#166534', marginBottom: 8 }}>Biên lai Hoàn tiền</h4>
              {isTenant && (
                <p style={{ fontSize: 13, color: '#15803d', marginBottom: 12 }}>
                  Chủ nhà đã tải lên hóa đơn chuyển tiền hoàn cọc. Vui lòng kiểm tra tài khoản ngân hàng và xác nhận bên dưới.
                </p>
              )}
              {isLandlord && (
                <p style={{ fontSize: 13, color: '#15803d', marginBottom: 12 }}>
                  Đã tải biên lai hoàn tiền. Đang chờ Khách thuê xác nhận.
                </p>
              )}
              {record.refund_proof_url && (
                <div style={{ marginBottom: 12 }}>
                  <a href={record.refund_proof_url.startsWith('http') ? record.refund_proof_url : `http://localhost:5000/${record.refund_proof_url}`} target="_blank" rel="noreferrer">
                    <img src={record.refund_proof_url.startsWith('http') ? record.refund_proof_url : `http://localhost:5000/${record.refund_proof_url}`} alt="Refund Proof" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  </a>
                </div>
              )}
              
              {isTenant && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleConfirmRefund}
                    disabled={loading}
                    className="tm-btn tm-btn-primary"
                    style={{ background: '#16a34a' }}
                  >
                    Xác nhận đã nhận tiền
                  </button>
                </div>
              )}
            </div>
          )}

          {request.status === 'ACCEPTED' && record?.refund_status === 'COMPLETED' && (
             <div className="tm-alert" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534', marginTop: 16 }}>
               <strong>Hoàn tiền cọc hoàn tất!</strong> Hợp đồng đã chính thức được đóng lại.
             </div>
          )}

          {/* Dispute Actions */}
          {request.status === 'ACCEPTED' && !showDisputeInput && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowDisputeInput(true)}
                className="tm-btn tm-btn-secondary"
                style={{ fontSize: 12, color: '#b45309', background: '#fffbe6' }}
              >
                Gửi Khiếu nại Admin
              </button>
            </div>
          )}

          {showDisputeInput && (
            <div className="tm-form-group" style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
              <textarea
                rows={2}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Nhập lý do bạn muốn khiếu nại tranh chấp tới Ban quản trị hệ thống..."
                className="tm-textarea"
                style={{ background: '#fffbe6', borderColor: '#ffe58f' }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowDisputeInput(false)}
                  className="tm-btn tm-btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleDispute}
                  disabled={loading}
                  className="tm-btn tm-btn-primary"
                  style={{ background: '#d97706' }}
                >
                  Gửi Khiếu Nại
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="tm-modal-footer">
          <button type="button" onClick={onClose} className="tm-btn tm-btn-secondary">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerminationDetailsModal;
