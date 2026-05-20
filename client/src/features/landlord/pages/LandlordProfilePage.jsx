import React from 'react';
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
  Award
} from 'lucide-react';
import { ROUTES } from '../../../constants';
import './LandlordProfilePage.css';

const LandlordProfilePage = () => {
  const navigate = useNavigate();

  const handleEditProfileClick = () => {
    navigate(ROUTES.LANDLORD.SETTINGS);
  };

  const properties = [
    {
      id: 1,
      name: 'Oakwood Smart Residences',
      units: '12 Units',
      location: 'Downtown',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=120&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      name: 'The Metro Lofts',
      units: '8 Units',
      location: 'Westside',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=120&auto=format&fit=crop&q=80'
    }
  ];

  const verificationItems = [
    { label: 'Government ID', status: 'Verified', type: 'success' },
    { label: 'Email Address', status: 'Verified', type: 'success' },
    { label: 'Phone Number', status: 'Verified', type: 'success' },
    { label: 'Background Check', status: 'Cleared (2023)', type: 'info' }
  ];

  return (
    <div className="landlord-profile-container">
      {/* Top Profile Card Header */}
      <div className="landlord-profile-header-card">
        <div className="header-card-avatar-section">
          <div className="profile-large-avatar-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80" 
              alt="Robert Sterling" 
              className="profile-large-avatar"
            />
            <div className="profile-avatar-badge">
              <ShieldCheck size={16} className="badge-check-icon" />
            </div>
          </div>
        </div>

        <div className="header-card-info-section">
          <div className="profile-name-row">
            <h1 className="profile-full-name">Robert Sterling</h1>
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
              <a href="#" className="header-action-link">View All Properties</a>
            </div>

            <div className="section-card-body">
              {/* Stats Box Row */}
              <div className="stats-box-row">
                <div className="stat-box-item">
                  <span className="stat-label">Total Units</span>
                  <span className="stat-value">24</span>
                </div>
                <div className="stat-box-item">
                  <span className="stat-label">Active Tenants</span>
                  <span className="stat-value">22</span>
                </div>
                <div className="stat-box-item">
                  <span className="stat-label">Occupancy Rate</span>
                  <span className="stat-value highlight-occupancy">91%</span>
                </div>
                <div className="stat-box-item">
                  <span className="stat-label">Avg. Stay</span>
                  <span className="stat-value">18mo</span>
                </div>
              </div>

              {/* Property list */}
              <div className="portfolio-properties-list">
                {properties.map(prop => (
                  <div key={prop.id} className="portfolio-property-row">
                    <div className="property-row-left">
                      <img src={prop.image} alt={prop.name} className="property-row-thumb" />
                      <div className="property-row-details">
                        <h4 className="property-row-name">{prop.name}</h4>
                        <span className="property-row-caption">{prop.units} • {prop.location}</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="property-row-arrow" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Account Settings Header Title */}
          <h3 className="profile-subsection-title">Account Settings</h3>

          {/* Contact Details and Payout Methods Side-by-Side */}
          <div className="account-settings-row-grid">
            {/* Contact Details */}
            <div className="profile-section-card mini-card">
              <div className="section-card-header">
                <h2 className="section-card-title">Contact Details</h2>
                <button className="btn-icon-action" onClick={handleEditProfileClick}>
                  <Pencil size={16} />
                </button>
              </div>

              <div className="section-card-body pt-1">
                <div className="contact-info-list">
                  <div className="contact-info-item">
                    <span className="contact-label">Primary Email</span>
                    <span className="contact-val">robert.sterling@smartstay.com</span>
                  </div>
                  <div className="contact-info-item">
                    <span className="contact-label">Phone Number</span>
                    <span className="contact-val">+1 (555) 123-4567</span>
                  </div>
                  <div className="contact-info-item">
                    <span className="contact-label">Mailing Address</span>
                    <span className="contact-val address-multiline">
                      100 Corporate Plaza, Suite 400<br />
                      San Francisco, CA 94105
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payout Methods */}
            <div className="profile-section-card mini-card">
              <div className="section-card-header">
                <h2 className="section-card-title">Payout Methods</h2>
                <button className="btn-icon-action">
                  <Plus size={18} className="icon-blue-action" />
                </button>
              </div>

              <div className="section-card-body pt-1">
                <div className="payout-methods-list">
                  <div className="payout-row-item">
                    <div className="payout-item-left">
                      <div className="payout-bank-icon-box">
                        <Landmark size={18} />
                      </div>
                      <div className="payout-details">
                        <h4 className="payout-bank-title">Chase Bank Checking</h4>
                        <span className="payout-number">**** **** **** 8821</span>
                      </div>
                    </div>
                    <span className="default-payout-badge">Default</span>
                  </div>

                  <div className="payout-row-item">
                    <div className="payout-item-left">
                      <div className="payout-bank-icon-box">
                        <Landmark size={18} />
                      </div>
                      <div className="payout-details">
                        <h4 className="payout-bank-title">Wells Fargo Savings</h4>
                        <span className="payout-number">**** **** **** 4490</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="payout-footer-info">
                  <Info size={14} className="info-icon" />
                  <p className="payout-info-text">
                    Payouts are processed on the 1st of every month automatically to your default account.
                  </p>
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
                  <h4 className="banner-title">Fully Verified Host</h4>
                  <p className="banner-desc">
                    All identity and background checks are current and approved.
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
