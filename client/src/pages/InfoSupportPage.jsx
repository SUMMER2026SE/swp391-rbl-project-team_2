import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import './InfoSupportPage.css';

const TABS = [
  { id: 'about', label: 'Về chúng tôi', path: '/about' },
  { id: 'privacy', label: 'Chính sách bảo mật', path: '/privacy' },
  { id: 'terms', label: 'Điều khoản sử dụng', path: '/terms' },
  { id: 'faq', label: 'Câu hỏi thường gặp', path: '/faq' },
  { id: 'guide', label: 'Hướng dẫn thuê phòng', path: '/guide' },
  { id: 'report', label: 'Báo cáo vi phạm', path: '/report' }
];

const AboutContent = () => (
  <div className="info-text-content">
    <h2>Về chúng tôi</h2>
    <p>Chào mừng bạn đến với <strong>RentWise</strong> - nền tảng tìm kiếm và cho thuê phòng trọ uy tín và chất lượng.</p>
    <p>Được thành lập với sứ mệnh giải quyết bài toán tìm phòng trọ sinh viên và người đi làm, RentWise cung cấp một giải pháp toàn diện giúp việc kết nối giữa chủ nhà và người thuê trở nên dễ dàng, minh bạch và an toàn hơn bao giờ hết.</p>
    
    <h3>Tầm nhìn</h3>
    <p>Trở thành hệ sinh thái nhà trọ tốt tại Việt Nam, mang đến không gian sống an toàn, tiện nghi và phù hợp với khả năng tài chính của mọi người.</p>

    <h3>Sứ mệnh</h3>
    <p>Cung cấp công nghệ tối ưu hóa quá trình tìm kiếm chỗ ở, giảm thiểu rủi ro lừa đảo, đảm bảo quyền lợi cho cả người đi thuê và người cho thuê.</p>

    <h3>Giá trị cốt lõi</h3>
    <ul>
      <li><strong>Minh bạch:</strong> Mọi thông tin về giá cả, chi phí phát sinh đều được công khai rõ ràng.</li>
      <li><strong>Tin cậy:</strong> Các phòng trọ đều được đội ngũ kiểm duyệt xác minh trước khi hiển thị.</li>
      <li><strong>Đồng hành:</strong> Đội ngũ hỗ trợ 24/7 sẵn sàng giải đáp mọi thắc mắc của bạn.</li>
    </ul>
  </div>
);

const PrivacyContent = () => (
  <div className="info-text-content">
    <h2>Chính sách bảo mật</h2>
    <p>Bảo vệ dữ liệu cá nhân và gây dựng niềm tin cho quý khách là vấn đề rất quan trọng với RentWise. Vì vậy, chúng tôi sẽ dùng tên và các thông tin khác liên quan đến quý khách tuân thủ theo nội dung của Chính sách bảo mật này.</p>
    
    <h3>1. Thu thập thông tin cá nhân</h3>
    <p>Chúng tôi thu thập thông tin khi bạn đăng ký tài khoản, đăng tin hoặc liên hệ với chúng tôi, bao gồm:</p>
    <ul>
      <li>Họ và tên, Email, Số điện thoại.</li>
      <li>Lịch sử tìm kiếm và các phòng trọ đã lưu.</li>
      <li>Nội dung đánh giá, bình luận.</li>
    </ul>

    <h3>2. Sử dụng thông tin</h3>
    <p>Thông tin của bạn được sử dụng để:</p>
    <ul>
      <li>Xử lý yêu cầu thuê phòng hoặc đăng tin.</li>
      <li>Cải thiện chất lượng dịch vụ của nền tảng.</li>
      <li>Gửi email thông báo, hỗ trợ kỹ thuật hoặc khuyến mãi (nếu bạn đồng ý).</li>
    </ul>

    <h3>3. Bảo mật thông tin</h3>
    <p>RentWise áp dụng các biện pháp kỹ thuật và an ninh để ngăn chặn truy cập trái phép hoặc mất mát dữ liệu của bạn. Tuy nhiên, bạn cũng cần có trách nhiệm tự bảo mật mật khẩu của mình và không chia sẻ cho bất kỳ ai.</p>

    <h3>4. Quyền của người dùng</h3>
    <p>Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa dữ liệu cá nhân của mình bất kỳ lúc nào bằng cách truy cập vào trang quản lý tài khoản hoặc liên hệ với chúng tôi.</p>
  </div>
);

const TermsContent = () => (
  <div className="info-text-content">
    <h2>Điều khoản sử dụng</h2>
    <p>Khi truy cập và sử dụng dịch vụ của RentWise, bạn đồng ý tuân thủ các Điều khoản sử dụng dưới đây. Vui lòng đọc kỹ trước khi sử dụng.</p>
    
    <h3>1. Quy định chung</h3>
    <p>RentWise là nền tảng trung gian kết nối người có nhu cầu cho thuê và người có nhu cầu thuê phòng. Chúng tôi không phải là chủ sở hữu của các bất động sản được đăng tải trên nền tảng.</p>

    <h3>2. Trách nhiệm của người đăng tin (Chủ nhà)</h3>
    <ul>
      <li>Cung cấp thông tin phòng trọ chính xác, trung thực (hình ảnh, giá cả, diện tích, tiện ích...).</li>
      <li>Không đăng tải các nội dung vi phạm pháp luật, thuần phong mỹ tục hoặc hình ảnh phản cảm.</li>
      <li>Chịu hoàn toàn trách nhiệm về các giao dịch phát sinh từ tin đăng của mình.</li>
    </ul>

    <h3>3. Trách nhiệm của người xem tin (Người thuê)</h3>
    <ul>
      <li>Tự chịu trách nhiệm xác minh thông tin trước khi tiến hành giao dịch đặt cọc hoặc ký hợp đồng.</li>
      <li>Không sử dụng công cụ tự động (bot) để thu thập dữ liệu hàng loạt từ RentWise.</li>
      <li>Tuân thủ các quy định về an ninh mạng khi tương tác trên nền tảng.</li>
    </ul>

    <h3>4. Từ chối bảo đảm</h3>
    <p>Mặc dù chúng tôi có cơ chế kiểm duyệt, RentWise không đảm bảo độ chính xác tuyệt đối của 100% tin đăng. Chúng tôi từ chối trách nhiệm đối với bất kỳ thiệt hại nào phát sinh do giao dịch giữa các người dùng.</p>
  </div>
);

const FaqContent = () => (
  <div className="info-text-content">
    <h2>Câu hỏi thường gặp (FAQ)</h2>
    
    <h3>1. RentWise có thu phí người đi thuê phòng không?</h3>
    <p>Không. Dịch vụ tìm kiếm và xem phòng trên RentWise là hoàn toàn miễn phí đối với người đi thuê. Bạn chỉ phải thanh toán tiền thuê phòng trực tiếp cho chủ nhà theo hợp đồng thỏa thuận.</p>

    <h3>2. Tôi muốn đăng tin cho thuê phòng thì làm thế nào?</h3>
    <p>Bạn cần đăng ký tài khoản và cập nhật loại tài khoản thành "Chủ nhà". Sau khi tài khoản được duyệt, bạn có thể vào trang Quản trị để thêm mới Phòng trọ của mình kèm theo hình ảnh, giá cả.</p>

    <h3>3. Làm sao để biết phòng trọ này là có thật và không lừa đảo?</h3>
    <p>Chúng tôi có đội ngũ kiểm duyệt xác minh thông tin cơ bản. Tuy nhiên, để an toàn tuyệt đối, bạn <strong style={{color: '#DC2626'}}>TUYỆT ĐỐI KHÔNG CHUYỂN KHOẢN ĐẶT CỌC </strong>  khi chưa đến xem phòng trực tiếp và chưa gặp chủ nhà.</p>

    <h3>4. Nếu phát hiện tin giả mạo, tôi phải làm gì?</h3>
    <p>Bạn hãy nhấn vào nút "Báo cáo vi phạm" (icon lá cờ) trên trang chi tiết phòng đó, hoặc điền Form ở mục "Báo cáo vi phạm" dưới Footer. Chúng tôi sẽ xử lý và gỡ bỏ tin đăng nếu vi phạm.</p>
  </div>
);

const GuideContent = () => (
  <div className="info-text-content">
    <h2>Hướng dẫn thuê phòng an toàn</h2>
    <p>Tìm được một căn phòng ưng ý là bước đầu tiên để có một cuộc sống thoải mái. Dưới đây là những hướng dẫn cơ bản từ RentWise giúp bạn tìm và thuê phòng an toàn.</p>

    <h3>Bước 1: Tìm kiếm theo nhu cầu</h3>
    <p>Sử dụng công cụ tìm kiếm trên RentWise để lọc phòng theo Khu vực, Mức giá, và Tiện ích (Máy lạnh, Có gác, Cho nuôi thú cưng...).</p>

    <h3>Bước 2: Xem xét chi tiết</h3>
    <ul>
      <li>Xem kỹ các hình ảnh thực tế của căn phòng.</li>
      <li>Đọc kỹ mô tả về chi phí phát sinh (Tiền điện, nước, rác, wifi, phí quản lý...).</li>
      <li>Xem vị trí trên bản đồ để ước lượng khoảng cách tới trường học/chỗ làm.</li>
    </ul>

    <h3>Bước 3: Liên hệ xem phòng</h3>
    <p>Sử dụng nút Gọi điện hoặc Zalo trên trang chi tiết để hẹn chủ nhà đến xem phòng trực tiếp.</p>
    <div className="alert-warning" style={{ background: '#fff3cd', color: '#856404', padding: '12px', borderRadius: '8px', margin: '16px 0', border: '1px solid #ffeeba' }}>
      <strong>Lưu ý quan trọng:</strong> Tuyệt đối KHÔNG CHUYỂN KHOẢN ĐẶT CỌC trước khi đến xem phòng thực tế và gặp mặt chủ nhà.
    </div>

    <h3>Bước 4: Kiểm tra phòng và Ký hợp đồng</h3>
    <ul>
      <li>Kiểm tra đường nước, đèn, cửa nẻo và thiết bị vệ sinh.</li>
      <li>Yêu cầu chủ nhà làm hợp đồng rõ ràng, ghi chú các tình trạng hỏng hóc hiện tại (nếu có).</li>
      <li>Đọc kỹ điều khoản bồi thường, thời hạn thuê và thời gian thông báo trả phòng trước khi ký.</li>
    </ul>
  </div>
);

const ReportContent = () => {
  const [violationType, setViolationType] = useState('');
  const [roomUrl, setRoomUrl] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const match = roomUrl.trim().match(/(?:rooms\/)?(\d+)$/);
    const roomId = match ? parseInt(match[1], 10) : null;

    if (!roomId || isNaN(roomId)) {
      toast.error('Đường dẫn phòng không hợp lệ. Vui lòng nhập link chứa mã số phòng (ví dụ: /rooms/12)');
      return;
    }

    const typeNames = {
      fraud: 'Tin đăng lừa đảo / Phí môi giới ẩn',
      fake_image: 'Phòng không giống hình ảnh',
      fake_price: 'Giá phòng sai sự thật',
      sold: 'Phòng đã cho thuê nhưng không gỡ',
      inappropriate: 'Nội dung phản cảm / Không phù hợp',
      other: 'Lý do khác'
    };

    const title = `Báo cáo vi phạm: ${typeNames[violationType] || 'Khác'}`;

    try {
      setSubmitting(true);
      const response = await api.post('/tenant/complaints', {
        roomId,
        title,
        description,
        complaintType: violationType,
      });

      if (response.success) {
        toast.success('Gửi báo cáo thành công! Admin sẽ kiểm duyệt và xử lý vi phạm.');
        setViolationType('');
        setRoomUrl('');
        setDescription('');
      } else {
        toast.error(response.message || 'Gửi báo cáo thất bại.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Thao tác thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="info-text-content report-content">
      <h2>Báo cáo vi phạm</h2>
      <p>Chung tay xây dựng môi trường thuê trọ minh bạch. Vui lòng cung cấp chi tiết nếu bạn phát hiện tin đăng lừa đảo, sai sự thật hoặc nội dung phản cảm.</p>

      <form className="report-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Loại vi phạm <span className="required">*</span></label>
          <select 
            required 
            className="form-control"
            value={violationType}
            onChange={(e) => setViolationType(e.target.value)}
            disabled={submitting}
          >
            <option value="">Chọn loại vi phạm</option>
            <option value="fraud">Tin đăng lừa đảo / Phí môi giới ẩn</option>
            <option value="fake_image">Phòng không giống hình ảnh</option>
            <option value="fake_price">Giá phòng sai sự thật</option>
            <option value="sold">Phòng đã cho thuê nhưng không gỡ</option>
            <option value="inappropriate">Nội dung phản cảm / Không phù hợp</option>
            <option value="other">Lý do khác</option>
          </select>
        </div>

        <div className="form-group">
          <label>Đường dẫn (Link) phòng vi phạm <span className="required">*</span></label>
          <input 
            type="text" 
            required 
            className="form-control" 
            placeholder="Ví dụ: http://localhost:5173/rooms/12 hoặc nhập số 12"
            value={roomUrl}
            onChange={(e) => setRoomUrl(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label>Mô tả chi tiết <span className="required">*</span></label>
          <textarea 
            required 
            className="form-control" 
            rows="4" 
            placeholder="Vui lòng cung cấp thêm chi tiết để chúng tôi xác minh (VD: Số điện thoại lừa đảo, số tiền bị yêu cầu cọc...)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
          ></textarea>
        </div>

        <button type="submit" className="submit-report-btn" disabled={submitting}>
          {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
        </button>
      </form>
    </div>
  );
};

const InfoSupportPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab from URL path
  const currentPath = location.pathname;
  const activeTabObj = TABS.find(tab => tab.path === currentPath) || TABS[0];
  const activeTab = activeTabObj.id;

  // Content rendering based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'about': return <AboutContent />;
      case 'privacy': return <PrivacyContent />;
      case 'terms': return <TermsContent />;
      case 'faq': return <FaqContent />;
      case 'guide': return <GuideContent />;
      case 'report': return <ReportContent />;
      default: return <AboutContent />;
    }
  };

  return (
    <div className="info-support-page">
      <div className="info-hero-banner">
        <h1>Thông tin & Hỗ trợ</h1>
        <p>RentWise luôn minh bạch, rõ ràng và sẵn sàng hỗ trợ bạn.</p>
      </div>

      <div className="info-container">
        <aside className="info-sidebar">
          <h3>Thông tin RentWise</h3>
          <nav className="info-nav">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`info-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => navigate(tab.path)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="info-content-area">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default InfoSupportPage;
