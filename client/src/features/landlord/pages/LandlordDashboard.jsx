import React, { useState, useEffect } from 'react';
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
  Timer,
  CheckCircle2,
} from 'lucide-react';
import { ROUTES } from '../../../constants';
import Button from '../../../components/common/Button';
import useAuthStore from '../../../store/useAuthStore';
import { useLandlordStats } from '../hooks/useLandlordStats';
import { useTranslation } from 'react-i18next';
import './LandlordDashboard.css';

// SVG Revenue Column Chart Component
const RevenueChart = ({ activeMonth, setActiveMonth, data, months }) => {
  const width = 600;
  const height = 280;
  const padL = 60;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  
  const getX = (i) => padL + (i / (Math.max(1, data.length - 1))) * chartW;
  
  // Dynamic scale based on data max value
  const maxVal = Math.max(...data, 1000000);
  let maxScale = Math.ceil((maxVal * 1.2) / 1000000) * 1000000;
  // Ensure divisible by 3 for nice tick intervals
  maxScale = Math.ceil(maxScale / 3000000) * 3000000;

  const getY = (val) => {
    return padT + chartH - (val / maxScale) * chartH;
  };

  const yTicks = [0, maxScale / 3, (maxScale * 2) / 3, maxScale];

  const formatYLabel = (val) => {
    if (val === 0) return '0 đ';
    if (val >= 1000000000) return `${+(val / 1000000000).toFixed(1)}Tỷ`;
    if (val >= 1000000) return `${+(val / 1000000).toFixed(1)}Tr`;
    if (val >= 1000) return `${+(val / 1000).toFixed(1)}k`;
    return `${val}`;
  };

  const points = data.map((val, i) => ({ x: getX(i), y: getY(val), val, label: months[i] }));
  
  const maxBars = Math.max(points.length, 1);
  const barWidth = Math.min(36, (chartW / maxBars) * 0.6); 
  const linePath = points.length > 0 ? `M ${points.map(pt => `${pt.x},${pt.y}`).join(' L ')}` : '';

  return (
    <div className="revenue-chart-wrapper">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="chartGradientSolid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Y Grid lines & Labels */}
        {yTicks.map((yVal, i) => {
          const y = getY(yVal);
          const label = formatYLabel(yVal);
          return (
            <g key={i} className="chart-grid-line-group">
              <line x1={padL} y1={y} x2={width - padR} y2={y} className="chart-grid-line" />
              <text x={padL - 12} y={y + 4} className="chart-y-label">{label}</text>
            </g>
          );
        })}

        {/* Bars */}
        {points.map((pt, i) => {
          const barHeight = (padT + chartH) - pt.y;
          
          return (
            <g 
              key={`bar-${i}`}
              onMouseEnter={() => setActiveMonth(i)}
              onMouseLeave={() => setActiveMonth(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Invisible wider rect for easier hover */}
              <rect x={pt.x - 20} y={padT} width={40} height={chartH} fill="transparent" />
              
              <rect
                x={pt.x - barWidth / 2}
                y={pt.y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={activeMonth === i ? "#2563EB" : "#93C5FD"}
                opacity={activeMonth === i ? 1 : (activeMonth !== null ? 0.6 : 1)}
                style={{ transition: 'all 0.3s ease' }}
              />
            </g>
          );
        })}

        {/* Line Chart */}
        {points.length > 1 && (
          <path
            d={linePath}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ pointerEvents: 'none', filter: 'drop-shadow(0 4px 6px rgba(245, 158, 11, 0.2))' }}
          />
        )}
        
        {/* Data points for line chart */}
        {points.map((pt, i) => (
          <circle
            key={`point-${i}`}
            cx={pt.x}
            cy={pt.y}
            r={activeMonth === i ? 5 : 4}
            fill={activeMonth === i ? "#F59E0B" : "#fff"}
            stroke="#F59E0B"
            strokeWidth="2"
            style={{ pointerEvents: 'none', transition: 'all 0.3s ease' }}
          />
        ))}

        {/* X Axis Labels */}
        {points.map((pt, i) => {
          const step = Math.ceil(points.length / 10);
          if (points.length > 12 && i % step !== 0 && i !== points.length - 1 && i !== 0) {
            return null;
          }
          return (
            <text
              key={`x-${i}`}
              x={pt.x}
              y={padT + chartH + 20}
              textAnchor="middle"
              className={`chart-label ${activeMonth === i ? 'active' : ''}`}
            >
              {pt.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

const LandlordDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeMonth, setActiveMonth] = useState(null);
  const [showPeriodFilter, setShowPeriodFilter] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('Last 30 Days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState(null);
  const [appliedEndDate, setAppliedEndDate] = useState(null);

  const { stats: statsData, recentActivity, revenueChart, expiringSummary, loading, error } = useLandlordStats(filterPeriod, appliedStartDate, appliedEndDate);

  useEffect(() => {
    if (revenueChart && revenueChart.length > 0) {
      setActiveMonth(revenueChart.length - 1);
    }
  }, [revenueChart]);

  // Stats matching Figma design precisely
  const stats = [
    {
      label: t('landlord.dashboard.stats.totalRooms', 'Total Rooms'),
      value: loading ? '...' : (statsData?.rooms?.total || 0).toString(),
      icon: <Building2 size={20} />,
      iconClass: 'dashboard-stat-icon--blue',
      badge: (
        <span className="dashboard-stat-badge dashboard-stat-badge--success">
          <TrendingUp size={12} /> {t('landlord.dashboard.stats.live', 'Live')}
        </span>
      ),
    },
    {
      label: t('landlord.dashboard.stats.availableUnits', 'Available Units'),
      value: loading ? '...' : (statsData?.rooms?.available || 0).toString(),
      icon: <Key size={20} />,
      iconClass: 'dashboard-stat-icon--purple',
      badge: (
        <span className="dashboard-stat-badge dashboard-stat-badge--success">
          {t('landlord.dashboard.stats.active', 'Active')}
        </span>
      ),
    },
    {
      label: t('landlord.dashboard.stats.currentlyRented', 'Currently Rented'),
      value: loading ? '...' : (statsData?.rooms?.rented || 0).toString(),
      icon: <Bed size={20} />,
      iconClass: 'dashboard-stat-icon--green',
      badge: (
        <span className="dashboard-stat-badge dashboard-stat-badge--success">
          {t('landlord.dashboard.stats.occupied', 'Occupied')}
        </span>
      ),
    },
    {
      label: t('landlord.dashboard.stats.pendingRequests', 'Pending Requests'),
      value: loading ? '...' : (statsData?.requests?.pending || 0).toString(),
      icon: <Hourglass size={20} />,
      iconClass: 'dashboard-stat-icon--orange',
      badge: (
        <span className="dashboard-stat-badge dashboard-stat-badge--warning">
          {t('landlord.dashboard.stats.actionNeeded', 'Action Needed')}
        </span>
      ),
    },
  ];

  const formatActivity = () => {
    if (!recentActivity) return [];
    
    const allActivities = [
      ...(recentActivity.recentRequests || []).map(r => ({
        id: `req-${r.requestId}`,
        icon: <ClipboardList size={18} />,
        iconClass: 'activity-icon-container--orange',
        text: t('landlord.dashboard.recentActivity.newRequest', 'New rental request received.'),
        date: new Date(r.createdAt)
      })),
      ...(recentActivity.recentPayments || []).map(p => ({
        id: `pay-${p.paymentId}`,
        icon: <CreditCard size={18} />,
        iconClass: 'activity-icon-container--blue',
        text: t('landlord.dashboard.recentActivity.rentPaid', 'Rent payment processed for {{amount}} VNĐ.', { amount: p.amount?.toLocaleString('vi-VN') || p.amount }),
        date: new Date(p.createdAt)
      })),
      ...(recentActivity.recentComplaints || []).map(c => ({
        id: `comp-${c.complaintId}`,
        icon: <AlertCircle size={18} />,
        iconClass: 'activity-icon-container--red',
        text: t('landlord.dashboard.recentActivity.complaintReported', 'Complaint reported: {{title}}', { title: c.title }),
        date: new Date(c.createdAt)
      })),
      ...(recentActivity.recentRenewals || []).map(ren => ({
        id: `ren-${ren.renewalId}`,
        icon: ren.status === 'COMPLETED' ? <CheckCircle2 size={18} /> : <Timer size={18} />,
        iconClass: ren.status === 'COMPLETED' ? 'activity-icon-container--green' : 'activity-icon-container--purple',
        text: ren.status === 'COMPLETED'
          ? `Đã ký hợp đồng gia hạn phòng "${ren.roomNumber || ren.roomTitle}".`
          : `Khách thuê yêu cầu gia hạn phòng "${ren.roomNumber || ren.roomTitle}".`,
        date: new Date(ren.createdAt),
        type: ren.status === 'COMPLETED' ? 'renewal-completed' : 'renewal',
        contractId: ren.contractId,
        contractNumber: ren.contractNumber,
        renewalId: ren.renewalId
      }))
    ];

    allActivities.sort((a, b) => b.date - a.date);

    return allActivities.slice(0, 5).map(act => {
      const diffHrs = Math.floor((new Date() - act.date) / 3600000);
      let timeStr = act.date.toLocaleDateString();
      if (diffHrs === 0) timeStr = t('landlord.dashboard.recentActivity.justNow', 'Just now');
      else if (diffHrs < 24) timeStr = t('landlord.dashboard.recentActivity.hoursAgo', '{{count}} hours ago', { count: diffHrs });
      else if (diffHrs < 48) timeStr = t('landlord.dashboard.recentActivity.yesterday', 'Yesterday');
      return { ...act, time: timeStr };
    });
  };

  const activities = formatActivity();

  const handlePeriodChange = (period) => {
    setFilterPeriod(period);
    if (period !== 'Tùy chỉnh') {
      setAppliedStartDate(null);
      setAppliedEndDate(null);
      setShowPeriodFilter(false);
    }
  };

  const handleApplyCustomDate = () => {
    if (customStartDate && customEndDate) {
      setAppliedStartDate(customStartDate);
      setAppliedEndDate(customEndDate);
      setShowPeriodFilter(false);
    }
  };

  const getDisplayPeriod = () => {
    if (filterPeriod === 'Tùy chỉnh' && appliedStartDate && appliedEndDate) {
      try {
        return `${new Date(appliedStartDate).toLocaleDateString('vi-VN')} - ${new Date(appliedEndDate).toLocaleDateString('vi-VN')}`;
      } catch (e) {
        return filterPeriod;
      }
    }
    return filterPeriod;
  };

  const revenueChartData = revenueChart && revenueChart.length > 0 
    ? revenueChart.map(item => item.revenue)
    : [0, 0, 0, 0, 0, 0];
  const revenueChartMonths = revenueChart && revenueChart.length > 0
    ? revenueChart.map(item => item.label || item.month?.split(' ')[0] || '')
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const totalRevenue = revenueChartData.reduce((a, b) => a + b, 0);
  const activeRevenue = activeMonth !== null ? revenueChartData[activeMonth] || 0 : 0;
  const isProjected = false; // The user wants actual revenue for the current month

  return (
    <div className="dashboard-container" id="landlord-dashboard">
      
      {/* Overview Page Header */}
      <div className="dashboard-header-block">
        <div className="dashboard-title-box">
          <h1 className="dashboard-main-title" style={{ fontSize: '2rem', fontWeight: '800', color: '#1E293B', letterSpacing: '-0.025em' }}>
            {t('landlord.dashboard.welcomeBack', 'Welcome back, {{name}}! 👋', { name: user?.fullName || 'Landlord' })}
          </h1>
          <p className="dashboard-subtitle" style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '0.25rem' }}>
            {t('landlord.dashboard.subtitle', "Here's what's happening with your properties today.")}
          </p>
        </div>
        <div className="dashboard-header-actions">
          <div className="dashboard-period-selector" style={{ position: 'relative' }}>
            <button 
              className="dashboard-period-btn" 
              onClick={() => setShowPeriodFilter(!showPeriodFilter)}
            >
              <Calendar size={16} />
              <span>{getDisplayPeriod()}</span>
              <ChevronDown size={14} />
            </button>
            {showPeriodFilter && (
              <div className="dashboard-dropdown-menu">
                {['Last 7 Days', 'Last 30 Days', 'Last 6 Months', 'This Year', 'Tùy chỉnh'].map((p) => (
                  <button 
                    key={p} 
                    className={`dropdown-menu-item ${filterPeriod === p ? 'active' : ''}`}
                    onClick={() => handlePeriodChange(p)}
                  >
                    {p}
                  </button>
                ))}
                {filterPeriod === 'Tùy chỉnh' && (
                  <div style={{ padding: '10px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b' }}>Từ ngày</label>
                      <input 
                        type="date" 
                        max={new Date().toISOString().split('T')[0]}
                        value={customStartDate} 
                        onChange={e => setCustomStartDate(e.target.value)} 
                        style={{ width: '100%', padding: '4px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b' }}>Đến ngày</label>
                      <input 
                        type="date" 
                        max={new Date().toISOString().split('T')[0]}
                        value={customEndDate} 
                        onChange={e => setCustomEndDate(e.target.value)} 
                        style={{ width: '100%', padding: '4px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
                      />
                    </div>
                    <button 
                      onClick={handleApplyCustomDate}
                      disabled={!customStartDate || !customEndDate}
                      style={{ 
                        marginTop: '4px', padding: '6px', background: '#2563EB', color: 'white', 
                        border: 'none', borderRadius: '4px', fontSize: '13px', cursor: (!customStartDate || !customEndDate) ? 'not-allowed' : 'pointer',
                        opacity: (!customStartDate || !customEndDate) ? 0.5 : 1
                      }}
                    >
                      Áp dụng
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <Button variant="primary" onClick={() => navigate(ROUTES.LANDLORD.NEW_LISTING)}>
            <Plus size={16} />
            <span>{t('landlord.manageListings.addNewListing', 'New Listing')}</span>
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
              <h3 className="chart-card-title">{t('landlord.dashboard.revenueSummary.title', 'Revenue Summary')}</h3>
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
              {revenueChartMonths[activeMonth] || 'Month'}:
            </span>
            <span className="tooltip-value-indicator">
              {activeRevenue.toLocaleString('vi-VN')} đ
            </span>
            <span className="tooltip-actual-tag">{t('landlord.dashboard.revenueSummary.actual', 'Actual')}</span>
          </div>

          <div className="dashboard-chart-container">
            <RevenueChart 
              activeMonth={activeMonth} 
              setActiveMonth={setActiveMonth} 
              data={revenueChartData}
              months={revenueChartMonths}
            />
          </div>
          
          <div className="chart-legend-row">
            <div className="legend-item">
              <div style={{ width: '14px', height: '14px', background: 'linear-gradient(to bottom, rgba(37, 99, 235, 0.8), rgba(37, 99, 235, 0.4))', borderRadius: '3px' }}></div>
              <span className="legend-label">{t('landlord.dashboard.revenueSummary.actualIncome', 'Actual Income')}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="dashboard-activity-card">
          <div className="dashboard-activity-header">
            <h3 className="activity-card-title">{t('landlord.dashboard.recentActivity.title', 'Recent Activity')}</h3>
            <Link to={ROUTES.LANDLORD.NOTIFICATIONS} className="activity-view-all-link">
              {t('landlord.dashboard.recentActivity.viewAll', 'View All')}
            </Link>
          </div>
          
          <div className="dashboard-activity-list">
            {activities.map((act) => (
              <div 
                className={`activity-list-item ${act.type === 'renewal' ? 'clickable' : ''}`} 
                key={act.id}
                onClick={() => {
                  if (act.type === 'renewal') {
                    navigate(ROUTES.LANDLORD.CONTRACTS, { state: { autoApproveRenewalId: act.renewalId, search: act.contractNumber || '' } });
                  }
                }}
              >
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

      {/* Contract Expiration & Vacancy Tracking */}
      <div className="dashboard-main-layout-row" style={{ marginTop: '24px' }}>
        
        {/* Left Column: Upcoming Contract Expirations */}
        <div className="dashboard-chart-card" style={{ flex: 1 }}>
          <div className="dashboard-chart-header">
            <div className="dashboard-chart-title-block">
              <h3 className="chart-card-title">Phòng sắp hết hạn thuê</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Hợp đồng còn ≤ 30 ngày và đang chờ xử lý gia hạn</p>
            </div>
          </div>
          <div style={{ marginTop: '16px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Phòng</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Khách thuê</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Ngày hết hạn</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {expiringSummary?.upcomingExpirations?.length > 0 ? (
                  expiringSummary.upcomingExpirations.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 500, color: '#0f172a' }}>{item.roomTitle}</td>
                      <td style={{ padding: '12px 8px', color: '#334155' }}>{item.tenantName}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ color: '#334155', display: 'block' }}>{new Date(item.endDate).toLocaleDateString('vi-VN')}</span>
                        <span style={{ fontSize: '12px', color: item.daysLeft <= 10 ? '#ef4444' : '#f59e0b', fontWeight: 500 }}>
                          Còn {item.daysLeft} ngày
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500,
                          background: item.requestStatus === 'WAITING_TENANT_SIGN' ? '#dbeafe' : 
                                      item.requestStatus === 'PENDING_LANDLORD' ? '#fef3c7' : '#f1f5f9',
                          color: item.requestStatus === 'WAITING_TENANT_SIGN' ? '#1e40af' : 
                                 item.requestStatus === 'PENDING_LANDLORD' ? '#92400e' : '#475569'
                        }}>
                          {item.requestStatus === 'PENDING_INTENT' ? 'Chờ Khách Phản Hồi' : 
                           item.requestStatus === 'PENDING_LANDLORD' ? 'Chờ Bạn Duyệt' : 
                           item.requestStatus === 'WAITING_TENANT_SIGN' ? 'Chờ Khách Ký' : 'Chưa Rõ'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                      Không có phòng nào sắp hết hạn.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Upcoming Vacancies */}
        <div className="dashboard-chart-card" style={{ flex: 1 }}>
          <div className="dashboard-chart-header">
            <div className="dashboard-chart-title-block">
              <h3 className="chart-card-title">Phòng sắp trống</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Khách từ chối gia hạn hoặc quá hạn xử lý</p>
            </div>
          </div>
          <div style={{ marginTop: '16px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Phòng</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Ngày trống</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Lý do</th>
                </tr>
              </thead>
              <tbody>
                {expiringSummary?.upcomingVacancies?.length > 0 ? (
                  expiringSummary.upcomingVacancies.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 500, color: '#0f172a' }}>{item.roomTitle}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ color: '#334155', display: 'block' }}>{new Date(item.endDate).toLocaleDateString('vi-VN')}</span>
                        <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 500 }}>
                          {item.daysLeft > 0 ? `Còn ${item.daysLeft} ngày` : 'Đã trống'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ color: '#475569' }}>
                          {item.reason === 'Tenant Declined' ? 'Khách từ chối' : 
                           item.reason === 'Landlord Declined' ? 'Bạn từ chối' : 'Quá hạn / Hủy'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                      Chưa có phòng nào sắp trống.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LandlordDashboard;
