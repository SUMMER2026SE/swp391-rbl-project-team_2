import React, { useState } from 'react';
import { Save, Bell, Shield, Globe, Palette } from 'lucide-react';
import Button from '../../../components/common/Button';
import './SettingsPage.css';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: <Globe size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
  ];

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Portal Settings</h1>
        <p className="admin-page-subtitle">Configure system preferences and platform settings.</p>
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
              <h2>General Settings</h2>
              <div className="settings-form">
                <div className="settings-field">
                  <label>Platform Name</label>
                  <input type="text" defaultValue="SmartBoarding" />
                </div>
                <div className="settings-field">
                  <label>Support Email</label>
                  <input type="email" defaultValue="support@smartboarding.com" />
                </div>
                <div className="settings-field">
                  <label>Default Language</label>
                  <select defaultValue="vi">
                    <option value="vi">Vietnamese</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="settings-field">
                  <label>Timezone</label>
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
              <h2>Notification Preferences</h2>
              <div className="settings-toggles">
                {[
                  { label: 'New tenant registration', desc: 'Get notified when a new user registers' },
                  { label: 'Payment received', desc: 'Get notified when a payment is processed' },
                  { label: 'Maintenance requests', desc: 'Get notified on new maintenance requests' },
                  { label: 'System alerts', desc: 'Critical system and security alerts' },
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
              <h2>Security Settings</h2>
              <div className="settings-form">
                <div className="settings-field">
                  <label>Current Password</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <div className="settings-field">
                  <label>New Password</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <div className="settings-field">
                  <label>Confirm New Password</label>
                  <input type="password" placeholder="••••••••" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h2>Appearance</h2>
              <div className="settings-form">
                <div className="settings-field">
                  <label>Theme</label>
                  <select defaultValue="light">
                    <option value="light">Light</option>
                    <option value="dark">Dark (Coming soon)</option>
                  </select>
                </div>
                <div className="settings-field">
                  <label>Primary Color</label>
                  <input type="color" defaultValue="#2563EB" />
                </div>
              </div>
            </div>
          )}

          <div className="settings-actions">
            <Button variant="primary">
              <Save size={16} />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
