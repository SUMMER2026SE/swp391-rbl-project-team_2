import React from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Home,
  ClipboardList,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { ROUTES } from '../../../constants';
import Button from '../../../components/common/Button';
import './LandlordDashboard.css';

// Mock data matches the Figma numbers exactly
const stats = [
  {
    label: 'Total Revenue',
    value: '$124,500',
    icon: <DollarSign size={22} />,
    iconClass: 'stat-card__icon--blue',
    badge: '+12.5%',
    badgeClass: 'stat-card__badge--success',
  },
  {
    label: 'Active Listings',
    value: '48',
    icon: <Home size={22} />,
    iconClass: 'stat-card__icon--green',
    badge: null,
    badgeClass: '',
  },
  {
    label: 'Pending Requests',
    value: '12',
    icon: <ClipboardList size={22} />,
    iconClass: 'stat-card__icon--red',
    badge: 'Requires Action',
    badgeClass: 'stat-card__badge--danger',
  },
  {
    label: 'Average Occupancy',
    value: '94%',
    icon: <TrendingUp size={22} />,
    iconClass: 'stat-card__icon--purple',
    badge: '+2.1%',
    badgeClass: 'stat-card__badge--success',
  },
];

const recentRequests = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    detail: 'Apt 4B, The Grand - 12',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80',
    initials: 'SJ',
  },
  {
    id: 2,
    name: 'David Miller',
    detail: 'Studio 2, Westside - 6',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80',
    initials: 'DM',
  },
  {
    id: 3,
    name: 'Emily Chen',
    detail: 'Loft 1A, Downtown - 12',
    avatar: null, // text avatar like Figma
    initials: 'EM',
  },
];

// SVG Revenue Chart Component with smooth Bezier Spline
const RevenueChart = () => {
  const width = 520;
  const height = 260;
  const padL = 50;
  const padR = 20;
  const padT = 15;
  const padB = 30;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  // Exact visual coordinates alignment from Figma screenshot:
  // Jan (~15k), Feb (~10k), Mar (~23k), Apr (~30k), May (~10k), Jun (~38k)
  const data = [15000, 10000, 23000, 30000, 10000, 38000];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const maxVal = 40000;
  const yLabels = ['$0', '$10k', '$20k', '$30k', '$40k'];

  const getX = (i) => padL + (i / (data.length - 1)) * chartW;
  const getY = (val) => padT + chartH - (val / maxVal) * chartH;

  const points = data.map((val, i) => ({ x: getX(i), y: getY(val) }));

  // Generate smooth cubic bezier path
  const getBezierPath = (pts, tension = 0.2) => {
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const prev = pts[i - 1] || curr;
      const nextNext = pts[i + 2] || next;

      const cp1x = curr.x + (next.x - prev.x) * tension;
      const cp1y = curr.y + (next.y - prev.y) * tension;
      const cp2x = next.x - (nextNext.x - curr.x) * tension;
      const cp2y = next.y - (nextNext.y - curr.y) * tension;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const linePath = getBezierPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padT + chartH} L ${points[0].x} ${padT + chartH} Z`;

  return (
    <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yLabels.map((_, i) => {
        const y = padT + chartH - (i / (yLabels.length - 1)) * chartH;
        return (
          <line key={i} x1={padL} y1={y} x2={padL + chartW} y2={y} className="chart-grid-line" />
        );
      })}

      {/* Y labels */}
      {yLabels.map((label, i) => {
        const y = padT + chartH - (i / (yLabels.length - 1)) * chartH;
        return (
          <text key={i} x={padL - 10} y={y + 4} className="chart-y-label">{label}</text>
        );
      })}

      {/* Area fill under curve */}
      <path d={areaPath} className="chart-area" />

      {/* Curved Line */}
      <path d={linePath} className="chart-line" />

      {/* Data dots */}
      {points.map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r="5" fill="#2563EB" stroke="white" strokeWidth="2.5" />
      ))}

      {/* X labels */}
      {months.map((month, i) => (
        <text key={i} x={getX(i)} y={height - 5} textAnchor="middle" className="chart-label">{month}</text>
      ))}
    </svg>
  );
};

const LandlordDashboard = () => {
  return (
    <div className="dashboard" id="landlord-dashboard">
      {/* Header */}
      <div className="dashboard__header">
        <div className="dashboard__header-text">
          <h1>Welcome back, Admin</h1>
          <p>Here is an overview of your properties today.</p>
        </div>
        <div className="dashboard__header-action">
          <Button variant="primary" icon={<Plus size={18} />}>
            Create New Listing
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="dashboard__stats">
        {stats.map((stat, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-card__top">
              <div className={`stat-card__icon ${stat.iconClass}`}>
                {stat.icon}
              </div>
              {stat.badge && (
                <span className={`stat-card__badge ${stat.badgeClass}`}>
                  {stat.badge}
                </span>
              )}
            </div>
            <div>
              <div className="stat-card__label">{stat.label}</div>
              <div className="stat-card__value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="dashboard__bottom">
        {/* Revenue Chart */}
        <div className="dashboard__chart-card">
          <div className="dashboard__chart-header">
            <h3>Revenue Overview</h3>
            <select className="dashboard__chart-filter">
              <option>Last 6 Months</option>
              <option>Last Year</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="dashboard__chart-area">
            <RevenueChart />
          </div>
        </div>

        {/* Recent Requests */}
        <div className="dashboard__requests-card">
          <div className="dashboard__requests-header">
            <h3>Recent Requests</h3>
            <Link to={ROUTES.LANDLORD.REQUESTS}>View All</Link>
          </div>
          <div>
            {recentRequests.map((req) => (
              <div className="request-item" key={req.id}>
                <div className={`request-item__avatar ${req.avatar ? '' : 'request-item__avatar--initials'}`}>
                  {req.avatar ? (
                    <img src={req.avatar} alt={req.name} />
                  ) : (
                    req.initials
                  )}
                </div>
                <div className="request-item__info">
                  <div className="request-item__name">{req.name}</div>
                  <div className="request-item__detail">{req.detail}</div>
                </div>
                <div className="request-item__actions">
                  <button className="request-item__btn request-item__btn--accept">Accept</button>
                  <button className="request-item__btn request-item__btn--view">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;
