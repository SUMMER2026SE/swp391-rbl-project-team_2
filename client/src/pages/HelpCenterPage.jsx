import React from 'react';
import { Search, Smartphone, CreditCard, UserCog, Bot, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants';
import './HelpCenterPage.css';

const HelpCenterPage = () => {
  const navigate = useNavigate();

  return (
    <div className="hc-container">
      {/* Hero Section */}
      <div className="hc-hero">
        <h1 className="hc-title">How can we help you today?</h1>
        <p className="hc-subtitle">
          Search our knowledge base or browse categories below to find answers to your questions about the SmartBoarding platform.
        </p>

        <div className="hc-search-wrapper">
          <Search className="hc-search-icon" size={20} />
          <input 
            type="text" 
            className="hc-search-input" 
            placeholder="Search for articles, guides, or keywords..." 
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="hc-categories-grid">
        {/* Card 1 */}
        <div className="hc-category-card">
          <div className="hc-icon-wrapper">
            <Smartphone size={24} className="hc-icon" />
          </div>
          <h3 className="hc-card-title">Booking & Reservations</h3>
          <p className="hc-card-desc">
            Manage stays, modifications, and cancellation policies.
          </p>
        </div>

        {/* Card 2 */}
        <div className="hc-category-card">
          <div className="hc-icon-wrapper">
            <CreditCard size={24} className="hc-icon" />
          </div>
          <h3 className="hc-card-title">Billing & Payments</h3>
          <p className="hc-card-desc">
            Invoices, payment methods, and payout scheduling.
          </p>
        </div>

        {/* Card 3 */}
        <div className="hc-category-card">
          <div className="hc-icon-wrapper">
            <UserCog size={24} className="hc-icon" />
          </div>
          <h3 className="hc-card-title">Account Management</h3>
          <p className="hc-card-desc">
            Profile settings, user roles, and security features.
          </p>
        </div>

        {/* Card 4 */}
        <div className="hc-category-card">
          <div className="hc-icon-wrapper">
            <Bot size={24} className="hc-icon" />
          </div>
          <h3 className="hc-card-title">AI Assistant</h3>
          <p className="hc-card-desc">
            Learn how to utilize our automated support tools.
          </p>
        </div>
      </div>

      {/* Bottom Assistance Card */}
      <div className="hc-assistance-card">
        <div className="hc-assistance-content">
          <h2 className="hc-assistance-title">Still need assistance?</h2>
          <p className="hc-assistance-desc">
            Our support team and AI agents are available 24/7 to resolve complex issues.
          </p>
        </div>
        <div className="hc-assistance-actions">
          <button className="hc-btn hc-btn-outline" onClick={() => navigate(ROUTES.LANDLORD?.CONTACT_SUPPORT || '#')}>
            Contact Support
          </button>
          <button className="hc-btn hc-btn-solid" onClick={() => navigate(ROUTES.TENANT?.CHAT || '#')}>
            <MessageSquare size={18} />
            Chat with AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
