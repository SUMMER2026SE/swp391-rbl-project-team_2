import { useState, useEffect, useCallback } from 'react';
import { landlordService } from '../services/landlordService';

export const useComplaints = (params = {}) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const paramsString = JSON.stringify(params);

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const data = await landlordService.getComplaints(JSON.parse(paramsString));
      setComplaints(data.complaints || data);
      if (data.pagination) {
        setPagination(data.pagination);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [paramsString]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const updateStatus = async (id, status) => {
    try {
      const updated = await landlordService.updateComplaintStatus(id, status);
      setComplaints(complaints.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updatePriority = async (id, priority) => {
    try {
      const updated = await landlordService.updateComplaintPriority(id, priority);
      setComplaints(complaints.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    complaints,
    loading,
    error,
    pagination,
    fetchComplaints,
    updateStatus,
    updatePriority,
  };
};

export default useComplaints;
