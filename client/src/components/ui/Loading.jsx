import React from 'react';
import { Loader2 } from 'lucide-react';
import './Loading.css';

const Loading = ({ size = 32, fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="loading-fullpage">
        <Loader2 size={size} className="loading-spinner" />
      </div>
    );
  }
  return <Loader2 size={size} className="loading-spinner" />;
};

export default Loading;
