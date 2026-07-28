import { useState, useEffect } from 'react';
import { landlordService } from '../services/landlordService';

export const useLandlordStats = (period, startDate = null, endDate = null) => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [revenueChart, setRevenueChart] = useState(null);
  const [expiringSummary, setExpiringSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const params = { period };
        if (startDate && endDate) {
          params.startDate = startDate;
          params.endDate = endDate;
        }
        
        const [statsData, activityData, revenueData, expiringData] = await Promise.all([
          landlordService.getStats(params),
          landlordService.getRecentActivity(params),
          landlordService.getRevenueChart(params),
          landlordService.getExpiringSummary(),
        ]);
        setStats(statsData.data || statsData);
        setRecentActivity(activityData.data || activityData);
        setRevenueChart(revenueData.data || revenueData);
        setExpiringSummary(expiringData.data || expiringData);
        setError(null);
      } catch (err) {
        setError(err.message);
        setStats(null);
        setRecentActivity(null);
        setRevenueChart(null);
        setExpiringSummary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [period, startDate, endDate]);

  return { stats, recentActivity, revenueChart, expiringSummary, loading, error };
};

export default useLandlordStats;
