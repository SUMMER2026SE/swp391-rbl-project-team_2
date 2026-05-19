import React from 'react';
import { Link } from 'react-router-dom';
import { Grid } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-minimal">
      <div className="container footer-minimal-content">
        <div className="footer-left">
          &copy; 2024 SmartBoard AI. Modern housing for modern people.
        </div>
        <div className="footer-right">
          <Link to="#">Terms</Link>
          <Link to="#">Privacy</Link>
          <Link to="#">Support</Link>
          <Link to="#">English (US)</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
