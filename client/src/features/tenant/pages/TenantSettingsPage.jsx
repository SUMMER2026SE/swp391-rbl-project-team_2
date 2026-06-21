import React, { useState } from 'react';
import { 
  Bell, CreditCard, ChevronRight, 
  Shield, Key, Smartphone, Globe, 
  Receipt, History, LogOut 
} from 'lucide-react';
import ChangePasswordModal from '../../auth/components/ChangePasswordModal';
import './TenantSettingsPage.css';

const TenantSettingsPage = () => {
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
          <h1>Account Settings</h1>
          <p>Manage your security, preferences, and payment details in one place.</p>
        </div>
      </div>

      <div className="settings-content-grid">
        
        {/* Security & Authentication */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="header-icon security-icon">
              <Shield size={20} />
            </div>
            <h2>Security & Authentication</h2>
          </div>
          <div className="settings-card-body">
            <button className="settings-action-row" onClick={() => setIsPasswordModalOpen(true)}>
              <div className="action-row-left">
                <div className="action-icon-wrapper">
                  <Key size={18} />
                </div>
                <div className="action-texts">
                  <span className="action-title">Change Password</span>
                  <span className="action-desc">Update your password regularly to keep your account secure</span>
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
                  <span className="action-title">Two-Factor Authentication</span>
                  <span className="action-desc">Add an extra layer of security to your account</span>
                </div>
              </div>
              <div className="status-badge disabled">Disabled</div>
            </button>
            
            <button className="settings-action-row">
              <div className="action-row-left">
                <div className="action-icon-wrapper">
                  <LogOut size={18} />
                </div>
                <div className="action-texts">
                  <span className="action-title">Active Sessions</span>
                  <span className="action-desc">Manage devices currently logged into your account</span>
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
            <h2>Notifications & Preferences</h2>
          </div>
          <div className="settings-card-body">
            <div className="settings-toggle-row">
              <div className="action-row-left">
                <div className="action-texts">
                  <span className="action-title">Email Notifications</span>
                  <span className="action-desc">Receive updates about your rent and requests via email</span>
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
                  <span className="action-title">SMS Notifications</span>
                  <span className="action-desc">Get urgent alerts via text message</span>
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
                  <span className="action-title">Language & Region</span>
                  <span className="action-desc">English (US), UTC-5</span>
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
            <h2>Billing & Payments</h2>
          </div>
          <div className="settings-card-body">
            <button className="settings-action-row">
              <div className="action-row-left">
                <div className="action-icon-wrapper">
                  <CreditCard size={18} />
                </div>
                <div className="action-texts">
                  <span className="action-title">Payment Methods</span>
                  <span className="action-desc">Manage credit cards and bank accounts</span>
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
                  <span className="action-title">Billing Information</span>
                  <span className="action-desc">Update your billing address and tax details</span>
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
                  <span className="action-title">Payment History</span>
                  <span className="action-desc">View past invoices and receipts</span>
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
