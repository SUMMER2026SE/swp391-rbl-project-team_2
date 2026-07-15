import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Home, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import { formatCurrency } from '../../../utils/format';
import adminService from '../../../services/adminService';
import { useTranslation } from 'react-i18next';
import './DashboardPage.css';

const DashboardPage = () => {
  const { t } = useTranslation();
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
    return <div className="admin-page-container"><div className="loading-state">{t('adminDashboard.loading', 'Loading dashboard...')}</div></div>;
  }

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">{t('adminDashboard.title', 'Dashboard')}</h1>
        <p className="admin-page-subtitle">{t('adminDashboard.subtitle', "Welcome back! Here's what's happening today.")}</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title={t('adminDashboard.totalRevenue', 'Total Revenue (This Month)')}
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign size={24} />}
          trend="up"
          trendValue="12.5%"
          isCurrency
        />
        <StatCard
          title={t('adminDashboard.activeTenants', 'Active Tenants')}
          value={stats.activeTenants}
          icon={<Users size={24} />}
          trend="up"
          trendValue="4.2%"
        />
        <StatCard
          title={t('adminDashboard.totalListings', 'Total Listings')}
          value={stats.totalListings}
          icon={<Home size={24} />}
          trend="up"
          trendValue="2"
        />
        <StatCard
          title={t('adminDashboard.pendingApprovals', 'Pending Approvals')}
          value={stats.pendingListings}
          icon={<Clock size={24} color="#e11d48" />}
          trend={stats.pendingListings > 0 ? "up" : "none"}
          trendValue={stats.pendingListings > 0 ? t('adminDashboard.actionNeeded', "Action needed") : t('adminDashboard.allClear', "All clear")}
        />
        <StatCard
          title={t('adminDashboard.occupancyRate', 'Occupancy Rate')}
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
            <h3>{t('adminDashboard.revenueOverview', 'Revenue Overview')}</h3>
            <select className="chart-filter">
              <option>{t('adminDashboard.thisYear', 'This Year')}</option>
            </select>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(month) => t(`adminDashboard.months.${month}`, month)} 
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v / 1000000}${t('adminDashboard.million', 'M')}`}
                />
                <Tooltip 
                  formatter={(v) => formatCurrency(v)} 
                  labelFormatter={(label) => t(`adminDashboard.months.${label}`, label)}
                  cursor={{ fill: '#f8fafc' }} 
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-card">
          <div className="chart-header">
            <h3>{t('adminDashboard.recentActivity', 'Recent Activity')}</h3>
          </div>
          <ul className="activity-list">
            {recentActivity.length > 0 ? (
              recentActivity.map((item) => {
                let activityMessage = item.message;
                if (item.type === 'Request') {
                  const match = item.message.match(/^(.*?) submitted a rental request for (.*?)$/);
                  if (match) {
                    activityMessage = t('adminDashboard.requestActivity', '{{name}} submitted a rental request for {{room}}', { name: match[1], room: match[2] });
                  }
                } else if (item.type === 'Payment') {
                  const match = item.message.match(/^(.*?) paid rent for (.*?)$/);
                  if (match) {
                    activityMessage = t('adminDashboard.paymentActivity', '{{name}} paid rent for {{room}}', { name: match[1], room: match[2] });
                  }
                }

                let timeStr = item.time;
                if (item.rawTime) {
                  const diffMs = new Date() - new Date(item.rawTime);
                  const diffMins = Math.floor(diffMs / 60000);
                  if (diffMins < 1) {
                    timeStr = t('adminDashboard.timeAgo.justNow', 'Just now');
                  } else if (diffMins < 60) {
                    timeStr = t('adminDashboard.timeAgo.mins', '{{count}} min ago', { count: diffMins });
                  } else if (diffMins < 1440) {
                    timeStr = t('adminDashboard.timeAgo.hrs', '{{count}} hr ago', { count: Math.floor(diffMins / 60) });
                  } else {
                    timeStr = t('adminDashboard.timeAgo.days', '{{count}} days ago', { count: Math.floor(diffMins / 1440) });
                  }
                }
                
                return (
                  <li key={item.id} className="activity-item">
                    <div className="activity-dot" />
                    <div className="activity-content">
                      <span className="activity-type">{t(`adminDashboard.types.${item.type}`, item.type.toUpperCase())}</span>
                      <p className="activity-message">{activityMessage}</p>
                      <span className="activity-time">{timeStr}</span>
                    </div>
                  </li>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm py-4 text-center">{t('adminDashboard.noActivity', 'No recent activity.')}</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
