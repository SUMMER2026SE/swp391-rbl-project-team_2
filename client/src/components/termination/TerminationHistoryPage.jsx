import React, { useState, useEffect } from 'react';
import { terminationService } from '../../services/terminationService';
import TerminationDetailsModal from './TerminationDetailsModal';
import './Termination.css';

const TerminationHistoryPage = ({ currentUserId, userRole = 'Tenant' }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await terminationService.getHistory();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setRequests(list);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Không thể tải lịch sử chấm dứt hợp đồng.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const safeRequests = Array.isArray(requests) ? requests : [];
  const filteredRequests = safeRequests.filter((item) => {
    if (!item) return false;
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const contractNum = item.contract?.contract_number || item.contract?.contractNumber || '';
      const roomTitle = item.contract?.room?.title || item.contract?.roomTitle || '';
      const reason = item.reason || '';
      return (
        contractNum.toLowerCase().includes(q) ||
        roomTitle.toLowerCase().includes(q) ||
        reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('vi-VN');
    } catch (e) {
      return 'N/A';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <span className="tm-badge tm-badge-accepted">Đã Chấp Nhận</span>;
      case 'REJECTED':
        return <span className="tm-badge tm-badge-rejected">Đã Từ Chối</span>;
      case 'DISPUTED':
        return <span className="tm-badge tm-badge-disputed">Đang Tranh Chấp</span>;
      default:
        return <span className="tm-badge tm-badge-pending">Chờ Xử Lý</span>;
    }
  };

  return (
    <div className="tm-history-container">
      {/* Header */}
      <div className="tm-history-header">
        <div>
          <h2 className="tm-history-title">Lịch sử Chấm dứt Hợp đồng</h2>
          <p className="tm-history-subtitle">
            Quản lý các yêu cầu đồng thuận, đơn phương hủy hợp đồng & quyết toán tài chính
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="tm-btn tm-btn-secondary"
        >
          Làm mới
        </button>
      </div>

      {/* Controls: Search & Filters */}
      <div className="tm-history-controls">
        <div className="tm-search-input-wrap">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo số hợp đồng, tên phòng hoặc lý do..."
            className="tm-input"
            style={{ paddingLeft: 14 }}
          />
        </div>

        <div className="tm-filter-tabs">
          {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'DISPUTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`tm-filter-btn ${filterStatus === status ? 'active' : ''}`}
            >
              {status === 'ALL' && 'Tất cả'}
              {status === 'PENDING' && 'Chờ xử lý'}
              {status === 'ACCEPTED' && 'Đã chấp nhận'}
              {status === 'REJECTED' && 'Đã từ chối'}
              {status === 'DISPUTED' && 'Tranh chấp'}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="tm-alert tm-alert-danger">
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '4px solid #2563eb', borderTopColor: 'transparent', animation: 'tmSpin 0.8s linear infinite' }} />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: 20, border: '2px dashed #cbd5e1', padding: '60px 20px', textAlign: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Chưa có yêu cầu chấm dứt nào</h3>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
            Các yêu cầu chấm dứt hợp đồng sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <div className="tm-history-grid">
          {filteredRequests.map((item) => (
            <div key={item.request_id} className="tm-history-card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                      Hợp đồng #{item.contract?.contract_number || item.contract?.contractNumber || item.contract_id}
                    </span>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '2px 0 0 0' }}>
                      {item.contract?.room?.title || item.contract?.roomTitle || `Phòng #${item.contract?.room_id || ''}`}
                    </h4>
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '10px 0', fontSize: 13, color: '#475569', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Loại yêu cầu:</span>
                    <strong style={{ color: '#0f172a' }}>
                      {item.termination_type === 'Mutual' && 'Đồng thuận'}
                      {item.termination_type === 'TenantVoluntaryBreak' && 'Tự nguyện trước hạn'}
                      {item.termination_type === 'LandlordViolationClaim' && 'Khiếu nại Chủ nhà'}
                      {item.termination_type === 'TenantViolationClaim' && 'Khiếu nại Khách thuê'}
                      {item.termination_type === 'UnilateralLandlord' && 'Đơn phương (Chủ nhà)'}
                      {item.termination_type === 'LandlordArbitraryBreak' && 'Lấy lại nhà sớm'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Ngày yêu cầu:</span>
                    <strong style={{ color: '#0f172a' }}>
                      {formatDate(item.request_date || item.created_at)}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Ngày chấm dứt:</span>
                    <strong style={{ color: '#0f172a' }}>
                      {formatDate(item.requested_termination_date)}
                    </strong>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Lý do:</span>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginTop: 2 }}>
                    {item.reason}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setSelectedRequest(item)}
                  className="tm-btn tm-btn-secondary"
                  style={{ width: '100%' }}
                >
                  Xem Chi tiết & Quyết toán
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedRequest && (
        <TerminationDetailsModal
          request={selectedRequest}
          currentUserId={currentUserId}
          onClose={() => setSelectedRequest(null)}
          onRefresh={fetchHistory}
        />
      )}
    </div>
  );
};

export default TerminationHistoryPage;
