import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Home, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  X, 
  CheckCircle2, 
  Check,
  RotateCw
} from 'lucide-react';
import './RentalRequestManagementPage.css';

// Initial Mock Applicants/Applications data
const INITIAL_APPLICATIONS = [
  {
    id: 'APP-101',
    name: 'Sarah Jenkins',
    title: 'Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&auto=format&fit=crop&q=80',
    matchScore: 98,
    matchLabel: '98% Match',
    property: 'Apt 4B, The Grand',
    moveIn: 'Oct 1, 2024',
    rent: '$2,400/mo (Verified)',
    message: "Hi, I'm relocating for a new job and love the building amenities. I have great references and am looking for a quiet place.",
    status: 'new_request',
    checks: null
  },
  {
    id: 'APP-102',
    name: 'Marcus Reed',
    title: 'Graduate Student',
    avatar: null, // MR initials
    matchScore: 85,
    matchLabel: 'Pending Checks',
    property: 'Studio 12, Westside',
    moveIn: 'ASAP',
    rent: null, // Hide rent for Marcus Reed to match Figma
    message: null,
    status: 'new_request',
    checks: 'pending'
  },
  {
    id: 'APP-103',
    name: 'David Chen',
    title: 'Freelance Designer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&auto=format&fit=crop&q=80',
    matchScore: 90,
    matchLabel: '90% Match',
    property: 'Unit 12, Riverstone Appts',
    moveIn: 'Oct 15, 2024',
    rent: '$1,950/mo',
    message: null,
    status: 'under_review',
    checks: {
      creditCheck: 'Completed',
      references: 'Awaiting'
    },
    reminderSent: false
  }
];

const RentalRequestManagementPage = () => {
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [matchThreshold, setMatchThreshold] = useState(0);

  // Handlers
  const handleApprove = (id) => {
    setApplications(prev => prev.map(app => {
      if (app.id === id) {
        return { ...app, status: 'approved' };
      }
      return app;
    }));
  };

  const handleReview = (id) => {
    setApplications(prev => prev.map(app => {
      if (app.id === id) {
        return { 
          ...app, 
          status: 'under_review',
          checks: {
            creditCheck: 'Completed',
            references: 'Awaiting'
          }
        };
      }
      return app;
    }));
  };

  const handleReject = (id) => {
    if (window.confirm('Are you sure you want to reject this application?')) {
      setApplications(prev => prev.filter(app => app.id !== id));
    }
  };

  const handleSendReminder = (id) => {
    setApplications(prev => prev.map(app => {
      if (app.id === id) {
        return { ...app, reminderSent: true };
      }
      return app;
    }));
  };

  // Filter application list
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.property.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesScore = app.matchScore >= matchThreshold;

    return matchesSearch && matchesScore;
  });

  // Split into columns
  const newRequests = filteredApplications.filter(app => app.status === 'new_request');
  const underReview = filteredApplications.filter(app => app.status === 'under_review');
  const approved = filteredApplications.filter(app => app.status === 'approved');

  return (
    <div className="rental-requests-container" id="rental-requests-dashboard">
      
      {/* Top Header Grid */}
      <div className="rental-requests-header-row">
        <div>
          <h1 className="rental-requests-main-title">Rental Requests</h1>
          <p className="rental-requests-sub-title">Review and manage incoming tenant applications.</p>
        </div>

        <div className="rental-requests-search-actions">
          {/* Search Box */}
          <div className="applicants-search-box">
            <Search size={18} className="applicants-search-icon" />
            <input 
              type="text" 
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          {/* Filter Trigger Button */}
          <div className="filter-dropdown-wrapper">
            <button 
              className={`btn-applicants-filter ${showFilterDropdown ? 'active' : ''}`}
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <SlidersHorizontal size={16} />
              <span>Filter</span>
            </button>

            {showFilterDropdown && (
              <div className="applicants-filter-menu">
                <div className="filter-menu-header">Filter Options</div>
                <div className="filter-menu-body">
                  <label className="filter-score-label">
                    <span>Minimum Match Score:</span>
                    <span className="threshold-val">{matchThreshold}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="95" 
                    step="5"
                    value={matchThreshold}
                    onChange={(e) => setMatchThreshold(parseInt(e.target.value))}
                    className="match-score-slider"
                  />
                  <div className="slider-limits">
                    <span>0%</span>
                    <span>50%</span>
                    <span>95%</span>
                  </div>
                </div>
                <div className="filter-menu-footer">
                  <button 
                    className="btn-clear-menu-filter"
                    onClick={() => {
                      setMatchThreshold(0);
                      setShowFilterDropdown(false);
                    }}
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board Row */}
      <div className="requests-kanban-board">
        
        {/* Column 1: New Requests */}
        <div className="kanban-column">
          <div className="kanban-column-header">
            <div className="column-title-box">
              <span className="column-indicator-dot dot-blue"></span>
              <h3>New Requests</h3>
            </div>
            <span className="column-count-badge">{newRequests.length}</span>
          </div>

          <div className="kanban-column-cards">
            {newRequests.length > 0 ? (
              newRequests.map(app => (
                <div className="kanban-card entry-animated" key={app.id}>
                  {/* Card Header Profile */}
                  <div className="kanban-card-profile">
                    <div className="profile-details-left">
                      {app.avatar ? (
                        <img src={app.avatar} alt={app.name} className="kanban-avatar" />
                      ) : (
                        <div className="kanban-avatar-initials">
                          {app.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <div className="profile-name-box">
                        <h4>{app.name}</h4>
                        <span className="profile-job-title">{app.title}</span>
                      </div>
                    </div>
                    
                    {/* Top Right Match Tag */}
                    <span className={`match-badge-tag ${app.matchScore >= 90 ? 'match-high' : 'match-pending'}`}>
                      {app.matchLabel}
                    </span>
                  </div>

                  {/* Card Location Details */}
                  <div className="kanban-card-details-list">
                    <div className="card-detail-item">
                      <Home size={15} className="detail-icon" />
                      <span>{app.property}</span>
                    </div>
                    <div className="card-detail-item">
                      <Calendar size={15} className="detail-icon" />
                      <span>Move-in: {app.moveIn.replace('Move-in: ', '')}</span>
                    </div>
                    {app.rent && (
                      <div className="card-detail-item">
                        <DollarSign size={15} className="detail-icon" />
                        <span>{app.rent}</span>
                      </div>
                    )}
                  </div>

                  {/* Message Quote Bubble (Conditional) */}
                  {app.message && (
                    <div className="kanban-card-message-bubble">
                      <p>{app.message}</p>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="kanban-card-actions-row">
                    {app.checks === 'pending' ? (
                      <>
                        <button 
                          className="btn-card-action-blue"
                          onClick={() => handleReview(app.id)}
                        >
                          Review
                        </button>
                        <button 
                          className="btn-card-icon-action chat"
                          title="Chat with applicant"
                          onClick={() => toast(`Starting direct conversation with ${app.name}...`)}
                        >
                          <MessageSquare size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          className="btn-card-action-blue"
                          onClick={() => handleApprove(app.id)}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn-card-icon-action chat"
                          title="Chat with applicant"
                          onClick={() => toast(`Starting direct conversation with ${app.name}...`)}
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button 
                          className="btn-card-icon-action reject"
                          title="Reject application"
                          onClick={() => handleReject(app.id)}
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="column-empty-state">
                <p>No new requests available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Under Review */}
        <div className="kanban-column">
          <div className="kanban-column-header">
            <div className="column-title-box">
              <span className="column-indicator-dot dot-gold"></span>
              <h3>Under Review</h3>
            </div>
            <span className="column-count-badge">{underReview.length}</span>
          </div>

          <div className="kanban-column-cards">
            {underReview.length > 0 ? (
              underReview.map(app => (
                <div className="kanban-card entry-animated" key={app.id}>
                  {/* Profile Row */}
                  <div className="kanban-card-profile">
                    <div className="profile-details-left">
                      {app.avatar ? (
                        <img src={app.avatar} alt={app.name} className="kanban-avatar" />
                      ) : (
                        <div className="kanban-avatar-initials">
                          {app.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <div className="profile-name-box">
                        <h4>{app.name}</h4>
                        <span className="profile-job-title">{app.title}</span>
                      </div>
                    </div>
                  </div>

                  {/* Verification checklist details (Specific to Under Review) */}
                  <div className="verification-checks-box">
                    <div className="check-row">
                      <span className="check-label-text">Credit Check</span>
                      <span className="check-status-val completed">Completed</span>
                    </div>
                    <div className="check-row">
                      <span className="check-label-text">References</span>
                      {app.reminderSent ? (
                        <span className="check-status-val completed">Reminded</span>
                      ) : (
                        <span className="check-status-val awaiting">
                          <RotateCw size={12} className="awaiting-icon" />
                          <span>Awaiting</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Send Reminder button row */}
                  <div className="under-review-actions-row">
                    <button 
                      className={`btn-send-reminder ${app.reminderSent ? 'sent' : ''}`}
                      disabled={app.reminderSent}
                      onClick={() => handleSendReminder(app.id)}
                    >
                      {app.reminderSent ? (
                        <>
                          <Check size={14} />
                          <span>Reminder Sent</span>
                        </>
                      ) : (
                        <span>Send Reminder</span>
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="column-empty-state">
                <p>No applications currently under review.</p>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Approved (Awaiting Deposit) */}
        <div className="kanban-column">
          <div className="kanban-column-header">
            <div className="column-title-box">
              <span className="column-indicator-dot dot-blue"></span>
              <h3>Approved (Awaiting Deposit)</h3>
            </div>
            <span className="column-count-badge">{approved.length}</span>
          </div>

          <div className="kanban-column-cards">
            {approved.length > 0 ? (
              approved.map(app => (
                <div className="kanban-card entry-animated card-approved-highlight" key={app.id}>
                  {/* Card Profile */}
                  <div className="kanban-card-profile">
                    <div className="profile-details-left">
                      {app.avatar ? (
                        <img src={app.avatar} alt={app.name} className="kanban-avatar" />
                      ) : (
                        <div className="kanban-avatar-initials">
                          {app.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <div className="profile-name-box">
                        <h4>{app.name}</h4>
                        <span className="profile-job-title">{app.title}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Location Details */}
                  <div className="kanban-card-details-list">
                    <div className="card-detail-item">
                      <Home size={15} className="detail-icon" />
                      <span>{app.property}</span>
                    </div>
                    <div className="card-detail-item">
                      <Calendar size={15} className="detail-icon" />
                      <span>Move-in: {app.moveIn.replace('Move-in: ', '')}</span>
                    </div>
                  </div>

                  <div className="lease-deposit-status-box">
                    <CheckCircle2 size={16} className="text-green" />
                    <span>Lease agreement dispatched. Awaiting security deposit invoice payment.</span>
                  </div>

                  {/* Actions */}
                  <div className="kanban-card-actions-row">
                    <button 
                      className="btn-card-action-blue"
                      onClick={() => toast(`Recording security deposit manual check for ${app.name}...`)}
                    >
                      Record Deposit
                    </button>
                    <button 
                      className="btn-card-icon-action chat"
                      title="Send message"
                      onClick={() => toast(`Opening conversation to prompt ${app.name} for deposit payment...`)}
                    >
                      <MessageSquare size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // Double Circle Checkmark Empty State matches Figma
              <div className="column-empty-state-dashed">
                <div className="empty-double-circle-icon">
                  <CheckCircle2 size={40} strokeWidth={1.5} className="gray-circle-svg" />
                </div>
                <p className="empty-state-headline">No approved applications currently awaiting deposit.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default RentalRequestManagementPage;
