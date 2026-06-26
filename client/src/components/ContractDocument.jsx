import React, { useRef, useState } from 'react';
import { FileSignature, Eraser, CheckCircle2, XCircle, ChevronRight, X, FileText } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants';
import useAuthStore from '../store/useAuthStore';
import '../features/tenant/components/ContractDocumentModal.css';

const ContractDocument = ({ contract, role, onSign, onCancel, onRenew, onTerminate }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const sigCanvas = useRef({});
  const [error, setError] = useState('');

  if (!contract) return null;

  const today = new Date();
  const startDate = new Date(contract.startDate);
  const durationMonths = contract.endDate ? 
    Math.round((new Date(contract.endDate) - startDate) / (1000 * 60 * 60 * 24 * 30)) : 
    6;

  const rentAmount = parseFloat(contract.monthlyRent);
  const depositAmount = parseFloat(contract.depositAmount || contract.monthlyRent);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '..........................';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '..........................';
    return date.toLocaleDateString('vi-VN');
  };

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  const fullRoomAddress = contract?.room ? 
    [contract.room.address, contract.room.ward, contract.room.district, contract.room.city].filter(Boolean).join(', ') : 
    '...........................';

  const handleSignProceed = () => {
    if (sigCanvas.current && sigCanvas.current.isEmpty && sigCanvas.current.isEmpty()) {
      setError("Vui lòng ký tên trước khi đồng ý.");
      return;
    }
    const signatureDataUrl = sigCanvas.current.getCanvas().toDataURL('image/png');
    if (onSign) onSign(contract, signatureDataUrl);
  };

  const statusLower = (contract.status || '').toLowerCase();
  const showSignButton = role === 'tenant' && statusLower === 'pending_signature' && !contract.tenantSignature;

  return (
    <div className="contract-document-wrapper" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
      <div className="contract-document" style={{ padding: '40px', border: 'none', boxShadow: 'none' }}>
        <div className="contract-doc-header">
          <h3>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
          <h4>Độc lập – Tự do – Hạnh phúc</h4>
          <p>---o0o---</p>
          <h2>HỢP ĐỒNG THUÊ PHÒNG TRỌ</h2>
        </div>
        
        <p className="contract-doc-date">
          Hôm nay, ngày {today.getDate().toString().padStart(2, '0')} tháng {(today.getMonth() + 1).toString().padStart(2, '0')} năm {today.getFullYear()}, 
          tại căn nhà số: <strong>{fullRoomAddress}</strong>. Chúng tôi ký tên dưới đây gồm có:
        </p>

        <div className="contract-party">
          <h4>BÊN CHO THUÊ PHÒNG TRỌ (gọi tắt là Bên A):</h4>
          <p>Ông/bà (tên chủ hợp đồng): <strong>{contract.landlordName || contract.landlord?.full_name || (role === 'landlord' ? user?.fullName : '................................................................')}</strong></p>
          <p>CMND/CCCD số: {contract.landlordIc || '................................'} cấp ngày {formatDate(contract.landlordIcIssueDate)} nơi cấp {contract.landlordIcIssuePlace || '................................'}</p>
          <p>Thường trú tại: {contract.landlordPermanentAddress || '...............................................................................................'}</p>
          <p>Điện thoại: {contract.landlord?.phone || (role === 'landlord' ? user?.phone : '................................')}</p>
        </div>

        <div className="contract-party">
          <h4>BÊN THUÊ PHÒNG TRỌ (gọi tắt là Bên B):</h4>
          <p>Ông/bà: <strong>{contract.tenantName || contract.tenant?.full_name || (role === 'tenant' ? user?.fullName : '................................................................')}</strong></p>
          <p>CMND/CCCD số: {contract.tenantIc || '................................'} cấp ngày {formatDate(contract.tenantIcIssueDate)} nơi cấp {contract.tenantIcIssuePlace || '................................'}</p>
          <p>Thường trú tại: {contract.tenantPermanentAddress || '...............................................................................................'}</p>
          <p>Điện thoại: {contract.tenant?.phone || (role === 'tenant' ? user?.phone : '................................')}</p>
        </div>

        <div className="contract-content">
          <p><strong>Sau khi thỏa thuận, hai bên thống nhất như sau:</strong></p>
          
          <h5>1. Nội dung thuê phòng trọ</h5>
          <p>Bên A cho Bên B thuê 01 phòng trọ tại địa chỉ <strong>{fullRoomAddress}</strong>. Với thời hạn là: <strong>{durationMonths}</strong> tháng, giá thuê: <strong>{formatCurrency(rentAmount)}</strong> đồng. Chưa bao gồm chi phí: điện sinh hoạt, nước.</p>
          
          <h5>2. Trách nhiệm Bên A</h5>
          <ul>
            <li>Đảm bảo căn nhà cho thuê không có tranh chấp, khiếu kiện.</li>
            <li>Đăng ký với chính quyền địa phương về thủ tục cho thuê phòng trọ.</li>
          </ul>

          <h5>3. Trách nhiệm Bên B</h5>
          <ul>
            <li>Đặt cọc với số tiền là <strong>{formatCurrency(depositAmount)}</strong> đồng, thanh toán tiền thuê phòng hàng tháng vào ngày <strong>10</strong> + tiền điện + nước.</li>
            <li>Đảm bảo các thiết bị và sửa chữa các hư hỏng trong phòng trong khi sử dụng. Nếu không sửa chữa thì khi trả phòng, bên A sẽ trừ vào tiền đặt cọc, giá trị cụ thể được tính theo giá thị trường.</li>
            <li>Chỉ sử dụng phòng trọ vào mục đích ở, với số lượng tối đa không quá 04 người (kể cả trẻ em); không chứa các thiết bị gây cháy nổ, hàng cấm... cung cấp giấy tờ tùy thân để đăng ký tạm trú theo quy định, giữ gìn an ninh trật tự, nếp sống văn hóa đô thị; không tụ tập nhậu nhẹt, cờ bạc và các hành vi vi phạm pháp luật khác.</li>
            <li>Không được tự ý cải tạo kiếm trúc phòng hoặc trang trí ảnh hưởng tới tường, cột, nền... Nếu có nhu cầu trên phải trao đổi với bên A để được thống nhất.</li>
          </ul>

          <h5>4. Điều khoản thực hiện</h5>
          <ul>
            <li>Hai bên nghiêm túc thực hiện những quy định trên trong thời hạn cho thuê, nếu bên A lấy phòng phải báo cho bên B ít nhất 01 tháng, hoặc ngược lại.</li>
            <li>Sau thời hạn cho thuê <strong>{durationMonths}</strong> tháng nếu bên B có nhu cầu hai bên tiếp tục thương lượng giá thuê để gia hạn hợp đồng bằng miệng hoặc thực hiện như sau.</li>
          </ul>

          <div className="contract-signatures">
            <div className="signature-box" style={{ width: '45%' }}>
              <p><strong>Bên B</strong></p>
              <p className="subtext">(Ký, ghi rõ họ tên)</p>
              {contract.tenantSignature ? (
                <img src={contract.tenantSignature} alt="Tenant Signature" style={{ maxHeight: '100px', maxWidth: '100%' }} />
              ) : (
                role === 'tenant' && statusLower === 'pending_signature' ? (
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', background: '#f8fafc', marginTop: '10px', position: 'relative' }}>
                    <SignatureCanvas 
                      ref={sigCanvas}
                      penColor="blue"
                      canvasProps={{width: 300, height: 150, className: 'sigCanvas'}} 
                    />
                    <button onClick={clearSignature} style={{ position: 'absolute', top: 5, right: 5, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }} title="Clear">
                      <Eraser size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="signature-name-placeholder" style={{ marginTop: '10px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    Chưa ký
                  </div>
                )
              )}
              {(() => {
                const tenantName = contract.tenantName || contract.tenant?.full_name || (role === 'tenant' ? user?.fullName : null);
                return tenantName ? (
                  <div className="signature-name-placeholder" style={{ marginTop: '10px' }}>{tenantName}</div>
                ) : null;
              })()}
            </div>
            <div className="signature-box" style={{ width: '45%' }}>
              <p><strong>Bên A</strong></p>
              <p className="subtext">(Ký, ghi rõ họ tên)</p>
              {contract.landlordSignature ? (
                <img src={contract.landlordSignature} alt="Landlord Signature" style={{ maxHeight: '100px', maxWidth: '100%' }} />
              ) : (
                <div className="signature-name-placeholder" style={{ marginTop: '10px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  Chưa ký
                </div>
              )}
              {(() => {
                const landlordName = contract.landlordName || contract.landlord?.full_name || (role === 'landlord' ? user?.fullName : null);
                return landlordName ? (
                  <div className="signature-name-placeholder" style={{ marginTop: '10px' }}>{landlordName}</div>
                ) : null;
              })()}
            </div>
          </div>
          {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</p>}
        </div>
      </div>
      
      {/* Actions Footer */}
      <div style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {statusLower === 'active' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 500 }}>
              <CheckCircle2 size={18} /> Contract is Active
            </div>
          )}
          {statusLower === 'pending_signature' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d97706', fontWeight: 500 }}>
              Waiting for Signature
            </div>
          )}
          {statusLower === 'pending_deposit' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d97706', fontWeight: 500 }}>
              Waiting for Deposit
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {(statusLower === 'pending_signature' || statusLower === 'cancelled') && role === 'tenant' && onCancel && (
            <button onClick={() => onCancel(contract.contractId || contract.id)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #dc2626', color: '#dc2626', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 500 }}>
              <XCircle size={16} /> Delete
            </button>
          )}

          {statusLower === 'active' && role === 'landlord' && onTerminate && (
            <button onClick={() => onTerminate(contract)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #dc2626', color: '#dc2626', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 500 }}>
              <XCircle size={16} /> Terminate
            </button>
          )}

          {statusLower === 'active' && role === 'landlord' && onRenew && (
            <button onClick={() => onRenew(contract)} style={{ padding: '8px 16px', background: '#2563eb', border: 'none', color: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 500 }}>
              <FileText size={16} /> Renew
            </button>
          )}
          
          {showSignButton && onSign && (
            <button onClick={handleSignProceed} style={{ padding: '8px 16px', background: '#2563eb', border: 'none', color: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 500 }}>
              <FileSignature size={16} /> Đồng ý và Thanh toán
            </button>
          )}

          {contract.room && contract.roomId && (
            <button onClick={() => navigate(`${ROUTES.ROOMS}/${contract.roomId}`)} style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#374151', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 500 }}>
              View Room <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractDocument;
