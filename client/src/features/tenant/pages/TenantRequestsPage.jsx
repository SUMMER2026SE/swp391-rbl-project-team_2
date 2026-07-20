import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
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
import ContractDocument from '../../../components/ContractDocument';
import TerminationRequestModal from '../../../components/termination/TerminationRequestModal';
import TerminationHistoryPage from '../../../components/termination/TerminationHistoryPage';
import { useTranslation } from 'react-i18next';
import './TenantRequestsPage.css';

const TenantRequestsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search || '');
    return params.get('tab') || location.state?.activeTab || 'viewing';
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    const tabFromUrl = params.get('tab') || location.state?.activeTab;
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search, location.state]);
  const [viewingSchedules, setViewingSchedules] = useState([]);
  const [rentalRequests, setRentalRequests] = useState([]);
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
  const [tenantName, setTenantName] = useState('');
  const [tenantIc, setTenantIc] = useState('');
  const [tenantIcIssueDate, setTenantIcIssueDate] = useState('');
  const [tenantIcIssuePlace, setTenantIcIssuePlace] = useState('');
  const [tenantPermanentAddress, setTenantPermanentAddress] = useState('');
  const [modalMode, setModalMode] = useState('request_contract'); // 'request_contract' or 'create_request'
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [phone, setPhone] = useState('');
  const [rentalPurpose, setRentalPurpose] = useState('');

  const [selectedContractToSign, setSelectedContractToSign] = useState(null);
  const [showContractModal, setShowContractModal] = useState(false);
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
  
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewContractTarget, setRenewContractTarget] = useState(null);
  const [renewDuration, setRenewDuration] = useState('6');

  const [showTerminationModal, setShowTerminationModal] = useState(false);
  const [selectedContractForTermination, setSelectedContractForTermination] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        await Promise.allSettled([
          fetchViewingSchedules(),
          fetchRentalRequests(),
          fetchContracts(),
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const fetchViewingSchedules = async () => {
    try {
      const res = await rentalRequestService.getMyViewingSchedules();
      const items = Array.isArray(res) ? res : (res?.data || []);
      setViewingSchedules(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error(err);
      setViewingSchedules([]);
    }
  };

  const fetchRentalRequests = async () => {
    try {
      const response = await rentalRequestService.getMyRequests();
      const items = Array.isArray(response) ? response : (response?.data?.data || response?.data || []);
      setRentalRequests(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error(err);
      setRentalRequests([]);
    }
  };

  const fetchContracts = async () => {
    try {
      const res = await rentalRequestService.getMyContracts();
      const items = Array.isArray(res) ? res : (res?.data || []);
      setContracts(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error(err);
      setContracts([]);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      await rentalRequestService.cancelRequest(requestId, 'Canceled by tenant');
      toast.success('Request canceled successfully');
      fetchRentalRequests();
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

  const handleCancelViewing = (scheduleId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Viewing Schedule',
      message: 'Are you sure you want to cancel this viewing schedule? This action cannot be undone.',
      confirmText: 'Yes, Cancel it',
      cancelText: 'Keep it',
      type: 'danger',
      onConfirm: async () => {
        try {
          await rentalRequestService.cancelViewingSchedule(scheduleId);
          toast.success('Viewing schedule cancelled successfully.');
          fetchViewingSchedules();
        } catch (err) {
          toast.error('Failed to cancel viewing: ' + (err.response?.data?.message || err.message));
        }
      }
    });
  };

  const handleDeclineToRent = (scheduleId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Decline to Rent',
      message: 'Are you sure you want to decline renting this room?',
      confirmText: 'Yes, Decline',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await rentalRequestService.declineViewingSchedule(scheduleId);
          toast.success('You have declined to rent. Feedback sent to landlord.');
          fetchViewingSchedules();
        } catch (err) {
          toast.error('Failed to decline: ' + (err.response?.data?.message || err.message));
        }
      }
    });
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

  const handleOpenContractRequest = (item, mode = 'request_contract') => {
    setModalMode(mode);
    setSelectedContractSchedule(item);
    if (mode === 'create_request') {
      setSelectedRoomId(item.roomId || item.room_id);
      setContractStartDate('');
      setContractDuration('6');
      setPhone(user?.phone || '');
      setRentalPurpose('');
    } else {
      setSelectedRoomId(null);
      // Autofill start date and duration from request
      const reqDate = item.requestedMoveInDate || item.requested_move_in_date;
      setContractStartDate(reqDate ? reqDate.split('T')[0] : '');
      setContractDuration(item.leaseDurationMonths || item.lease_duration_months || '6');
      setPhone(item.tenantPhone || item.tenant_phone || '');
      setRentalPurpose(item.rentalPurpose || item.rental_purpose || '');
    }
    setContractMessage('');
    
    // Format date to YYYY-MM-DD if it exists
    let defaultDate = '';
    if (item.requested_move_in_date) {
      defaultDate = new Date(item.requested_move_in_date).toISOString().split('T')[0];
    } else if (item.requestedMoveInDate) {
      defaultDate = new Date(item.requestedMoveInDate).toISOString().split('T')[0];
    }
    
    setContractStartDate(defaultDate);
    setContractDuration(item.lease_duration_months?.toString() || item.leaseDurationMonths?.toString() || '6');
    setTenantName(user?.full_name || '');
    setTenantIc('');
    setTenantIcIssueDate('');
    setTenantIcIssuePlace('Cục Cảnh sát Quản lý hành chính về trật tự xã hội');
    setTenantPermanentAddress('');
    setIsContractModalOpen(true);
  };

  const handleCloseContractRequest = () => {
    setIsContractModalOpen(false);
    setSelectedContractSchedule(null);
    setSelectedRoomId(null);
    setModalMode('request_contract');
    setContractMessage('');
    setContractStartDate('');
    setContractDuration('6');
    setTenantName('');
    setTenantIc('');
    setTenantIcIssueDate('');
    setTenantIcIssuePlace('');
    setTenantPermanentAddress('');
    setPhone('');
    setRentalPurpose('');
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

    if (modalMode !== 'create_request') {
      if (!tenantName || !tenantIc || !tenantIcIssueDate || !tenantIcIssuePlace || !tenantPermanentAddress) {
        toast.error('Please fill in all identity details for the contract.');
        return;
      }
      if (tenantIc.length !== 12) {
        toast.error('CCCD must be exactly 12 digits.');
        return;
      }
    }

    try {
      setSubmittingDispute(true);
      if (modalMode === 'create_request') {
        if (!phone) {
          toast.error('Vui lòng nhập số điện thoại.');
          return;
        }
        if (!contractStartDate) {
          toast.error('Vui lòng chọn ngày nhận phòng.');
          return;
        }
        if (!rentalPurpose) {
          toast.error('Vui lòng nhập mục đích thuê phòng.');
          return;
        }
        const selectedDate = new Date(contractStartDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          toast.error('Ngày nhận phòng không thể ở quá khứ.');
          return;
        }

        const roomId = parseInt(selectedRoomId || selectedContractSchedule.roomId || selectedContractSchedule.room_id, 10);
        await rentalRequestService.createRequest({
          roomId,
          message: contractMessage || null,
          requestedMoveInDate: contractStartDate,
          leaseDurationMonths: parseInt(contractDuration, 10),
          phone: phone,
          rentalPurpose: rentalPurpose
        });
        toast.success(t('tenantRequests.sendRentalRequestSuccess', 'Gửi yêu cầu thuê phòng thành công!'));
        handleCloseContractRequest();
        fetchViewingSchedules();
        fetchRentalRequests();
      } else if (selectedContractSchedule.scheduleId || selectedContractSchedule.schedule_id) {
        await rentalRequestService.requestContract(
          selectedContractSchedule.scheduleId || selectedContractSchedule.schedule_id, 
          contractMessage, contractStartDate, contractDuration, 
          tenantName, tenantIc, tenantIcIssueDate, tenantIcIssuePlace, tenantPermanentAddress
        );
        toast.success('Contract requested successfully. Landlord will draft it shortly.');
        handleCloseContractRequest();
        fetchViewingSchedules();
      } else if (selectedContractSchedule.requestId || selectedContractSchedule.request_id) {
        await rentalRequestService.requestContractForRentalRequest(
          selectedContractSchedule.requestId || selectedContractSchedule.request_id, 
          contractMessage, contractStartDate, contractDuration, 
          tenantName, tenantIc, tenantIcIssueDate, tenantIcIssuePlace, tenantPermanentAddress
        );
        toast.success('Contract requested successfully. Landlord will draft it shortly.');
        handleCloseContractRequest();
        fetchRentalRequests();
      }
    } catch (err) {
      toast.error('Failed to process request: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingDispute(false);
    }
  };

  const handleSignContract = (contract) => {
    setSelectedContractToSign(contract);
    setShowContractModal(true);
  };

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingSignatureData, setPendingSignatureData] = useState('');
  const [pendingContractId, setPendingContractId] = useState(null);
  const [pendingRoomId, setPendingRoomId] = useState(null);

  const triggerOtpFlow = async (contractId, roomId, signatureDataUrl) => {
    try {
      setSubmittingContract(true);
      await rentalRequestService.sendContractOtp(contractId);
      setPendingSignatureData(signatureDataUrl);
      setPendingContractId(contractId);
      setPendingRoomId(roomId);
      setOtpCode('');
      setShowOtpModal(true);
      setShowContractModal(false);
      toast.success('OTP sent to your email.');
    } catch (err) {
      toast.error('Failed to send OTP: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingContract(false);
    }
  };

  const proceedToSignContractInline = async (contract, signatureDataUrl) => {
    const { contractId, roomId } = contract;
    await triggerOtpFlow(contractId, roomId, signatureDataUrl);
  };

  const proceedToSignContract = async (signatureDataUrl) => {
    if (!selectedContractToSign) return;
    const { contractId, roomId } = selectedContractToSign;
    await triggerOtpFlow(contractId, roomId, signatureDataUrl);
  };

  const handleVerifyOtpAndSign = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP.');
      return;
    }
    try {
      setSubmittingContract(true);
      // Generate PDF
      const element = document.querySelector('.contract-document-wrapper') || document.querySelector('.contract-modal-container');
      let pdfBase64 = '';
      if (element) {
        // dynamically import html2pdf
        const html2pdf = (await import('html2pdf.js')).default;
        pdfBase64 = await html2pdf().from(element).outputPdf('datauristring');
      }

      const response = await rentalRequestService.signContract(pendingContractId, { 
        tenantSignature: pendingSignatureData, 
        otp: otpCode,
        contractPdf: pdfBase64
      });
      setShowOtpModal(false);
      setSelectedContractToSign(null);

      if (response?.data?.data?.isRenewal || response?.data?.isRenewal) {
        toast.success('Hợp đồng gia hạn đã được ký và kích hoạt thành công!');
        fetchContracts();
      } else {
        toast.success('Contract signed successfully! Redirecting to payment...');
        navigate(`${ROUTES.TENANT.PAYMENT}?roomId=${pendingRoomId}&contractId=${pendingContractId}`);
      }
    } catch (err) {
      toast.error('Failed to sign contract: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingContract(false);
    }
  };

  const handleCancelContract = (contractId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Contract',
      message: 'Are you sure you want to delete/cancel this contract? This action cannot be undone.',
      confirmText: 'Yes, Cancel it',
      cancelText: 'Keep it',
      type: 'danger',
      onConfirm: async () => {
        try {
          await rentalRequestService.cancelContract(contractId);
          toast.success('Contract cancelled successfully.');
          fetchContracts();
        } catch (err) {
          toast.error('Failed to cancel contract: ' + (err.response?.data?.message || err.message));
        }
      }
    });
  };

  const handleRenewContract = (contract) => {
    setRenewContractTarget(contract);
    setRenewDuration('6');
    setShowRenewModal(true);
  };

  const handleDeclineRenewal = (contract) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận không gia hạn',
      message: 'Bạn có chắc chắn xác nhận KHÔNG gia hạn hợp đồng này và sẽ dọn đi khi hết hạn? Sau khi xác nhận, phòng của bạn sẽ được hiển thị ngày trống để người khác có thể đặt trước.',
      confirmText: 'Xác nhận không gia hạn',
      cancelText: 'Hủy',
      type: 'danger',
      onConfirm: async () => {
        try {
          await rentalRequestService.declineContractRenewal(contract.contractId || contract.contract_id);
          toast.success('Xác nhận từ chối gia hạn thành công.');
          fetchContracts();
        } catch (err) {
          toast.error('Thao tác thất bại: ' + (err.response?.data?.message || err.message));
        }
      }
    });
  };

  const handleRenewContractConfirm = () => {
    const durationNum = parseInt(renewDuration, 10);
    if (isNaN(durationNum) || durationNum <= 0) {
      toast.error('Số tháng gia hạn không hợp lệ.');
      return;
    }
    
    setShowRenewModal(false);
    
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận gia hạn hợp đồng',
      message: `Bạn có chắc chắn muốn gia hạn hợp đồng này thêm ${durationNum} tháng? Chủ nhà sẽ nhận được yêu cầu và soạn hợp đồng mới.`,
      confirmText: 'Xác nhận',
      cancelText: 'Hủy',
      type: 'primary',
      onConfirm: async () => {
        try {
          await rentalRequestService.renewContract(renewContractTarget.contractId || renewContractTarget.contract_id, durationNum);
          toast.success('Đã gửi yêu cầu gia hạn thành công.');
          fetchContracts();
        } catch (err) {
          toast.error('Gửi yêu cầu gia hạn thất bại: ' + (err.response?.data?.message || err.message));
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
        return { icon: <AlertTriangle size={16} />, color: '#dc2626', bg: '#fee2e2', label: 'No Show' };
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
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '40px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '4px solid #2563eb', borderTopColor: 'transparent', animation: 'tmSpin 0.8s linear infinite' }} />
        <p style={{ fontSize: '15px', color: '#64748b', fontWeight: 500 }}>{t('tenantRequests.loading', 'Đang tải dữ liệu của bạn...')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ background: '#ffffff', padding: '32px', borderRadius: '16px', border: '1px solid #fecdd3', maxWidth: '400px', textAlign: 'center' }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Có lỗi xảy ra</h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>{error}</p>
          <Button onClick={() => { fetchViewingSchedules(); fetchRentalRequests(); fetchContracts(); }} className="mt-6 w-full">Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-requests-page">
      <div className="container">
        
        {/* Header Section */}
        <div className="page-header">
          <h1>{t('tenantRequests.title', 'My Requests')}</h1>
          <p>{t('tenantRequests.subtitle', 'Track room viewings, deposits, contracts and rental applications.')}</p>
        </div>

        {/* Tabs */}
        <div className="requests-tabs">
          <button 
            className={`tab-btn ${activeTab === 'viewing' ? 'active' : ''}`}
            onClick={() => setActiveTab('viewing')}
            style={{ position: 'relative' }}
          >
            <Eye size={16} /> {t('tenantRequests.tabViewing', 'Lịch xem phòng')}
            {Array.isArray(viewingSchedules) && viewingSchedules.some(s => s?.status === 'pending_payment' || s?.status === 'confirmed') && (
              <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></span>
            )}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
            style={{ position: 'relative' }}
          >
            <Home size={16} /> {t('tenantRequests.tabRequests', 'Yêu cầu thuê')}
            {Array.isArray(rentalRequests) && rentalRequests.some(r => r?.status === 'approved') && (
              <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></span>
            )}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'contracts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contracts')}
            style={{ position: 'relative' }}
          >
            <FileText size={16} /> {t('tenantRequests.tabContracts', 'Hợp đồng')}
            {Array.isArray(contracts) && contracts.some(c => c?.status === 'pending_tenant_signature') && (
              <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></span>
            )}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'terminations' ? 'active' : ''}`}
            onClick={() => setActiveTab('terminations')}
            style={{ position: 'relative' }}
          >
            Chấm dứt & Quyết toán
          </button>
        </div>
        
        {/* =================== TERMINATION TAB =================== */}
        {activeTab === 'terminations' && (
          <TerminationHistoryPage currentUserId={user?.user_id || user?.userId} userRole="Tenant" />
        )}
        

        {/* =================== VIEWING SCHEDULES TAB =================== */}
        {activeTab === 'viewing' && (viewingSchedules.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <Calendar size={40} />
            </div>
            <h3>{t('tenantRequests.noViewing', 'No viewing schedules')}</h3>
            <p>{t('tenantRequests.noViewingDesc', "You haven't requested any room viewings yet. Browse rooms and schedule a visit!")}</p>
            <Button onClick={() => navigate(ROUTES.ROOMS)} className="btn-browse">
              {t('tenantRequests.browseRooms', 'Browse Rooms')}
            </Button>
          </div>
        ) : (
          <div className="requests-list">
            {viewingSchedules.map((schedule) => {
              const statusInfo = getStatusInfo(schedule.status);
              const existingRequest = rentalRequests.find(r => 
                (r.roomId === schedule.roomId || r.room_id === schedule.roomId) && 
                !['cancelled', 'canceled', 'rejected'].includes(r.status)
              );
              const primaryImage = schedule.room?.images?.find(img => img.is_primary)?.image_url || schedule.room?.images?.[0]?.image_url;
              const roomImage = primaryImage
                ? (primaryImage.startsWith('http') ? primaryImage : `http://localhost:5000${primaryImage}`) 
                : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80';
              
              const requestDate = new Date(schedule.createdAt || Date.now()).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              });
              
              const scheduleDateObj = schedule.scheduledDate ? new Date(schedule.scheduledDate) : null;
              const viewingDateOnly = scheduleDateObj 
                ? scheduleDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'TBD';
              const viewingTimeOnly = scheduleDateObj
                ? scheduleDateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                : '';

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
                        <h3 
                          onClick={() => navigate(`${ROUTES.ROOMS}/${schedule.roomId}`)}
                          style={{ cursor: 'pointer', color: '#2563eb' }}
                          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                        >
                          {schedule.room?.title || 'Unknown Room'}
                        </h3>
                        <span className="request-date">{t('tenantRequests.requestedOn', 'Requested on')} {requestDate}</span>
                      </div>
                      <div className="address-row">
                        <MapPin size={14} />
                        <span>{[schedule.room?.address, schedule.room?.ward, schedule.room?.district, schedule.room?.city].filter(Boolean).join(', ') || t('tenantRequests.addressNotAvailable', 'Address not available')}</span>
                      </div>
                    </div>

                    <div className="key-details-box">
                      <div className="detail-item">
                        <p className="detail-label">{t('tenantRequests.viewingDate', 'Viewing Date')}</p>
                        <div className="detail-value">
                          <Calendar size={16} />
                          {viewingDateOnly}
                        </div>
                      </div>

                      {viewingTimeOnly && (
                        <div className="detail-item">
                          <p className="detail-label">{t('tenantRequests.viewingTime', 'Viewing Time')}</p>
                          <div className="detail-value">
                            <Clock size={16} />
                            {viewingTimeOnly}
                          </div>
                        </div>
                      )}

                      {schedule.status === 'pending_payment' && schedule.paymentDeadline && (
                        <div className="detail-item">
                          <p className="detail-label">{t('tenantRequests.paymentDeadline', 'Payment Deadline')}</p>
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
                          <>
                            <button onClick={() => handlePayDeposit(schedule.scheduleId)} className="btn-action btn-pay">
                              <CreditCard size={16} /> {t('tenantRequests.payDeposit', 'Pay Deposit')}
                            </button>
                            <button onClick={() => handleCancelViewing(schedule.scheduleId)} className="btn-action" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecdd3' }}>
                              <X size={16} /> {t('tenantRequests.cancel', 'Cancel')}
                            </button>
                          </>
                        )}

                        {/* Cancel button for pending/scheduled */}
                        {(schedule.status === 'pending' || schedule.status === 'scheduled') && (
                          <button onClick={() => handleCancelViewing(schedule.scheduleId)} className="btn-action" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecdd3' }}>
                            <X size={16} /> {t('tenantRequests.cancelSchedule', 'Cancel Schedule')}
                          </button>
                        )}

                        {/* After viewing confirmed/completed — tenant can request contract, decline, or dispute */}
                        {(schedule.status === 'confirmed' || schedule.status === 'completed') && (
                          <>
                            {schedule.tenantDecision === 'rejected' ? (
                              <span className="status-message-inline" style={{ color: '#dc2626', background: '#fef2f2', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #fecdd3' }}>
                                <Ban size={14} /> {t('tenantRequests.declinedToRent', 'Đã từ chối thuê')}
                              </span>
                            ) : (
                              <>
                                {existingRequest ? (
                                  existingRequest.status === 'pending' ? (
                                    <span className="status-message-inline" style={{ color: '#b45309', background: '#fef3c7', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #fde68a' }}>
                                      <Clock size={14} /> {t('tenantRequests.rentalRequestPending', 'Đã gửi yêu cầu thuê (Chờ duyệt)')}
                                    </span>
                                  ) : existingRequest.status === 'approved' ? (
                                    <span className="status-message-inline" style={{ color: '#059669', background: '#d1fae5', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #a7f3d0' }}>
                                      <CheckCircle2 size={14} /> {t('tenantRequests.rentalRequestApproved', 'Yêu cầu thuê đã duyệt')}
                                    </span>
                                  ) : existingRequest.status === 'contract_requested' ? (
                                    <span className="status-message-inline" style={{ color: '#0891b2', background: '#cffafe', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #a5f3fc' }}>
                                      <Clock size={14} /> {t('tenantRequests.contractRequested', 'Đã yêu cầu hợp đồng')}
                                    </span>
                                  ) : (
                                    <span className="status-message-inline" style={{ color: '#64748b', background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #e2e8f0' }}>
                                      <Info size={14} /> {t('tenantRequests.rentalRequestStatus', 'Yêu cầu thuê:')} {existingRequest.status}
                                    </span>
                                  )
                                ) : (
                                  <button onClick={() => handleOpenContractRequest(schedule, 'create_request')} className="btn-action" style={{ background: '#10b981', color: '#ffffff', border: 'none' }}>
                                    <Home size={16} /> {t('tenantRequests.sendRentalRequest', 'Gửi yêu cầu thuê')}
                                  </button>
                                )}
                                <button onClick={() => handleDeclineToRent(schedule.scheduleId)} className="btn-action" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                                  <Ban size={16} /> {t('tenantRequests.decline', 'Decline')}
                                </button>
                                <button onClick={() => handleOpenDispute(schedule)} className="btn-action btn-dispute">
                                  <MessageSquare size={16} /> {t('tenantRequests.reportIssue', 'Report Issue')}
                                </button>
                              </>
                            )}
                          </>
                        )}

                        {/* Contract requested — waiting for landlord */}
                        {schedule.status === 'contract_requested' && (
                          <div className="status-message-inline">
                            <Clock size={14} /> {t('tenantRequests.waitingForLandlord', 'Waiting for landlord to create contract...')}
                          </div>
                        )}

                        {/* Disputed — waiting for admin */}
                        {schedule.status === 'disputed' && (
                          <div className="status-message-inline warning">
                            <Shield size={14} /> {t('tenantRequests.disputeUnderReview', 'Dispute under admin review')}
                          </div>
                        )}

                      </div>
                    </div>
                  
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* =================== RENTAL REQUESTS TAB =================== */}
        {activeTab === 'requests' && (rentalRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <Home size={40} />
            </div>
            <h3>{t('tenantRequests.noRequests', 'No rental requests')}</h3>
            <p>{t('tenantRequests.noRequestsDesc', "You haven't submitted any rental requests yet. Browse rooms and send a request!")}</p>
            <Button onClick={() => navigate(ROUTES.ROOMS)} className="btn-browse">
              {t('tenantRequests.browseRooms', 'Browse Rooms')}
            </Button>
          </div>
        ) : (
          <div className="requests-list">
            {rentalRequests.map((request) => {
              const statusInfo = getStatusInfo(request.status);
              const primaryImage = request.room?.thumbnail_url || (request.room?.images?.find(img => img.is_primary)?.image_url || request.room?.images?.[0]?.image_url);
              const roomImage = primaryImage
                ? (primaryImage.startsWith('http') ? primaryImage : `http://localhost:5000${primaryImage}`) 
                : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80';
              
              const requestDate = new Date(request.createdAt || Date.now()).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              });

              return (
                <div key={request.requestId} className="request-card">
                  <div className="request-image-wrapper">
                    <img src={roomImage} alt={request.room?.title || 'Room'} />
                    <div className="status-badge-container">
                      <div className={`status-badge ${request.status}`} style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </div>
                    </div>
                  </div>

                  <div className="request-content">
                    <div className="request-top-info">
                      <div className="title-row">
                        <h3 
                          onClick={() => navigate(`${ROUTES.ROOMS}/${request.roomId}`)}
                          style={{ cursor: 'pointer', color: '#2563eb' }}
                          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                        >
                          {request.room?.title || 'Unknown Room'}
                        </h3>
                        <span className="request-date">{t('tenantRequests.requestedOn', 'Requested on')} {requestDate}</span>
                      </div>
                      <div className="address-row">
                        <MapPin size={14} />
                        <span>{[request.room?.address, request.room?.ward, request.room?.district, request.room?.city].filter(Boolean).join(', ') || t('tenantRequests.addressNotAvailable', 'Address not available')}</span>
                      </div>
                    </div>

                    <div className="key-details-box">
                      <div className="detail-item">
                        <p className="detail-label">{t('tenantRequests.moveInDate', 'Move-in Date')}</p>
                        <div className="detail-value">
                          <Calendar size={16} />
                          {request.requestedMoveInDate ? new Date(request.requestedMoveInDate).toLocaleDateString('en-US') : 'TBD'}
                        </div>
                      </div>

                      <div className="detail-item">
                        <p className="detail-label">{t('tenantRequests.duration', 'Duration')}</p>
                        <div className="detail-value">
                          <Clock size={16} />
                          {request.leaseDurationMonths || 6} {t('tenantRequests.months', 'months')}
                        </div>
                      </div>
                    </div>

                    <div className="request-actions-row">
                      <div className="action-buttons">
                        {request.status === 'approved' && (
                          <button onClick={() => handleOpenContractRequest(request)} className="btn-action btn-contract">
                            <FileSignature size={16} /> {t('tenantRequests.requestContract', 'Request Contract')}
                          </button>
                        )}

                        {(request.status === 'pending' || request.status === 'approved') && (
                          <button onClick={() => handleCancelRequest(request.requestId)} className="btn-action" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecdd3', marginLeft: request.status === 'approved' ? '8px' : '0' }}>
                            <X size={16} /> {t('tenantRequests.cancelRequest', 'Từ chối / Hủy')}
                          </button>
                        )}
                        
                        {request.status === 'contract_requested' && (
                          <div className="status-message-inline">
                            <Clock size={14} /> {t('tenantRequests.waitingForLandlord', 'Waiting for landlord to create contract...')}
                          </div>
                        )}
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
            <h3>{t('tenantRequests.noContracts', 'No contracts yet')}</h3>
            <p>{t('tenantRequests.noContractsDesc', "You don't have any rental contracts yet. View rooms and complete the booking process to get started.")}</p>
            <Button onClick={() => navigate(ROUTES.ROOMS)} className="btn-browse">
              {t('tenantRequests.browseRooms', 'Browse Rooms')}
            </Button>
          </div>
        ) : (
          <div className="contracts__table-container" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table className="contracts__table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '14px' }}>{t('tenantRequests.landlord', 'Landlord')}</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '14px' }}>{t('tenantRequests.room', 'Room')}</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '14px' }}>{t('tenantRequests.moveInDate', 'Move-in Date')}</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '14px' }}>{t('tenantRequests.duration', 'Duration')}</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '14px' }}>{t('tenantRequests.status', 'Status')}</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '14px' }}>{t('tenantRequests.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => {
                  const statusInfo = getStatusInfo(contract.status);
                  
                  const isValidDate = (d) => d && !isNaN(new Date(d).getTime());
                  const startDate = isValidDate(contract.startDate)
                    ? new Date(contract.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'N/A';
                  
                  const duration = contract.startDate && contract.endDate 
                    ? Math.round((new Date(contract.endDate) - new Date(contract.startDate)) / (1000 * 60 * 60 * 24 * 30))
                    : 0;

                  return (
                    <tr key={contract.contractId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#334155' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#e2e8f0', flexShrink: 0 }}>
                            {contract.landlord?.avatar_url ? (
                              <img src={contract.landlord.avatar_url} alt={contract.landlord?.full_name || 'Landlord'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 600, fontSize: '16px' }}>
                                {contract.landlord?.full_name ? contract.landlord.full_name.charAt(0) : 'L'}
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: '#2563eb', marginBottom: '2px' }}>{contract.landlord?.full_name || 'N/A'}</div>
                            <div style={{ fontSize: '13px', color: '#2563eb' }}>{contract.landlord?.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#2563eb' }}>
                        {contract.room && (
                          <span 
                            onClick={() => navigate(`${ROUTES.ROOMS}/${contract.roomId}`)}
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                          >
                            {contract.room.title}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#334155' }}>
                        {startDate}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#334155' }}>
                        {duration} {t('tenantRequests.months', 'months')}
                      </td>
                      <td style={{ padding: '16px' }}>
                        {(contract.renewalStatus === 'declined' || contract.renewal_status === 'declined') ? (
                          <div className="status-badge declined" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: '600', fontSize: '12px', border: '1px solid #fecdd3' }}>
                            <Ban size={12} />
                            Không gia hạn
                          </div>
                        ) : (
                          <div className={`status-badge ${contract.status}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '9999px', backgroundColor: statusInfo.bg, color: statusInfo.color, fontWeight: '600', fontSize: '12px', border: `1px solid ${statusInfo.color}33` }}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleSignContract(contract)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              padding: '6px 12px', background: contract.status === 'pending_signature' ? '#2563eb' : '#f8fafc', 
                              border: contract.status === 'pending_signature' ? 'none' : '1px solid #cbd5e1',
                              borderRadius: '6px', color: contract.status === 'pending_signature' ? 'white' : '#475569', 
                              fontSize: '13px', cursor: 'pointer', fontWeight: 500
                            }}
                          >
                            <FileText size={14} /> {t('tenantRequests.viewContract', 'View Contract')}
                          </button>
                          {contract.status === 'active' && !contract.is_renewed && contract.renewalStatus !== 'declined' && contract.renewal_status !== 'declined' && (
                            <>
                              <button
                                onClick={() => handleRenewContract(contract)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '6px',
                                  padding: '6px 12px', background: '#059669', 
                                  border: 'none',
                                  borderRadius: '6px', color: 'white', 
                                  fontSize: '13px', cursor: 'pointer', fontWeight: 500
                                }}
                              >
                                <FileText size={14} /> Gia hạn
                              </button>
                              <button
                                onClick={() => handleDeclineRenewal(contract)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '6px',
                                  padding: '6px 12px', background: '#dc2626', 
                                  border: 'none',
                                  borderRadius: '6px', color: 'white', 
                                  fontSize: '13px', cursor: 'pointer', fontWeight: 500
                                }}
                              >
                                <X size={14} /> Không gia hạn
                              </button>
                            </>
                          )}
                          {contract.status === 'active' && (
                            <button
                              onClick={() => {
                                setSelectedContractForTermination(contract);
                                setShowTerminationModal(true);
                              }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '6px 12px', background: '#ef4444', 
                                border: 'none',
                                borderRadius: '6px', color: 'white', 
                                fontSize: '13px', cursor: 'pointer', fontWeight: 500
                              }}
                            >
                              Hủy hợp đồng
                            </button>
                          )}
                          {contract.status === 'pending_payment' && (
                            <button
                              onClick={() => navigate(`${ROUTES.TENANT.PAYMENT}?roomId=${contract.roomId}&contractId=${contract.contractId}`)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '6px 12px', background: '#7c3aed', 
                                border: 'none',
                                borderRadius: '6px', color: 'white', 
                                fontSize: '13px', cursor: 'pointer', fontWeight: 500
                              }}
                            >
                              <CreditCard size={14} /> {t('tenantRequests.payDeposit', 'Pay Deposit')}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
        <div className="modal-overlay" onClick={handleCloseContractRequest} style={{ overflowY: 'auto', padding: '20px 0' }}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', margin: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileSignature size={20} style={{ color: '#059669' }} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
                {modalMode === 'create_request' ? t('tenantRequests.sendRentalRequestHeader', 'Gửi Yêu Cầu Thuê Phòng') : t('tenantRequests.requestContractHeader', 'Yêu Cầu Hợp Đồng Thuê')}
              </h2>
            </div>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#166534', lineHeight: 1.6 }}>
                <strong>Room:</strong> {selectedContractSchedule.room?.title}<br />
                <span style={{ fontSize: '0.8rem', color: '#15803d', display: 'block', marginTop: '4px' }}>
                  {modalMode === 'create_request' 
                    ? t('tenantRequests.sendRentalRequestDesc', 'Gửi lời nhắn của bạn đến chủ trọ để đăng ký thuê phòng. Sau khi chủ trọ đồng ý yêu cầu, bạn mới thực hiện tạo hợp đồng.')
                    : t('tenantRequests.requestContractDesc', 'Bạn sẽ thanh toán tiền đặt cọc và tiền nhà tháng đầu tiên khi ký hợp đồng.')}
                </span>
              </p>
            </div>
            
            {modalMode === 'create_request' ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Số điện thoại *</label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={(e) => e.target.style.borderColor = '#059669'}
                      onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Ngày dọn vào *</label>
                    <input 
                      type="date" 
                      value={contractStartDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setContractStartDate(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={(e) => e.target.style.borderColor = '#059669'}
                      onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Thời hạn thuê (Tháng) *</label>
                    <select 
                      value={contractDuration}
                      onChange={(e) => setContractDuration(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#fff' }}
                      onFocus={(e) => e.target.style.borderColor = '#059669'}
                      onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    >
                      {[3, 6, 9, 12, 18, 24].map(m => (
                        <option key={m} value={m}>{m} Month{m > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Mục đích vào ở *</label>
                    <input 
                      type="text" 
                      value={rentalPurpose}
                      placeholder="Ví dụ: Đi học, Đi làm..."
                      onChange={(e) => setRentalPurpose(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={(e) => e.target.style.borderColor = '#059669'}
                      onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Move-in Date (Tự động điền) *</label>
                    <input 
                      type="date" 
                      value={contractStartDate}
                      disabled
                      style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Duration (Tự động điền) *</label>
                    <select 
                      value={contractDuration}
                      disabled
                      style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24].map(m => (
                        <option key={m} value={m}>{m} Month{m > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: '20px 0 12px 0', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px' }}>
                  {t('tenantRequests.tenantInfoContract', 'Thông tin người thuê (Lập hợp đồng)')}
                </h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Full Name *</label>
                  <input 
                    type="text" 
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none' }}
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>CCCD/CMND (12 digits) *</label>
                    <input 
                      type="text" 
                      maxLength={12}
                      value={tenantIc}
                      onChange={(e) => setTenantIc(e.target.value.replace(/\D/g, ''))}
                      style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none' }}
                      placeholder="012345678901"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Issue Date *</label>
                    <input 
                      type="date" 
                      value={tenantIcIssueDate}
                      onChange={(e) => setTenantIcIssueDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Issue Place *</label>
                  <input 
                    type="text" 
                    value={tenantIcIssuePlace}
                    onChange={(e) => setTenantIcIssuePlace(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none' }}
                    placeholder="Cục Cảnh sát Quản lý hành chính về trật tự xã hội"
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Permanent Address *</label>
                  <input 
                    type="text" 
                    value={tenantPermanentAddress}
                    onChange={(e) => setTenantPermanentAddress(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none' }}
                    placeholder="123 Duong ABC, Phuong XYZ, Quan 1, TP HCM"
                  />
                </div>
              </>
            )}

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
                {submittingContract ? 'Sending...' : (modalMode === 'create_request' ? t('tenantRequests.sendRentalRequestSubmit', 'Gửi Yêu Cầu Thuê') : t('tenantRequests.sendContractRequestSubmit', 'Gửi Yêu Cầu Hợp Đồng'))}
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


      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="modal-overlay" onClick={() => setShowOtpModal(false)}>
          <div className="modal-container" style={{ maxWidth: '400px', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h2 className="modal-title" style={{ fontSize: '18px' }}>Verify Contract Signature</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowOtpModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: '24px' }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#4b5563', lineHeight: 1.5 }}>
                An OTP has been sent to your email. Please enter the 6-digit code below to finalize signing this contract.
              </p>
              <input 
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                style={{ width: '100%', padding: '12px', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '4px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            
            <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowOtpModal(false)}
                disabled={submittingContract}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleVerifyOtpAndSign}
                disabled={submittingContract || otpCode.length !== 6}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '6px', 
                  border: 'none', 
                  background: (submittingContract || otpCode.length !== 6) ? '#9ca3af' : '#4f46e5', 
                  color: '#fff', 
                  cursor: (submittingContract || otpCode.length !== 6) ? 'not-allowed' : 'pointer', 
                  fontWeight: 600,
                  marginLeft: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {submittingContract ? 'Verifying...' : 'Verify & Sign'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Contract Document Modal */}
      {showContractModal && selectedContractToSign && (
        <div className="modal-backdrop" onClick={() => setShowContractModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', padding: '40px 20px', overflowY: 'auto', display: 'block' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowContractModal(false)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
            >
              <X size={20} color="#475569" />
            </button>
            <ContractDocument 
              contract={selectedContractToSign}
              role="tenant"
              onSign={proceedToSignContractInline}
              onCancel={(id) => {
                setShowContractModal(false);
                handleCancelContract(id);
              }}
            />
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {showRenewModal && renewContractTarget && (
        <div className="modal-overlay" onClick={() => setShowRenewModal(false)}>
          <div className="modal-container" style={{ maxWidth: '400px', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h2 className="modal-title" style={{ fontSize: '18px' }}>{t('tenantRequests.renewContract', 'Gia hạn hợp đồng')}</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowRenewModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: '24px' }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#4b5563', lineHeight: 1.5 }}>
                {t('tenantRequests.renewContractDesc', 'Vui lòng nhập số tháng bạn muốn gia hạn cho hợp đồng này.')}
              </p>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{t('tenantRequests.durationMonths', 'Số tháng gia hạn')} *</label>
                <input 
                  type="number" 
                  min="1"
                  value={renewDuration}
                  onChange={(e) => setRenewDuration(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
            </div>
            
            <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowRenewModal(false)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontWeight: 500 }}
              >
                {t('tenantRequests.cancel', 'Hủy')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleRenewContractConfirm}
                disabled={!renewDuration || isNaN(parseInt(renewDuration, 10)) || parseInt(renewDuration, 10) <= 0}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '6px', 
                  border: 'none', 
                  background: (!renewDuration || isNaN(parseInt(renewDuration, 10)) || parseInt(renewDuration, 10) <= 0) ? '#9ca3af' : '#10b981', 
                  color: '#fff', 
                  cursor: (!renewDuration || isNaN(parseInt(renewDuration, 10)) || parseInt(renewDuration, 10) <= 0) ? 'not-allowed' : 'pointer', 
                  fontWeight: 600,
                  marginLeft: '12px'
                }}
              >
                {t('tenantRequests.continue', 'Tiếp tục')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Termination Request Modal */}
      {showTerminationModal && selectedContractForTermination && (
        <TerminationRequestModal
          contract={selectedContractForTermination}
          userRole="Tenant"
          onClose={() => setShowTerminationModal(false)}
          onSuccess={() => {
            fetchContracts();
            toast.success('Đã gửi yêu cầu chấm dứt hợp đồng thành công!');
          }}
        />
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
