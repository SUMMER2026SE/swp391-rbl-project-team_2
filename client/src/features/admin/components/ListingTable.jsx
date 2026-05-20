import React from 'react';
import { MoreVertical, Lock, AlertCircle, Edit, ExternalLink, Activity } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';
import './ListingTable.css';

const ListingTable = ({ listings }) => {
  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <span className="status-badge status-active">Active</span>;
      case 'occupied':
        return (
          <span className="status-badge status-occupied">
            <Lock size={12} /> Occupied
          </span>
        );
      case 'hidden':
        return <span className="status-badge status-hidden">Hidden (System)</span>;
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
            <th>Performance</th>
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
                    <span className="property-id">#{listing.id}</span>
                    <span className="property-title">{listing.title}</span>
                    <span className="property-location">{listing.location}</span>
                    <span className="property-price">{formatCurrency(listing.price)}/mo</span>
                  </div>
                </div>
              </td>
              <td className="listing-landlord">
                <div className="landlord-info-cell">
                  <span className="landlord-name">{listing.landlord.name}</span>
                  {getLandlordBadge(listing.landlord.type)}
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
              <td className="listing-performance">
                <div className="performance-cell">
                  <div className="perf-item">
                    <span className="perf-label">Views:</span>
                    <span className="perf-value">{listing.performance.views.toLocaleString()}</span>
                  </div>
                  <div className="perf-item">
                    <span className="perf-label">Inquiries:</span>
                    <span className="perf-value">{listing.performance.inquiries}</span>
                  </div>
                </div>
              </td>
              <td className="listing-actions">
                {listing.alert ? (
                  <button className="btn-review-violation">Review Violation</button>
                ) : (
                  <div className="action-buttons">
                    <button className="btn-action-icon" title="View Details">
                      <ExternalLink size={18} />
                    </button>
                    <button className="btn-action-icon" title="Edit Listing">
                      <Edit size={18} />
                    </button>
                    <button className="btn-action-icon" title="Analytics">
                      <Activity size={18} />
                    </button>
                    <button className="btn-action-icon" title="More Options">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListingTable;
