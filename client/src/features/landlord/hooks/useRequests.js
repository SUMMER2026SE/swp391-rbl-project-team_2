import { useState, useEffect, useCallback } from 'react';
import { landlordService } from '../services/landlordService';

export const useRequests = (params = {}) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await landlordService.getRequests(params);
      
      // response is { success, data: [...], pagination: {...} }
      // httpClient interceptor already unwrapped axios response.data
      if (response && response.data) {
        setRequests(Array.isArray(response.data) ? response.data : []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else if (Array.isArray(response)) {
        setRequests(response);
      } else {
        setRequests([]);
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const approve = async (id) => {
    try {
      await landlordService.approveRequest(id);
      // Refresh requests after approval
      await fetchRequests();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to approve request';
      setError(msg);
      throw new Error(msg);
    }
  };

  const reject = async (id, reason) => {
    try {
      await landlordService.rejectRequest(id, reason);
      // Refresh requests after rejection
      await fetchRequests();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to reject request';
      setError(msg);
      throw new Error(msg);
    }
  };

  return { requests, loading, error, pagination, approve, reject, refetch: fetchRequests };
};

export default useRequests;
