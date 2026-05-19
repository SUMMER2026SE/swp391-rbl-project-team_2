import React, { useState, useRef } from 'react';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Lock, 
  Upload, 
  Check, 
  X, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import './SettingsPage.css';

const SettingsPage = () => {
  // Navigation / Tabs State
  // activeMainTab can be 'personal' or 'business'
  const [activeMainTab, setActiveMainTab] = useState('personal');
  const [activeSubTab, setActiveSubTab] = useState('Personal Info'); // For styling active tab in menu

  // References for scrolling inside 'personal' view
  const personalRef = useRef(null);
  const contactRef = useRef(null);
  const securityRef = useRef(null);

  // Form State - Personal Information
  const [personalInfo, setPersonalInfo] = useState({
    firstName: 'Robert',
    lastName: 'Chen',
    bio: 'Experienced property manager specializing in high-end residential boarding houses. Committed to providing premium, frictionless rental experiences.'
  });
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [tempPersonalInfo, setTempPersonalInfo] = useState({ ...personalInfo });

  // Form State - Contact Info
  const [contactInfo, setContactInfo] = useState({
    email: 'r.chen@smartboarding.com',
    phone: '+1 (555) 123-4567'
  });
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [tempContactInfo, setTempContactInfo] = useState({ ...contactInfo });

  // Form State - Business Details
  const [businessInfo, setBusinessInfo] = useState({
    companyName: 'Smart Boarding Ltd.',
    taxId: 'TX-98234-89',
    officeAddress: 'Suite 400, 100 Innovation Way, Tech District',
    licenseNumber: 'BL-2024-998822',
    businessPhone: '+1 (555) 987-6543'
  });
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [tempBusinessInfo, setTempBusinessInfo] = useState({ ...businessInfo });

  // Form State - Security (Password)
  const [securityInfo, setSecurityInfo] = useState({
    currentPassword: '••••••••', // visual placeholder
    newPassword: '',
    confirmNewPassword: ''
  });

  // Profile Picture State
  const [profilePic, setProfilePic] = useState('https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&auto=format&fit=crop&q=80');
  const fileInputRef = useRef(null);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  // Profile Picture Upload Handler
  const handleUpdatePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        showToast('Profile photo updated successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Personal Info Form Handlers
  const handleEditPersonal = () => {
    setTempPersonalInfo({ ...personalInfo });
    setIsEditingPersonal(true);
  };

  const handleCancelPersonal = () => {
    setIsEditingPersonal(false);
  };

  const handleSavePersonal = () => {
    setPersonalInfo({ ...tempPersonalInfo });
    setIsEditingPersonal(false);
    showToast('Personal information saved successfully!', 'success');
  };

  // Contact Info Form Handlers
  const handleEditContact = () => {
    setTempContactInfo({ ...contactInfo });
    setIsEditingContact(true);
  };

  const handleCancelContact = () => {
    setIsEditingContact(false);
  };

  const handleSaveContact = () => {
    setContactInfo({ ...tempContactInfo });
    setIsEditingContact(false);
    showToast('Contact information saved successfully!', 'success');
  };

  // Business Info Form Handlers
  const handleEditBusiness = () => {
    setTempBusinessInfo({ ...businessInfo });
    setIsEditingBusiness(true);
  };

  const handleCancelBusiness = () => {
    setIsEditingBusiness(false);
  };

  const handleSaveBusiness = () => {
    setBusinessInfo({ ...tempBusinessInfo });
    setIsEditingBusiness(false);
    showToast('Business details saved successfully!', 'success');
  };

  // Security Form Handlers
  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!securityInfo.newPassword || !securityInfo.confirmNewPassword) {
      showToast('Please fill in both new password fields.', 'error');
      return;
    }
    if (securityInfo.newPassword !== securityInfo.confirmNewPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (securityInfo.newPassword.length < 8) {
      showToast('New password must be at least 8 characters long.', 'error');
      return;
    }
    // Simulation Success
    setSecurityInfo({
      currentPassword: '••••••••',
      newPassword: '',
      confirmNewPassword: ''
    });
    showToast('Password updated successfully!', 'success');
  };

  // Scroll spy helper
  const scrollToRef = (ref, tabName) => {
    setActiveMainTab('personal');
    setActiveSubTab(tabName);
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="account-settings-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`settings-toast ${toast.type}`}>
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} className="toast-icon-svg" />
          ) : (
            <AlertCircle size={18} className="toast-icon-svg" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Title & Header */}
      <div className="settings-header-section">
        <h1 className="settings-page-title">Account Settings</h1>
        <p className="settings-page-subtitle">
          Manage your professional profile and security preferences.
        </p>
      </div>

      {/* Main Grid Workspace */}
      <div className="settings-workspace-grid">
        
        {/* Left Side: Profile Card & Tab Navigation List */}
        <div className="settings-left-column">
          
          {/* Card 1: Avatar / Profile Card */}
          <div className="left-profile-summary-card">
            <div className="settings-avatar-wrapper">
              <img src={profilePic} alt="Robert Chen Avatar" className="settings-avatar-img" />
            </div>
            
            <h2 className="profile-name-text">
              {personalInfo.firstName} {personalInfo.lastName}
            </h2>
            <span className="profile-role-title">Senior Property Manager</span>
            
            <button className="btn-update-photo" onClick={handleUpdatePhotoClick}>
              <Upload size={14} />
              <span>Update Photo</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </div>

          {/* Card 2: Tab Selections */}
          <div className="left-tabs-navigation-card">
            <button 
              className={`menu-tab-btn ${activeMainTab === 'personal' && activeSubTab === 'Personal Info' ? 'active' : ''}`}
              onClick={() => {
                setActiveMainTab('personal');
                setActiveSubTab('Personal Info');
                personalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              <User size={18} className="tab-icon" />
              <span>Personal Info</span>
            </button>

            <button 
              className={`menu-tab-btn ${activeMainTab === 'business' ? 'active' : ''}`}
              onClick={() => {
                setActiveMainTab('business');
                setActiveSubTab('Business Details');
              }}
            >
              <Building2 size={18} className="tab-icon" />
              <span>Business Details</span>
            </button>

            <button 
              className={`menu-tab-btn ${activeMainTab === 'personal' && activeSubTab === 'Contact Info' ? 'active' : ''}`}
              onClick={() => scrollToRef(contactRef, 'Contact Info')}
            >
              <Mail size={18} className="tab-icon" />
              <span>Contact Info</span>
            </button>

            <button 
              className={`menu-tab-btn ${activeMainTab === 'personal' && activeSubTab === 'Security' ? 'active' : ''}`}
              onClick={() => scrollToRef(securityRef, 'Security')}
            >
              <Lock size={18} className="tab-icon" />
              <span>Security</span>
            </button>
          </div>

        </div>

        {/* Right Side: Tab panel contents */}
        <div className="settings-right-column">
          
          {activeMainTab === 'personal' ? (
            <div className="settings-sections-stack">
              
              {/* Card 1: Personal Information */}
              <div className="settings-card" ref={personalRef}>
                <div className="settings-card-header">
                  <h3 className="card-title-text">Personal Information</h3>
                  {isEditingPersonal ? (
                    <div className="editing-actions">
                      <button className="btn-action-link cancel" onClick={handleCancelPersonal}>
                        Cancel
                      </button>
                      <button className="btn-action-link save" onClick={handleSavePersonal}>
                        Save
                      </button>
                    </div>
                  ) : (
                    <button className="btn-action-link edit" onClick={handleEditPersonal}>
                      Edit
                    </button>
                  )}
                </div>

                <div className="settings-card-body">
                  <div className="inputs-row">
                    <div className="settings-input-group">
                      <label className="input-field-label">First Name</label>
                      <input 
                        type="text" 
                        value={isEditingPersonal ? tempPersonalInfo.firstName : personalInfo.firstName}
                        onChange={e => setTempPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={!isEditingPersonal}
                        className={`settings-input-box ${isEditingPersonal ? 'enabled' : 'disabled'}`}
                      />
                    </div>
                    <div className="settings-input-group">
                      <label className="input-field-label">Last Name</label>
                      <input 
                        type="text" 
                        value={isEditingPersonal ? tempPersonalInfo.lastName : personalInfo.lastName}
                        onChange={e => setTempPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={!isEditingPersonal}
                        className={`settings-input-box ${isEditingPersonal ? 'enabled' : 'disabled'}`}
                      />
                    </div>
                  </div>

                  <div className="settings-input-group full-width" style={{ marginTop: '1.25rem' }}>
                    <label className="input-field-label">Bio</label>
                    <textarea 
                      value={isEditingPersonal ? tempPersonalInfo.bio : personalInfo.bio}
                      onChange={e => setTempPersonalInfo(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditingPersonal}
                      rows={4}
                      className={`settings-textarea-box ${isEditingPersonal ? 'enabled' : 'disabled'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Contact Info */}
              <div className="settings-card" ref={contactRef}>
                <div className="settings-card-header">
                  <h3 className="card-title-text">Contact Info</h3>
                  {isEditingContact ? (
                    <div className="editing-actions">
                      <button className="btn-action-link cancel" onClick={handleCancelContact}>
                        Cancel
                      </button>
                      <button className="btn-action-link save" onClick={handleSaveContact}>
                        Save
                      </button>
                    </div>
                  ) : (
                    <button className="btn-action-link edit" onClick={handleEditContact}>
                      Edit
                    </button>
                  )}
                </div>

                <div className="settings-card-body">
                  <div className="inputs-row">
                    <div className="settings-input-group with-prefix-icon">
                      <label className="input-field-label">Email Address</label>
                      <div className="input-icon-wrapper">
                        <Mail size={16} className="input-prefix-icon" />
                        <input 
                          type="email" 
                          value={isEditingContact ? tempContactInfo.email : contactInfo.email}
                          onChange={e => setTempContactInfo(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditingContact}
                          className={`settings-input-box prefix-indent ${isEditingContact ? 'enabled' : 'disabled'}`}
                        />
                      </div>
                    </div>

                    <div className="settings-input-group with-prefix-icon">
                      <label className="input-field-label">Phone Number</label>
                      <div className="input-icon-wrapper">
                        <Phone size={16} className="input-prefix-icon" />
                        <input 
                          type="text" 
                          value={isEditingContact ? tempContactInfo.phone : contactInfo.phone}
                          onChange={e => setTempContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!isEditingContact}
                          className={`settings-input-box prefix-indent ${isEditingContact ? 'enabled' : 'disabled'}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Security */}
              <div className="settings-card" ref={securityRef}>
                <div className="settings-card-header no-border">
                  <div>
                    <h3 className="card-title-text">Security</h3>
                    <p className="card-subtitle-caption">
                      Update your password to keep your account secure.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="settings-card-body pt-0">
                  <div className="settings-input-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="input-field-label">Current Password</label>
                    <input 
                      type="password" 
                      value={securityInfo.currentPassword}
                      onChange={e => setSecurityInfo(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="settings-input-box secure-input"
                    />
                  </div>

                  <div className="settings-input-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="input-field-label">New Password</label>
                    <input 
                      type="password" 
                      value={securityInfo.newPassword}
                      onChange={e => setSecurityInfo(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="settings-input-box secure-input"
                    />
                  </div>

                  <div className="settings-input-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="input-field-label">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={securityInfo.confirmNewPassword}
                      onChange={e => setSecurityInfo(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="settings-input-box secure-input"
                    />
                  </div>

                  <button type="submit" className="btn-update-password-submit">
                    Update Password
                  </button>
                </form>
              </div>

            </div>
          ) : (
            /* Business Details Card (Rendered when Business Details tab is active) */
            <div className="settings-sections-stack">
              <div className="settings-card">
                <div className="settings-card-header">
                  <h3 className="card-title-text">Business Details</h3>
                  {isEditingBusiness ? (
                    <div className="editing-actions">
                      <button className="btn-action-link cancel" onClick={handleCancelBusiness}>
                        Cancel
                      </button>
                      <button className="btn-action-link save" onClick={handleSaveBusiness}>
                        Save
                      </button>
                    </div>
                  ) : (
                    <button className="btn-action-link edit" onClick={handleEditBusiness}>
                      Edit
                    </button>
                  )}
                </div>

                <div className="settings-card-body">
                  <div className="inputs-row">
                    <div className="settings-input-group">
                      <label className="input-field-label">Company Name</label>
                      <input 
                        type="text" 
                        value={isEditingBusiness ? tempBusinessInfo.companyName : businessInfo.companyName}
                        onChange={e => setTempBusinessInfo(prev => ({ ...prev, companyName: e.target.value }))}
                        disabled={!isEditingBusiness}
                        className={`settings-input-box ${isEditingBusiness ? 'enabled' : 'disabled'}`}
                      />
                    </div>
                    <div className="settings-input-group">
                      <label className="input-field-label">Tax ID / Business Registration</label>
                      <input 
                        type="text" 
                        value={isEditingBusiness ? tempBusinessInfo.taxId : businessInfo.taxId}
                        onChange={e => setTempBusinessInfo(prev => ({ ...prev, taxId: e.target.value }))}
                        disabled={!isEditingBusiness}
                        className={`settings-input-box ${isEditingBusiness ? 'enabled' : 'disabled'}`}
                      />
                    </div>
                  </div>

                  <div className="inputs-row" style={{ marginTop: '1.25rem' }}>
                    <div className="settings-input-group">
                      <label className="input-field-label">Operating License Number</label>
                      <input 
                        type="text" 
                        value={isEditingBusiness ? tempBusinessInfo.licenseNumber : businessInfo.licenseNumber}
                        onChange={e => setTempBusinessInfo(prev => ({ ...prev, licenseNumber: e.target.value }))}
                        disabled={!isEditingBusiness}
                        className={`settings-input-box ${isEditingBusiness ? 'enabled' : 'disabled'}`}
                      />
                    </div>
                    <div className="settings-input-group">
                      <label className="input-field-label">Business Phone</label>
                      <input 
                        type="text" 
                        value={isEditingBusiness ? tempBusinessInfo.businessPhone : businessInfo.businessPhone}
                        onChange={e => setTempBusinessInfo(prev => ({ ...prev, businessPhone: e.target.value }))}
                        disabled={!isEditingBusiness}
                        className={`settings-input-box ${isEditingBusiness ? 'enabled' : 'disabled'}`}
                      />
                    </div>
                  </div>

                  <div className="settings-input-group full-width" style={{ marginTop: '1.25rem' }}>
                    <label className="input-field-label">Registered Office Address</label>
                    <input 
                      type="text" 
                      value={isEditingBusiness ? tempBusinessInfo.officeAddress : businessInfo.officeAddress}
                      onChange={e => setTempBusinessInfo(prev => ({ ...prev, officeAddress: e.target.value }))}
                      disabled={!isEditingBusiness}
                      className={`settings-input-box ${isEditingBusiness ? 'enabled' : 'disabled'}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
