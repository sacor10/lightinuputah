import React, { Suspense } from 'react';
import ImageOptimizer from './ImageOptimizer';
import './LazyGallery.css';

// Lazy load the main Gallery component
const Gallery = React.lazy(() => import('./Gallery'));

// Loading fallback component
const GallerySkeleton: React.FC = () => (
  <div className="gallery-skeleton">
    <div className="gallery-header-skeleton">
      <div className="skeleton-title"></div>
      <div className="skeleton-subtitle"></div>
    </div>
    <div className="gallery-filters-skeleton">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="skeleton-filter"></div>
      ))}
    </div>
    <div className="gallery-grid-skeleton">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="skeleton-item">
          <div className="skeleton-image"></div>
        </div>
      ))}
    </div>
  </div>
);

const LazyGallery: React.FC = () => {
  return (
    <Suspense fallback={<GallerySkeleton />}>
      <Gallery />
    </Suspense>
  );
};

export default LazyGallery; 