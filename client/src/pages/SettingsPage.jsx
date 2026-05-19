import React, { useState } from 'react';
import { 
  Palette, 
  Globe, 
  Bell, 
  Cpu, 
  Check, 
  Shield, 
  Users, 
  Sliders, 
  Info,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react';
import './SettingsPage.css';

const SettingsPage = () => {
  // Navigation State
  const [activeSubTab, setActiveSubTab] = useState('General');

  // Form State
  const [appearanceMode, setAppearanceMode] = useState('light');
  const [displayLanguage, setDisplayLanguage] = useState('en-US');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  const [enableSmartAssistant, setEnableSmartAssistant] = useState(true);
  const [personaName, setPersonaName] = useState('SmartHost AI');
  const [escalationValue, setEscalationValue] = useState(50); // slider value

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Trigger Toast Notification
  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Save changes handler
  const handleSave = (e) => {
    e.preventDefault();
    showToast('Preferences saved successfully!', 'success');
  };

  // Discard changes handler
  const handleDiscard = () => {
    setAppearanceMode('light');
    setDisplayLanguage('en-US');
    setDateFormat('MM/DD/YYYY');
    setEmailNotifications(true);
    setSmsAlerts(false);
    setPushNotifications(true);
    setEnableSmartAssistant(true);
    setPersonaName('SmartHost AI');
    setEscalationValue(50);
    showToast('Changes discarded and reset to default.', 'info');
  };

  // Convert numerical slider value to textual threshold labels
  const getThresholdLabel = (val) => {
    if (val < 33) return 'Low';
    if (val < 67) return 'Medium';
    return 'High';
  };

  return (
    <div className="settings-page-wrapper">
      {/* Toast popup */}
      {toastMessage && (
        <div className={`floating-toast ${toastType}`}>
          {toastType === 'success' ? (
            <CheckCircle size={18} className="toast-icon" />
          ) : (
            <Info size={18} className="toast-icon" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Title Block */}
      <div className="settings-title-header">
        <h1 className="settings-main-title">System Settings</h1>
        <p className="settings-main-subtitle">
          Manage your platform preferences and configurations.
        </p>
      </div>

      {/* Main Layout Grid split */}
      <div className="settings-grid-split">
        
        {/* Left Side: Sub Navigation Panel */}
        <aside className="settings-subnav-panel">
          <nav className="settings-subnav-menu">
            <button 
              onClick={() => setActiveSubTab('General')}
              className={`subnav-pill-btn ${activeSubTab === 'General' ? 'active' : ''}`}
            >
              <Sliders size={16} />
              <span className="pill-title">General</span>
              {activeSubTab === 'General' && <ChevronRight size={14} className="active-chevron-indicator" />}
            </button>

            <button 
              onClick={() => {
                setActiveSubTab('Security');
                showToast('Security sub-panel simulation active.', 'info');
              }}
              className={`subnav-pill-btn ${activeSubTab === 'Security' ? 'active' : ''}`}
            >
              <Shield size={16} />
              <span className="pill-title">Security</span>
              {activeSubTab === 'Security' && <ChevronRight size={14} className="active-chevron-indicator" />}
            </button>

            <button 
              onClick={() => {
                setActiveSubTab('Alerts');
                showToast('System Alerts sub-panel simulation active.', 'info');
              }}
              className={`subnav-pill-btn ${activeSubTab === 'Alerts' ? 'active' : ''}`}
            >
              <Bell size={16} />
              <span className="pill-title">Alerts</span>
              {activeSubTab === 'Alerts' && <ChevronRight size={14} className="active-chevron-indicator" />}
            </button>

            <button 
              onClick={() => {
                setActiveSubTab('Team');
                showToast('Team sub-panel simulation active.', 'info');
              }}
              className={`subnav-pill-btn ${activeSubTab === 'Team' ? 'active' : ''}`}
            >
              <Users size={16} />
              <span className="pill-title">Team</span>
              {activeSubTab === 'Team' && <ChevronRight size={14} className="active-chevron-indicator" />}
            </button>
          </nav>
        </aside>

        {/* Right Side: Preference form containers */}
        <main className="settings-content-main">
          {activeSubTab === 'General' ? (
            <form onSubmit={handleSave} className="settings-form-flow">
              
              {/* CARD 1: Appearance */}
              <div className="preference-form-card">
                <header className="pref-card-header">
                  <Palette className="pref-card-icon" size={20} />
                  <div className="pref-header-meta">
                    <h3 className="pref-card-title">Appearance</h3>
                    <p className="pref-card-subtitle">
                      Customize the look and feel of your admin dashboard.
                    </p>
                  </div>
                </header>

                <div className="pref-card-body">
                  <div className="appearance-cards-row">
                    {/* Light Mode choice */}
                    <div 
                      onClick={() => setAppearanceMode('light')}
                      className={`appearance-card-option ${appearanceMode === 'light' ? 'active' : ''}`}
                    >
                      <div className="appearance-preview light-preview">
                        <span className="dummy-sidebar"></span>
                        <span className="dummy-content">
                          <span className="dummy-line header-line"></span>
                          <span className="dummy-line content-line"></span>
                        </span>
                      </div>
                      <div className="option-label-meta">
                        <Sun size={14} className="option-icon" />
                        <span className="option-name">Light Mode</span>
                      </div>
                    </div>

                    {/* Dark Mode choice */}
                    <div 
                      onClick={() => setAppearanceMode('dark')}
                      className={`appearance-card-option ${appearanceMode === 'dark' ? 'active' : ''}`}
                    >
                      <div className="appearance-preview dark-preview">
                        <span className="dummy-sidebar"></span>
                        <span className="dummy-content">
                          <span className="dummy-line header-line"></span>
                          <span className="dummy-line content-line"></span>
                        </span>
                      </div>
                      <div className="option-label-meta">
                        <Moon size={14} className="option-icon" />
                        <span className="option-name">Dark Mode</span>
                      </div>
                    </div>

                    {/* System Sync choice */}
                    <div 
                      onClick={() => setAppearanceMode('system')}
                      className={`appearance-card-option ${appearanceMode === 'system' ? 'active' : ''}`}
                    >
                      <div className="appearance-preview system-preview">
                        <span className="dummy-sidebar-system"></span>
                        <span className="dummy-content-system">
                          <Monitor size={22} className="sync-monitor-icon" />
                        </span>
                      </div>
                      <div className="option-label-meta">
                        <Monitor size={14} className="option-icon" />
                        <span className="option-name">System Sync</span>
                        <span className="os-caption">Follows OS setting</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: Language & Region */}
              <div className="preference-form-card">
                <header className="pref-card-header">
                  <Globe className="pref-card-icon" size={20} />
                  <div className="pref-header-meta">
                    <h3 className="pref-card-title">Language & Region</h3>
                    <p className="pref-card-subtitle">
                      Set your primary language and regional formatting.
                    </p>
                  </div>
                </header>

                <div className="pref-card-body">
                  <div className="inputs-double-row">
                    <div className="form-field-group">
                      <label className="field-input-label">Display Language</label>
                      <select 
                        value={displayLanguage}
                        onChange={e => setDisplayLanguage(e.target.value)}
                        className="pref-select-dropdown"
                      >
                        <option value="en-US">English (United States)</option>
                        <option value="vi-VN">Tiếng Việt (Việt Nam)</option>
                        <option value="ja-JP">日本語 (日本)</option>
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label className="field-input-label">Date Format</label>
                      <select 
                        value={dateFormat}
                        onChange={e => setDateFormat(e.target.value)}
                        className="pref-select-dropdown"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 3: Notification Preferences */}
              <div className="preference-form-card">
                <header className="pref-card-header">
                  <Bell className="pref-card-icon" size={20} />
                  <div className="pref-header-meta">
                    <h3 className="pref-card-title">Notification Preferences</h3>
                    <p className="pref-card-subtitle">
                      Choose how and when you want to be alerted.
                    </p>
                  </div>
                </header>

                <div className="pref-card-body">
                  <div className="toggle-list-stack">
                    {/* Toggle 1 */}
                    <div className="toggle-row-item">
                      <div className="toggle-info-block">
                        <span className="toggle-main-label">Email Notifications</span>
                        <span className="toggle-sub-label">
                          Receive daily summaries and critical alerts via email.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        className={`ios-toggle-switch ${emailNotifications ? 'active' : ''}`}
                      >
                        <span className="ios-toggle-slider">
                          {emailNotifications && <Check size={10} className="checkmark-inner" />}
                        </span>
                      </button>
                    </div>

                    {/* Toggle 2 */}
                    <div className="toggle-row-item">
                      <div className="toggle-info-block">
                        <span className="toggle-main-label">SMS Alerts</span>
                        <span className="toggle-sub-label">
                          Get text messages for urgent booking requests.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSmsAlerts(!smsAlerts)}
                        className={`ios-toggle-switch ${smsAlerts ? 'active' : ''}`}
                      >
                        <span className="ios-toggle-slider">
                          {smsAlerts && <Check size={10} className="checkmark-inner" />}
                        </span>
                      </button>
                    </div>

                    {/* Toggle 3 */}
                    <div className="toggle-row-item">
                      <div className="toggle-info-block">
                        <span className="toggle-main-label">Push Notifications</span>
                        <span className="toggle-sub-label">
                          Browser notifications for real-time updates.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPushNotifications(!pushNotifications)}
                        className={`ios-toggle-switch ${pushNotifications ? 'active' : ''}`}
                      >
                        <span className="ios-toggle-slider">
                          {pushNotifications && <Check size={10} className="checkmark-inner" />}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 4: AI Support Assistant */}
              <div className="preference-form-card">
                <header className="pref-card-header">
                  <Cpu className="pref-card-icon" size={20} />
                  <div className="pref-header-meta">
                    <h3 className="pref-card-title">AI Support Assistant</h3>
                    <p className="pref-card-subtitle">
                      Configure the automated chatbot for initial tenant inquiries.
                    </p>
                  </div>
                </header>

                <div className="pref-card-body">
                  <div className="ai-activation-box">
                    <div className="ai-box-left">
                      <div className="ai-avatar-circle">
                        <Cpu size={16} />
                      </div>
                      <div className="ai-box-meta">
                        <span className="ai-main-title">Enable Smart Assistant</span>
                        <span className="ai-sub-title">Allow AI to handle common questions.</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnableSmartAssistant(!enableSmartAssistant)}
                      className={`ios-toggle-switch ${enableSmartAssistant ? 'active' : ''}`}
                    >
                      <span className="ios-toggle-slider">
                        {enableSmartAssistant && <Check size={10} className="checkmark-inner" />}
                      </span>
                    </button>
                  </div>

                  <div className={`ai-collapsible-options-grid ${!enableSmartAssistant ? 'disabled-view' : ''}`}>
                    <div className="form-field-group">
                      <label className="field-input-label">Assistant Persona Name</label>
                      <input 
                        type="text" 
                        value={personaName}
                        onChange={e => setPersonaName(e.target.value)}
                        disabled={!enableSmartAssistant}
                        placeholder="SmartHost AI"
                        className="pref-text-input"
                      />
                    </div>

                    <div className="form-field-group">
                      <div className="slider-header-row">
                        <label className="field-input-label">Escalation Threshold</label>
                        <span className="slider-label-badge">{getThresholdLabel(escalationValue)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0"
                        max="100"
                        value={escalationValue}
                        onChange={e => setEscalationValue(Number(e.target.value))}
                        disabled={!enableSmartAssistant}
                        className="pref-slider-range"
                      />
                      <p className="slider-hint-text">
                        Determines when the AI hands over to a human agent based on query complexity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="settings-bottom-actions-row">
                <button 
                  type="button" 
                  onClick={handleDiscard}
                  className="btn-discard-outline"
                >
                  Discard Changes
                </button>
                <button 
                  type="submit" 
                  className="btn-save-solid"
                >
                  Save Preferences
                </button>
              </div>

            </form>
          ) : (
            <div className="simulation-empty-container">
              <Shield size={36} className="empty-sub-icon" />
              <h3>{activeSubTab} settings panel simulation</h3>
              <p>State logic is active. This configuration module is mapped correctly.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default SettingsPage;
