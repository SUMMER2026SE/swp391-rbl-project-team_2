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
  Loader
} from 'lucide-react';
import { ROUTES } from '../../../constants';
import useAuthStore from '../../../store/useAuthStore';
import { landlordService } from '../services/landlordService';
import './LandlordProfilePage.css';

const LandlordProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchProfile();
  }, []);

  const handleEditProfileClick = () => {
    navigate(ROUTES.LANDLORD.SETTINGS);
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
          <div className="profile-large-avatar-wrapper">
            <img 
              src={displayProfile.avatarUrl || `https://ui-avatars.com/api/?name=${displayProfile.fullName || 'User'}&background=random&size=150`}
              alt={displayProfile.fullName || 'Landlord'}
              className="profile-large-avatar"
            />
            <div className="profile-avatar-badge">
              <ShieldCheck size={16} className="badge-check-icon" />
            </div>
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
    </div>
  );
};

export default LandlordProfilePage;
