import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, ShieldCheck, Star, Edit, Edit3, Lock, Bell, 
  CreditCard, ChevronRight, Wrench, ThermometerSnowflake, 
  CheckCircle2, Clock, ArrowRight, Plus, Save, X, Camera
} from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';
import { authService } from '../../auth/services/authService';
import { API_URL } from '../../../config';
import ChangePasswordModal from '../../auth/components/ChangePasswordModal';
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
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await authService.updateProfile({
        fullName: formData.fullName,
        phone: formData.phone,
      });
      if (!response.success) throw new Error(response.message);
      updateUser(response.data);
      setIsEditing(false);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error updating profile';
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

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
      alert('Avatar updated successfully!');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error uploading avatar';
      alert(msg);
    }
  };

  const getAvatarUrl = () => {
    if (user?.avatarUrl) {
      // If it's a relative path from our server
      if (user.avatarUrl.startsWith('/uploads')) {
        const baseUrl = API_URL.replace('/api', '');
        return `${baseUrl}${user.avatarUrl}`;
      }
      // If it's a full URL (e.g., from Google)
      return user.avatarUrl;
    }
    return `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=random&size=150`;
  };

  const getJoinDate = () => {
    if (!user?.createdAt) return 'Member';
    const date = new Date(user.createdAt);
    return `Member since ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  };

  return (
    <div className="profile-page-wrapper">
      <div className="profile-page container">
        
        {/* Profile Header */}
        <div className="profile-header-card">
          <div className="profile-header-info">
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleAvatarClick}>
              <img 
                src={getAvatarUrl()}
                alt="Profile" 
                className="profile-avatar" 
              />
              <div style={{
                position: 'absolute', bottom: '4px', right: '4px',
                background: '#667eea', borderRadius: '50%', padding: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                <Camera size={14} color="white" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/jpeg,image/png,image/gif,image/webp"
                style={{ display: 'none' }}
              />
            </div>
            <div className="profile-details">
              <h1 className="profile-name">{user?.fullName || 'User Name'}</h1>
              <p className="profile-member-since">
                <Calendar size={16} />
                <span>{getJoinDate()}</span>
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
          {!isEditing ? (
            <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
              <Edit3 size={18} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="edit-profile-btn" onClick={() => setIsEditing(false)} style={{ background: '#f3f4f6', color: '#374151' }}>
                <X size={18} />
                <span>Cancel</span>
              </button>
              <button className="edit-profile-btn" onClick={handleSaveProfile} disabled={isSaving}>
                <Save size={18} />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile Content Grid */}
        <div className="profile-content-grid">
          
          {/* Left Sidebar */}
          <aside className="profile-sidebar">
            
            {/* Personal Information */}
            <div className="profile-card personal-info-card">
              <div className="card-header">
                <h2>Personal Information</h2>
                {!isEditing && (
                  <button className="icon-btn" aria-label="Edit personal info" onClick={() => setIsEditing(true)}>
                    <Edit size={18} />
                  </button>
                )}
              </div>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Full Name</span>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.fullName} 
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="edit-input"
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', width: '100%' }}
                    />
                  ) : (
                    <span className="info-value">{user?.fullName || 'Not provided'}</span>
                  )}
                </div>
                <div className="info-item">
                  <span className="info-label">Email Address</span>
                  <span className="info-value" style={{ color: '#6b7280' }}>{user?.email || 'Not provided'} (Cannot change)</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone Number</span>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="edit-input"
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd', width: '100%' }}
                    />
                  ) : (
                    <span className="info-value">{user?.phone || 'Not provided'}</span>
                  )}
                </div>
                <div className="info-item">
                  <span className="info-label">Role</span>
                  <span className="info-value" style={{ textTransform: 'capitalize' }}>{user?.role || 'Tenant'}</span>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="profile-card settings-card">
              <div className="card-header">
                <h2>Account Settings</h2>
              </div>
              <div className="settings-menu">
                <button className="settings-item" onClick={() => setIsPasswordModalOpen(true)}>
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
      
      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
};

export default TenantProfilePage;
