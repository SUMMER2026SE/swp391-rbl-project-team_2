import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { DollarSign, Users, Home, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import { formatCurrency } from '../../../utils/format';
import './AnalyticsPage.css';

// Mock Data
const revenueData = [
  { month: 'Jan', revenue: 45000000 },
  { month: 'Feb', revenue: 52000000 },
  { month: 'Mar', revenue: 48000000 },
  { month: 'Apr', revenue: 61000000 },
  { month: 'May', revenue: 59000000 },
  { month: 'Jun', revenue: 75000000 },
];

const occupancyData = [
  { month: 'Jan', rate: 85 },
  { month: 'Feb', rate: 88 },
  { month: 'Mar', rate: 86 },
  { month: 'Apr', rate: 92 },
  { month: 'May', rate: 90 },
  { month: 'Jun', rate: 95 },
];

const AnalyticsPage = () => {
  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Reports & Analytics</h1>
        <p className="admin-page-subtitle">Overview of your business performance and property statistics.</p>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Total Revenue (This Month)" 
          value={formatCurrency(75000000)} 
          icon={<DollarSign size={24} />}
          trend="up"
          trendValue="12.5%"
          isCurrency={true}
        />
        <StatCard 
          title="Active Tenants" 
          value={124} 
          icon={<Users size={24} />}
          trend="up"
          trendValue="4.2%"
        />
        <StatCard 
          title="Total Listings" 
          value={45} 
          icon={<Home size={24} />}
          trend="up"
          trendValue="2"
        />
        <StatCard 
          title="Occupancy Rate" 
          value="95%" 
          icon={<TrendingUp size={24} />}
          trend="up"
          trendValue="5%"
        />
      </div>

      <div className="charts-grid">
        <div className="chart-card chart-large">
          <div className="chart-header">
            <h3>Revenue Overview</h3>
            <select className="chart-filter">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Occupancy Rate</h3>
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
