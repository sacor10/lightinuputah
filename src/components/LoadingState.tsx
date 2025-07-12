import React from 'react';
import Spinner from './Spinner';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = React.memo(({ 
  message = 'Loading...', 
  className = '' 
}) => (
  <div className={`loading-state ${className}`}>
    <Spinner />
    <p>{message}</p>
  </div>
));

LoadingState.displayName = 'LoadingState';

export default LoadingState; 