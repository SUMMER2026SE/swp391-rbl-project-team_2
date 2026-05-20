import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <h1 className="not-found-code">404</h1>
      <p className="not-found-title">Page not found</p>
      <p className="not-found-desc">The page you're looking for doesn't exist or has been moved.</p>
      <Link to={ROUTES.HOME} className="not-found-link">Go back home</Link>
    </div>
  );
};

export default NotFoundPage;
