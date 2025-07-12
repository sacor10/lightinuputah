import React from 'react';

const Spinner: React.FC = React.memo(() => (
  <div className="spinner">
    <div className="spinner-inner"></div>
  </div>
));

Spinner.displayName = 'Spinner';

export default Spinner; 