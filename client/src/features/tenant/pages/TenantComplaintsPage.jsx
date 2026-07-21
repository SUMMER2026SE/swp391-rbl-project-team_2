import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Plus, Eye, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { tenantComplaintService } from '../services/tenantComplaintService';
import { rentalRequestService } from '../services/rentalRequestService';
import Button from '../../../components/common/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import './TenantComplaintsPage.css';

const TenantComplaintsPage = () => {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRooms, setActiveRooms] = useState([]);
  const [formData, setFormData] = useState({
    roomId: '',
    title: '',
    complaintType: 'maintenance',
    priority: 'medium',
    description: ''
  });

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  useEffect(() => {
    if (isModalOpen && activeRooms.length === 0) {
      fetchActiveRooms();
    }
  }, [isModalOpen]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await tenantComplaintService.getComplaints(statusFilter);
      setComplaints(res.data || []);
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveRooms = async () => {
    try {
      const res = await rentalRequestService.getMyContracts();
      const contractsData = Array.isArray(res) ? res : (res?.data || []);
      const activeContracts = contractsData.filter(
        c => c.status === 'active' || c.status === 'pre_booked_active'
      );
      setActiveRooms(activeContracts.map(c => c.room));
    } catch (error) {
      console.error('Failed to fetch rooms', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roomId || !formData.title || !formData.description) {
      toast.error(t('tenantComplaints.error', 'Vui lòng điền đầy đủ thông tin!'));
      return;
    }

    try {
      setIsSubmitting(true);
      await tenantComplaintService.createComplaint(formData);
      toast.success(t('tenantComplaints.success', 'Gửi khiếu nại thành công!'));
      setIsModalOpen(false);
      setFormData({
        roomId: '',
        title: '',
        complaintType: 'maintenance',
        priority: 'medium',
        description: ''
      });
      fetchComplaints();
    } catch (error) {
      toast.error(error.message || t('tenantComplaints.error', 'Có lỗi xảy ra.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'info';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
      case 'urgent': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setIsViewModalOpen(true);
  };

  return (
    <div className="tenant-complaints-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">{t('tenantComplaints.title', 'Khiếu nại của tôi')}</h1>
          <p className="page-subtitle">{t('tenantComplaints.subtitle', 'Xem và quản lý khiếu nại.')}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> {t('tenantComplaints.newComplaintBtn', 'Gửi khiếu nại mới')}
        </Button>
      </div>

      <div className="filters-container" style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <select 
          className="form-select" 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', minWidth: '150px' }}
        >
          {['All', 'open', 'in_progress', 'resolved', 'closed'].map(status => (
            <option key={status} value={status}>
              {status === 'All' ? 'Tất cả trạng thái' : status.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 className="animate-spin" size={32} color="#2563eb" />
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState 
          icon={<AlertTriangle size={48} />}
          title={t('tenantComplaints.noComplaintsTitle', 'Chưa có khiếu nại nào')}
          description={t('tenantComplaints.noComplaintsSubtitle', 'Bạn chưa gửi khiếu nại nào.')}
        />
      ) : (
        <div className="table-responsive" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '16px' }}>{t('tenantComplaints.room', 'Phòng')}</th>
                <th style={{ padding: '16px' }}>{t('tenantComplaints.complaintTitle', 'Tiêu đề')}</th>
                <th style={{ padding: '16px' }}>{t('tenantComplaints.date', 'Ngày gửi')}</th>
                <th style={{ padding: '16px' }}>{t('tenantComplaints.priority', 'Mức độ')}</th>
                <th style={{ padding: '16px' }}>{t('tenantComplaints.status', 'Trạng thái')}</th>
                <th style={{ padding: '16px' }}>{t('tenantComplaints.actions', 'Hành động')}</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c.complaintId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px' }}>{c.room?.title || `Phòng ${c.roomId}`}</td>
                  <td style={{ padding: '16px', fontWeight: '500' }}>{c.title}</td>
                  <td style={{ padding: '16px' }}>{new Date(c.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td style={{ padding: '16px' }}>
                    <Badge variant={getPriorityColor(c.priority)}>{t(`tenantComplaints.priorities.${c.priority}`, c.priority)}</Badge>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <Badge variant={getStatusColor(c.status)}>{c.status.toUpperCase()}</Badge>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button 
                      onClick={() => handleViewDetails(c)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Eye size={16} /> {t('tenantComplaints.view', 'Xem')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Complaint Modal */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: 'white', borderRadius: '12px', width: '90%', maxWidth: '500px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>{t('tenantComplaints.createTitle', 'Gửi Khiếu nại / Sự cố')}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('tenantComplaints.selectRoom', 'Phòng đang thuê')} *</label>
                <select name="roomId" value={formData.roomId} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="">-- Chọn phòng --</option>
                  {activeRooms.map(r => (
                    <option key={r.room_id} value={r.room_id}>{r.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('tenantComplaints.complaintTitle', 'Tiêu đề')} *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder={t('tenantComplaints.complaintTitlePlaceholder', 'Nhập tiêu đề')} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('tenantComplaints.complaintType', 'Loại khiếu nại')}</label>
                  <select name="complaintType" value={formData.complaintType} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="maintenance">{t('tenantComplaints.types.maintenance', 'Bảo trì')}</option>
                    <option value="noise">{t('tenantComplaints.types.noise', 'Tiếng ồn')}</option>
                    <option value="cleanliness">{t('tenantComplaints.types.cleanliness', 'Vệ sinh')}</option>
                    <option value="safety">{t('tenantComplaints.types.safety', 'An ninh')}</option>
                    <option value="utilities">{t('tenantComplaints.types.utilities', 'Điện nước')}</option>
                    <option value="other">{t('tenantComplaints.types.other', 'Khác')}</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('tenantComplaints.priority', 'Độ ưu tiên')}</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="low">{t('tenantComplaints.priorities.low', 'Thấp')}</option>
                    <option value="medium">{t('tenantComplaints.priorities.medium', 'Trung bình')}</option>
                    <option value="high">{t('tenantComplaints.priorities.high', 'Cao')}</option>
                    <option value="urgent">{t('tenantComplaints.priorities.urgent', 'Khẩn cấp')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('tenantComplaints.description', 'Mô tả chi tiết')} *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={4} placeholder={t('tenantComplaints.descriptionPlaceholder', 'Mô tả...')} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <Button type="button" onClick={() => setIsModalOpen(false)} style={{ background: '#f1f5f9', color: '#475569' }}>
                  {t('tenantComplaints.cancel', 'Hủy')}
                </Button>
                <Button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : t('tenantComplaints.submit', 'Gửi')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Complaint Modal */}
      {isViewModalOpen && selectedComplaint && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: 'white', borderRadius: '12px', width: '90%', maxWidth: '500px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>{selectedComplaint.title}</h2>
              <button onClick={() => setIsViewModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Badge variant={getStatusColor(selectedComplaint.status)}>{selectedComplaint.status.toUpperCase()}</Badge>
                <Badge variant={getPriorityColor(selectedComplaint.priority)}>{t(`tenantComplaints.priorities.${selectedComplaint.priority}`, selectedComplaint.priority)}</Badge>
              </div>
              
              <div>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{t('tenantComplaints.room', 'Phòng')}</p>
                <p style={{ margin: '4px 0 0 0', fontWeight: '500' }}>{selectedComplaint.room?.title || `Phòng ${selectedComplaint.roomId}`}</p>
              </div>

              <div>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{t('tenantComplaints.date', 'Ngày gửi')}</p>
                <p style={{ margin: '4px 0 0 0', fontWeight: '500' }}>{new Date(selectedComplaint.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              
              <div>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{t('tenantComplaints.description', 'Mô tả')}</p>
                <p style={{ margin: '4px 0 0 0', padding: '12px', background: '#f8fafc', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                  {selectedComplaint.description}
                </p>
              </div>

              {selectedComplaint.resolutionNotes && (
                <div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Ghi chú giải quyết của Chủ trọ</p>
                  <p style={{ margin: '4px 0 0 0', padding: '12px', background: '#ecfdf5', borderRadius: '8px', color: '#065f46', whiteSpace: 'pre-wrap' }}>
                    {selectedComplaint.resolutionNotes}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <Button onClick={() => setIsViewModalOpen(false)} style={{ background: '#f1f5f9', color: '#475569' }}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TenantComplaintsPage;
