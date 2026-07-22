import toast from 'react-hot-toast';
import { getAvatarUrl as getGlobalAvatar, formatDate } from '../../../utils/format';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  Camera,
  Upload
} from 'lucide-react';
import { ROUTES } from '../../../constants';
import useAuthStore from '../../../store/useAuthStore';
import { landlordService } from '../services/landlordService';
import { authService } from '../../auth/services/authService';
import httpClient from '../../../services/httpClient';
import { API_URL } from '../../../config';
import './LandlordProfilePage.css';

const VIETNAMESE_BANKS = [
  { code: 'Vietcombank', name: 'Vietcombank (VCB)' },
  { code: 'Techcombank', name: 'Techcombank (TCB)' },
  { code: 'MB Bank', name: 'MB Bank (Military Bank)' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'VietinBank', name: 'VietinBank' },
  { code: 'Agribank', name: 'Agribank' },
  { code: 'Sacombank', name: 'Sacombank' },
  { code: 'VPBank', name: 'VPBank' },
  { code: 'ACB', name: 'ACB' },
  { code: 'TPBank', name: 'TPBank' },
  { code: 'VIB', name: 'VIB' },
  { code: 'HDBank', name: 'HDBank' },
  { code: 'SHB', name: 'SHB' }
];

const LandlordProfilePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Bank details state
  const [bankDetails, setBankDetails] = useState(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankForm, setBankForm] = useState({ bank_name: '', account_number: '', account_holder_name: '', branch: '' });
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState('');

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', phone: '', icNumber: '', icIssueDate: '', icIssuePlace: '', permanentAddress: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const fileInputRef = React.useRef(null);

  // Identity Verification state
  const [verifyForm, setVerifyForm] = useState({ icNumber: '', icIssueDate: '', icIssuePlace: '', permanentAddress: '' });
  const [cccdFront, setCccdFront] = useState(null);
  const [cccdBack, setCccdBack] = useState(null);
  const [facePhoto, setFacePhoto] = useState(null);
  const [cccdFrontPreview, setCccdFrontPreview] = useState('');
  const [cccdBackPreview, setCccdBackPreview] = useState('');
  const [facePhotoPreview, setFacePhotoPreview] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);

  useEffect(() => {
    const displayProfile = profile || user || {};
    setVerifyForm({
      icNumber: displayProfile.icNumber || displayProfile.ic_number || '',
      icIssueDate: displayProfile.icIssueDate ? new Date(displayProfile.icIssueDate).toISOString().split('T')[0] : '',
      icIssuePlace: displayProfile.icIssuePlace || '',
      permanentAddress: displayProfile.permanentAddress || '',
    });
  }, [profile, user]);

  useEffect(() => {
    if (cccdFront && cccdBack) {
      handleScanOcr();
    }
  }, [cccdFront, cccdBack]);

  const handleScanOcr = async () => {
    if (!cccdFront || !cccdBack) return;
    
    setScanLoading(true);
    toast.loading('Đang tự động quét thông tin CCCD...', { id: 'ocrScan' });

    try {
      const formData = new FormData();
      formData.append('cccdFront', cccdFront);
      formData.append('cccdBack', cccdBack);

      const response = await landlordService.scanOcr(formData);
      
      if (response.success && response.data) {
        toast.success('Quét thông tin thành công!', { id: 'ocrScan' });
        setVerifyForm(prev => ({
          ...prev,
          icNumber: response.data.icNumber || prev.icNumber,
          icIssueDate: response.data.icIssueDate || prev.icIssueDate,
          icIssuePlace: response.data.icIssuePlace || prev.icIssuePlace,
          permanentAddress: response.data.permanentAddress || prev.permanentAddress,
        }));
      } else {
        toast.error(response.message || 'Lỗi khi quét thông tin CCCD', { id: 'ocrScan' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi quét thông tin CCCD', { id: 'ocrScan' });
    } finally {
      setScanLoading(false);
    }
  };

  const handleVerifyFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.verification.toastSizeLimit'));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (type === 'front') {
      setCccdFront(file);
      setCccdFrontPreview(previewUrl);
    } else if (type === 'back') {
      setCccdBack(file);
      setCccdBackPreview(previewUrl);
    } else if (type === 'face') {
      setFacePhoto(file);
      setFacePhotoPreview(previewUrl);
    }
  };

  const handleRemoveVerifyFile = (type) => {
    if (type === 'front') {
      setCccdFront(null);
      setCccdFrontPreview('');
    } else if (type === 'back') {
      setCccdBack(null);
      setCccdBackPreview('');
    } else if (type === 'face') {
      setFacePhoto(null);
      setFacePhotoPreview('');
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();

    if (!verifyForm.icNumber || !verifyForm.icIssueDate || !verifyForm.icIssuePlace || !verifyForm.permanentAddress) {
      toast.error(t('profile.verification.toastFieldRequired'));
      return;
    }

    if (!cccdFront || !cccdBack || !facePhoto) {
      toast.error(t('profile.verification.toastPhotoRequired'));
      return;
    }

    setVerifyLoading(true);
    const formData = new FormData();
    formData.append('icNumber', verifyForm.icNumber);
    formData.append('icIssueDate', verifyForm.icIssueDate);
    formData.append('icIssuePlace', verifyForm.icIssuePlace);
    formData.append('permanentAddress', verifyForm.permanentAddress);
    formData.append('cccdFront', cccdFront);
    formData.append('cccdBack', cccdBack);
    formData.append('facePhoto', facePhoto);

    try {
      const response = await landlordService.submitVerification(formData);
      if (response.success) {
        toast.success(response.message || t('profile.verification.toastSuccess'));
        fetchProfile(); // Refresh profile status
        setCccdFront(null);
        setCccdBack(null);
        setFacePhoto(null);
        setCccdFrontPreview('');
        setCccdBackPreview('');
        setFacePhotoPreview('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || t('profile.verification.toastError'));
    } finally {
      setVerifyLoading(false);
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

  const fetchBankDetails = async () => {
    try {
      const response = await landlordService.getBankDetails();
      if (response.success) {
        setBankDetails(response.data);
      }
    } catch (err) {
      console.error('Error fetching bank details:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchBankDetails();
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

  const handleEditBankClick = () => {
    setBankForm({
      bank_name: bankDetails?.bank_name || '',
      account_number: bankDetails?.account_number || '',
      account_holder_name: bankDetails?.account_holder_name || '',
      branch: bankDetails?.branch || '',
    });
    setBankError('');
    setShowBankModal(true);
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    setBankLoading(true);
    setBankError('');

    try {
      const response = await landlordService.saveBankDetails(bankForm);
      if (response.success) {
        setBankDetails(response.data);
        toast.success('Cập nhật tài khoản ngân hàng thành công!');
        setShowBankModal(false);
      }
    } catch (err) {
      setBankError(err.response?.data?.message || err.message || 'Lỗi lưu thông tin ngân hàng');
    } finally {
      setBankLoading(false);
    }
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
        verificationStatus: updatedData.verificationStatus || updatedData.verification_status,
        verificationNotes: updatedData.verificationNotes || updatedData.verification_notes,
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

  const getVerificationStatusLabel = () => {
    const status = displayProfile.verificationStatus || displayProfile.verification_status;
    switch (status) {
      case 'verified': return { label: t('profile.verification.badgeVerified'), type: 'success' };
      case 'pending': return { label: t('profile.verification.badgePending'), type: 'warning' };
      case 'rejected': return { label: t('profile.verification.badgeRejected'), type: 'danger' };
      default: return { label: t('profile.verification.badgeUnverified'), type: 'warning' };
    }
  };

  const statusInfo = getVerificationStatusLabel();

  const verificationItems = [
    { label: t('profile.emailAddress', 'Email'), status: displayProfile.email ? t('profile.verified', 'Verified') : t('profile.pending', 'Pending'), type: displayProfile.email ? 'success' : 'warning' },
    { label: t('profile.phoneNumber', 'Phone'), status: displayProfile.phone ? t('profile.verified', 'Verified') : t('profile.pending', 'Pending'), type: displayProfile.phone ? 'success' : 'warning' },
    { label: t('profile.accountStatus', 'Account Status'), status: (displayProfile.isActive !== undefined ? displayProfile.isActive : displayProfile.is_active) ? t('profile.active', 'Active') : t('profile.inactive', 'Inactive'), type: (displayProfile.isActive !== undefined ? displayProfile.isActive : displayProfile.is_active) ? 'success' : 'warning' },
    { label: t('profile.verification.title', 'Verification'), status: statusInfo.label, type: statusInfo.type },
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
              <span>{t('profile.premiumHost', 'Premium Host')}</span>
            </span>
          </div>

          <p className="profile-bio-text">
            {t('profile.bio', 'Professional property manager overseeing premium boarding houses and long-term rental units in the metropolitan area. Committed to providing exceptional living experiences with a 98% tenant satisfaction rate.')}
          </p>

          <div className="profile-action-buttons">
            <button className="btn-edit-profile-action" onClick={handleEditProfileClick}>
              <Pencil size={16} />
              {t('profile.editProfile', 'Edit Profile')}
            </button>
            <button className="btn-view-public-action">
              {t('profile.viewPublicProfile', 'View Public Profile')}
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
                <h2 className="section-card-title">{t('profile.portfolioOverview', 'Portfolio Overview')}</h2>
              </div>
            </div>

            <div className="section-card-body">
              {/* Stats Box Row */}
              <div className="stats-box-row">
                <div className="stat-box-item">
                  <span className="stat-label">{t('profile.memberSince', 'Member Since')}</span>
                  <span className="stat-value">
                    {displayProfile.createdAt ? new Date(displayProfile.createdAt).getFullYear() : 'N/A'}
                  </span>
                </div>
                <div className="stat-box-item">
                  <span className="stat-label">{t('profile.accountStatus', 'Account Status')}</span>
                  <span className="stat-value highlight-occupancy">
                    {(displayProfile.isActive !== undefined ? displayProfile.isActive : displayProfile.is_active) ? t('profile.active', 'Active') : t('profile.inactive', 'Inactive')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings Header Title */}
          <h3 className="profile-subsection-title">{t('profile.accountSettings', 'Account Settings')}</h3>

          {/* Contact Details */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <h2 className="section-card-title">{t('profile.contactDetails', 'Contact Details')}</h2>
              <button className="btn-icon-action" onClick={handleEditProfileClick}>
                <Pencil size={16} />
              </button>
            </div>

            <div className="section-card-body pt-1">
              <div className="contact-info-list">
                <div className="contact-info-item">
                  <Mail size={16} className="contact-icon" />
                  <div>
                    <span className="contact-label">{t('profile.emailAddress', 'Email')}</span>
                    <span className="contact-val">{displayProfile.email || t('profile.notProvided')}</span>
                  </div>
                </div>
                <div className="contact-info-item">
                  <Phone size={16} className="contact-icon" />
                  <div>
                    <span className="contact-label">{t('profile.phoneNumber', 'Phone')}</span>
                    <span className="contact-val">{displayProfile.phone || t('profile.notProvided')}</span>
                  </div>
                </div>
                <div className="contact-info-item">
                  <Calendar size={16} className="contact-icon" />
                  <div>
                    <span className="contact-label">{t('profile.memberSince', 'Member Since')}</span>
                    <span className="contact-val">
                      {displayProfile.createdAt ? formatDate(displayProfile.createdAt) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Identity Details - Render only when verified or pending to avoid duplicate inputs during submission */}
          {((displayProfile.verificationStatus || displayProfile.verification_status) === 'verified' || 
            (displayProfile.verificationStatus || displayProfile.verification_status) === 'pending') && (
            <div className="profile-section-card" style={{ marginTop: '1.5rem' }}>
              <div className="section-card-header">
                <h2 className="section-card-title">{t('profile.identityDetails')}</h2>
              </div>
              <div className="section-card-body pt-1">
                <div className="contact-info-list">
                  <div className="contact-info-item">
                    <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '12px' }}>🆔</span>
                    </div>
                    <div>
                      <span className="contact-label">{t('profile.idNumber')}</span>
                      <span className="contact-val">{displayProfile.icNumber || t('profile.notProvided')}</span>
                    </div>
                  </div>
                  <div className="contact-info-item">
                    <Calendar size={16} className="contact-icon" />
                    <div>
                      <span className="contact-label">{t('profile.issueDate')}</span>
                      <span className="contact-val">
                        {displayProfile.icIssueDate ? formatDate(displayProfile.icIssueDate) : t('profile.notProvided')}
                      </span>
                    </div>
                  </div>
                  <div className="contact-info-item">
                    <MapPin size={16} className="contact-icon" />
                    <div>
                      <span className="contact-label">{t('profile.issuePlace')}</span>
                      <span className="contact-val">{displayProfile.icIssuePlace || t('profile.notProvided')}</span>
                    </div>
                  </div>
                  <div className="contact-info-item">
                    <Home size={16} className="contact-icon" />
                    <div>
                      <span className="contact-label">{t('profile.permanentAddress')}</span>
                      <span className="contact-val">{displayProfile.permanentAddress || t('profile.notProvided')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Identity Verification Section */}
          <div className="profile-section-card" style={{ marginTop: '1.5rem' }}>
            <div className="section-card-header">
              <div className="card-header-left">
                <ShieldCheck size={20} className="header-icon-blue" />
                <h2 className="section-card-title">{t('profile.verification.title')}</h2>
              </div>
            </div>

            <div className="section-card-body pt-1">
              {/* Verification Alerts based on status */}
              {(displayProfile.verificationStatus || displayProfile.verification_status) === 'verified' && (
                <div className="verification-alert success">
                  <Check size={20} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>{t('profile.verification.statusVerifiedTitle')}</strong>
                    <p>{t('profile.verification.statusVerifiedDesc')}</p>
                  </div>
                </div>
              )}

              {(displayProfile.verificationStatus || displayProfile.verification_status) === 'pending' && (
                <div className="verification-alert info">
                  <Loader size={20} className="spinner" style={{ flexShrink: 0, animation: 'spin 1s linear infinite' }} />
                  <div>
                    <strong>{t('profile.verification.statusPendingTitle')}</strong>
                    <p>{t('profile.verification.statusPendingDesc')}</p>
                  </div>
                </div>
              )}

              {(displayProfile.verificationStatus || displayProfile.verification_status) === 'rejected' && (
                <div className="verification-alert danger">
                  <AlertCircle size={20} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>{t('profile.verification.statusRejectedTitle')}</strong>
                    <p>
                      {t('profile.verification.statusRejectedDesc', {
                        reason: displayProfile.verificationNotes || displayProfile.verification_notes || 'Ảnh không rõ nét hoặc thông tin không khớp'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Show Form if unverified or rejected */}
              {((displayProfile.verificationStatus || displayProfile.verification_status) === 'unverified' || 
                (displayProfile.verificationStatus || displayProfile.verification_status) === 'rejected' ||
                !(displayProfile.verificationStatus || displayProfile.verification_status)) && (
                <form onSubmit={handleVerifySubmit} className="verification-form">
                  {scanLoading && (
                    <div style={{ marginBottom: '1rem', padding: '10px', background: '#e0f2fe', color: '#0369a1', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Loader size={18} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Hệ thống đang tự động trích xuất thông tin thẻ...</span>
                    </div>
                  )}
                  <div className="edit-form-group">
                    <label>{t('profile.verification.idNumberLabel')}</label>
                    <input 
                      type="text" 
                      value={verifyForm.icNumber} 
                      onChange={(e) => setVerifyForm(prev => ({ ...prev, icNumber: e.target.value.replace(/\D/g, '') }))}
                      placeholder={t('profile.verification.idNumberPlaceholder')}
                      maxLength={12}
                      required
                    />
                  </div>

                  <div className="verify-grid-3" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="edit-form-group">
                      <label>{t('profile.verification.issueDateLabel')}</label>
                      <input 
                        type="date" 
                        lang="vi-VN"
                        value={verifyForm.icIssueDate} 
                        onChange={(e) => setVerifyForm(prev => ({ ...prev, icIssueDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="edit-form-group">
                      <label>{t('profile.verification.issuePlaceLabel')}</label>
                      <input 
                        type="text" 
                        value={verifyForm.icIssuePlace} 
                        onChange={(e) => setVerifyForm(prev => ({ ...prev, icIssuePlace: e.target.value }))}
                        placeholder={t('profile.verification.issuePlacePlaceholder')}
                        required
                      />
                    </div>
                  </div>

                  <div className="edit-form-group">
                    <label>{t('profile.verification.addressLabel')}</label>
                    <input 
                      type="text" 
                      value={verifyForm.permanentAddress} 
                      onChange={(e) => setVerifyForm(prev => ({ ...prev, permanentAddress: e.target.value }))}
                      placeholder={t('profile.verification.addressPlaceholder')}
                      required
                    />
                  </div>

                  {/* Upload grid */}
                  <div className="verify-grid-3" style={{ marginTop: '0.5rem' }}>
                    
                    {/* Front side card */}
                    <div className="upload-box-wrapper">
                      <span className="upload-box-label">{t('profile.verification.frontPhotoLabel')}</span>
                      {cccdFrontPreview ? (
                        <div className="preview-container">
                          <img src={cccdFrontPreview} alt="Mặt trước CCCD" className="preview-image" />
                          <button type="button" className="btn-remove-preview" onClick={() => handleRemoveVerifyFile('front')}>
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="upload-card-box">
                          <Upload size={24} className="upload-box-icon" />
                          <span className="upload-box-text">{t('profile.verification.frontPhotoUpload')}</span>
                          <span className="upload-box-subtext">{t('profile.verification.uploadLimits')}</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={(e) => handleVerifyFileChange(e, 'front')} 
                          />
                        </label>
                      )}
                    </div>

                    {/* Back side card */}
                    <div className="upload-box-wrapper">
                      <span className="upload-box-label">{t('profile.verification.backPhotoLabel')}</span>
                      {cccdBackPreview ? (
                        <div className="preview-container">
                          <img src={cccdBackPreview} alt="Mặt sau CCCD" className="preview-image" />
                          <button type="button" className="btn-remove-preview" onClick={() => handleRemoveVerifyFile('back')}>
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="upload-card-box">
                          <Upload size={24} className="upload-box-icon" />
                          <span className="upload-box-text">{t('profile.verification.backPhotoUpload')}</span>
                          <span className="upload-box-subtext">{t('profile.verification.uploadLimits')}</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={(e) => handleVerifyFileChange(e, 'back')} 
                          />
                        </label>
                      )}
                    </div>

                    {/* Face Selfie photo */}
                    <div className="upload-box-wrapper">
                      <span className="upload-box-label">{t('profile.verification.facePhotoLabel')}</span>
                      {facePhotoPreview ? (
                        <div className="preview-container">
                          <img src={facePhotoPreview} alt="Ảnh chân dung" className="preview-image" />
                          <button type="button" className="btn-remove-preview" onClick={() => handleRemoveVerifyFile('face')}>
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="upload-card-box">
                          <Upload size={24} className="upload-box-icon" />
                          <span className="upload-box-text">{t('profile.verification.facePhotoUpload')}</span>
                          <span className="upload-box-subtext">{t('profile.verification.facePhotoSub')}</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={(e) => handleVerifyFileChange(e, 'face')} 
                          />
                        </label>
                      )}
                    </div>

                  </div>

                  <button 
                    type="submit" 
                    className="btn-submit-verify" 
                    style={{ marginTop: '1rem', width: '100%' }}
                    disabled={verifyLoading}
                  >
                    {verifyLoading ? (
                      <>
                        <Loader size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                        <span>{t('profile.verification.submittingButton')}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        <span>{t('profile.verification.submitButton')}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
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
                <h2 className="section-card-title">{t('profile.trustAndVerification', 'Trust & Verification')}</h2>
              </div>
            </div>

            <div className="section-card-body">
              {/* Verified Host Alert Box */}
              <div className="verified-host-banner">
                <div className="banner-icon-circle">
                  <ShieldCheck size={18} />
                </div>
                <div className="banner-content">
                  <h4 className="banner-title">{t('profile.accountStatus', 'Account Status')}</h4>
                  <p className="banner-desc">
                    {(displayProfile.isActive !== undefined ? displayProfile.isActive : displayProfile.is_active) ? t('profile.accountVerified', 'Your account is active and verified.') : t('profile.accountPending', 'Your account is pending verification.')}
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

          {/* Bank Details Config */}
          <div className="profile-section-card" style={{ marginTop: '1.5rem' }}>
            <div className="section-card-header">
              <div className="card-header-left">
                <Landmark size={20} className="header-icon-blue" />
                <h2 className="section-card-title">Tài khoản Ngân hàng (Nhận tiền)</h2>
              </div>
              <button className="btn-icon-action" onClick={handleEditBankClick}>
                <Pencil size={16} />
              </button>
            </div>

            <div className="section-card-body pt-1">
              {bankDetails ? (
                <div className="contact-info-list">
                  <div className="contact-info-item">
                    <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      🏦
                    </div>
                    <div>
                      <span className="contact-label">Ngân hàng</span>
                      <span className="contact-val" style={{ fontWeight: 'bold' }}>{bankDetails.bank_name}</span>
                    </div>
                  </div>
                  <div className="contact-info-item">
                    <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      💳
                    </div>
                    <div>
                      <span className="contact-label">Số tài khoản</span>
                      <span className="contact-val" style={{ fontWeight: 'bold' }}>{bankDetails.account_number}</span>
                    </div>
                  </div>
                  <div className="contact-info-item">
                    <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      👤
                    </div>
                    <div>
                      <span className="contact-label">Chủ tài khoản</span>
                      <span className="contact-val" style={{ fontWeight: 'bold' }}>{bankDetails.account_holder_name}</span>
                    </div>
                  </div>
                  {bankDetails.branch && (
                    <div className="contact-info-item">
                      <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        📍
                      </div>
                      <div>
                        <span className="contact-label">Chi nhánh</span>
                        <span className="contact-val">{bankDetails.branch}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '1rem' }}>Chưa cấu hình ngân hàng thụ hưởng.</p>
                  <button 
                    onClick={handleEditBankClick}
                    style={{
                      padding: '8px 16px',
                      background: '#4f46e5',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Thiết lập tài khoản ngân hàng
                  </button>
                </div>
              )}
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
                  lang="vi-VN"
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

      {/* Edit Bank Details Modal */}
      {showBankModal && (
        <div className="edit-profile-overlay" onClick={() => !bankLoading && setShowBankModal(false)}>
          <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="edit-modal-header">
              <h2>Cấu hình tài khoản thụ hưởng</h2>
              <button className="edit-modal-close" onClick={() => setShowBankModal(false)} disabled={bankLoading}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBankSubmit} className="edit-modal-form">
              <div className="edit-form-group">
                <label>Tên Ngân hàng</label>
                <select
                  value={bankForm.bank_name}
                  onChange={(e) => setBankForm(prev => ({ ...prev, bank_name: e.target.value }))}
                  required
                  disabled={bankLoading}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', fontSize: '14px' }}
                >
                  <option value="">-- Chọn ngân hàng thụ hưởng --</option>
                  {VIETNAMESE_BANKS.map(bank => (
                    <option key={bank.code} value={bank.code}>{bank.name}</option>
                  ))}
                </select>
              </div>

              <div className="edit-form-group">
                <label>Số tài khoản</label>
                <input
                  type="text"
                  value={bankForm.account_number}
                  onChange={(e) => setBankForm(prev => ({ ...prev, account_number: e.target.value.replace(/\D/g, '') }))}
                  placeholder="Nhập số tài khoản ngân hàng"
                  required
                  disabled={bankLoading}
                />
              </div>

              <div className="edit-form-group">
                <label>Tên chủ tài khoản (Viết hoa không dấu)</label>
                <input
                  type="text"
                  value={bankForm.account_holder_name}
                  onChange={(e) => setBankForm(prev => ({ ...prev, account_holder_name: e.target.value.toUpperCase() }))}
                  placeholder="Ví dụ: NGUYEN VAN A"
                  required
                  disabled={bankLoading}
                />
              </div>

              <div className="edit-form-group">
                <label>Chi nhánh (Không bắt buộc)</label>
                <input
                  type="text"
                  value={bankForm.branch}
                  onChange={(e) => setBankForm(prev => ({ ...prev, branch: e.target.value }))}
                  placeholder="Ví dụ: Chi nhánh Hà Nội"
                  disabled={bankLoading}
                />
              </div>

              {bankError && (
                <div className="edit-msg edit-msg-error">
                  <AlertCircle size={16} />
                  <span>{bankError}</span>
                </div>
              )}

              <div className="edit-modal-actions">
                <button type="button" className="edit-btn-cancel" onClick={() => setShowBankModal(false)} disabled={bankLoading}>
                  Hủy
                </button>
                <button type="submit" className="edit-btn-save" disabled={bankLoading}>
                  {bankLoading ? 'Đang lưu...' : 'Lưu lại'}
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
