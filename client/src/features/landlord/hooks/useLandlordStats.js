import { useState, useEffect } from 'react';
import { landlordService } from '../services/landlordService';

export const useLandlordStats = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [revenueChart, setRevenueChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [statsData, activityData, revenueData] = await Promise.all([
          landlordService.getStats(),
          landlordService.getRecentActivity(),
          landlordService.getRevenueChart(),
        ]);
        setStats(statsData.data || statsData);
        setRecentActivity(activityData.data || activityData);
        setRevenueChart(revenueData.data || revenueData);
        setError(null);
      } catch (err) {
        setError(err.message);
        setStats(null);
        setRecentActivity(null);
        setRevenueChart(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, recentActivity, revenueChart, loading, error };
};

export default useLandlordStats;
