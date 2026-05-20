import { useState, useEffect } from 'react';
import { roomService } from '../services/roomService';
import useDebounce from '../../../hooks/useDebounce';

const useRooms = (filters = {}) => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedFilters = useDebounce(filters, 400);

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await roomService.getRooms(debouncedFilters);
        setRooms(data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [JSON.stringify(debouncedFilters)]);

  return { rooms, isLoading, error };
};

export default useRooms;
