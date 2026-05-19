import React from 'react';
import clsx from 'clsx';
import { MessageSquare } from 'lucide-react';
import './RequestCard.css';

const RequestCard = ({ request }) => {
  const {
    tenantName,
    initials,
    avatarColor,
    appliedAt,
    status,
    roomName,
    moveInDate,
    message,
  } = request;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'New':
        return 'status-new';
      case 'Under Review':
        return 'status-review';
      case 'Accepted':
        return 'status-accepted';
      case 'Rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  return (
    <div className={clsx('request-card', {
      'card-accepted': status === 'Accepted',
      'card-rejected': status === 'Rejected'
    })}>
      <div className="card-header">
        <div className="tenant-info">
          <div className="avatar" style={{ backgroundColor: avatarColor }}>
            {initials}
          </div>
          <div className="tenant-meta">
            <h3>{tenantName}</h3>
            <p>{appliedAt}</p>
          </div>
        </div>
        <div className={clsx('status-badge', getStatusStyle(status))}>
          {status}
        </div>
      </div>

      <div className="card-details">
        <div className="detail-row">
          <span className="label">SELECTED ROOM</span>
          <span className="value">{roomName}</span>
        </div>
        <div className="detail-row">
          <span className="label">MOVE-IN DATE</span>
          <span className="value">{moveInDate}</span>
        </div>
      </div>

      {message && (
        <div className="message-box">
          <p>{message}</p>
        </div>
      )}

      <div className="card-actions">
        {status === 'New' && (
          <>
            <button className="btn-primary">Review Application</button>
            <button className="btn-secondary">
              <MessageSquare size={16} />
              Message Tenant
            </button>
          </>
        )}
        {status === 'Under Review' && (
          <>
            <button className="btn-primary">Continue Review</button>
            <button className="btn-secondary">
              <MessageSquare size={16} />
              Message Tenant
            </button>
          </>
        )}
        {status === 'Accepted' && (
          <button className="btn-outline">View Lease</button>
        )}
      </div>
    </div>
  );
};

export default RequestCard;
