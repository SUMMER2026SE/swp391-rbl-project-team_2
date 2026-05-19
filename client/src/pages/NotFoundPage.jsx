import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Cpu, 
  HelpCircle, 
  ArrowRight,
  MessageSquare,
  X,
  Sparkles
} from 'lucide-react';
import { ROUTES } from '../constants';
import dogIllustration from '../assets/images/404-dog.png';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [showAiModal, setShowAiModal] = useState(false);

  return (
    <div className="notfound-page-container">
      {/* 404 Split Panel Layout */}
      <div className="notfound-card-wrapper">
        
        {/* Left Side: Custom Cuteconfused Dog Illustration */}
        <div className="notfound-visual-pane">
          <img 
            src={dogIllustration} 
            alt="Page Not Found Illustration" 
            className="dog-illustration-img" 
          />
        </div>

        {/* Right Side: Text & Quick-Path navigators */}
        <div className="notfound-content-pane">
          <span className="error-code-badge">404</span>
          <h1 className="error-title-text">Page Not Found</h1>
          <p className="error-description-text">
            Oops! It looks like you've ventured into an uncharted room. The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          {/* Divider line */}
          <div className="error-horizontal-divider"></div>

          {/* Let's get you back on track block */}
          <div className="track-suggest-header">Let's get you back on track:</div>

          {/* 3 Interactive Cards Row */}
          <div className="suggest-cards-grid">
            {/* Card 1: Home */}
            <div 
              onClick={() => navigate(ROUTES.HOME)} 
              className="suggest-card-item"
            >
              <div className="suggest-icon-circle blue-circle">
                <Home size={20} />
              </div>
              <span className="suggest-card-title">Home</span>
            </div>

            {/* Card 2: Search Rooms */}
            <div 
              onClick={() => navigate(ROUTES.ROOMS)} 
              className="suggest-card-item"
            >
              <div className="suggest-icon-circle purple-circle">
                <Search size={20} />
              </div>
              <span className="suggest-card-title">Search Rooms</span>
            </div>

            {/* Card 3: AI Assistant */}
            <div 
              onClick={() => setShowAiModal(true)} 
              className="suggest-card-item"
            >
              <div className="suggest-icon-circle indigo-circle">
                <Cpu size={20} />
              </div>
              <span className="suggest-card-title">AI Assistant</span>
            </div>
          </div>

          {/* Bottom Footer Help Link */}
          <div className="notfound-footer-row">
            <HelpCircle size={16} className="help-footer-icon" />
            <span>Need further assistance?</span>
            <span 
              onClick={() => navigate(ROUTES.LANDLORD.HELP)}
              className="contact-support-highlight"
            >
              Contact Support
            </span>
          </div>

        </div>

      </div>

      {/* Mini Interactive AI Assistant Dialog Modal */}
      {showAiModal && (
        <div className="ai-assist-backdrop">
          <div className="ai-assist-dialog">
            <header className="ai-assist-hdr">
              <div className="ai-hdr-left">
                <div className="ai-hdr-avatar">
                  <Cpu size={16} />
                </div>
                <div className="ai-hdr-meta">
                  <h4>SmartHost AI</h4>
                  <span>Online Assistant</span>
                </div>
              </div>
              <button 
                onClick={() => setShowAiModal(false)}
                className="btn-close-ai-assist"
              >
                <X size={16} />
              </button>
            </header>

            <div className="ai-assist-body">
              <div className="ai-bubble-msg">
                <div className="ai-bubble-avatar">🤖</div>
                <div className="ai-bubble-text">
                  <p>Beep boop! I am SmartHost AI. It seems you wandered into an empty room.</p>
                  <p>Let's get you back! Where would you like to go next?</p>
                </div>
              </div>

              {/* Bot selection triggers */}
              <div className="ai-suggest-options">
                <button 
                  onClick={() => {
                    setShowAiModal(false);
                    navigate(ROUTES.HOME);
                  }}
                  className="ai-option-btn"
                >
                  <Home size={14} />
                  <span>Go to Homepage</span>
                </button>

                <button 
                  onClick={() => {
                    setShowAiModal(false);
                    navigate(ROUTES.ROOMS);
                  }}
                  className="ai-option-btn"
                >
                  <Search size={14} />
                  <span>Search Property Listings</span>
                </button>

                <button 
                  onClick={() => {
                    setShowAiModal(false);
                    navigate(ROUTES.LANDLORD.HELP);
                  }}
                  className="ai-option-btn outline"
                >
                  <HelpCircle size={14} />
                  <span>Contact Human Host</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotFoundPage;
