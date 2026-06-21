import React from 'react';
import { EyeOff, CheckCircle, ExternalLink, MapPin, Eye, MessageSquare, MoreVertical, ShieldCheck, AlertCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';
import './ListingGrid.css';

const ListingGrid = ({ listings, onUpdateStatus }) => {
  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'available':
        return <span className="grid-status-badge active">Available</span>;
      case 'occupied':
      case 'rented':
        return <span className="grid-status-badge occupied">Occupied</span>;
      case 'hidden':
        return <span className="grid-status-badge hidden">Hidden</span>;
      case 'pending':
        return <span className="grid-status-badge" style={{ backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>Pending</span>;
      case 'rejected':
        return <span className="grid-status-badge" style={{ backgroundColor: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}>Rejected</span>;
      default:
        return <span className="grid-status-badge">{status}</span>;
    }
  };

  if (listings.length === 0) {
    return (
      <div className="grid-empty-state">
        <p>No listings found.</p>
      </div>
    );
  }

  return (
    <div className="listing-grid-container">
      {listings.map((listing) => (
        <div key={listing.id} className={`listing-grid-card ${listing.alert ? 'has-alert' : ''}`}>
          {/* Card Header (Image & Badges) */}
          <div className="grid-card-header">
            <img src={listing.image} alt={listing.title} className="grid-card-image" />
            <div className="grid-badges-top">
              {getStatusBadge(listing.status)}
              {listing.alert && (
                <span className="grid-alert-badge">
                  <AlertCircle size={14} /> Alert
                </span>
              )}
            </div>
            <div className="grid-card-overlay-actions">
              <button className="grid-icon-btn" title="View Details" onClick={() => window.open(`/admin/listings/${listing.rawId}/review`, '_blank')}>
                <ExternalLink size={16} />
              </button>
              {listing.status.toLowerCase() === 'pending' ? (
                <button 
                  className="grid-icon-btn" 
                  title="Review Listing"
                  style={{ color: '#4f46e5', borderColor: '#c7d2fe', backgroundColor: '#eef2ff', padding: '0 8px', width: 'auto' }}
                  onClick={() => window.open(`/admin/listings/${listing.rawId}/review`, '_blank')}
                >
                  <span style={{ fontSize: '12px', fontWeight: '500' }}>Review</span>
                </button>
              ) : listing.status.toLowerCase() !== 'hidden' ? (
                <button 
                  className="grid-icon-btn" 
                  title="Hide Listing"
                  onClick={() => onUpdateStatus(listing.rawId, 'hidden')}
                >
                  <EyeOff size={16} />
                </button>
              ) : (
                <button 
                  className="grid-icon-btn" 
                  title="Activate Listing"
                  onClick={() => onUpdateStatus(listing.rawId, 'available')}
                >
                  <CheckCircle size={16} />
                </button>
              )}
              <button className="grid-icon-btn" title="More Options">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          {/* Card Body (Info) */}
          <div className="grid-card-body">
            <div className="grid-card-title-row">
              <h3 className="grid-card-title" title={listing.title}>{listing.title}</h3>
              <span className="grid-card-id">{listing.id}</span>
            </div>
            <div className="grid-card-location">
              <MapPin size={14} />
              <span>{listing.location}</span>
            </div>
            <div className="grid-card-price">
              {formatCurrency(listing.price)}<span>/month</span>
            </div>
          </div>

          {/* Card Footer (Landlord & Stats) */}
          <div className="grid-card-footer">
            <div className="grid-landlord-info">
              <div className="grid-landlord-avatar">
                {listing.landlord?.name?.charAt(0) || 'U'}
              </div>
              <div className="grid-landlord-details">
                <span className="grid-landlord-name">{listing.landlord?.name || 'Unknown'}</span>
                {listing.landlord?.type === 'Verified Host' && (
                  <span className="grid-verified-host"><ShieldCheck size={12} /> Verified</span>
                )}
              </div>
            </div>
          </div>
          
          {listing.alert && (
            <div className="grid-card-alert-action">
              <button className="btn-review-alert">Review Violation</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ListingGrid;
