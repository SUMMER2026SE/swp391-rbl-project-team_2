import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Heart, MessageSquare, Home } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';
import { ROUTES } from '../../../constants';
import './TenantDashboardPage.css';

const TenantDashboardPage = () => {
  const { user } = useAuthStore();

  return (
    <div className="tenant-dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.fullName || 'Tenant'}!</h1>
        <p>Here is an overview of your rental activity.</p>
      </div>

      <div className="stats-grid">
        <Link to="/tenant/requests" className="stat-card">
          <div className="stat-icon-wrapper requests">
            <ClipboardList size={24} />
          </div>
          <div className="stat-info">
            <h3>My Requests</h3>
            <p>View maintenance requests</p>
          </div>
        </Link>

        <Link to={ROUTES.TENANT.FAVORITES} className="stat-card">
          <div className="stat-icon-wrapper favorites">
            <Heart size={24} />
          </div>
          <div className="stat-info">
            <h3>Saved Rooms</h3>
            <p>View your favorite properties</p>
          </div>
        </Link>

        <Link to="/messages" className="stat-card">
          <div className="stat-icon-wrapper messages">
            <MessageSquare size={24} />
          </div>
          <div className="stat-info">
            <h3>Messages</h3>
            <p>Chat with landlords</p>
          </div>
        </Link>

        <Link to={ROUTES.ROOMS} className="stat-card">
          <div className="stat-icon-wrapper explore">
            <Home size={24} />
          </div>
          <div className="stat-info">
            <h3>Explore</h3>
            <p>Find your next home</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default TenantDashboardPage;
