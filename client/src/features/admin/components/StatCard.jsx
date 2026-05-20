import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon, trend, trendValue, isCurrency = false }) => {
  return (
    <div className="admin-stat-card">
      <div className="stat-card-header">
        <h3 className="stat-card-title">{title}</h3>
        <div className="stat-card-icon">
          {icon}
        </div>
      </div>
      <div className="stat-card-body">
        <div className="stat-card-value">
          {isCurrency ? value : value.toLocaleString('vi-VN')}
        </div>
        {trend && trendValue && (
          <div className={`stat-card-trend ${trend === 'up' ? 'trend-positive' : 'trend-negative'}`}>
            <span className="trend-icon">{trend === 'up' ? '↑' : '↓'}</span>
            <span className="trend-text">{trendValue} from last month</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
