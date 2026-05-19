import React from 'react';
import { Search, Smartphone, CreditCard, UserCog, Bot, MessageSquare, PhoneCall } from 'lucide-react';
import Button from '../components/common/Button';
import './HelpCenterPage.css';

const HelpCenterPage = () => {
  return (
    <div className="help-center-page">
      {/* Help Hero Header */}
      <section className="help-hero-section">
        <h1 className="help-main-title">How can we help you today?</h1>
        <p className="help-subtitle">
          Search our knowledge base or browse categories below to find answers to your questions about the SmartBoarding platform.
        </p>

        {/* Large Central Search Box */}
        <div className="help-search-container">
          <Search size={22} className="help-search-icon" />
          <input 
            type="text" 
            placeholder="Search for articles, guides, or keywords..." 
            className="help-search-input"
          />
        </div>
      </section>

      {/* 4 Cards Categories Grid */}
      <section className="help-categories-grid">
        <div className="help-card">
          <div className="help-card-icon-wrapper">
            <Smartphone size={24} className="help-card-icon" />
          </div>
          <h3 className="help-card-title">Booking & Reservations</h3>
          <p className="help-card-desc">
            Manage stays, modifications, and cancellation policies.
          </p>
        </div>

        <div className="help-card">
          <div className="help-card-icon-wrapper">
            <CreditCard size={24} className="help-card-icon" />
          </div>
          <h3 className="help-card-title">Billing & Payments</h3>
          <p className="help-card-desc">
            Invoices, payment methods, and payout scheduling.
          </p>
        </div>

        <div className="help-card">
          <div className="help-card-icon-wrapper">
            <UserCog size={24} className="help-card-icon" />
          </div>
          <h3 className="help-card-title">Account Management</h3>
          <p className="help-card-desc">
            Profile settings, user roles, and security features.
          </p>
        </div>

        <div className="help-card">
          <div className="help-card-icon-wrapper">
            <Bot size={24} className="help-card-icon" />
          </div>
          <h3 className="help-card-title">AI Assistant</h3>
          <p className="help-card-desc">
            Learn how to utilize our automated support tools.
          </p>
        </div>
      </section>

      {/* Still need assistance Banner */}
      <section className="still-need-assistance-banner">
        <div className="banner-text-content">
          <h2 className="banner-title">Still need assistance?</h2>
          <p className="banner-subtitle">
            Our support team and AI agents are available 24/7 to resolve complex issues.
          </p>
        </div>

        <div className="banner-actions">
          <Button variant="outline" className="btn-contact-support">
            Contact Support
          </Button>
          <Button variant="primary" className="btn-chat-ai">
            <MessageSquare size={16} />
            <span>Chat with AI</span>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HelpCenterPage;
