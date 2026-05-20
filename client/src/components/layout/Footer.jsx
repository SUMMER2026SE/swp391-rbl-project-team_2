import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-minimal">
      <div className="container footer-minimal-content">
        <div className="footer-left">
          <Link to="/" className="footer-logo">
            SmartBoard
          </Link>
        </div>
        
        <div className="footer-middle">
          <Link to="#">Terms</Link>
          <Link to="#">Privacy</Link>
          <Link to="#">Support</Link>
          <Link to="#">English (US)</Link>
        </div>

        <div className="footer-right">
          &copy; 2024 SmartBoard AI. Modern housing for modern people.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
