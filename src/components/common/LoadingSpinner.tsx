import React from 'react';
import { LoadingStateProps } from '../../types';

const LoadingSpinner: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  showSpinner = true 
}) => {
  return (
    <div className="loading-container">
      {showSpinner && (
        <div className="spinner">
          <div className="spinner-inner"></div>
        </div>
      )}
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner; 