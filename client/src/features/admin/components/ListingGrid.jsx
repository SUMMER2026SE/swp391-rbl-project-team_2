import React from 'react';
import { useTranslation } from 'react-i18next';
import { EyeOff, CheckCircle, ExternalLink, MapPin, Eye, MessageSquare, MoreVertical, ShieldCheck, AlertCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';
import './ListingGrid.css';

const ListingGrid = ({ listings, onUpdateStatus }) => {
  const { t } = useTranslation();
  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'available':
        return <span className="grid-status-badge active">{t('adminListings.statusAvailable')}</span>;
      case 'occupied':
      case 'rented':
        return <span className="grid-status-badge occupied">{t('adminListings.statusOccupied')}</span>;
      case 'hidden':
        return <span className="grid-status-badge hidden">{t('adminListings.statusHidden')}</span>;
      case 'pending':
        return <span className="grid-status-badge" style={{ backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>{t('adminListings.statusPending')}</span>;
      case 'rejected':
        return <span className="grid-status-badge" style={{ backgroundColor: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}>{t('adminListings.statusRejected')}</span>;
      default:
        return <span className="grid-status-badge">{status}</span>;
    }
  };

  if (listings.length === 0) {
    return (
      <div className="grid-empty-state">
        <p>{t('adminListings.noListings')}</p>
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
                  <AlertCircle size={14} /> {t('adminListings.alert')}
                </span>
              )}
            </div>
            <div className="grid-card-overlay-actions">
              <button className="grid-icon-btn" title={t('adminListings.viewDetails')} onClick={() => window.open(`/admin/listings/${listing.rawId}/review`, '_blank')}>
                <ExternalLink size={16} />
              </button>
              {listing.status.toLowerCase() === 'pending' ? (
                <button 
                  className="grid-icon-btn" 
                  title={t('adminListings.viewAndReview')}
                  style={{ color: '#4f46e5', borderColor: '#c7d2fe', backgroundColor: '#eef2ff', padding: '0 8px', width: 'auto' }}
                  onClick={() => window.open(`/admin/listings/${listing.rawId}/review`, '_blank')}
                >
                  <span style={{ fontSize: '12px', fontWeight: '500' }}>{t('adminListings.reviewListing')}</span>
                </button>
              ) : listing.status.toLowerCase() !== 'hidden' ? (
                <button 
                  className="grid-icon-btn" 
                  title={t('adminListings.hideListing')}
                  onClick={() => onUpdateStatus(listing.rawId, 'hidden')}
                >
                  <EyeOff size={16} />
                </button>
              ) : (
                <button 
                  className="grid-icon-btn" 
                  title={t('adminListings.activateListing')}
                  onClick={() => onUpdateStatus(listing.rawId, 'available')}
                >
                  <CheckCircle size={16} />
                </button>
              )}
              <button className="grid-icon-btn" title={t('adminListings.moreOptions')}>
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
              {formatCurrency(listing.price)}<span>{t('adminListings.perMonth')}</span>
            </div>
          </div>

          {/* Card Footer (Landlord & Stats) */}
          <div className="grid-card-footer">
            <div className="grid-landlord-info">
              <div className="grid-landlord-avatar">
                {listing.landlord?.name?.charAt(0) || 'U'}
              </div>
              <div className="grid-landlord-details">
                <span className="grid-landlord-name">{listing.landlord?.name || t('adminListings.unknown')}</span>
                {listing.landlord?.type === 'Verified Host' && (
                  <span className="grid-verified-host"><ShieldCheck size={12} /> {t('adminListings.verifiedHost')}</span>
                )}
              </div>
            </div>
          </div>
          
          {listing.alert && (
            <div className="grid-card-alert-action">
              <button className="btn-review-alert">{t('adminListings.reviewViolation')}</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ListingGrid;
