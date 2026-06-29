import toast from 'react-hot-toast';
import { getAvatarUrl as getGlobalAvatar } from '../../../utils/format';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Home, 
  ChevronRight, 
  Pencil, 
  Plus, 
  Landmark, 
  Info, 
  Star,
  Award,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Loader,
  X,
  Check,
  Camera
} from 'lucide-react';
import { ROUTES } from '../../../constants';
import useAuthStore from '../../../store/useAuthStore';
import { landlordService } from '../services/landlordService';
import { authService } from '../../auth/services/authService';
import httpClient from '../../../services/httpClient';
import { API_URL } from '../../../config';
import './LandlordProfilePage.css';

const LandlordProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', phone: '', icNumber: '', icIssueDate: '', icIssuePlace: '', permanentAddress: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const fileInputRef = React.useRef(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await authService.uploadAvatar(formData);
      if (!response.success) throw new Error(response.message);
      updateUser({ avatarUrl: response.data.avatarUrl });
      setProfile(prev => ({ ...prev, avatarUrl: response.data.avatarUrl }));
      toast.success('Avatar updated successfully!');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error uploading avatar';
      toast(msg);
    }
  };

  const getAvatarUrl = () => {
    const displayProfile = profile || user || {};
    if (displayProfile.avatarUrl) {
      if (displayProfile.avatarUrl.startsWith('/uploads')) {
        const baseUrl = API_URL.replace('/api', '');
        return `${baseUrl}${displayProfile.avatarUrl}`;
      }
      return displayProfile.avatarUrl;
    }
    return `https://ui-avatars.com/api/?name=${displayProfile.fullName || 'User'}&background=random&size=150`;
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await landlordService.getProfile();
      const profileData = response.data || response;
      setProfile(profileData);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEditProfileClick = () => {
    const displayProfile = profile || user || {};
    setEditForm({
      fullName: displayProfile.fullName || displayProfile.full_name || '',
      phone: displayProfile.phone || '',
      icNumber: displayProfile.icNumber || '',
      icIssueDate: displayProfile.icIssueDate ? new Date(displayProfile.icIssueDate).toISOString().split('T')[0] : '',
      icIssuePlace: displayProfile.icIssuePlace || '',
      permanentAddress: displayProfile.permanentAddress || '',
    });
    setEditError('');
    setPhoneError('');
    setEditSuccess('');
    setShowEditModal(true);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Allow only digits
    if (value.length > 10) return; // Limit to 10 digits
    
    setEditForm(prev => ({ ...prev, phone: value }));

    if (value && !value.startsWith('0')) {
      setPhoneError('Phone number must start with 0');
    } else if (value && value.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (phoneError || (editForm.phone && (editForm.phone.length !== 10 || !editForm.phone.startsWith('0')))) {
      setEditError('Please fix the phone number errors before saving.');
      return;
    }

    setEditLoading(true);
    setEditError('');
    setEditSuccess('');

    try {
      const response = await landlordService.updateProfile({
        fullName: editForm.fullName,
        phone: editForm.phone,
        icNumber: editForm.icNumber,
        icIssueDate: editForm.icIssueDate,
        icIssuePlace: editForm.icIssuePlace,
        permanentAddress: editForm.permanentAddress,
      });

      const updatedData = response.data || response;
      setProfile(updatedData);
      
      // Also update Zustand store so Header etc. reflect the change
      updateUser({
        fullName: updatedData.fullName,
        phone: updatedData.phone,
      });

      setEditSuccess('Profile updated successfully!');
      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccess('');
      }, 1500);
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="landlord-profile loading-state">
        <Loader size={32} className="spinner" />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="landlord-profile error-state">
        <AlertCircle size={32} />
        <p>{error}</p>
      </div>
    );
  }

  const displayProfile = profile || user || {};

  const verificationItems = [
    { label: 'Email Address', status: displayProfile.email ? 'Verified' : 'Pending', type: displayProfile.email ? 'success' : 'warning' },
    { label: 'Phone Number', status: displayProfile.phone ? 'Verified' : 'Pending', type: displayProfile.phone ? 'success' : 'warning' },
    { label: 'Account Status', status: displayProfile.isActive ? 'Active' : 'Inactive', type: displayProfile.isActive ? 'success' : 'warning' },
  ];

  return (
    <div className="landlord-profile-container">
      {/* Top Profile Card Header */}
      <div className="landlord-profile-header-card">
        <div className="header-card-avatar-section">
          <div 
            className="profile-large-avatar-wrapper" 
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={handleAvatarClick}
          >
            <img 
              src={getGlobalAvatar(displayProfile.fullName, displayProfile.avatarUrl, 150)}
              alt={displayProfile.fullName || 'Landlord'}
              className="profile-large-avatar"
            />
            <div className="profile-avatar-badge" style={{ display: 'none' }}>
              <ShieldCheck size={16} className="badge-check-icon" />
            </div>
            <div style={{
              position: 'absolute', bottom: '4px', right: '4px',
              background: '#667eea', borderRadius: '50%', padding: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              <Camera size={16} color="white" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="header-card-info-section">
          <div className="profile-name-row">
            <h1 className="profile-full-name">{displayProfile.fullName || 'Landlord Name'}</h1>
            <span className="premium-host-badge">
              <Star size={12} fill="currentColor" />
              <span>Premium Host</span>
            </span>
          </div>

          <p className="profile-bio-text">
            Professional property manager overseeing premium boarding houses and long-term
            rental units in the metropolitan area. Committed to providing exceptional living
            experiences with a 98% tenant satisfaction rate.
          </p>

          <div className="profile-action-buttons">
            <button className="btn-edit-profile-action" onClick={handleEditProfileClick}>
              <Pencil size={16} />
              Edit Profile
            </button>
            <button className="btn-view-public-action">
              View Public Profile
            </button>
          </div>
        </div>
      </div>

      {/* Grid Workspace */}
      <div className="landlord-profile-grid">
        {/* Left Column */}
        <div className="profile-grid-left-col">
          {/* Portfolio Overview */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <div className="card-header-left">
                <Home size={20} className="header-icon-blue" />
                <h2 className="section-card-title">Portfolio Overview</h2>
              </div>
            </div>

            <div className="section-card-body">
              {/* Stats Box Row */}
              <div className="stats-box-row">
                <div className="stat-box-item">
                  <span className="stat-label">Member Since</span>
                  <span className="stat-value">
                    {displayProfile.createdAt ? new Date(displayProfile.createdAt).getFullYear() : 'N/A'}
                  </span>
                </div>
                <div className="stat-box-item">
                  <span className="stat-label">Account Status</span>
                  <span className="stat-value highlight-occupancy">
                    {displayProfile.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings Header Title */}
          <h3 className="profile-subsection-title">Account Settings</h3>

          {/* Contact Details */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <h2 className="section-card-title">Contact Details</h2>
              <button className="btn-icon-action" onClick={handleEditProfileClick}>
                <Pencil size={16} />
              </button>
            </div>

            <div className="section-card-body pt-1">
              <div className="contact-info-list">
                <div className="contact-info-item">
                  <Mail size={16} className="contact-icon" />
                  <div>
                    <span className="contact-label">Email</span>
                    <span className="contact-val">{displayProfile.email || 'Not provided'}</span>
                  </div>
                </div>
                <div className="contact-info-item">
                  <Phone size={16} className="contact-icon" />
                  <div>
                    <span className="contact-label">Phone</span>
                    <span className="contact-val">{displayProfile.phone || 'Not provided'}</span>
                  </div>
                </div>
                <div className="contact-info-item">
                  <Calendar size={16} className="contact-icon" />
                  <div>
                    <span className="contact-label">Member Since</span>
                    <span className="contact-val">
                      {displayProfile.createdAt ? new Date(displayProfile.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Identity Details */}
          <div className="profile-section-card" style={{ marginTop: '1.5rem' }}>
            <div className="section-card-header">
              <h2 className="section-card-title">Identity Details (For Contracts)</h2>
            </div>
            <div className="section-card-body pt-1">
              <div className="contact-info-list">
                <div className="contact-info-item">
                  <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '12px' }}>🆔</span>
                  </div>
                  <div>
                    <span className="contact-label">CCCD/CMND</span>
                    <span className="contact-val">{displayProfile.icNumber || 'Not provided'}</span>
                  </div>
                </div>
                <div className="contact-info-item">
                  <Calendar size={16} className="contact-icon" />
                  <div>
                    <span className="contact-label">Issue Date</span>
                    <span className="contact-val">
                      {displayProfile.icIssueDate ? new Date(displayProfile.icIssueDate).toLocaleDateString() : 'Not provided'}
                    </span>
                  </div>
                </div>
                <div className="contact-info-item">
                  <MapPin size={16} className="contact-icon" />
                  <div>
                    <span className="contact-label">Issue Place</span>
                    <span className="contact-val">{displayProfile.icIssuePlace || 'Not provided'}</span>
                  </div>
                </div>
                <div className="contact-info-item">
                  <Home size={16} className="contact-icon" />
                  <div>
                    <span className="contact-label">Permanent Address</span>
                    <span className="contact-val">{displayProfile.permanentAddress || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="profile-grid-right-col">
          {/* Trust & Verification */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <div className="card-header-left">
                <Award size={20} className="header-icon-blue" />
                <h2 className="section-card-title">Trust & Verification</h2>
              </div>
            </div>

            <div className="section-card-body">
              {/* Verified Host Alert Box */}
              <div className="verified-host-banner">
                <div className="banner-icon-circle">
                  <ShieldCheck size={18} />
                </div>
                <div className="banner-content">
                  <h4 className="banner-title">Account Status</h4>
                  <p className="banner-desc">
                    {displayProfile.isActive ? 'Your account is active and verified.' : 'Your account is pending verification.'}
                  </p>
                </div>
              </div>

              {/* Status List */}
              <div className="trust-checklist-group">
                {verificationItems.map((item, idx) => (
                  <div key={idx} className="trust-checklist-row">
                    <span className="trust-item-label">{item.label}</span>
                    <span className={`trust-status-badge ${item.type}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="edit-profile-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2>Edit Profile</h2>
              <button className="edit-modal-close" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="edit-modal-form">
              <div className="edit-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="edit-form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={displayProfile.email || ''}
                  disabled
                  className="edit-input-disabled"
                />
                <span className="edit-field-hint">Email cannot be changed</span>
              </div>

              <div className="edit-form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter your phone number (e.g. 098...)"
                  style={phoneError ? { borderColor: '#ef4444' } : {}}
                />
                {phoneError && (
                  <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                    {phoneError}
                  </span>
                )}
              </div>

              <div style={{ margin: '20px 0', borderTop: '1px solid #e2e8f0' }}></div>
              <h4 style={{ marginBottom: '16px', fontSize: '15px', color: '#334155', fontWeight: '600' }}>Identity Information (For Contracts)</h4>

              <div className="edit-form-group">
                <label>CCCD/CMND (12 digits)</label>
                <input
                  type="text"
                  maxLength={12}
                  value={editForm.icNumber}
                  onChange={(e) => setEditForm(prev => ({ ...prev, icNumber: e.target.value.replace(/\D/g, '') }))}
                  placeholder="Enter 12 digit ID number"
                />
              </div>

              <div className="edit-form-group">
                <label>Issue Date</label>
                <input
                  type="date"
                  value={editForm.icIssueDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, icIssueDate: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="edit-form-group">
                <label>Issue Place</label>
                <input
                  type="text"
                  value={editForm.icIssuePlace}
                  onChange={(e) => setEditForm(prev => ({ ...prev, icIssuePlace: e.target.value }))}
                  placeholder="e.g. Cục Cảnh sát QLHC về TTXH"
                />
              </div>

              <div className="edit-form-group">
                <label>Permanent Address</label>
                <input
                  type="text"
                  value={editForm.permanentAddress}
                  onChange={(e) => setEditForm(prev => ({ ...prev, permanentAddress: e.target.value }))}
                  placeholder="Enter your permanent address"
                />
              </div>

              {editError && (
                <div className="edit-msg edit-msg-error">
                  <AlertCircle size={16} />
                  <span>{editError}</span>
                </div>
              )}

              {editSuccess && (
                <div className="edit-msg edit-msg-success">
                  <Check size={16} />
                  <span>{editSuccess}</span>
                </div>
              )}

              <div className="edit-modal-actions">
                <button type="button" className="edit-btn-cancel" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="edit-btn-save" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandlordProfilePage;
