import { useState, useEffect, useCallback } from 'react';
import { landlordService } from '../services/landlordService';

export const usePayments = (params = {}) => {
  const [payments, setPayments] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const paramsString = JSON.stringify(params);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await landlordService.getPayments(JSON.parse(paramsString));
      setPayments(data.payments || data);
      if (data.pagination) {
        setPagination(data.pagination);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [paramsString]);

  const fetchStatistics = useCallback(async () => {
    try {
      const data = await landlordService.getPaymentStatistics(JSON.parse(paramsString));
      setStatistics(data);
    } catch (err) {
      setError(err.message);
    }
  }, [paramsString]);

  useEffect(() => {
    fetchPayments();
    fetchStatistics();
  }, [fetchPayments, fetchStatistics]);

  return {
    payments,
    statistics,
    loading,
    error,
    pagination,
    fetchPayments,
    fetchStatistics,
  };
};

export default usePayments;
