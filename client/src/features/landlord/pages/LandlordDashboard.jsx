import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChevronDown,
  Plus,
  MoreVertical,
  ClipboardList,
  CreditCard,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Building2,
  Key,
  Bed,
  Hourglass,
} from 'lucide-react';
import { ROUTES } from '../../../constants';
import Button from '../../../components/common/Button';
import './LandlordDashboard.css';

// SVG Revenue Chart Component with smooth Bezier Spline
const RevenueChart = ({ activeMonth, setActiveMonth }) => {
  const width = 600;
  const height = 280;
  const padL = 60;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  // Chart data points: Jan to May (solid), May to Jun (dashed/projected)
  // Exact visual coordinates aligned with Figma axis: $0, $10k, $30k, $50k
  const data = [12000, 18000, 32000, 24000, 10000, 38000];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  const getX = (i) => padL + (i / (data.length - 1)) * chartW;
  
  // Custom non-linear scale matching the axis tick spacing of Figma
  // Axes ticks are $0, $10k, $30k, $50k
  const getY = (val) => {
    let percentage = 0;
    if (val <= 10000) {
      // 0 to 10k takes up 30% of the height
      percentage = (val / 10000) * 0.3;
    } else if (val <= 30000) {
      // 10k to 30k takes up 40% of the height (from 30% to 70%)
      percentage = 0.3 + ((val - 10000) / 20000) * 0.4;
    } else {
      // 30k to 50k takes up 30% of the height (from 70% to 100%)
      percentage = 0.7 + ((val - 30000) / 20000) * 0.3;
    }
    return padT + chartH - percentage * chartH;
  };

  const points = data.map((val, i) => ({ x: getX(i), y: getY(val), val, month: months[i] }));

  // Generate smooth cubic bezier path
  const getBezierPath = (pts, tension = 0.2) => {
    if (pts.length < 2) return '';
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

  // Splitting points for Solid (Jan-May) and Dashed (May-Jun)
  const solidPoints = points.slice(0, 5);
  const dashedPoints = points.slice(4, 6);

  const solidPath = getBezierPath(solidPoints);
  const dashedPath = getBezierPath(dashedPoints);

  // Gradient area paths
  const solidAreaPath = `${solidPath} L ${solidPoints[solidPoints.length - 1].x} ${padT + chartH} L ${solidPoints[0].x} ${padT + chartH} Z`;
  const dashedAreaPath = `${dashedPath} L ${dashedPoints[dashedPoints.length - 1].x} ${padT + chartH} L ${dashedPoints[0].x} ${padT + chartH} Z`;

  return (
    <div className="revenue-chart-wrapper">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="chartGradientSolid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="chartGradientDashed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y Grid lines & Labels */}
        {[0, 10000, 30000, 50000].map((yVal, i) => {
          const y = getY(yVal);
          const label = yVal === 0 ? '$0' : `$${yVal / 1000}k`;
          return (
            <g key={i} className="chart-grid-line-group">
              <line x1={padL} y1={y} x2={width - padR} y2={y} className="chart-grid-line" />
              <text x={padL - 12} y={y + 4} className="chart-y-label">{label}</text>
            </g>
          );
        })}

        {/* Area fill under curve */}
        <path d={solidAreaPath} fill="url(#chartGradientSolid)" />
        <path d={dashedAreaPath} fill="url(#chartGradientDashed)" />

        {/* Lines */}
        <path d={solidPath} className="chart-line-solid" />
        <path d={dashedPath} className="chart-line-dashed" />

        {/* Interactive indicator bar */}
        {activeMonth !== null && (
          <line 
            x1={points[activeMonth].x} 
            y1={padT} 
            x2={points[activeMonth].x} 
            y2={padT + chartH} 
            className="chart-active-indicator" 
          />
        )}

        {/* Data dots */}
        {points.map((pt, i) => {
          const isMay = pt.month === 'May';
          return (
            <g 
              key={i} 
              className="chart-dot-trigger"
              onMouseEnter={() => setActiveMonth(i)}
            >
              {/* Big hover target circle */}
              <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" style={{ cursor: 'pointer' }} />
              
              {/* Outer active circle ring */}
              {activeMonth === i && (
                <circle cx={pt.x} cy={pt.y} r="8" fill="#2563EB" opacity="0.18" className="chart-active-ring" />
              )}
              
              {/* Inner dot */}
              <circle 
                cx={pt.x} 
                cy={pt.y} 
                r={activeMonth === i ? 6 : 4.5} 
                fill={isMay || activeMonth === i ? '#2563EB' : '#FFFFFF'} 
                stroke="#2563EB" 
                strokeWidth={activeMonth === i ? 2.5 : 2} 
                className="chart-dot-element"
              />
            </g>
          );
        })}

        {/* X labels */}
        {points.map((pt, i) => (
          <g key={i}>
            {pt.month === 'May' && (
              <circle cx={pt.x} cy={height - 29} r="3" fill="#2563EB" />
            )}
            <text 
              x={pt.x} 
              y={height - 8} 
              className={`chart-label ${activeMonth === i ? 'active' : ''} ${pt.month === 'May' ? 'current-month-lbl' : ''}`}
            >
              {pt.month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const LandlordDashboard = () => {
  const navigate = useNavigate();
  const [activeMonth, setActiveMonth] = useState(4); // default May active
  const [showPeriodFilter, setShowPeriodFilter] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('Last 30 Days');

  // Stats matching Figma design precisely
  const stats = [
    {
      label: 'Total Rooms',
      value: '124',
      icon: <Building2 size={20} />,
      iconClass: 'dashboard-stat-icon--blue',
      badge: (
        <span className="dashboard-stat-badge dashboard-stat-badge--success">
          <TrendingUp size={12} /> 2.4%
        </span>
      ),
    },
    {
      label: 'Available Units',
      value: '18',
      icon: <Key size={20} />,
      iconClass: 'dashboard-stat-icon--purple',
      badge: (
        <span className="dashboard-stat-badge dashboard-stat-badge--danger">
          <TrendingDown size={12} /> 5.1%
        </span>
      ),
    },
    {
      label: 'Currently Rented',
      value: '106',
      icon: <Bed size={20} />,
      iconClass: 'dashboard-stat-icon--green',
      badge: (
        <span className="dashboard-stat-badge dashboard-stat-badge--success">
          <TrendingUp size={12} /> 8.2%
        </span>
      ),
    },
    {
      label: 'Pending Requests',
      value: '4',
      icon: <Hourglass size={20} />,
      iconClass: 'dashboard-stat-icon--orange',
      badge: (
        <span className="dashboard-stat-badge dashboard-stat-badge--warning">
          Action Needed
        </span>
      ),
    },
  ];

  // Recent activity list matching Figma
  const activities = [
    {
      id: 1,
      icon: <ClipboardList size={18} />,
      iconClass: 'activity-icon-container--orange',
      text: 'New lease application received for Unit 4B from Sarah Jenkins.',
      time: '2 hours ago',
    },
    {
      id: 2,
      icon: <CreditCard size={18} />,
      iconClass: 'activity-icon-container--blue',
      text: 'Rent payment processed for $1,250 from Unit 12A.',
      time: '5 hours ago',
    },
    {
      id: 3,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&h=80&q=80',
      text: 'Maintenance resolved: Plumbing issue in Unit 3C reported by Emily.',
      time: 'Yesterday',
    },
    {
      id: 4,
      icon: <AlertCircle size={18} />,
      iconClass: 'activity-icon-container--red',
      text: 'Late payment alert for Unit 8D. Grace period ends tomorrow.',
      time: 'Yesterday',
    },
  ];

  const handlePeriodChange = (period) => {
    setFilterPeriod(period);
    setShowPeriodFilter(false);
  };

  const revenueValues = [12000, 18000, 32000, 24000, 10000, 38000];
  const activeRevenue = activeMonth !== null ? revenueValues[activeMonth] : 0;
  const isProjected = activeMonth === 5;

  return (
    <div className="dashboard-container" id="landlord-dashboard">
      
      {/* Overview Page Header */}
      <div className="dashboard-header-block">
        <div className="dashboard-title-box">
          <h1 className="dashboard-main-title">Overview</h1>
          <p className="dashboard-sub-title">Here's what's happening with your properties today.</p>
        </div>
        
        {/* Actions bar (Filter dropdown & Button) */}
        <div className="dashboard-header-actions">
          <div className="dashboard-filter-dropdown-container">
            <button 
              className="dashboard-filter-btn" 
              onClick={() => setShowPeriodFilter(!showPeriodFilter)}
            >
              <Calendar size={16} />
              <span>{filterPeriod}</span>
              <ChevronDown size={14} />
            </button>
            {showPeriodFilter && (
              <div className="dashboard-dropdown-menu">
                {['Last 7 Days', 'Last 30 Days', 'Last 6 Months', 'This Year'].map((p) => (
                  <button 
                    key={p} 
                    className={`dropdown-menu-item ${filterPeriod === p ? 'active' : ''}`}
                    onClick={() => handlePeriodChange(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <Button variant="primary" onClick={() => navigate(ROUTES.LANDLORD.LISTINGS)}>
            <Plus size={16} />
            <span>New Listing</span>
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="dashboard-stats-grid">
        {stats.map((stat, i) => (
          <div className="dashboard-stat-card" key={i}>
            <div className="dashboard-stat-card-header">
              <div className={`dashboard-stat-icon-wrapper ${stat.iconClass}`}>
                {stat.icon}
              </div>
              {stat.badge}
            </div>
            <div className="dashboard-stat-card-body">
              <span className="dashboard-stat-label">{stat.label}</span>
              <h2 className="dashboard-stat-value">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Activity Row */}
      <div className="dashboard-main-layout-row">
        
        {/* Left Column: Revenue Summary */}
        <div className="dashboard-chart-card">
          <div className="dashboard-chart-header">
            <div className="dashboard-chart-title-block">
              <h3 className="chart-card-title">Revenue Summary</h3>
              <p className="chart-card-subtitle">Monthly gross income vs projections</p>
            </div>
            
            <div className="dashboard-chart-menu-box">
              <button className="chart-option-btn">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>
          
          {/* Active stats display bubble on hover */}
          <div className="dashboard-chart-tooltip-display">
            <span className="tooltip-month-indicator">
              {['January', 'February', 'March', 'April', 'May', 'June'][activeMonth]}:
            </span>
            <span className="tooltip-value-indicator">
              ${activeRevenue.toLocaleString()}
            </span>
            {isProjected ? (
              <span className="tooltip-projected-tag">Projected</span>
            ) : (
              <span className="tooltip-actual-tag">Actual</span>
            )}
          </div>

          <div className="dashboard-chart-container">
            <RevenueChart activeMonth={activeMonth} setActiveMonth={setActiveMonth} />
          </div>
          
          <div className="chart-legend-row">
            <div className="legend-item">
              <span className="legend-dot legend-dot--blue"></span>
              <span className="legend-label">Actual Income</span>
            </div>
            <div className="legend-item">
              <span className="legend-line legend-line--dashed"></span>
              <span className="legend-label">Projections</span>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="dashboard-activity-card">
          <div className="dashboard-activity-header">
            <h3 className="activity-card-title">Recent Activity</h3>
            <Link to={ROUTES.LANDLORD.REQUESTS} className="activity-view-all-link">
              View All
            </Link>
          </div>
          
          <div className="dashboard-activity-list">
            {activities.map((act) => (
              <div className="activity-list-item" key={act.id}>
                <div className="activity-avatar-or-icon">
                  {act.avatar ? (
                    <div className="activity-avatar-img-container">
                      <img src={act.avatar} alt="User Avatar" />
                    </div>
                  ) : (
                    <div className={`activity-icon-container ${act.iconClass}`}>
                      {act.icon}
                    </div>
                  )}
                </div>
                <div className="activity-item-content">
                  <p className="activity-text-message">{act.text}</p>
                  <span className="activity-time-stamp">{act.time}</span>
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
