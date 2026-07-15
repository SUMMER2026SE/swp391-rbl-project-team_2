import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { DollarSign, Users, Home, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import { formatCurrency } from '../../../utils/format';
import adminService from '../../../services/adminService';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeTenants: 0,
    totalListings: 0,
    occupancyRate: '0%',
  });
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for occupancy until backend supports historical occupancy tracking
  const occupancyData = [
    { month: t('adminDashboard.months.Jan', 'Jan'), rate: 85 },
    { month: t('adminDashboard.months.Feb', 'Feb'), rate: 88 },
    { month: t('adminDashboard.months.Mar', 'Mar'), rate: 86 },
    { month: t('adminDashboard.months.Apr', 'Apr'), rate: 92 },
    { month: t('adminDashboard.months.May', 'May'), rate: 90 },
    { month: t('adminDashboard.months.Jun', 'Jun'), rate: parseInt(stats.occupancyRate) || 95 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, chartRes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRevenueChart()
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (chartRes.success) {
          // Display last 6 months for the chart
          const currentMonth = new Date().getMonth();
          const last6Months = chartRes.data.filter((d, i) => i <= currentMonth && i >= currentMonth - 5);
          if (last6Months.length < 6) {
             // fill missing past months if needed
             const padded = chartRes.data.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
             setRevenueData(padded);
          } else {
             setRevenueData(last6Months);
          }
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="admin-page-container"><div className="loading-state">Loading analytics...</div></div>;

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">{t('adminAnalytics.title')}</h1>
        <p className="admin-page-subtitle">{t('adminAnalytics.subtitle')}</p>
      </div>

      <div className="stats-grid">
        <StatCard 
          title={t('adminAnalytics.totalRevenue')}
          value={formatCurrency(stats.totalRevenue)} 
          icon={<DollarSign size={24} />}
          trend="up"
          trendValue="12.5%"
          isCurrency={true}
        />
        <StatCard 
          title={t('adminAnalytics.activeTenants')}
          value={stats.activeTenants} 
          icon={<Users size={24} />}
          trend="up"
          trendValue="4.2%"
        />
        <StatCard 
          title={t('adminAnalytics.totalListings')}
          value={stats.totalListings} 
          icon={<Home size={24} />}
          trend="up"
          trendValue="2"
        />
        <StatCard 
          title={t('adminAnalytics.occupancyRate')}
          value={stats.occupancyRate} 
          icon={<TrendingUp size={24} />}
          trend="up"
          trendValue="5%"
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card chart-large">
          <div className="chart-header">
            <h3>{t('adminAnalytics.revenueOverview')}</h3>
            <select className="chart-filter">
              <option>{t('adminAnalytics.last6Months')}</option>
              <option>{t('adminAnalytics.thisYear')}</option>
            </select>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  tickFormatter={(value) => `${value / 1000000}${t('adminDashboard.million', 'M')}`}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => t(`adminDashboard.months.${label}`, label)}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>{t('adminAnalytics.occupancyRate')}</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={occupancyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
