import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Bell, Shield, Globe, Palette } from 'lucide-react';
import Button from '../../../components/common/Button';
import './SettingsPage.css';

const SettingsPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success(t('adminSettings.saved'));
    }, 800);
  };

  const tabs = [
    { id: 'general', label: t('adminSettings.tabs.general'), icon: <Globe size={18} /> },
    { id: 'notifications', label: t('adminSettings.tabs.notifications'), icon: <Bell size={18} /> },
    { id: 'security', label: t('adminSettings.tabs.security'), icon: <Shield size={18} /> },
    { id: 'appearance', label: t('adminSettings.tabs.appearance'), icon: <Palette size={18} /> },
  ];

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">{t('adminSettings.title')}</h1>
        <p className="admin-page-subtitle">{t('adminSettings.subtitle')}</p>
      </div>

      <div className="settings-layout">
        {/* Sidebar Tabs */}
        <nav className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Content Panel */}
        <div className="settings-panel">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>{t('adminSettings.general.title')}</h2>
              <div className="settings-form">
                <div className="settings-field">
                  <label>{t('adminSettings.general.platformName')}</label>
                  <input type="text" defaultValue="RentWise" />
                </div>
                <div className="settings-field">
                  <label>{t('adminSettings.general.supportEmail')}</label>
                  <input type="email" defaultValue="support@smartboarding.com" />
                </div>
                <div className="settings-field">
                  <label>{t('adminSettings.general.defaultLang')}</label>
                  <select defaultValue="vi">
                    <option value="vi">{t('adminSettings.general.vietnamese')}</option>
                    <option value="en">{t('adminSettings.general.english')}</option>
                  </select>
                </div>
                <div className="settings-field">
                  <label>{t('adminSettings.general.timezone')}</label>
                  <select defaultValue="Asia/Ho_Chi_Minh">
                    <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (UTC+7)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>{t('adminSettings.notifications.title')}</h2>
              <div className="settings-toggles">
                {[
                  { label: t('adminSettings.notifications.items.reg'), desc: t('adminSettings.notifications.items.regDesc') },
                  { label: t('adminSettings.notifications.items.payment'), desc: t('adminSettings.notifications.items.paymentDesc') },
                  { label: t('adminSettings.notifications.items.maintenance'), desc: t('adminSettings.notifications.items.maintenanceDesc') },
                  { label: t('adminSettings.notifications.items.system'), desc: t('adminSettings.notifications.items.systemDesc') },
                ].map((item) => (
                  <div key={item.label} className="toggle-row">
                    <div>
                      <p className="toggle-label">{item.label}</p>
                      <p className="toggle-desc">{item.desc}</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>{t('adminSettings.security.title')}</h2>
              <div className="settings-form">
                <div className="settings-field">
                  <label>{t('adminSettings.security.currentPassword')}</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <div className="settings-field">
                  <label>{t('adminSettings.security.newPassword')}</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <div className="settings-field">
                  <label>{t('adminSettings.security.confirmPassword')}</label>
                  <input type="password" placeholder="••••••••" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h2>{t('adminSettings.appearance.title')}</h2>
              <div className="settings-form">
                <div className="settings-field">
                  <label>{t('adminSettings.appearance.theme')}</label>
                  <select defaultValue="light">
                    <option value="light">{t('adminSettings.appearance.light')}</option>
                    <option value="dark">{t('adminSettings.appearance.dark')}</option>
                  </select>
                </div>
                <div className="settings-field">
                  <label>{t('adminSettings.appearance.primaryColor')}</label>
                  <input type="color" defaultValue="#2563EB" />
                </div>
              </div>
            </div>
          )}

          <div className="settings-actions">
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              <Save size={16} />
              {isSaving ? t('adminSettings.saving') : t('adminSettings.saveChanges')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
