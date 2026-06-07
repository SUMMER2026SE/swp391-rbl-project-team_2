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
  CreditCard
} from 'lucide-react';
import { rentalRequestService } from '../services/rentalRequestService';
import Button from '../../../components/common/Button';
import './TenantRequestsPage.css';

const TenantRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await rentalRequestService.getMyRequests();
      const items = Array.isArray(data) ? data : (data.data || []);
      setRequests(items);
    } catch (err) {
      setError('Failed to fetch rental requests. ' + (err.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      await rentalRequestService.cancelRequest(requestId, 'Canceled by tenant');
      alert('Request canceled successfully');
      fetchRequests(); // Refresh list
    } catch (err) {
      alert('Failed to cancel request: ' + (err.response?.data?.message || ''));
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { 
          icon: <Clock size={16} />, 
          color: 'text-amber-600', 
          bg: 'bg-amber-50', 
          border: 'border-amber-200',
          label: 'Pending Approval' 
        };
      case 'approved':
        return { 
          icon: <CheckCircle2 size={16} />, 
          color: 'text-emerald-600', 
          bg: 'bg-emerald-50', 
          border: 'border-emerald-200',
          label: 'Approved' 
        };
      case 'rejected':
        return { 
          icon: <XCircle size={16} />, 
          color: 'text-rose-600', 
          bg: 'bg-rose-50', 
          border: 'border-rose-200',
          label: 'Rejected' 
        };
      case 'canceled':
      case 'cancelled':
        return { 
          icon: <Info size={16} />, 
          color: 'text-slate-600', 
          bg: 'bg-slate-50', 
          border: 'border-slate-200',
          label: 'Canceled' 
        };
      default:
        return { 
          icon: <Info size={16} />, 
          color: 'text-gray-600', 
          bg: 'bg-gray-50', 
          border: 'border-gray-200',
          label: status.charAt(0).toUpperCase() + status.slice(1) 
        };
    }
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
          <Button onClick={fetchRequests} className="mt-6 w-full">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="tenant-requests-page">
      <div className="container">
        
        {/* Header Section */}
        <div className="page-header">
          <h1>My Rental Requests</h1>
          <p>Track the status of your room applications and inquiries in real-time.</p>
        </div>
        
        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <FileText size={40} />
            </div>
            <h3>No requests yet</h3>
            <p>
              You haven't submitted any rental requests. Browse our available rooms and find your next perfect home!
            </p>
            <Button onClick={() => navigate('/listings')} className="btn-browse">
              Browse Rooms
            </Button>
          </div>
        ) : (
          <div className="requests-list">
            {requests.map((req) => {
              const statusInfo = getStatusInfo(req.status);
              const roomImage = req.room?.thumbnail_url 
                ? `http://localhost:5000${req.room.thumbnail_url}` 
                : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80';
              
              const requestDate = new Date(req.created_at || Date.now()).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              });
              
              const moveInDate = req.requested_move_in_date 
                ? new Date(req.requested_move_in_date).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  }) 
                : 'Flexible';

              return (
                <div key={req.request_id} className="request-card">
                  {/* Left: Image Area */}
                  <div className="request-image-wrapper">
                    <img src={roomImage} alt={req.room?.title || 'Room'} />
                    <div className="status-badge-container">
                      <div className={`status-badge ${req.status}`}>
                        {statusInfo.icon}
                        {statusInfo.label}
                      </div>
                    </div>
                  </div>

                  {/* Right: Content Area */}
                  <div className="request-content">
                    
                    {/* Top Row: Title & Date */}
                    <div className="request-top-info">
                      <div className="title-row">
                        <h3>{req.room?.title || 'Unknown Room'}</h3>
                        <span className="request-date">Requested on {requestDate}</span>
                      </div>
                      <div className="address-row">
                        <MapPin size={14} />
                        <span>{req.room?.address || 'Address not available'}</span>
                      </div>
                    </div>

                    {/* Middle: Key Details Box */}
                    <div className="key-details-box">
                      <div className="detail-item">
                        <p className="detail-label">Move-in Date</p>
                        <div className="detail-value">
                          <Calendar size={16} />
                          {moveInDate}
                        </div>
                      </div>
                      <div className="detail-item">
                        <p className="detail-label">Lease Duration</p>
                        <div className="detail-value">
                          <Clock size={16} />
                          {req.lease_duration_months ? `${req.lease_duration_months} Months` : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="request-actions-row">
                      {req.message && (
                        <div className="tenant-message-preview">
                          <span className="dot"></span>
                          "{req.message}"
                        </div>
                      )}
                      
                      <div className="action-buttons">
                        {req.status === 'pending' && (
                          <button onClick={() => handleCancel(req.request_id)} className="btn-action btn-cancel">
                            Cancel Request
                          </button>
                        )}
                        {req.status === 'approved' && (
                          <button onClick={() => navigate(`/tenant/payment?roomId=${req.room_id}&requestId=${req.request_id}`)} className="btn-action btn-pay">
                            <CreditCard size={16} /> Pay Deposit
                          </button>
                        )}
                        <button onClick={() => navigate(`/listings/${req.room_id}`)} className="btn-action btn-view">
                          View Listing <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantRequestsPage;
