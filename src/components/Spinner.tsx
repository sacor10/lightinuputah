import React from 'react';

const Spinner: React.FC = React.memo(() => (
  <div className="spinner" role="status" aria-label="Loading">
    <div className="spinner-inner"></div>
  </div>
));

Spinner.displayName = 'Spinner';

export default Spinner; 