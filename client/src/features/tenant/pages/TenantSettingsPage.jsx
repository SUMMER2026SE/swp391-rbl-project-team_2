import React, { useState } from 'react';
import { 
  Bell, CreditCard, ChevronRight, 
  Shield, Key, Smartphone, Globe, 
  Receipt, History, LogOut 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ChangePasswordModal from '../../auth/components/ChangePasswordModal';
import './TenantSettingsPage.css';

const TenantSettingsPage = () => {
  const { t } = useTranslation();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true
  });

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="tenant-settings-page">
      <div className="settings-header-banner">
        <div className="settings-header-content">
          <h1>{t('tenantSettings.title', 'Account Settings')}</h1>
          <p>{t('tenantSettings.subtitle', 'Manage your security, preferences, and payment details in one place.')}</p>
        </div>
      </div>

      <div className="settings-content-grid">
        
        {/* Security & Authentication */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="header-icon security-icon">
              <Shield size={20} />
            </div>
            <h2>{t('tenantSettings.securityAuth', 'Security & Authentication')}</h2>
          </div>
          <div className="settings-card-body">
            <button className="settings-action-row" onClick={() => setIsPasswordModalOpen(true)}>
              <div className="action-row-left">
                <div className="action-icon-wrapper">
                  <Key size={18} />
                </div>
                <div className="action-texts">
                  <span className="action-title">{t('tenantSettings.changePassword', 'Change Password')}</span>
                  <span className="action-desc">{t('tenantSettings.changePasswordDesc', 'Update your password regularly to keep your account secure')}</span>
                </div>
              </div>
              <ChevronRight size={20} className="chevron-icon" />
            </button>

            <button className="settings-action-row">
              <div className="action-row-left">
                <div className="action-icon-wrapper">
                  <Smartphone size={18} />
                </div>
                <div className="action-texts">
                  <span className="action-title">{t('tenantSettings.twoFactor', 'Two-Factor Authentication')}</span>
                  <span className="action-desc">{t('tenantSettings.twoFactorDesc', 'Add an extra layer of security to your account')}</span>
                </div>
              </div>
              <div className="status-badge disabled">{t('tenantSettings.disabled', 'Disabled')}</div>
            </button>
            
            <button className="settings-action-row">
              <div className="action-row-left">
                <div className="action-icon-wrapper">
                  <LogOut size={18} />
                </div>
                <div className="action-texts">
                  <span className="action-title">{t('tenantSettings.activeSessions', 'Active Sessions')}</span>
                  <span className="action-desc">{t('tenantSettings.activeSessionsDesc', 'Manage devices currently logged into your account')}</span>
                </div>
              </div>
              <ChevronRight size={20} className="chevron-icon" />
            </button>
          </div>
        </div>

        {/* Notifications & Preferences */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="header-icon preferences-icon">
              <Bell size={20} />
            </div>
            <h2>{t('tenantSettings.notifsPrefs', 'Notifications & Preferences')}</h2>
          </div>
          <div className="settings-card-body">
            <div className="settings-toggle-row">
              <div className="action-row-left">
                <div className="action-texts">
                  <span className="action-title">{t('tenantSettings.emailNotifs', 'Email Notifications')}</span>
                  <span className="action-desc">{t('tenantSettings.emailNotifsDesc', 'Receive updates about your rent and requests via email')}</span>
                </div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={notifications.email}
                  onChange={() => toggleNotification('email')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-toggle-row">
              <div className="action-row-left">
                <div className="action-texts">
                  <span className="action-title">{t('tenantSettings.smsNotifs', 'SMS Notifications')}</span>
                  <span className="action-desc">{t('tenantSettings.smsNotifsDesc', 'Get urgent alerts via text message')}</span>
                </div>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={notifications.sms}
                  onChange={() => toggleNotification('sms')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <button className="settings-action-row">
              <div className="action-row-left">
                <div className="action-icon-wrapper">
                  <Globe size={18} />
                </div>
                <div className="action-texts">
                  <span className="action-title">{t('tenantSettings.langRegion', 'Language & Region')}</span>
                  <span className="action-desc">Tiếng Việt (VN), UTC+7</span>
                </div>
              </div>
              <ChevronRight size={20} className="chevron-icon" />
            </button>
          </div>
        </div>

        {/* Billing & Payments */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="header-icon billing-icon">
              <CreditCard size={20} />
            </div>
            <h2>{t('tenantSettings.billingPayments', 'Billing & Payments')}</h2>
          </div>
          <div className="settings-card-body">
            <button className="settings-action-row">
              <div className="action-row-left">
                <div className="action-icon-wrapper">
                  <CreditCard size={18} />
                </div>
                <div className="action-texts">
                  <span className="action-title">{t('tenantSettings.paymentMethods', 'Payment Methods')}</span>
                  <span className="action-desc">{t('tenantSettings.paymentMethodsDesc', 'Manage credit cards and bank accounts')}</span>
                </div>
              </div>
              <ChevronRight size={20} className="chevron-icon" />
            </button>

            <button className="settings-action-row">
              <div className="action-row-left">
                <div className="action-icon-wrapper">
                  <Receipt size={18} />
                </div>
                <div className="action-texts">
                  <span className="action-title">{t('tenantSettings.billingInfo', 'Billing Information')}</span>
                  <span className="action-desc">{t('tenantSettings.billingInfoDesc', 'Update your billing address and tax details')}</span>
                </div>
              </div>
              <ChevronRight size={20} className="chevron-icon" />
            </button>
            
            <button className="settings-action-row">
              <div className="action-row-left">
                <div className="action-icon-wrapper">
                  <History size={18} />
                </div>
                <div className="action-texts">
                  <span className="action-title">{t('tenantSettings.paymentHistory', 'Payment History')}</span>
                  <span className="action-desc">{t('tenantSettings.paymentHistoryDesc', 'View past invoices and receipts')}</span>
                </div>
              </div>
              <ChevronRight size={20} className="chevron-icon" />
            </button>
          </div>
        </div>

      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
};

export default TenantSettingsPage;
