import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
  Calendar, ShieldCheck, Star, Edit, Edit3, Lock, Bell, 
  CreditCard, ChevronRight, Wrench, ThermometerSnowflake, 
  CheckCircle2, Clock, ArrowRight, Plus, Save, X, Camera
} from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';
import { authService } from '../../auth/services/authService';
import { API_URL } from '../../../config';
import './TenantProfilePage.css';

// Mock requests removed

const TenantProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const validate = () => {
    const newErrors = {};
    if (formData.phone) {
      if (!/^0\d{9}$/.test(formData.phone)) {
        newErrors.phone = 'Phone number must be exactly 10 digits and start with 0';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const response = await authService.updateProfile({
        fullName: formData.fullName,
        phone: formData.phone,
      });
      if (!response.success) throw new Error(response.message);
      updateUser(response.data);
      setIsEditing(false);
      setErrors({});
      toast.success("Profile updated successfully!");
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error updating profile';
      toast.error(msg);
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
      toast.success('Avatar updated successfully!');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error uploading avatar';
      toast.error(msg);
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
                    <div>
                      <input 
                        type="text" 
                        value={formData.phone} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({...formData, phone: val});
                          if (val && !/^0\d{9}$/.test(val)) {
                            setErrors({...errors, phone: 'Phone number must be exactly 10 digits and start with 0'});
                          } else {
                            const newErrors = { ...errors };
                            delete newErrors.phone;
                            setErrors(newErrors);
                          }
                        }}
                        className={`edit-input ${errors.phone ? 'is-invalid' : ''}`}
                        style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${errors.phone ? '#dc3545' : '#ddd'}`, width: '100%' }}
                      />
                      {errors.phone && (
                        <div style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                          {errors.phone}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="info-value">{user?.phone || 'Not provided'}</span>
                  )}
                </div>
                <div className="info-item">
                  <span className="info-label">Role</span>
                  <span className="info-value" style={{ textTransform: 'capitalize' }}>{user?.role || 'Tenant'}</span>
                </div>
              </div>
              {isEditing && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                  <button className="edit-profile-btn" onClick={() => { setIsEditing(false); setErrors({}); }} style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                  <button className="edit-profile-btn" onClick={handleSaveProfile} disabled={isSaving} style={{ background: '#2563eb', color: 'white', border: 'none' }}>
                    <Save size={16} />
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>



          </aside>

          {/* Main Content removed */}

        </div>
      </div>
    </div>
  );
};

export default TenantProfilePage;
