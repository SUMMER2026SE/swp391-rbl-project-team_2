import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  Eye,
  X,
  AlertCircle,
  Calendar,
  Flag,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useComplaints } from '../hooks/useComplaints';
import Button from '../../../components/common/Button';
import Loading from '../../../components/ui/Loading';
import EmptyState from '../../../components/ui/EmptyState';
import Badge from '../../../components/ui/Badge';
import { getAvatarUrl as getGlobalAvatar } from '../../../utils/format';
import './ComplaintsPage.css';

const ComplaintsPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');

  const { complaints, loading, error, updateStatus, updatePriority } = useComplaints();

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch =
      complaint.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.roomTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || complaint.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || complaint.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'warning';
      case 'IN_PROGRESS':
        return 'info';
      case 'RESOLVED':
        return 'success';
      case 'CLOSED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    try {
      await updateStatus(selectedComplaint.id, newStatus);
      setSelectedComplaint(null);
      setShowDetailModal(false);
      setNewStatus('');
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handlePriorityUpdate = async () => {
    if (!newPriority) return;
    try {
      await updatePriority(selectedComplaint.id, newPriority);
      setSelectedComplaint(null);
      setShowDetailModal(false);
      setNewPriority('');
    } catch (err) {
      toast.error(err.message || 'Failed to update priority');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="complaints">
      {/* Header */}
      <div className="complaints__header">
        <div>
          <h1 className="complaints__title">{t('complaints.complaints', 'Complaints')}</h1>
          <p className="complaints__subtitle">{t('complaints.manageTenantComplaintsAndIssues', 'Manage tenant complaints and issues')}</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="complaints__filter-bar">
        <div className="filter-search">
          <Search size={18} />
          <input
            type="text"
            placeholder={t('complaints.searchByTenantRoomOrPlaceholder', 'Search by tenant, room, or title...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown-container">
          <button
            className="filter-dropdown-btn"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
          >
            <span>{statusFilter}</span>
            <ChevronDown size={16} />
          </button>
          {showStatusDropdown && (
            <div className="filter-dropdown-menu">
              {['All', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
                <button
                  key={status}
                  className={`filter-dropdown-item ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter(status);
                    setShowStatusDropdown(false);
                  }}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="filter-dropdown-container">
          <button
            className="filter-dropdown-btn"
            onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
          >
            <span>{priorityFilter}</span>
            <ChevronDown size={16} />
          </button>
          {showPriorityDropdown && (
            <div className="filter-dropdown-menu">
              {['All', 'HIGH', 'MEDIUM', 'LOW'].map(priority => (
                <button
                  key={priority}
                  className={`filter-dropdown-item ${priorityFilter === priority ? 'active' : ''}`}
                  onClick={() => {
                    setPriorityFilter(priority);
                    setShowPriorityDropdown(false);
                  }}
                >
                  {priority}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Complaints Table */}
      {filteredComplaints.length > 0 ? (
        <div className="complaints__table-container">
          <table className="complaints__table">
            <thead>
              <tr>
                <th>{t('complaints.title', 'Title')}</th>
                <th>{t('complaints.tenant', 'Tenant')}</th>
                <th>{t('complaints.room', 'Room')}</th>
                <th>{t('complaints.date', 'Date')}</th>
                <th>{t('complaints.priority', 'Priority')}</th>
                <th>{t('complaints.status', 'Status')}</th>
                <th>{t('complaints.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map(complaint => (
                <tr key={complaint.id} className="complaint-row">
                  <td>
                    <div className="complaint-title">{complaint.title}</div>
                  </td>
                  <td>
                    <div className="tenant-info">
                      <div className="tenant-avatar">
                        <img src={getGlobalAvatar(complaint.tenantName, complaint.tenantAvatar)} alt={complaint.tenantName || 'Unknown'} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      </div>
                      <span>{complaint.tenantName}</span>
                    </div>
                  </td>
                  <td>{complaint.roomTitle}</td>
                  <td>
                    <div className="date-info">
                      <Calendar size={14} />
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <Badge variant={getPriorityColor(complaint.priority)}>
                      {complaint.priority}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={getStatusColor(complaint.status)}>
                      {complaint.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setNewStatus(complaint.status);
                        setNewPriority(complaint.priority);
                        setShowDetailModal(true);
                      }}
                    >
                      <Eye size={14} />{t('complaints.view', 'View')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon="🔧"
          title="No complaints found"
          description="You don't have any complaints yet"
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedComplaint && (
        <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content modal-content--large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('complaints.complaintDetails', 'Complaint Details')}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Complaint Title */}
              <div className="detail-section">
                <h4 className="complaint-title-display">{selectedComplaint.title}</h4>
                <p className="complaint-description">{selectedComplaint.description}</p>
              </div>

              {/* Complaint Info */}
              <div className="detail-section">
                <h4 className="section-title">{t('complaints.complaintInformation', 'Complaint Information')}</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>{t('complaints.tenant', 'Tenant')}</label>
                    <div className="detail-value">{selectedComplaint.tenantName}</div>
                  </div>
                  <div className="detail-item">
                    <label>{t('complaints.room', 'Room')}</label>
                    <div className="detail-value">{selectedComplaint.roomTitle}</div>
                  </div>
                  <div className="detail-item">
                    <label>{t('complaints.dateReported', 'Date Reported')}</label>
                    <div className="detail-value">
                      <Calendar size={14} />
                      {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>{t('complaints.category', 'Category')}</label>
                    <div className="detail-value">{selectedComplaint.category}</div>
                  </div>
                </div>
              </div>

              {/* Status & Priority Update */}
              <div className="detail-section">
                <h4 className="section-title">{t('complaints.updateStatusPriority', 'Update Status & Priority')}</h4>
                <div className="update-grid">
                  <div className="update-item">
                    <label>{t('complaints.status', 'Status')}</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="OPEN">{t('complaints.open', 'Open')}</option>
                      <option value="IN_PROGRESS">{t('complaints.inProgress', 'In Progress')}</option>
                      <option value="RESOLVED">{t('complaints.resolved', 'Resolved')}</option>
                      <option value="CLOSED">{t('complaints.closed', 'Closed')}</option>
                    </select>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={handleStatusUpdate}
                    >{t('complaints.updateStatus', 'Update Status')}</Button>
                  </div>

                  <div className="update-item">
                    <label>{t('complaints.priority', 'Priority')}</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                    >
                      <option value="LOW">{t('complaints.low', 'Low')}</option>
                      <option value="MEDIUM">{t('complaints.medium', 'Medium')}</option>
                      <option value="HIGH">{t('complaints.high', 'High')}</option>
                    </select>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={handlePriorityUpdate}
                    >{t('complaints.updatePriority', 'Update Priority')}</Button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedComplaint.notes && (
                <div className="detail-section">
                  <h4 className="section-title">{t('complaints.notes', 'Notes')}</h4>
                  <div className="notes-box">{selectedComplaint.notes}</div>
                </div>
              )}

              {/* Timeline */}
              {selectedComplaint.timeline && selectedComplaint.timeline.length > 0 && (
                <div className="detail-section">
                  <h4 className="section-title">{t('complaints.timeline', 'Timeline')}</h4>
                  <div className="timeline">
                    {selectedComplaint.timeline.map((event, idx) => (
                      <div key={idx} className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-title">{event.title}</div>
                          <div className="timeline-date">
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          {event.description && (
                            <div className="timeline-description">{event.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <Button
                variant="secondary"
                onClick={() => setShowDetailModal(false)}
              >{t('complaints.close', 'Close')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsPage;
