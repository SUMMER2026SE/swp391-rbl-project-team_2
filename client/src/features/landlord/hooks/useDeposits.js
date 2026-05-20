import { useState, useEffect } from 'react';
import { landlordService } from '../services/landlordService';

export const useDeposits = (params = {}) => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        setLoading(true);
        const data = await landlordService.getDeposits(params);
        setDeposits(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setDeposits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeposits();
  }, [params]);

  const updateStatus = async (id, status) => {
    try {
      const updated = await landlordService.updateDepositStatus(id, status);
      setDeposits(deposits.map(d => d.id === id ? updated : d));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { deposits, loading, error, updateStatus };
};

export default useDeposits;
