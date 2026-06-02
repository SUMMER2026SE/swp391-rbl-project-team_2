import { useState, useEffect, useCallback } from 'react';
import { landlordService } from '../services/landlordService';

export const useSchedules = (params = {}) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const paramsString = JSON.stringify(params);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const data = await landlordService.getSchedules(JSON.parse(paramsString));
      setSchedules(data.schedules || data);
      if (data.pagination) {
        setPagination(data.pagination);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [paramsString]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const createSchedule = async (scheduleData) => {
    try {
      const newSchedule = await landlordService.createSchedule(scheduleData);
      setSchedules([newSchedule, ...schedules]);
      return newSchedule;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateSchedule = async (id, scheduleData) => {
    try {
      const updated = await landlordService.updateSchedule(id, scheduleData);
      setSchedules(schedules.map(s => s.id === id ? updated : s));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteSchedule = async (id) => {
    try {
      await landlordService.deleteSchedule(id);
      setSchedules(schedules.filter(s => s.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    schedules,
    loading,
    error,
    pagination,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
};

export default useSchedules;
