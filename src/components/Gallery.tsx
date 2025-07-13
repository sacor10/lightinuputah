import React, { useEffect, useState, useRef } from 'react';
import { useContentfulData } from '../hooks/useContentfulData';
import ContentfulService from '../services/contentfulService';
import { convertToGalleryItems, GalleryItem } from '../utils/galleryUtils';
import './Gallery.css';





// Spinner component for loading states
const Spinner: React.FC = () => (
  <div className="spinner">
    <div className="spinner-inner"></div>
  </div>
);

// Hook to detect mobile devices (copied from Slideshow.tsx)
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

const Gallery: React.FC = () => {
  const { items: allItems, categories, loading } = useContentfulData();
  const [filtered, setFiltered] = useState<GalleryItem[]>([]);
  const [displayedItems, setDisplayedItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loadingMore, setLoadingMore] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(6);
  const [fullscreenImage, setFullscreenImage] = useState<null | {
    url: string;
    title: string;
  }>(null);
  const isMobile = useIsMobile();
  
  // Refs for touch gesture detection
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Helper to determine number of columns based on screen size
  const getNumColumns = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth <= 768) {
        return Math.floor((window.innerWidth - 32) / 250) || 1; // min 1 col
      } else {
        return Math.floor((window.innerWidth - 64) / 300) || 1; // min 1 col
      }
    }
    return isMobile ? 1 : 2;
  }, [isMobile]);

  const [numColumns, setNumColumns] = useState(getNumColumns());

  useEffect(() => {
    const handleResize = () => {
      setNumColumns(getNumColumns());
    };
    window.addEventListener('resize', handleResize);
    setNumColumns(getNumColumns());
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, getNumColumns]);

  useEffect(() => {
    if (allItems.length > 0) {
      const service = ContentfulService.getInstance();
      const roundRobinItems = service.createRoundRobinOrder(allItems);
      const galleryItems = convertToGalleryItems(roundRobinItems);
      
      setFiltered(galleryItems);
      // Set initial number of items based on device
      const initialCount = isMobile ? 3 : 6;
      setDisplayedItems(galleryItems.slice(0, initialCount));
      setItemsToShow(initialCount);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Gallery component: Gallery loaded successfully with round-robin ordering');
      }
    }
  }, [allItems, isMobile]);

  // Add a debug log for activeCategory only in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Active category:', activeCategory);
    }
  }, [activeCategory]);

  // Handle mobile back gesture to close fullscreen image
  useEffect(() => {
    if (!fullscreenImage || !isMobile) return;

    const handleTouchStart = (e: Event) => {
      const touchEvent = e as TouchEvent;
      touchStartX.current = touchEvent.touches[0].clientX;
      touchStartY.current = touchEvent.touches[0].clientY;
    };

    const handleTouchMove = (e: Event) => {
      if (touchStartX.current === null || touchStartY.current === null) return;
      
      const touchEvent = e as TouchEvent;
      touchEndX.current = touchEvent.touches[0].clientX;
      touchEndY.current = touchEvent.touches[0].clientY;
    };

    const handleTouchEnd = (e: Event) => {
      if (touchStartX.current === null || touchStartY.current === null || 
          touchEndX.current === null || touchEndY.current === null) return;

      const touchEvent = e as TouchEvent;
      const deltaX = touchEndX.current - touchStartX.current;
      const deltaY = touchEndY.current - touchStartY.current;
      
      // Check if it's a horizontal swipe (more horizontal than vertical)
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
      
      // Check if it's a right-to-left swipe (back gesture) - more sensitive threshold
      const isBackGesture = deltaX > 30 && isHorizontalSwipe && Math.abs(deltaX) > 20;
      
      if (isBackGesture) {
        touchEvent.preventDefault();
        setFullscreenImage(null);
      }
      
      // Reset touch coordinates
      touchStartX.current = null;
      touchStartY.current = null;
      touchEndX.current = null;
      touchEndY.current = null;
    };

    // Add event listeners to the fullscreen overlay with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const overlay = overlayRef.current;
      if (overlay) {
        overlay.addEventListener('touchstart', handleTouchStart, { passive: false });
        overlay.addEventListener('touchmove', handleTouchMove, { passive: false });
        overlay.addEventListener('touchend', handleTouchEnd, { passive: false });
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const overlay = overlayRef.current;
      if (overlay) {
        overlay.removeEventListener('touchstart', handleTouchStart);
        overlay.removeEventListener('touchmove', handleTouchMove);
        overlay.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [fullscreenImage, isMobile]);

  const handleFilter = (category: string) => {
    const initialCount = isMobile ? 3 : 6;
    // If clicking the same category that's already active, toggle to 'All'
    if (activeCategory === category) {
      setActiveCategory('All');
      setItemsToShow(initialCount);
      const service = ContentfulService.getInstance();
      const roundRobinItems = service.createRoundRobinOrder(allItems);
      const galleryItems = convertToGalleryItems(roundRobinItems);
      setFiltered(galleryItems);
      setDisplayedItems(galleryItems.slice(0, initialCount));
    } else {
      setActiveCategory(category);
      setItemsToShow(initialCount);
      if (category === 'All') {
        const service = ContentfulService.getInstance();
        const roundRobinItems = service.createRoundRobinOrder(allItems);
        const galleryItems = convertToGalleryItems(roundRobinItems);
        setFiltered(galleryItems);
        setDisplayedItems(galleryItems.slice(0, initialCount));
      } else {
        const newFiltered = allItems.filter((item: any) => item.category === category);
        const galleryItems = convertToGalleryItems(newFiltered);
        setFiltered(galleryItems);
        setDisplayedItems(galleryItems.slice(0, initialCount));
      }
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    
    // Simulate a small delay to show the loading state and make the transition smoother
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const increment = 6;
    const nextItems = filtered.slice(0, itemsToShow + increment);
    setDisplayedItems(nextItems);
    setItemsToShow(itemsToShow + increment);
    setLoadingMore(false);
  };

  // Calculate if last row is not full
  const lastRowCount = displayedItems.length % numColumns;
  const shouldCenterLastRow =
    displayedItems.length > 0 &&
    lastRowCount > 0 &&
    lastRowCount < numColumns;

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>Gallery</h2>
        <p>Check out our latest work!</p>
      </div>
      <div className="category-filter" key={activeCategory}>
        <button
          className={`filter-btn${activeCategory === 'All' ? ' active' : ''}`}
          onClick={() => handleFilter('All')}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={`filter-btn${activeCategory === category ? ' active' : ''}`}
            onClick={() => handleFilter(category)}
            aria-pressed={activeCategory === category}
          >
            {category}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="gallery-loading">
          <Spinner />
          <p>Loading gallery...</p>
        </div>
      ) : allItems.length === 0 ? (
        <div className="gallery-empty">
          <p>Gallery content is currently unavailable.</p>
          <p>Please check back later or contact us for more information.</p>
        </div>
      ) : (
        <>
          <div className={`gallery-grid${shouldCenterLastRow ? ' gallery-grid--center-last-row' : ''}`}>
            {displayedItems.map(item => (
              <div className="gallery-item" key={item.sys.id}>
                <img
                  src={item.fields.image.fields.file.url.startsWith('http')
                    ? item.fields.image.fields.file.url
                    : `https:${item.fields.image.fields.file.url}`}
                  alt={item.fields.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  onClick={() => setFullscreenImage({
                    url: item.fields.image.fields.file.url.startsWith('http')
                      ? item.fields.image.fields.file.url
                      : `https:${item.fields.image.fields.file.url}`,
                    title: item.fields.title
                  })}
                  style={{ cursor: 'pointer' }}
                />
                <div className="gallery-overlay">
                  {item.fields.category && (
                    <span 
                      className={`category-tag clickable${activeCategory === item.fields.category ? ' active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFilter(item.fields.category);
                      }}
                    >
                      {item.fields.category}
                    </span>
                  )}
                  {item.fields.description && <p>{item.fields.description}</p>}
                </div>
              </div>
            ))}
          </div>
          {displayedItems.length < filtered.length && (
            <div className="gallery-load-more">
              {loadingMore ? (
                <div className="loading-more-container">
                  <Spinner />
                  <p>Loading more images...</p>
                </div>
              ) : (
                <button 
                  className="load-more-btn"
                  onClick={handleLoadMore}
                >
                  Load More ({filtered.length - displayedItems.length} remaining)
                </button>
              )}
            </div>
          )}
        </>
      )}
      {/* Fullscreen overlay */}
      {fullscreenImage && (
        <div
          ref={overlayRef}
          className="gallery-fullscreen-overlay"
          onClick={() => setFullscreenImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <button
            className="gallery-fullscreen-close"
            onClick={e => {
              e.stopPropagation();
              setFullscreenImage(null);
            }}
            style={{
              position: 'absolute',
              top: 24,
              left: 24,
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              fontSize: 24,
              cursor: 'pointer',
              zIndex: 1001,
            }}
            aria-label="Close fullscreen image"
          >
            ×
          </button>
          <img
            src={fullscreenImage.url}
            alt={fullscreenImage.title}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              boxShadow: '0 0 32px 8px rgba(0,0,0,0.7)',
              borderRadius: 8,
            }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Gallery;
