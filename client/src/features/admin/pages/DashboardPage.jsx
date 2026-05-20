import { DollarSign, Users, Home, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import { formatCurrency } from '../../../utils/format';
import './DashboardPage.css';

const revenueData = [
  { month: 'Jan', revenue: 45000000 },
  { month: 'Feb', revenue: 52000000 },
  { month: 'Mar', revenue: 48000000 },
  { month: 'Apr', revenue: 61000000 },
  { month: 'May', revenue: 59000000 },
  { month: 'Jun', revenue: 75000000 },
];

const recentActivity = [
  { id: 1, type: 'New Tenant', message: 'Nguyen Van A signed a lease for Room 101', time: '2 min ago' },
  { id: 2, type: 'Payment', message: 'Tran Thi B paid rent for Room 205', time: '15 min ago' },
  { id: 3, type: 'Request', message: 'Le Van C submitted a maintenance request', time: '1 hr ago' },
  { id: 4, type: 'New Listing', message: 'Room 302 at Sunrise Tower was published', time: '3 hr ago' },
];

const DashboardPage = () => {
  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Revenue (This Month)"
          value={formatCurrency(75000000)}
          icon={<DollarSign size={24} />}
          trend="up"
          trendValue="12.5%"
          isCurrency
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

      <div className="dashboard-grid">
        {/* Revenue Chart */}
        <div className="chart-card chart-large">
          <div className="chart-header">
            <h3>Revenue Overview</h3>
            <select className="chart-filter">
              <option>Last 6 Months</option>
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
            {recentActivity.map((item) => (
              <li key={item.id} className="activity-item">
                <div className="activity-dot" />
                <div className="activity-content">
                  <span className="activity-type">{item.type}</span>
                  <p className="activity-message">{item.message}</p>
                  <span className="activity-time">{item.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
