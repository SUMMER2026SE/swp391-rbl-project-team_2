import React, { useState, useEffect } from 'react';
import { terminationService } from '../../services/terminationService';
import './Termination.css';
import { X, Trash2, FileText, Video, Image as ImageIcon } from 'lucide-react';

const TerminationRequestModal = ({ contract, userRole = 'Tenant', onClose, onSuccess }) => {
  const [terminationType, setTerminationType] = useState('Mutual');
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [description, setDescription] = useState('');
  const [requestedDate, setRequestedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  // Custom financial inputs
  const depositVal = contract?.deposit_amount || contract?.depositAmount || contract?.deposit || 0;
  const [customRefund, setCustomRefund] = useState(String(depositVal));
  const [customRetained, setCustomRetained] = useState('0');
  const [customCompensation, setCustomCompensation] = useState('0');

  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isLandlord = userRole === 'Landlord' || userRole === 'landlord';

  useEffect(() => {
    if (!isLandlord) {
      if (contract?.status === 'pre_booked_active') {
        if (terminationType === 'Mutual' || terminationType === 'LandlordViolationClaim') {
          setCustomRefund(String(depositVal));
          setCustomRetained('0');
          setCustomCompensation('0');
        } else {
          const startDateStr = contract?.startDate || contract?.start_date;
          let diffDays = 0;
          if (startDateStr) {
            const start = new Date(startDateStr);
            const today = new Date();
            const diffTime = start.getTime() - today.getTime();
            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          }
          
          if (diffDays > 7) {
            const halfDeposit = depositVal / 2;
            setCustomRefund(String(halfDeposit));
            setCustomRetained(String(halfDeposit));
            setCustomCompensation('0');
          } else {
            setCustomRefund('0');
            setCustomRetained(String(depositVal));
            setCustomCompensation('0');
          }
        }
      } else {
        if (terminationType === 'TenantVoluntaryBreak') {
          setCustomRefund('0');
          setCustomRetained(String(depositVal));
          setCustomCompensation('0');
        } else if (terminationType === 'Mutual' || terminationType === 'LandlordViolationClaim') {
          setCustomRefund(String(depositVal));
          setCustomRetained('0');
          setCustomCompensation('0');
        }
      }
    }
  }, [terminationType, contract?.status, contract?.startDate, contract?.start_date, depositVal, isLandlord]);

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setEvidenceFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Predefined reasons by type
  const reasonOptions = {
    Mutual: [
      'Hai bên đồng ý chấm dứt hợp đồng',
      'Người thuê chuyển nơi làm việc',
      'Người thuê chuyển sang phòng khác',
      'Chủ trọ muốn sửa chữa hoặc cải tạo',
      'Hai bên không còn nhu cầu tiếp tục hợp đồng',
    ],
    TenantVoluntaryBreak: [
      'Chuyển công tác',
      'Chuyển trường',
      'Không còn nhu cầu thuê',
    ],
    LandlordViolationClaim: [
      'Phòng không đúng mô tả',
      'Thiếu nội thất đã cam kết',
      'Không đảm bảo an toàn',
      'Điện nước hỏng kéo dài',
      'Chủ trọ tự ý vào phòng',
      'Tăng giá trái hợp đồng',
      'Không thực hiện các nghĩa vụ đã cam kết',
    ],
    TenantViolationClaim: [
      'Không trả tiền thuê',
      'Nợ tiền điện nước',
      'Phá hoại tài sản',
      'Gây mất trật tự',
      'Cho thuê lại trái phép',
      'Nuôi thú cưng trái quy định',
      'Ở quá số người',
      'Sử dụng phòng sai mục đích',
      'Hoạt động trái pháp luật',
    ],
    UnilateralLandlord: [
      'Khách thuê vi phạm nghiêm trọng (Chấm dứt ngay lập tức)',
    ],
    LandlordArbitraryBreak: [
      'Chủ nhà thu hồi nhà trước hạn (Bồi thường phạt cọc)',
    ],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const finalReason = reason === 'Khác' ? customReason : reason;
    if (!finalReason) {
      setError('Vui lòng chọn hoặc nhập lý do chấm dứt hợp đồng.');
      return;
    }

    const targetContractId = contract.contract_id || contract.contractId || contract.id;
    if (!targetContractId) {
      setError('Không thể tìm thấy ID hợp đồng.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (requestedDate < todayStr) {
      setError('Ngày chấm dứt hợp đồng mong muốn phải là hôm nay hoặc một ngày trong tương lai (không được chọn ngày trong quá khứ).');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('contractId', targetContractId);
      formData.append('terminationType', terminationType);
      formData.append('reason', finalReason);
      formData.append('description', description);
      formData.append('requestedTerminationDate', requestedDate);

      if (customRefund !== '') formData.append('customRefund', customRefund);
      if (customRetained !== '') formData.append('customRetained', customRetained);
      if (customCompensation !== '') formData.append('customCompensation', customCompensation);

      evidenceFiles.forEach((file) => {
        formData.append('evidenceFiles', file);
      });

      const res = await terminationService.createRequest(formData);

      if (onSuccess) {
        onSuccess(res);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || err.data?.message || 'Có lỗi xảy ra khi tạo yêu cầu chấm dứt hợp đồng.');
    } finally {
      setLoading(false);
    }
  };

  const contractNum = contract?.contract_number || contract?.contractNumber || contract?.contract_id || contract?.id;
  const roomTitle = contract?.room?.title || contract?.roomTitle || contract?.assigned_room_number || `Phòng #${contract?.room_id || contract?.roomId || ''}`;

  return (
    <div className="tm-modal-backdrop" onClick={onClose}>
      <div className="tm-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="tm-modal-header">
          <div>
            <h3>{isLandlord ? 'Quản lý Chấm dứt Hợp đồng' : 'Yêu cầu Chấm dứt Hợp đồng'}</h3>
            <p>Hợp đồng #{contractNum} - {roomTitle}</p>
          </div>
          <button type="button" onClick={onClose} className="tm-close-btn">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="tm-modal-body">
            {error && (
              <div className="tm-alert tm-alert-danger">
                <span>{error}</span>
              </div>
            )}

            {/* Termination Type Selection */}
            <div className="tm-form-group">
              <label className="tm-form-label">Loại hình Chấm dứt</label>
              <div className="tm-type-grid">
                <button
                  type="button"
                  onClick={() => {
                    setTerminationType('Mutual');
                    setReason('');
                  }}
                  className={`tm-type-card ${terminationType === 'Mutual' ? 'active-mutual' : ''}`}
                >
                  <span className="tm-type-card-title">Hai bên đồng thuận</span>
                  <span className="tm-type-card-desc">Cần bên còn lại bấm chấp nhận</span>
                </button>

                {isLandlord ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setTerminationType('TenantViolationClaim');
                        setReason('');
                      }}
                      className={`tm-type-card ${terminationType === 'TenantViolationClaim' ? 'active-unilateral' : ''}`}
                    >
                      <span className="tm-type-card-title">Khách thuê vi phạm</span>
                      <span className="tm-type-card-desc">Gửi yêu cầu & chờ xác nhận</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTerminationType('UnilateralLandlord');
                        setReason('');
                      }}
                      className={`tm-type-card ${terminationType === 'UnilateralLandlord' ? 'active-unilateral' : ''}`}
                    >
                      <span className="tm-type-card-title">Đơn phương (Khách vi phạm)</span>
                      <span className="tm-type-card-desc">Hủy ngay lập tức & thu hồi phòng</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTerminationType('LandlordArbitraryBreak');
                        setReason('');
                        if (depositVal) {
                          setCustomRefund(String(depositVal));
                          setCustomCompensation(String(depositVal));
                          setCustomRetained('0');
                        }
                      }}
                      className={`tm-type-card ${terminationType === 'LandlordArbitraryBreak' ? 'active-arbitrary' : ''}`}
                    >
                      <span className="tm-type-card-title">Tự ý thu hồi nhà trước hạn</span>
                      <span className="tm-type-card-desc" style={{ color: '#d97706', fontWeight: 600 }}>
                        (Hoàn 100% cọc + Bồi thường)
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setTerminationType('TenantVoluntaryBreak');
                        setReason('');
                      }}
                      className={`tm-type-card ${terminationType === 'TenantVoluntaryBreak' ? 'active-mutual' : ''}`}
                    >
                      <span className="tm-type-card-title">Tự nguyện chấm dứt trước hạn</span>
                      <span className="tm-type-card-desc">Cần Chủ trọ xác nhận</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTerminationType('LandlordViolationClaim');
                        setReason('');
                      }}
                      className={`tm-type-card ${terminationType === 'LandlordViolationClaim' ? 'active-unilateral' : ''}`}
                    >
                      <span className="tm-type-card-title">Khiếu nại Chủ nhà vi phạm</span>
                      <span className="tm-type-card-desc">Cần kèm bằng chứng</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Unilateral Warning */}
            {terminationType === 'UnilateralLandlord' && (
              <div className="tm-alert tm-alert-danger">
                <div>
                  <strong>Chú ý về Đơn phương Chấm dứt:</strong>
                  <div style={{ fontSize: 12, marginTop: 2 }}>
                    Hợp đồng sẽ lập tức chuyển sang trạng thái <strong>TERMINATED</strong> và phòng trọ chuyển sang <strong>AVAILABLE</strong>.
                    Khách thuê sẽ nhận được thông báo khẩn và có quyền gửi khiếu nại lên Admin nếu không đúng thực tế.
                  </div>
                </div>
              </div>
            )}
            
            {terminationType === 'LandlordViolationClaim' && (
              <div className="tm-alert tm-alert-warning" style={{ background: '#fffbeb', border: '1px solid #fef3c7', color: '#b45309' }}>
                <div>
                  <strong>Lưu ý: </strong>
                  <div style={{ fontSize: 12, marginTop: 2 }}>
                    Đây là trường hợp nên đi qua bước <strong>Gửi Khiếu Nại (Complaint)</strong> trước để hai bên giải quyết. 
                    Nếu Chủ nhà không giải quyết, bạn mới nên gửi yêu cầu này và <strong>bắt buộc phải kèm theo bằng chứng</strong>.
                  </div>
                </div>
              </div>
            )}

            {/* Reason Select */}
            <div className="tm-form-group">
              <label className="tm-form-label">
                Lý do Chấm dứt <span className="required">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="tm-select"
                required
              >
                <option value="">-- Chọn lý do --</option>
                {(reasonOptions[terminationType] || []).map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
                <option value="Khác">Lý do khác...</option>
              </select>
            </div>

            {reason === 'Khác' && (
              <div className="tm-form-group">
                <label className="tm-form-label">Nhập lý do cụ thể</label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Nhập lý do chấm dứt..."
                  className="tm-input"
                  required
                />
              </div>
            )}

            {/* Requested Date */}
            <div className="tm-form-group">
              <label className="tm-form-label">
                Ngày Chấm dứt Mong muốn
              </label>
              <input
                type="date"
                value={requestedDate}
                min={new Date().toISOString().split('T')[0]}
                max={contract?.end_date ? new Date(contract.end_date).toISOString().split('T')[0] : undefined}
                onChange={(e) => setRequestedDate(e.target.value)}
                className="tm-input"
                required
              />
            </div>

            {/* Financial Settlement Inputs */}
            <div className="tm-financial-box">
              <div className="tm-financial-box-title">
                Đề xuất Quyết toán Tài chính (VND)
              </div>

              <div className="tm-financial-grid">
                <div className="tm-financial-item">
                  <label>Hoàn cọc cho Tenant</label>
                  <input
                    type="number"
                    value={customRefund}
                    onChange={(e) => setCustomRefund(e.target.value)}
                    className="tm-input"
                    style={{ backgroundColor: !isLandlord ? '#f1f5f9' : '#fff', cursor: !isLandlord ? 'not-allowed' : 'text', color: !isLandlord ? '#64748b' : 'inherit' }}
                    readOnly={!isLandlord}
                    placeholder="0"
                  />
                </div>

                <div className="tm-financial-item">
                  <label>Chủ nhà giữ cọc</label>
                  <input
                    type="number"
                    value={customRetained}
                    onChange={(e) => setCustomRetained(e.target.value)}
                    className="tm-input"
                    style={{ backgroundColor: !isLandlord ? '#f1f5f9' : '#fff', cursor: !isLandlord ? 'not-allowed' : 'text', color: !isLandlord ? '#64748b' : 'inherit' }}
                    readOnly={!isLandlord}
                    placeholder="0"
                  />
                </div>

                <div className="tm-financial-item">
                  <label>Bồi thường / Phạt cọc</label>
                  <input
                    type="number"
                    value={customCompensation}
                    onChange={(e) => setCustomCompensation(e.target.value)}
                    className="tm-input"
                    style={{ backgroundColor: !isLandlord ? '#f1f5f9' : '#fff', cursor: !isLandlord ? 'not-allowed' : 'text', color: !isLandlord ? '#64748b' : 'inherit' }}
                    readOnly={!isLandlord}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="tm-form-group">
              <label className="tm-form-label">Mô tả chi tiết / Ghi chú</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Giải thích chi tiết hoàn cảnh, thỏa thuận hoặc vi phạm..."
                className="tm-textarea"
              />
            </div>

            {/* Evidence Upload */}
            <div className="tm-form-group">
              <label className="tm-form-label">File Bằng chứng (Ảnh, Video, Tài liệu hóa đơn)</label>
              <label className="tm-upload-box">
                <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Bấm để chọn file ảnh / video / tài liệu</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Hỗ trợ PNG, JPG, WEBP, MP4, PDF</div>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>

              {evidenceFiles.length > 0 && (
                <div className="tm-preview-grid">
                  {evidenceFiles.map((file, i) => {
                    const isImage = file.type.startsWith('image/');
                    const isVideo = file.type.startsWith('video/');
                    const objectUrl = isImage ? URL.createObjectURL(file) : null;

                    return (
                      <div key={i} className="tm-preview-item">
                        {isImage ? (
                          <img src={objectUrl} alt={file.name} />
                        ) : isVideo ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 4, background: '#1e293b', color: '#fff', fontSize: 10 }}>
                            <Video size={18} />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>{file.name}</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 4, background: '#f1f5f9', color: '#334155', fontSize: 10 }}>
                            <FileText size={18} color="#2563eb" />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', fontStyle: 'italic', textAlign: 'center' }}>{file.name}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="tm-preview-remove"
                          title="Xóa file"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="tm-modal-footer">
            <button type="button" onClick={onClose} className="tm-btn tm-btn-secondary">
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`tm-btn ${
                terminationType.includes('Unilateral') || terminationType.includes('Arbitrary')
                  ? 'tm-btn-danger'
                  : 'tm-btn-primary'
              }`}
            >
              {loading ? 'Đang xử lý...' : terminationType.includes('Unilateral') ? 'Xác nhận Đơn phương Hủy' : 'Gửi Yêu cầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TerminationRequestModal;
