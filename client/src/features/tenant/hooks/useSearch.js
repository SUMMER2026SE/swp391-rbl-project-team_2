import { useState, useEffect } from 'react';
import { searchService } from '../services/searchService';

export const useSearch = (params = {}) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await searchService.searchRooms(params);
        setRooms(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [params]);

  return { rooms, loading, error };
};

export default useSearch;
