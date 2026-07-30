import React, { useRef } from 'react';
import { X, FileSignature, Eraser } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import useAuthStore from '../../../store/useAuthStore';
import './ContractDocumentModal.css';

const numberToWordsVN = (num) => {
  if (!num) return '';
  return '(Viết bằng chữ)';
};

const ContractDocumentModal = ({ isOpen, onClose, contract, onSign, readOnly = false }) => {
  const { user } = useAuthStore();
  const sigCanvas = useRef({});

  if (!isOpen || !contract) return null;

  const today = new Date();
  const startDate = new Date(contract.startDate || contract.start_date);
  const durationMonths = (contract.endDate || contract.end_date) ?
    Math.round((new Date(contract.endDate || contract.end_date) - startDate) / (1000 * 60 * 60 * 24 * 30)) :
    6;

  const rentAmount = parseFloat(contract.monthlyRent || contract.monthly_rent);
  const depositAmount = parseFloat(contract.depositAmount || contract.deposit_amount || contract.monthlyRent || contract.monthly_rent);

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
          <h2><FileSignature size={20} /> {readOnly ? 'Xem Hợp Đồng' : 'Xem và Ký Hợp Đồng'}</h2>
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
              <p>Ông/bà (tên chủ hợp đồng): <strong>{contract.landlordName || contract.landlord_name || contract.landlord?.full_name || contract.landlordContract?.full_name || '................................................................'}</strong></p>
              <p>CMND/CCCD số: {contract.landlordIc || contract.landlord_ic || '................................'} cấp ngày {formatDate(contract.landlordIcIssueDate || contract.landlord_ic_issue_date)} nơi cấp {contract.landlordIcIssuePlace || contract.landlord_ic_issue_place || '................................'}</p>
              <p>Thường trú tại: {contract.landlordPermanentAddress || contract.landlord_permanent_address || '...............................................................................................'}</p>
              <p>Điện thoại: {contract.landlord?.phone || contract.landlordContract?.phone || contract.landlord_phone || '................................'}</p>
            </div>

            <div className="contract-party">
              <h4>BÊN THUÊ PHÒNG TRỌ (gọi tắt là Bên B):</h4>
              <p>Ông/bà: <strong>{contract.tenantName || contract.tenant_name || contract.tenant?.full_name || contract.tenantContract?.full_name || user?.full_name || '................................................................'}</strong></p>
              <p>CMND/CCCD số: {contract.tenantIc || contract.tenant_ic || '................................'} cấp ngày {formatDate(contract.tenantIcIssueDate || contract.tenant_ic_issue_date)} nơi cấp {contract.tenantIcIssuePlace || contract.tenant_ic_issue_place || '................................'}</p>
              <p>Thường trú tại: {contract.tenantPermanentAddress || contract.tenant_permanent_address || '...............................................................................................'}</p>
              <p>Điện thoại: {contract.tenant?.phone || contract.tenantContract?.phone || contract.tenant_phone || user?.phone || '................................'}</p>
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
                <li>Đặt cọc với số tiền là <strong>{formatCurrency(depositAmount)}</strong> đồng, thanh toán tiền thuê phòng hàng tháng là <strong>{formatCurrency(rentAmount)}</strong> đồng vào ngày <strong>10</strong> (cộng thêm tiền điện + nước tiêu thụ thực tế).</li>
                <li>Đảm bảo các thiết bị và sửa chữa các hư hỏng trong phòng trong khi sử dụng. Nếu không sửa chữa thì khi trả phòng, bên A sẽ trừ vào tiền đặt cọc, giá trị cụ thể được tính theo giá thị trường.</li>
                <li>Chỉ sử dụng phòng trọ vào mục đích ở, với số lượng tối đa không quá 04 người (kể cả trẻ em); không chứa các thiết bị gây cháy nổ, hàng cấm... cung cấp giấy tờ tùy thân để đăng ký tạm trú theo quy định, giữ gìn an ninh trật tự, nếp sống văn hóa đô thị; không tụ tập nhậu nhẹt, cờ bạc và các hành vi vi phạm pháp luật khác.</li>
                <li>Không được tự ý cải tạo kiếm trúc phòng hoặc trang trí ảnh hưởng tới tường, cột, nền... Nếu có nhu cầu trên phải trao đổi với bên A để được thống nhất.</li>
              </ul>

              <h5>4. Điều khoản thực hiện</h5>
              <ul>
                <li>Hai bên phải tạo điều kiện thuận lợi cho nhau để thực hiện hợp đồng.</li>
                <li>Nếu một trong hai bên vi phạm hợp đồng trong thời gian hợp đồng vẫn còn hiệu lực thì bên còn lại có quyền đơn phương chấm dứt hợp đồng thuê nhà trọ. Ngoài ra, nếu hành vi vi phạm đó gây tổn thất cho bên bị vi phạm thì bên vi phạm sẽ phải bồi thường mọi thiệt hại đã gây ra.</li>
                <li>Trong trường hợp muốn chấm dứt hợp đồng trước thời hạn, bên đơn phương chấm dứt hợp đồng phải chịu mất tiền đặt cọc và bồi thường cho bên còn lại số tiền tương đương với 01 tháng tiền thuê phòng trọ. Đồng thời phải báo trước cho bên kia ít nhất 30 ngày.</li>
                <li>Kết thúc hợp đồng, Bên A phải trả lại đầy đủ tiền đặt cọc cho bên B.</li>
                <li>Bên nào vi phạm các điều khoản chung thì phải chịu trách nhiệm trước pháp luật.</li>
                <li>Hợp đồng này được lập thành 02 bản và có giá trị pháp lý như nhau, mỗi bên giữ một bản.</li>
              </ul>


              <div className="contract-signatures">
                <div className="signature-box" style={{ width: '45%' }}>
                  <p><strong>Bên B</strong></p>
                  <p className="subtext">(Ký, ghi rõ họ tên)</p>
                  {contract.tenantSignature || contract.tenant_signature ? (
                    <img src={contract.tenantSignature || contract.tenant_signature} alt="Tenant Signature" style={{ maxHeight: '100px', maxWidth: '100%' }} />
                  ) : readOnly ? (
                    <div className="signature-name-placeholder" style={{ marginTop: '10px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      Chưa ký
                    </div>
                  ) : (
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', background: '#f8fafc', marginTop: '10px', position: 'relative' }}>
                      <SignatureCanvas
                        ref={sigCanvas}
                        penColor="black"
                        canvasProps={{ width: 300, height: 150, className: 'sigCanvas' }}
                      />
                      <button onClick={clearSignature} style={{ position: 'absolute', top: 5, right: 5, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }} title="Clear">
                        <Eraser size={16} />
                      </button>
                    </div>
                  )}
                  {(contract.tenantName || contract.tenant_name || contract.tenant?.full_name || contract.tenantContract?.full_name) && (
                    <div className="signature-name-placeholder" style={{ marginTop: '10px' }}>{contract.tenantName || contract.tenant_name || contract.tenant?.full_name || contract.tenantContract?.full_name}</div>
                  )}
                </div>
                <div className="signature-box" style={{ width: '45%' }}>
                  <p><strong>Bên A</strong></p>
                  <p className="subtext">(Ký, ghi rõ họ tên)</p>
                  {contract.landlordSignature || contract.landlord_signature ? (
                    <img src={contract.landlordSignature || contract.landlord_signature} alt="Landlord Signature" style={{ maxHeight: '100px', maxWidth: '100%' }} />
                  ) : (
                    <div className="signature-name-placeholder" style={{ marginTop: '10px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      Chưa ký
                    </div>
                  )}
                  {(contract.landlordName || contract.landlord_name || contract.landlord?.full_name || contract.landlordContract?.full_name) && (
                    <div className="signature-name-placeholder">{contract.landlordName || contract.landlord_name || contract.landlord?.full_name || contract.landlordContract?.full_name}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="contract-modal-footer">
          <button className="btn-cancel" onClick={onClose}>Đóng</button>
          {!readOnly && (
            <button className="btn-sign-proceed" onClick={handleSignProceed}>
              <FileSignature size={18} /> Đồng ý và Thanh toán Ký Hợp Đồng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractDocumentModal;
