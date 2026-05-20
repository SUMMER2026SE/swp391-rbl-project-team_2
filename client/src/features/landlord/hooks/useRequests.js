import { useState, useEffect } from 'react';
import { landlordService } from '../services/landlordService';

export const useRequests = (params = {}) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const data = await landlordService.getRequests(params);
        setRequests(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [params]);

  const approve = async (id) => {
    try {
      const updated = await landlordService.approveRequest(id);
      setRequests(requests.map(r => r.id === id ? updated : r));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const reject = async (id, reason) => {
    try {
      const updated = await landlordService.rejectRequest(id, reason);
      setRequests(requests.map(r => r.id === id ? updated : r));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { requests, loading, error, approve, reject };
};

export default useRequests;
