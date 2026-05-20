import React from 'react';
import { 
  Calendar, ShieldCheck, Star, Edit, Edit3, Lock, Bell, 
  CreditCard, ChevronRight, Wrench, ThermometerSnowflake, 
  CheckCircle2, Clock, ArrowRight, Plus 
} from 'lucide-react';
import './TenantProfilePage.css';

const MOCK_REQUESTS = [
  {
    id: '8492',
    unit: 'Unit 4B',
    title: 'Leaking Faucet in Kitchen',
    status: 'Resolved',
    description: 'The cold water faucet in the kitchen sink is dripping continuously. Needs washer replacement.',
    date: 'Oct 12, 2023',
    iconType: 'plumbing'
  },
  {
    id: '8510',
    unit: 'Unit 4B',
    title: 'AC Not Cooling',
    status: 'In Progress',
    description: 'Air conditioning unit is blowing warm air. Maintenance scheduled for tomorrow morning.',
    date: 'Nov 02, 2023',
    iconType: 'hvac'
  }
];

const TenantProfilePage = () => {
  return (
    <div className="profile-page-wrapper">
      <div className="profile-page container">
        
        {/* Profile Header */}
        <div className="profile-header-card">
          <div className="profile-header-info">
            <img 
              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&auto=format&q=80" 
              alt="Sarah Jenkins" 
              className="profile-avatar" 
            />
            <div className="profile-details">
              <h1 className="profile-name">Sarah Jenkins</h1>
              <p className="profile-member-since">
                <Calendar size={16} />
                <span>Member since October 2023</span>
              </p>
              <div className="profile-badges">
                <div className="badge-blue">
                  <ShieldCheck size={16} />
                  <span>Verified Tenant</span>
                </div>
                <div className="badge-gray">
                  <Star size={16} className="star-icon" />
                  <span>Excellent Rating</span>
                </div>
              </div>
            </div>
          </div>
          <button className="edit-profile-btn">
            <Edit3 size={18} />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Profile Content Grid */}
        <div className="profile-content-grid">
          
          {/* Left Sidebar */}
          <aside className="profile-sidebar">
            
            {/* Personal Information */}
            <div className="profile-card personal-info-card">
              <div className="card-header">
                <h2>Personal Information</h2>
                <button className="icon-btn" aria-label="Edit personal info">
                  <Edit size={18} />
                </button>
              </div>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">sarah.jenkins@example.com</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">+1 (555) 123-4567</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Date of Birth</span>
                  <span className="info-value">August 14, 1992</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Emergency Contact</span>
                  <span className="info-value">Michael Jenkins (Brother)<br/>+1 (555) 987-6543</span>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="profile-card settings-card">
              <div className="card-header">
                <h2>Account Settings</h2>
              </div>
              <div className="settings-menu">
                <button className="settings-item">
                  <div className="settings-item-left">
                    <div className="settings-icon-wrapper">
                      <Lock size={18} />
                    </div>
                    <span>Password &amp; Security</span>
                  </div>
                  <ChevronRight size={20} className="chevron-icon" />
                </button>
                
                <button className="settings-item">
                  <div className="settings-item-left">
                    <div className="settings-icon-wrapper">
                      <Bell size={18} />
                    </div>
                    <span>Notifications</span>
                  </div>
                  <ChevronRight size={20} className="chevron-icon" />
                </button>

                <button className="settings-item">
                  <div className="settings-item-left">
                    <div className="settings-icon-wrapper">
                      <CreditCard size={18} />
                    </div>
                    <span>Payment Methods</span>
                  </div>
                  <ChevronRight size={20} className="chevron-icon" />
                </button>
              </div>
            </div>

          </aside>

          {/* Main Content */}
          <main className="profile-main">
            
            {/* My Requests */}
            <div className="profile-card requests-card">
              <div className="card-header">
                <h2>My Requests</h2>
                <button className="view-all-link">View All</button>
              </div>
              
              <div className="requests-list">
                {MOCK_REQUESTS.map(req => (
                  <div key={req.id} className="request-item">
                    <div className="request-item-header">
                      <div className="request-item-title-group">
                        <div className={`request-icon-wrapper ${req.iconType}`}>
                          {req.iconType === 'plumbing' ? <Wrench size={20} /> : <ThermometerSnowflake size={20} />}
                        </div>
                        <div className="request-title-area">
                          <h3>{req.title}</h3>
                          <span className="request-subtitle">Req #{req.id} • {req.unit}</span>
                        </div>
                      </div>
                      
                      <div className={`request-status-badge ${req.status.toLowerCase().replace(' ', '-')}`}>
                        {req.status === 'Resolved' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        <span>{req.status}</span>
                      </div>
                    </div>
                    
                    <p className="request-description">{req.description}</p>
                    
                    <div className="request-item-footer">
                      <span className="request-date">Submitted: {req.date}</span>
                      <button className="details-link">
                        Details <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="new-request-container">
                <button className="new-request-btn">
                  <Plus size={18} />
                  <span>New Request</span>
                </button>
              </div>
            </div>

          </main>

        </div>
      </div>
    </div>
  );
};

export default TenantProfilePage;
