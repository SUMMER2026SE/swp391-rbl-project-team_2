import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Loader, 
  AlertCircle, 
  Home, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Info,
  ChevronRight,
  FileText,
  CreditCard,
  MessageSquare,
  Shield,
  FileSignature,
  DollarSign,
  AlertTriangle,
  Timer,
  X,
  Bed,
  Users,
  User,
  Layout,
  Eye,
  Ban
} from 'lucide-react';
import { rentalRequestService } from '../services/rentalRequestService';
import Button from '../../../components/common/Button';
import { ROUTES } from '../../../constants';
import './TenantRequestsPage.css';

const TenantRequestsPage = () => {
  const [activeTab, setActiveTab] = useState('viewing'); // 'viewing' or 'contracts'
  const [viewingSchedules, setViewingSchedules] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [selectedDisputeSchedule, setSelectedDisputeSchedule] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedContractSchedule, setSelectedContractSchedule] = useState(null);
  const [contractMessage, setContractMessage] = useState('');
  const [contractStartDate, setContractStartDate] = useState('');
  const [contractDuration, setContractDuration] = useState('6'); // Default 6 months
  const [submittingContract, setSubmittingContract] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'primary'
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'viewing') {
      fetchViewingSchedules();
    } else {
      fetchContracts();
    }
  }, [activeTab]);

  const fetchViewingSchedules = async () => {
    try {
      setLoading(true);
      const data = await rentalRequestService.getMyViewingSchedules();
      const items = Array.isArray(data) ? data : (data.data || []);
      setViewingSchedules(items);
    } catch (err) {
      console.error(err);
      setViewingSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await rentalRequestService.getMyContracts();
      const items = Array.isArray(data) ? data : (data.data || []);
      setContracts(items);
    } catch (err) {
      console.error(err);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      await rentalRequestService.cancelRequest(requestId, 'Canceled by tenant');
      toast.success('Request canceled successfully');
      fetchRequests();
    } catch (err) {
      toast.error('Failed to cancel request: ' + (err.response?.data?.message || ''));
    }
  };

  const handlePayDeposit = async (scheduleId) => {
    try {
      const response = await rentalRequestService.retryPayment(scheduleId);
      if (response.success && response.url) {
        toast.success('Redirecting to VNPay...');
        window.location.href = response.url;
      } else {
        toast.error(response.message || 'Failed to create payment');
      }
    } catch (err) {
      toast.error('Failed to initiate payment: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenDispute = (schedule) => {
    setSelectedDisputeSchedule(schedule);
    setDisputeReason('');
    setIsDisputeModalOpen(true);
  };

  const handleCloseDispute = () => {
    setIsDisputeModalOpen(false);
    setSelectedDisputeSchedule(null);
    setDisputeReason('');
  };

  const handleSubmitDispute = async () => {
    if (!disputeReason.trim()) {
      toast.error('Please enter a reason for the dispute.');
      return;
    }

    try {
      setSubmittingDispute(true);
      await rentalRequestService.disputeViewingSchedule(selectedDisputeSchedule.scheduleId, disputeReason);
      toast.success('Dispute submitted successfully. Admin will review your case.');
      handleCloseDispute();
      fetchViewingSchedules();
    } catch (err) {
      toast.error('Failed to submit dispute: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingDispute(false);
    }
  };

  const handleOpenContractRequest = (schedule) => {
    setSelectedContractSchedule(schedule);
    setContractMessage('');
    setContractStartDate('');
    setContractDuration('6');
    setIsContractModalOpen(true);
  };

  const handleCloseContractRequest = () => {
    setIsContractModalOpen(false);
    setSelectedContractSchedule(null);
    setContractMessage('');
    setContractStartDate('');
    setContractDuration('6');
  };

  const handleSubmitContractRequest = async () => {
    if (!contractStartDate) {
      toast.error('Please select a move-in date.');
      return;
    }

    const selectedDate = new Date(contractStartDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate comparison
    if (selectedDate < today) {
      toast.error('Move-in date cannot be in the past.');
      return;
    }

    try {
      setSubmittingContract(true);
      await rentalRequestService.requestContract(selectedContractSchedule.scheduleId, contractMessage, contractStartDate, contractDuration);
      toast.success('Contract request sent to landlord!');
      handleCloseContractRequest();
      fetchViewingSchedules();
    } catch (err) {
      toast.error('Failed to request contract: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingContract(false);
    }
  };

  const handleSignContract = (contractId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Sign Contract',
      message: 'Are you sure you want to sign this contract? This action is final.',
      confirmText: 'Sign Contract',
      cancelText: 'Cancel',
      type: 'primary',
      onConfirm: async () => {
        try {
          await rentalRequestService.signContract(contractId);
          toast.success('Contract signed successfully! Your rental is now active.');
          fetchContracts();
        } catch (err) {
          toast.error('Failed to sign contract: ' + (err.response?.data?.message || err.message));
        }
      }
    });
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { icon: <Clock size={16} />, color: '#b45309', bg: '#fef3c7', label: 'Pending Approval' };
      case 'pending_payment':
        return { icon: <CreditCard size={16} />, color: '#7c3aed', bg: '#ede9fe', label: 'Awaiting Payment' };
      case 'scheduled':
        return { icon: <Calendar size={16} />, color: '#2563eb', bg: '#dbeafe', label: 'Scheduled' };
      case 'confirmed':
        return { icon: <CheckCircle2 size={16} />, color: '#059669', bg: '#d1fae5', label: 'Viewing Confirmed' };
      case 'contract_requested':
        return { icon: <FileSignature size={16} />, color: '#0891b2', bg: '#cffafe', label: 'Contract Requested' };
      case 'contract_created':
        return { icon: <FileText size={16} />, color: '#7c3aed', bg: '#ede9fe', label: 'Contract Ready' };
      case 'completed':
        return { icon: <CheckCircle2 size={16} />, color: '#059669', bg: '#d1fae5', label: 'Completed' };
      case 'approved':
        return { icon: <CheckCircle2 size={16} />, color: '#059669', bg: '#d1fae5', label: 'Approved' };
      case 'rejected':
        return { icon: <XCircle size={16} />, color: '#dc2626', bg: '#fee2e2', label: 'Rejected' };
      case 'cancelled':
      case 'canceled':
        return { icon: <Ban size={16} />, color: '#64748b', bg: '#f1f5f9', label: 'Cancelled' };
      case 'no_show':
        return { icon: <AlertTriangle size={16} />, color: '#dc2626', bg: '#fee2e2', label: 'No Show - Deposit Lost' };
      case 'disputed':
        return { icon: <MessageSquare size={16} />, color: '#ea580c', bg: '#fff7ed', label: 'Under Dispute' };
      case 'dispute_resolved':
        return { icon: <Shield size={16} />, color: '#059669', bg: '#d1fae5', label: 'Dispute Resolved' };
      case 'expired':
        return { icon: <Timer size={16} />, color: '#64748b', bg: '#f1f5f9', label: 'Expired' };
      case 'pending_signature':
        return { icon: <FileSignature size={16} />, color: '#7c3aed', bg: '#ede9fe', label: 'Pending Signature' };
      case 'active':
        return { icon: <CheckCircle2 size={16} />, color: '#059669', bg: '#d1fae5', label: 'Active' };
      default:
        return { icon: <Info size={16} />, color: '#64748b', bg: '#f1f5f9', label: status?.charAt(0).toUpperCase() + status?.slice(1) };
    }
  };

  const getTimeRemaining = (deadline) => {
    if (!deadline) return null;
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;
    if (diff <= 0) return 'Expired';
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-3 text-primary">
          <Loader size={40} className="animate-spin" />
          <p className="font-medium animate-pulse">Loading your requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Oops!</h3>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => activeTab === 'viewing' ? fetchViewingSchedules() : fetchContracts()} className="mt-6 w-full">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-requests-page">
      <div className="container">
        
        {/* Header Section */}
        <div className="page-header">
          <h1>My Requests</h1>
          <p>Track room viewings, deposits, contracts and rental applications.</p>
        </div>

        {/* Tabs */}
        <div className="requests-tabs">
          <button 
            className={`tab-btn ${activeTab === 'viewing' ? 'active' : ''}`}
            onClick={() => setActiveTab('viewing')}
          >
            <Eye size={16} /> Viewing Schedules
          </button>
          <button 
            className={`tab-btn ${activeTab === 'contracts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contracts')}
          >
            <FileText size={16} /> My Contracts
          </button>
        </div>
        

        {/* =================== VIEWING SCHEDULES TAB =================== */}
        {activeTab === 'viewing' && (viewingSchedules.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <Calendar size={40} />
            </div>
            <h3>No viewing schedules</h3>
            <p>You haven't requested any room viewings yet. Browse rooms and schedule a visit!</p>
            <Button onClick={() => navigate(ROUTES.ROOMS)} className="btn-browse">
              Browse Rooms
            </Button>
          </div>
        ) : (
          <div className="requests-list">
            {viewingSchedules.map((schedule) => {
              const statusInfo = getStatusInfo(schedule.status);
              const roomImage = schedule.room?.thumbnail_url 
                ? (schedule.room.thumbnail_url && schedule.room.thumbnail_url.startsWith('http') ? schedule.room.thumbnail_url : `http://localhost:5000${schedule.room.thumbnail_url}`) 
                : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80';
              
              const requestDate = new Date(schedule.createdAt || Date.now()).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              });
              
              const viewingDate = schedule.scheduledDate 
                ? new Date(schedule.scheduledDate).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) 
                : 'TBD';

              const depositAmount = schedule.depositAmount 
                ? parseFloat(schedule.depositAmount).toLocaleString('vi-VN') 
                : null;

              const hasCompletedPayment = schedule.payments?.some(p => p.status === 'completed');
              const hasPendingPayment = schedule.payments?.some(p => p.status === 'pending');

              return (
                <div key={schedule.scheduleId} className="request-card">
                  <div className="request-image-wrapper">
                    <img src={roomImage} alt={schedule.room?.title || 'Room'} />
                    <div className="status-badge-container">
                      <div className={`status-badge ${schedule.status}`} style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </div>
                    </div>
                  </div>

                  <div className="request-content">
                    <div className="request-top-info">
                      <div className="title-row">
                        <h3>{schedule.room?.title || 'Unknown Room'}</h3>
                        <span className="request-date">Requested on {requestDate}</span>
                      </div>
                      <div className="address-row">
                        <MapPin size={14} />
                        <span>{[schedule.room?.address, schedule.room?.ward, schedule.room?.district, schedule.room?.city].filter(Boolean).join(', ') || 'Address not available'}</span>
                      </div>
                    </div>

                    <div className="key-details-box">
                      <div className="detail-item">
                        <p className="detail-label">Viewing Date</p>
                        <div className="detail-value">
                          <Calendar size={16} />
                          {viewingDate}
                        </div>
                      </div>
                      {depositAmount && (
                        <div className="detail-item">
                          <p className="detail-label">Deposit (10%)</p>
                          <div className="detail-value deposit-value">
                            <DollarSign size={16} />
                            {depositAmount} VND
                          </div>
                        </div>
                      )}
                      {schedule.status === 'pending_payment' && schedule.paymentDeadline && (
                        <div className="detail-item">
                          <p className="detail-label">Payment Deadline</p>
                          <div className="detail-value deadline-value">
                            <Timer size={16} />
                            <CountdownTimer deadline={schedule.paymentDeadline} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="request-actions-row">
                      <div className="action-buttons">
                        {/* Pay deposit button for pending_payment */}
                        {schedule.status === 'pending_payment' && (
                          <button onClick={() => handlePayDeposit(schedule.scheduleId)} className="btn-action btn-pay">
                            <CreditCard size={16} /> Pay Deposit
                          </button>
                        )}

                        {/* After viewing confirmed — tenant can request contract or dispute */}
                        {schedule.status === 'confirmed' && (
                          <>
                            <button onClick={() => handleOpenContractRequest(schedule)} className="btn-action btn-contract">
                              <FileSignature size={16} /> Request Contract
                            </button>
                            <button onClick={() => handleOpenDispute(schedule)} className="btn-action btn-dispute">
                              <MessageSquare size={16} /> Report Issue
                            </button>
                          </>
                        )}

                        {/* Contract requested — waiting for landlord */}
                        {schedule.status === 'contract_requested' && (
                          <div className="status-message-inline">
                            <Clock size={14} /> Waiting for landlord to create contract...
                          </div>
                        )}

                        {/* Disputed — waiting for admin */}
                        {schedule.status === 'disputed' && (
                          <div className="status-message-inline warning">
                            <Shield size={14} /> Dispute under admin review
                          </div>
                        )}

                        <button onClick={() => navigate(`${ROUTES.ROOMS}/${schedule.roomId}`)} className="btn-action btn-view">
                          View Listing <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* =================== CONTRACTS TAB =================== */}
        {activeTab === 'contracts' && (contracts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <FileText size={40} />
            </div>
            <h3>No contracts yet</h3>
            <p>You don't have any rental contracts yet. View rooms and complete the booking process to get started.</p>
            <Button onClick={() => navigate(ROUTES.ROOMS)} className="btn-browse">
              Browse Rooms
            </Button>
          </div>
        ) : (
          <div className="requests-list">
            {contracts.map((contract) => {
              const statusInfo = getStatusInfo(contract.status);
              
              const startDate = contract.startDate 
                ? new Date(contract.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'N/A';
              const endDate = contract.endDate 
                ? new Date(contract.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'N/A';

              return (
                <div key={contract.contractId} className="request-card contract-card">
                  <div className="request-content" style={{ flex: 1 }}>
                    <div className="request-top-info">
                      <div className="title-row">
                        <h3>
                          <FileText size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                          Contract #{contract.contractNumber}
                        </h3>
                        <div className={`status-badge ${contract.status}`} style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </div>
                      </div>
                      {contract.room && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                          <div className="address-row" style={{ color: '#4b5563', fontSize: '14px', display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: 1.5 }}>
                            <Home size={16} style={{ color: '#6b7280', marginTop: '2px', flexShrink: 0 }} />
                            <span><strong>{contract.room.title}</strong></span>
                          </div>
                          <div className="address-row" style={{ color: '#6b7280', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: 1.5 }}>
                            <MapPin size={16} style={{ color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
                            <span>
                              {contract.room.address}, {contract.room.ward}, {contract.room.district}, {contract.room.city}
                              {contract.room.area_sqm ? ` • ${contract.room.area_sqm}m²` : ''}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="key-details-box">
                      <div className="detail-item">
                        <p className="detail-label">Start Date</p>
                        <div className="detail-value">
                          <Calendar size={16} />
                          {startDate}
                        </div>
                      </div>
                      <div className="detail-item">
                        <p className="detail-label">End Date</p>
                        <div className="detail-value">
                          <Calendar size={16} />
                          {endDate}
                        </div>
                      </div>
                      <div className="detail-item">
                        <p className="detail-label">Monthly Rent</p>
                        <div className="detail-value deposit-value">
                          <DollarSign size={16} />
                          {parseFloat(contract.monthlyRent).toLocaleString('vi-VN')} VND
                        </div>
                      </div>
                      {contract.room && (
                        <>
                          <div className="detail-item">
                            <p className="detail-label">Room Type</p>
                            <div className="detail-value" style={{ textTransform: 'capitalize' }}>
                              <Layout size={16} />
                              {contract.room.room_type.replace('_', ' ')}
                            </div>
                          </div>
                          <div className="detail-item">
                            <p className="detail-label">Bedrooms</p>
                            <div className="detail-value">
                              <Bed size={16} />
                              {contract.room.bedrooms}
                            </div>
                          </div>
                          <div className="detail-item">
                            <p className="detail-label">Max Occupants</p>
                            <div className="detail-value">
                              <Users size={16} />
                              {contract.room.max_occupants}
                            </div>
                          </div>
                        </>
                      )}
                      {contract.landlord && (
                        <div className="detail-item">
                          <p className="detail-label">Landlord</p>
                          <div className="detail-value">
                            <User size={16} />
                            {contract.landlord.full_name}
                          </div>
                        </div>
                      )}
                    </div>

                    {contract.termsAndConditions && (
                      <div className="contract-terms-preview">
                        <strong>Terms:</strong> {contract.termsAndConditions.substring(0, 200)}
                        {contract.termsAndConditions.length > 200 && '...'}
                      </div>
                    )}

                    <div className="request-actions-row">
                      <div className="action-buttons">
                        {contract.status === 'pending_signature' && (
                          <button onClick={() => handleSignContract(contract.contractId)} className="btn-action btn-sign">
                            <FileSignature size={16} /> Sign Contract
                          </button>
                        )}
                        {contract.status === 'active' && (
                          <div className="status-message-inline success">
                            <CheckCircle2 size={14} /> Contract is active
                          </div>
                        )}
                        {contract.room && (
                          <button onClick={() => navigate(`${ROUTES.ROOMS}/${contract.roomId}`)} className="btn-action btn-view">
                            View Room <ChevronRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* =================== DISPUTE MODAL =================== */}
      {isDisputeModalOpen && selectedDisputeSchedule && (
        <div className="modal-overlay" onClick={handleCloseDispute}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%', background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={20} style={{ color: '#DC2626' }} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Report an Issue</h2>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.6 }}>
              If the room does not match the description or photos, explain the problem below. Admin will review your report to decide on a deposit refund.
            </p>
            <textarea
              style={{ width: '100%', padding: '14px', border: '2px solid #E5E7EB', borderRadius: '10px', minHeight: '130px', marginBottom: '16px', fontSize: '0.95rem', transition: 'border-color 0.2s', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              placeholder="E.g. The room size is much smaller than described, and the air conditioner is broken..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              disabled={submittingDispute}
              onFocus={(e) => e.target.style.borderColor = '#7C3AED'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={handleCloseDispute}
                disabled={submittingDispute}
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#fff', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitDispute}
                disabled={submittingDispute}
                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#DC2626', color: '#fff', cursor: submittingDispute ? 'not-allowed' : 'pointer', opacity: submittingDispute ? 0.7 : 1, fontWeight: 600, fontSize: '0.9rem' }}
              >
                {submittingDispute ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== CONTRACT REQUEST MODAL =================== */}
      {isContractModalOpen && selectedContractSchedule && (
        <div className="modal-overlay" onClick={handleCloseContractRequest}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%', background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileSignature size={20} style={{ color: '#059669' }} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Request Rental Contract</h2>
            </div>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#166534', lineHeight: 1.6 }}>
                <strong>Room:</strong> {selectedContractSchedule.room?.title}<br />
                <strong>Deposit paid:</strong> {parseFloat(selectedContractSchedule.depositAmount).toLocaleString('vi-VN')} VND<br />
                <span style={{ fontSize: '0.8rem' }}>Upon successful rental, the platform will retain 5% commission on the deposit. 95% goes to the landlord.</span>
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Move-in Date *</label>
                <input 
                  type="date" 
                  value={contractStartDate}
                  onChange={(e) => setContractStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#059669'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Duration (Months) *</label>
                <select 
                  value={contractDuration}
                  onChange={(e) => setContractDuration(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#fff' }}
                  onFocus={(e) => e.target.style.borderColor = '#059669'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                    <option key={m} value={m}>{m} Month{m > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <textarea
              style={{ width: '100%', padding: '14px', border: '2px solid #E5E7EB', borderRadius: '10px', minHeight: '100px', marginBottom: '16px', fontSize: '0.95rem', transition: 'border-color 0.2s', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              placeholder="Optional message to the landlord..."
              value={contractMessage}
              onChange={(e) => setContractMessage(e.target.value)}
              disabled={submittingContract}
              onFocus={(e) => e.target.style.borderColor = '#059669'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={handleCloseContractRequest}
                disabled={submittingContract}
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#fff', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitContractRequest}
                disabled={submittingContract}
                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', cursor: submittingContract ? 'not-allowed' : 'pointer', opacity: submittingContract ? 0.7 : 1, fontWeight: 600, fontSize: '0.9rem' }}
              >
                {submittingContract ? 'Sending...' : 'Send Contract Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== CONFIRM DIALOG MODAL =================== */}
      {confirmDialog.isOpen && (
        <div className="modal-overlay" onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}>
          <div className="modal-container" style={{ maxWidth: '400px', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h2 className="modal-title" style={{ fontSize: '18px' }}>{confirmDialog.title}</h2>
              <button 
                className="modal-close" 
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: '24px' }}>
              <p style={{ margin: 0, fontSize: '15px', color: '#4b5563', lineHeight: 1.5 }}>
                {confirmDialog.message}
              </p>
            </div>
            
            <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontWeight: 500 }}
              >
                {confirmDialog.cancelText}
              </button>
              <button
                className={`btn ${confirmDialog.type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => {
                  setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                  if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                }}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '6px', 
                  border: 'none', 
                  background: confirmDialog.type === 'danger' ? '#ef4444' : '#10b981', 
                  color: '#fff', 
                  cursor: 'pointer', 
                  fontWeight: 600,
                  marginLeft: '12px'
                }}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Countdown Timer Component
const CountdownTimer = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(deadline);
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}m ${secs}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return <span className={timeLeft === 'Expired' ? 'expired-text' : 'countdown-text'}>{timeLeft}</span>;
};

export default TenantRequestsPage;
