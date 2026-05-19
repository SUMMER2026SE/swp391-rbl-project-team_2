import React from 'react';
import { Search, MapPin, Building, ShieldCheck } from 'lucide-react';
import Button from '../components/common/Button';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <h1>Tìm phòng trọ <span>nhanh chóng, dễ dàng</span> và <span>an toàn</span></h1>
            <p>Khám phá hàng ngàn phòng trọ, căn hộ dịch vụ chất lượng với SmartBoard AI. Chúng tôi đồng hành cùng bạn tìm kiếm không gian sống lý tưởng.</p>
            
            <div className="hero-search-box">
              <div className="search-input-group">
                <MapPin className="search-icon" size={20} />
                <input type="text" placeholder="Nhập địa điểm, quận, tên đường..." />
              </div>
              <Button size="lg" className="search-btn">
                <Search size={20} />
                Tìm kiếm
              </Button>
            </div>
          </div>
          <div className="hero-image">
            {/* Using a placeholder since we don't have images yet */}
            <div className="mock-image-container">
              <Building size={80} color="var(--primary)" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Tại sao chọn SmartBoard AI?</h2>
            <p>Nền tảng của chúng tôi cung cấp những tính năng vượt trội giúp bạn tìm và quản lý phòng trọ hiệu quả.</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Search /></div>
              <h3>Tìm kiếm thông minh</h3>
              <p>Hệ thống AI giúp gợi ý phòng trọ phù hợp nhất với nhu cầu và tài chính của bạn.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><ShieldCheck /></div>
              <h3>Thông tin xác thực</h3>
              <p>Tất cả phòng trọ trên hệ thống đều được kiểm duyệt kỹ càng, đảm bảo an toàn tuyệt đối.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Building /></div>
              <h3>Đa dạng lựa chọn</h3>
              <p>Hàng nghìn phòng trọ, căn hộ, chung cư mini được cập nhật liên tục mỗi ngày.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
