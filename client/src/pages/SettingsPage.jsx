import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Globe,
  Bell,
  Shield,
  Users,
  Settings,
  Monitor,
  Bot,
  ChevronRight,
  Check,
} from 'lucide-react';
import ChangePasswordModal from '../features/auth/components/ChangePasswordModal';
import './SettingsPage.css';

const SettingsPage = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('general');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Appearance - Read from localStorage or default to light
  const [appearance, setAppearance] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const handleThemeChange = () => {
      let activeTheme = appearance;
      // Removed system mode logic
      if (activeTheme === 'dark') {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
      } else {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
      }
      
      localStorage.setItem('theme', appearance);
    };

    handleThemeChange();
  }, [appearance]);

  // Language & Region
  const [language, setLanguage] = useState('English (United States)');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });

  // AI Support Assistant
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiName, setAiName] = useState('SmartHost AI');
  const [aiThreshold, setAiThreshold] = useState(50);

  // Toast
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const navItems = [
    { id: 'general', label: t('systemSettings.general'), icon: <Settings size={17} /> },
    { id: 'security', label: t('systemSettings.security'), icon: <Shield size={17} /> },
    { id: 'alerts', label: t('systemSettings.alerts'), icon: <Bell size={17} /> },
    { id: 'team', label: t('systemSettings.team'), icon: <Users size={17} /> },
  ];

  return (
    <div className="sys-settings-wrapper">
      {/* Page Header */}
      <div className="sys-settings-header">
        <h1 className="sys-settings-title">{t('systemSettings.title')}</h1>
        <p className="sys-settings-subtitle">{t('systemSettings.subtitle')}</p>
      </div>

      <div className="sys-settings-layout">
        {/* Left Nav */}
        <nav className="sys-settings-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sys-nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="sys-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {activeSection === item.id && <ChevronRight size={15} className="sys-nav-chevron" />}
            </button>
          ))}
        </nav>

        {/* Right Content */}
        <div className="sys-settings-content">

          {activeSection === 'general' && (
            <>
              {/* Appearance */}
              <div className="sys-section-card">
                <div className="sys-section-header">
                  <Monitor size={20} className="sys-section-icon" />
                  <div>
                    <h2 className="sys-section-title">{t('systemSettings.appearance')}</h2>
                    <p className="sys-section-desc">{t('systemSettings.appearanceDesc')}</p>
                  </div>
                </div>
                <div className="sys-appearance-grid">
                  <div
                    className={`sys-theme-card ${appearance === 'light' ? 'selected' : ''}`}
                    onClick={() => setAppearance('light')}
                  >
                    <div className="sys-theme-preview light-preview">
                      <div className="preview-bar" />
                      <div className="preview-line" />
                      <div className="preview-line short" />
                    </div>
                    <span className="sys-theme-label">{t('systemSettings.lightMode')}</span>
                    {appearance === 'light' && <div className="sys-theme-check"><Check size={12} /></div>}
                  </div>

                  <div
                    className={`sys-theme-card ${appearance === 'dark' ? 'selected' : ''}`}
                    onClick={() => setAppearance('dark')}
                  >
                    <div className="sys-theme-preview dark-preview">
                      <div className="preview-bar dark" />
                      <div className="preview-line dark" />
                      <div className="preview-line short dark" />
                    </div>
                    <span className="sys-theme-label">{t('systemSettings.darkMode')}</span>
                    {appearance === 'dark' && <div className="sys-theme-check"><Check size={12} /></div>}
                  </div>

                </div>
              </div>

              {/* Language & Region */}
              <div className="sys-section-card">
                <div className="sys-section-header">
                  <Globe size={20} className="sys-section-icon" />
                  <div>
                    <h2 className="sys-section-title">{t('systemSettings.langRegion')}</h2>
                    <p className="sys-section-desc">{t('systemSettings.langRegionDesc')}</p>
                  </div>
                </div>
                <div className="sys-form-row">
                  <div className="sys-form-group">
                    <label className="sys-form-label">{t('systemSettings.displayLang')}</label>
                    <select
                      className="sys-select"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option>English (United States)</option>
                      <option>Vietnamese (Vietnam)</option>
                      <option>French (France)</option>
                      <option>Spanish (Spain)</option>
                    </select>
                  </div>
                  <div className="sys-form-group">
                    <label className="sys-form-label">{t('systemSettings.dateFormat')}</label>
                    <select
                      className="sys-select"
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                    >
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="sys-section-card">
                <div className="sys-section-header">
                  <Bell size={20} className="sys-section-icon" />
                  <div>
                    <h2 className="sys-section-title">{t('systemSettings.notifPrefs')}</h2>
                    <p className="sys-section-desc">{t('systemSettings.notifPrefsDesc')}</p>
                  </div>
                </div>
                <div className="sys-toggle-list">
                  <div className="sys-toggle-item">
                    <div className="sys-toggle-info">
                      <span className="sys-toggle-name">{t('systemSettings.emailNotifs')}</span>
                      <span className="sys-toggle-desc">{t('systemSettings.emailNotifsDesc')}</span>
                    </div>
                    <button
                      className={`sys-toggle-btn ${notifications.email ? 'on' : 'off'}`}
                      onClick={() => setNotifications(n => ({ ...n, email: !n.email }))}
                    >
                      <span className="sys-toggle-thumb">
                        {notifications.email && <Check size={10} />}
                      </span>
                    </button>
                  </div>

                  <div className="sys-toggle-item">
                    <div className="sys-toggle-info">
                      <span className="sys-toggle-name">{t('systemSettings.smsAlerts')}</span>
                      <span className="sys-toggle-desc">{t('systemSettings.smsAlertsDesc')}</span>
                    </div>
                    <button
                      className={`sys-toggle-btn ${notifications.sms ? 'on' : 'off'}`}
                      onClick={() => setNotifications(n => ({ ...n, sms: !n.sms }))}
                    >
                      <span className="sys-toggle-thumb">
                        {notifications.sms && <Check size={10} />}
                      </span>
                    </button>
                  </div>

                  <div className="sys-toggle-item">
                    <div className="sys-toggle-info">
                      <span className="sys-toggle-name">{t('systemSettings.pushNotifs')}</span>
                      <span className="sys-toggle-desc">{t('systemSettings.pushNotifsDesc')}</span>
                    </div>
                    <button
                      className={`sys-toggle-btn ${notifications.push ? 'on' : 'off'}`}
                      onClick={() => setNotifications(n => ({ ...n, push: !n.push }))}
                    >
                      <span className="sys-toggle-thumb">
                        {notifications.push && <Check size={10} />}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Support Assistant */}
              <div className="sys-section-card">
                <div className="sys-section-header">
                  <Bot size={20} className="sys-section-icon" />
                  <div>
                    <h2 className="sys-section-title">{t('systemSettings.aiSupport')}</h2>
                    <p className="sys-section-desc">{t('systemSettings.aiSupportDesc')}</p>
                  </div>
                </div>

                <div className="sys-ai-enable-row">
                  <div className="sys-ai-enable-info">
                    <Bot size={20} className="sys-ai-bot-icon" />
                    <div>
                      <span className="sys-ai-enable-title">{t('systemSettings.enableSmartAssist')}</span>
                      <span className="sys-ai-enable-sub">{t('systemSettings.enableSmartAssistDesc')}</span>
                    </div>
                  </div>
                  <button
                    className={`sys-toggle-btn ${aiEnabled ? 'on' : 'off'}`}
                    onClick={() => setAiEnabled(!aiEnabled)}
                  >
                    <span className="sys-toggle-thumb">
                      {aiEnabled && <Check size={10} />}
                    </span>
                  </button>
                </div>

                <div className="sys-form-group" style={{ marginTop: '1.5rem' }}>
                  <label className="sys-form-label">{t('systemSettings.aiPersonaName')}</label>
                  <input
                    type="text"
                    className="sys-input"
                    value={aiName}
                    onChange={(e) => setAiName(e.target.value)}
                  />
                </div>

                <div className="sys-form-group" style={{ marginTop: '1.25rem' }}>
                  <label className="sys-form-label">{t('systemSettings.escThreshold')}</label>
                  <input
                    type="range"
                    className="sys-range"
                    min={0}
                    max={100}
                    value={aiThreshold}
                    onChange={(e) => setAiThreshold(e.target.value)}
                  />
                  <div className="sys-range-labels">
                    <span />
                    <span className="sys-range-value">{t('systemSettings.escThresholdMedium')}</span>
                  </div>
                  <p className="sys-range-desc">{t('systemSettings.escThresholdDesc')}</p>
                </div>
              </div>
            </>
          )}

          {activeSection === 'security' && (
            <div className="sys-section-card">
              <div className="sys-section-header">
                <Shield size={20} className="sys-section-icon" />
                <div>
                  <h2 className="sys-section-title">{t('systemSettings.securitySettings')}</h2>
                  <p className="sys-section-desc">{t('systemSettings.securitySettingsDesc')}</p>
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <button 
                  className="sys-btn-save" 
                  onClick={() => setIsPasswordModalOpen(true)}
                  style={{ background: '#6C3AED', color: '#fff' }}
                >
                  {t('systemSettings.changePassword')}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'alerts' && (
            <div className="sys-section-card">
              <div className="sys-section-header">
                <Bell size={20} className="sys-section-icon" />
                <div>
                  <h2 className="sys-section-title">{t('systemSettings.alertConfigs')}</h2>
                  <p className="sys-section-desc">{t('systemSettings.alertConfigsDesc')}</p>
                </div>
              </div>
              <p className="sys-placeholder-text">{t('systemSettings.alertContentComing')}</p>
            </div>
          )}

          {activeSection === 'team' && (
            <div className="sys-section-card">
              <div className="sys-section-header">
                <Users size={20} className="sys-section-icon" />
                <div>
                  <h2 className="sys-section-title">{t('systemSettings.teamMgmt')}</h2>
                  <p className="sys-section-desc">{t('systemSettings.teamMgmtDesc')}</p>
                </div>
              </div>
              <p className="sys-placeholder-text">{t('systemSettings.teamContentComing')}</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="sys-footer-actions">
            <button className="sys-btn-discard" onClick={() => {}}>{t('systemSettings.discardChanges')}</button>
            <button className="sys-btn-save" onClick={handleSave}>
              {saved ? <><Check size={16} /> {t('systemSettings.saved')}</> : t('systemSettings.savePrefs')}
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

export default SettingsPage;
