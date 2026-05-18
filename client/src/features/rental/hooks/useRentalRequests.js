import { useState, useEffect } from 'react';
import { getRentalRequests } from '../services/rentalService';

export const useRentalRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        const data = await getRentalRequests();
        setRequests(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch rental requests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return { requests, isLoading, error };
};
