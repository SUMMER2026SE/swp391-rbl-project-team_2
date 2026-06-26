import React, { useRef } from 'react';
import { X, FileSignature, Eraser } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import useAuthStore from '../../../store/useAuthStore';
import './ContractDocumentModal.css';

const numberToWordsVN = (num) => {
  if (!num) return '';
  return '(Viết bằng chữ)';
};

const ContractDocumentModal = ({ isOpen, onClose, contract, onSign }) => {
  const { user } = useAuthStore();
  const sigCanvas = useRef({});

  if (!isOpen || !contract) return null;

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

  const handleSignProceed = () => {
    try {
      if (sigCanvas.current && sigCanvas.current.isEmpty && sigCanvas.current.isEmpty()) {
        alert("Vui lòng ký tên trước khi đồng ý.");
        return;
      }
      if (sigCanvas.current && sigCanvas.current.getCanvas) {
        const signatureDataUrl = sigCanvas.current.getCanvas().toDataURL('image/png');
        onSign(signatureDataUrl);
      } else {
        alert("Lỗi: Không tìm thấy khung chữ ký. Vui lòng tải lại trang.");
      }
    } catch (err) {
      alert("Lỗi khi ký: " + err.message);
    }
  };

  return (
    <div className="contract-modal-overlay" onClick={onClose}>
      <div className="contract-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="contract-modal-header">
          <h2><FileSignature size={20} /> Xem và Ký Hợp Đồng</h2>
          <button className="contract-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="contract-modal-body">
          <div className="contract-document">
            <div className="contract-doc-header">
              <h3>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
              <h4>Độc lập – Tự do – Hạnh phúc</h4>
              <p>---o0o---</p>
              <h2>HỢP ĐỒNG THUÊ PHÒNG TRỌ</h2>
            </div>

            <p className="contract-doc-date">
              Hôm nay, ngày {today.getDate().toString().padStart(2, '0')} tháng {(today.getMonth() + 1).toString().padStart(2, '0')} năm {today.getFullYear()},
              tại căn nhà số: <strong>{contract.room?.address || '...........................'}</strong>. Chúng tôi ký tên dưới đây gồm có:
            </p>

            <div className="contract-party">
              <h4>BÊN CHO THUÊ PHÒNG TRỌ (gọi tắt là Bên A):</h4>
              <p>Ông/bà (tên chủ hợp đồng): <strong>{contract.landlordName || contract.landlord?.full_name || '................................................................'}</strong></p>
              <p>CMND/CCCD số: {contract.landlordIc || '................................'} cấp ngày {formatDate(contract.landlordIcIssueDate)} nơi cấp {contract.landlordIcIssuePlace || '................................'}</p>
              <p>Thường trú tại: {contract.landlordPermanentAddress || '...............................................................................................'}</p>
              <p>Điện thoại: {contract.landlord?.phone || '................................'}</p>
            </div>

            <div className="contract-party">
              <h4>BÊN THUÊ PHÒNG TRỌ (gọi tắt là Bên B):</h4>
              <p>Ông/bà: <strong>{contract.tenantName || contract.tenant?.full_name || user?.full_name || '................................................................'}</strong></p>
              <p>CMND/CCCD số: {contract.tenantIc || '................................'} cấp ngày {formatDate(contract.tenantIcIssueDate)} nơi cấp {contract.tenantIcIssuePlace || '................................'}</p>
              <p>Thường trú tại: {contract.tenantPermanentAddress || '...............................................................................................'}</p>
              <p>Điện thoại: {contract.tenant?.phone || user?.phone || '................................'}</p>
            </div>

            <div className="contract-content">
              <p><strong>Sau khi thỏa thuận, hai bên thống nhất như sau:</strong></p>

              <h5>1. Nội dung thuê phòng trọ</h5>
              <p>Bên A cho Bên B thuê 01 phòng trọ tại địa chỉ <strong>{contract.room?.address || '............................................'}</strong>. Với thời hạn là: <strong>{durationMonths}</strong> tháng, giá thuê: <strong>{formatCurrency(rentAmount)}</strong> đồng. Chưa bao gồm chi phí: điện sinh hoạt, nước.</p>

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

              <table className="contract-extension-table">
                <thead>
                  <tr>
                    <th>Số lần gia hạn</th>
                    <th>Thời gian gia hạn (tháng)</th>
                    <th>Từ ngày</th>
                    <th>Đến ngày</th>
                    <th>Giá thuê/tháng (triệu đồng)</th>
                    <th>Ký tên</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>1</td><td></td><td></td><td></td><td></td><td></td></tr>
                  <tr><td>2</td><td></td><td></td><td></td><td></td><td></td></tr>
                </tbody>
              </table>

              <div className="contract-signatures">
                <div className="signature-box" style={{ width: '45%' }}>
                  <p><strong>Bên B</strong></p>
                  <p className="subtext">(Ký, ghi rõ họ tên)</p>
                  {contract.tenantSignature ? (
                    <img src={contract.tenantSignature} alt="Tenant Signature" style={{ maxHeight: '100px', maxWidth: '100%' }} />
                  ) : (
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', background: '#f8fafc', marginTop: '10px', position: 'relative' }}>
                      <SignatureCanvas
                        ref={sigCanvas}
                        penColor="blue"
                        canvasProps={{ width: 300, height: 150, className: 'sigCanvas' }}
                      />
                      <button onClick={clearSignature} style={{ position: 'absolute', top: 5, right: 5, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }} title="Clear">
                        <Eraser size={16} />
                      </button>
                    </div>
                  )}
                  {(contract.tenantName || contract.tenant?.full_name) && (
                    <div className="signature-name-placeholder" style={{ marginTop: '10px' }}>{contract.tenantName || contract.tenant.full_name}</div>
                  )}
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
                  {(contract.landlordName || contract.landlord?.full_name) && (
                    <div className="signature-name-placeholder">{contract.landlordName || contract.landlord.full_name}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="contract-modal-footer">
          <button className="btn-cancel" onClick={onClose}>Đóng</button>
          <button className="btn-sign-proceed" onClick={handleSignProceed}>
            <FileSignature size={18} /> Đồng ý và Thanh toán Ký Hợp Đồng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractDocumentModal;
