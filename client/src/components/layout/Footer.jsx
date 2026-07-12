import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="footer-main">
      <div className="container footer-content">
        <div className="footer-top">
          <div className="footer-brand-section">
            <Link to="/" className="footer-brand-logo">
              <span className="logo-icon-custom">
                <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Left House */}
                  <path d="M 15 40 L 40 15 L 65 40" stroke="#2563EB" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="25" y="40" width="30" height="35" fill="#2563EB" />
                  <rect x="30" y="45" width="7" height="7" fill="white" />
                  <rect x="43" y="45" width="7" height="7" fill="white" />
                  <rect x="30" y="56" width="7" height="7" fill="white" />
                  <rect x="43" y="56" width="7" height="7" fill="white" />
                  <rect x="30" y="67" width="7" height="7" fill="white" />
                  <rect x="43" y="67" width="7" height="7" fill="white" />

                  {/* Right House */}
                  <path d="M 45 50 L 65 30 L 85 50" stroke="#8B5CF6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="75" y="28" width="4" height="10" fill="#8B5CF6" />
                  <rect x="55" y="50" width="24" height="25" fill="#8B5CF6" />
                  <rect x="59" y="55" width="6" height="6" fill="white" />
                  <rect x="69" y="55" width="6" height="6" fill="white" />
                  <rect x="59" y="65" width="6" height="6" fill="white" />
                  <rect x="69" y="65" width="6" height="6" fill="white" />

                  {/* Curves */}
                  <path d="M 22 78 Q 50 86 75 78" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  <path d="M 10 85 Q 50 96 85 85" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" fill="none"/>
                </svg>
              </span>
              <span className="logo-text">RentWise</span>
            </Link>
            <p className="footer-description">
              {t('footer.systemDesc', 'Hệ thống tìm phòng trọ uy tín.')} <br/>
              {t('footer.features', 'Tìm nhanh · Lọc thông minh · Liên hệ tức thì.')}
            </p>
          </div>

          <div className="footer-links-section">
            <div className="footer-column">
              <h4 className="footer-heading">{t('footer.information', 'Thông tin')}</h4>
              <ul className="footer-links-list">
                <li><Link to="/about">{t('footer.aboutUs', 'Về chúng tôi')}</Link></li>
                <li><Link to="/privacy">{t('footer.privacyPolicy', 'Chính sách bảo mật')}</Link></li>
                <li><Link to="/terms">{t('footer.termsOfService', 'Điều khoản sử dụng')}</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">{t('footer.customerSupport', 'Hỗ trợ khách hàng')}</h4>
              <ul className="footer-links-list">
                <li><Link to="/faq">{t('footer.faq', 'Câu hỏi thường gặp')}</Link></li>
                <li><Link to="/guide">{t('footer.rentalGuide', 'Hướng dẫn thuê phòng')}</Link></li>
                <li><Link to="/report">{t('footer.reportViolation', 'Báo cáo vi phạm')}</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            {t('footer.copyright', '© 2026 RentWise — Hệ thống tìm phòng trọ uy tín')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
