import React, { useState, useMemo } from 'react';
import FilterBar from '../components/FilterBar';
import RequestCard from '../components/RequestCard';
import { useRentalRequests } from '../hooks/useRentalRequests';
import './RentalRequestManagementPage.css';

const RentalRequestManagementPage = () => {
  const { requests, isLoading, error } = useRentalRequests();
  const [currentFilter, setCurrentFilter] = useState('All');

  const filteredRequests = useMemo(() => {
    if (currentFilter === 'All') return requests;
    return requests.filter(req => req.status === currentFilter);
  }, [requests, currentFilter]);

  return (
    <div className="rental-page">
      <div className="page-header">
        <div className="header-content">
          <h2 className="page-title">Rental Requests</h2>
          <p className="page-subtitle">Manage incoming applications and tenant communications.</p>
        </div>
        <FilterBar currentFilter={currentFilter} onFilterChange={setCurrentFilter} />
      </div>

      {isLoading ? (
        <div className="loading-state">Loading requests...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <div className="requests-grid">
          {filteredRequests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))}
          {filteredRequests.length === 0 && (
            <div className="empty-state">No requests found for this filter.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default RentalRequestManagementPage;
