import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Home, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import { formatCurrency } from '../../../utils/format';
import adminService from '../../../services/adminService';
import './DashboardPage.css';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeTenants: 0,
    totalListings: 0,
    pendingListings: 0,
    occupancyRate: '0%',
  });
  const [revenueData, setRevenueData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartRes, activityRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRevenueChart(),
        adminService.getRecentActivities(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (chartRes.success) setRevenueData(chartRes.data);
      if (activityRes.success) setRecentActivity(activityRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-page-container"><div className="loading-state">Loading dashboard...</div></div>;
  }

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Revenue (This Month)"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign size={24} />}
          trend="up"
          trendValue="12.5%"
          isCurrency
        />
        <StatCard
          title="Active Tenants"
          value={stats.activeTenants}
          icon={<Users size={24} />}
          trend="up"
          trendValue="4.2%"
        />
        <StatCard
          title="Total Listings"
          value={stats.totalListings}
          icon={<Home size={24} />}
          trend="up"
          trendValue="2"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingListings}
          icon={<Clock size={24} color="#e11d48" />}
          trend={stats.pendingListings > 0 ? "up" : "none"}
          trendValue={stats.pendingListings > 0 ? "Action needed" : "All clear"}
        />
        <StatCard
          title="Occupancy Rate"
          value={stats.occupancyRate}
          icon={<TrendingUp size={24} />}
          trend="up"
          trendValue="5%"
        />
      </div>

      <div className="dashboard-grid">
        {/* Revenue Chart */}
        <div className="chart-card chart-large">
          <div className="chart-header">
            <h3>Revenue Overview</h3>
            <select className="chart-filter">
              <option>This Year</option>
            </select>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v / 1000000}M`}
                />
                <Tooltip formatter={(v) => formatCurrency(v)} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-card">
          <div className="chart-header">
            <h3>Recent Activity</h3>
          </div>
          <ul className="activity-list">
            {recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <li key={item.id} className="activity-item">
                  <div className="activity-dot" />
                  <div className="activity-content">
                    <span className="activity-type">{item.type}</span>
                    <p className="activity-message">{item.message}</p>
                    <span className="activity-time">{item.time}</span>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-sm py-4 text-center">No recent activity.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
