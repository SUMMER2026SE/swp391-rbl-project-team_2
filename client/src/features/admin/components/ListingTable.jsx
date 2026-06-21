import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Lock, AlertCircle, ExternalLink, EyeOff, CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';
import './ListingTable.css';

const ListingTable = ({ listings, onUpdateStatus }) => {
  const navigate = useNavigate();
  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'available':
        return <span className="status-badge status-active">Active</span>;
      case 'occupied':
      case 'rented':
        return (
          <span className="status-badge status-occupied">
            <Lock size={12} /> Occupied
          </span>
        );
      case 'hidden':
        return <span className="status-badge status-hidden">Hidden (System)</span>;
      case 'pending':
        return (
          <span className="status-badge" style={{ backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>
            <Clock size={12} /> Pending Approval
          </span>
        );
      case 'rejected':
        return (
          <span className="status-badge" style={{ backgroundColor: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}>
            <XCircle size={12} /> Rejected
          </span>
        );
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const getLandlordBadge = (type) => {
    if (type === 'Verified Host') {
      return <span className="landlord-badge verified">Verified Host</span>;
    }
    if (type === 'New Host') {
      return <span className="landlord-badge new">New Host</span>;
    }
    return null;
  };

  return (
    <div className="listing-table-container">
      <table className="listing-table">
        <thead>
          <tr>
            <th>Property</th>
            <th>Landlord</th>
            <th>Status</th>
            <th className="th-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing) => (
            <tr key={listing.id} className={listing.alert ? 'row-alert' : ''}>
              <td className="listing-property">
                <div className="property-info-cell">
                  <img src={listing.image} alt={listing.title} className="property-thumbnail" />
                  <div className="property-details">
                    <span className="property-id">{listing.id}</span>
                    <span className="property-title">{listing.title}</span>
                    <span className="property-location">{listing.location}</span>
                    <span className="property-price">{formatCurrency(listing.price)}/mo</span>
                  </div>
                </div>
              </td>
              <td className="listing-landlord">
                <div className="landlord-info-cell">
                  <span className="landlord-name">{listing.landlord?.name || 'Unknown'}</span>
                  {getLandlordBadge(listing.landlord?.type)}
                </div>
              </td>
              <td className="listing-status">
                <div className="status-cell">
                  {getStatusBadge(listing.status)}
                  {listing.alert && (
                    <div className="status-alert">
                      <AlertCircle size={14} />
                      <span>{listing.alert}</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="listing-actions">
                {listing.status.toLowerCase() === 'pending' ? (
                  <div className="action-buttons">
                    <button
                      className="btn-action-icon"
                      title="Xem và duyệt phòng"
                      onClick={() => navigate(`/admin/listings/${listing.rawId}/review`)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#d97706', fontWeight: 600 }}
                    >
                      <ExternalLink size={16} />
                      <span style={{ fontSize: '13px' }}>Duyệt phòng</span>
                    </button>
                  </div>
                ) : (
                  <div className="action-buttons">
                    <button
                      className="btn-action-icon"
                      title="Xem chi tiết"
                      onClick={() => navigate(`/admin/listings/${listing.rawId}/review`)}
                    >
                      <ExternalLink size={18} />
                    </button>
                    {listing.status.toLowerCase() !== 'hidden' ? (
                      <button
                        className="btn-action-icon"
                        title="Ẩn phòng"
                        onClick={() => onUpdateStatus(listing.rawId, 'hidden')}
                      >
                        <EyeOff size={18} />
                      </button>
                    ) : (
                      <button
                        className="btn-action-icon"
                        title="Khôi phục phòng"
                        onClick={() => onUpdateStatus(listing.rawId, 'available')}
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button className="btn-action-icon" title="Thêm tùy chọn">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {listings.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center py-4">No listings found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ListingTable;
