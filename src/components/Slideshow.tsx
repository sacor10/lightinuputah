import React, { useEffect, useState, useRef, useCallback } from 'react';

import { useContentfulData } from '../hooks/useContentfulData';
import ContentfulService from '../services/contentfulService';
import { logger } from '../utils/logger';
import { SLIDESHOW_CONFIG } from '../constants';
import { SlideshowItem } from '../types';
import './Slideshow.css';

import { useIsMobile } from '../hooks/useIsMobile';

const Slideshow: React.FC = () => {
  const { items: allItems, loading } = useContentfulData();
  const [filteredItems, setFilteredItems] = useState<SlideshowItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);
  
  // Touch/swipe state for carousel (mobile only)
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const slideshowRef = useRef<HTMLDivElement>(null);
  
  // Timer ref for auto-advance functionality
  const autoAdvanceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isMobile = useIsMobile();

  // Minimum swipe distance (in px)
  const minSwipeDistance = SLIDESHOW_CONFIG.MIN_SWIPE_DISTANCE;

  // Function to start the auto-advance timer
  const startAutoAdvanceTimer = useCallback(() => {
    // Clear any existing timer
    if (autoAdvanceIntervalRef.current) {
      clearInterval(autoAdvanceIntervalRef.current);
    }

    if (filteredItems.length <= 1) return;

    autoAdvanceIntervalRef.current = setInterval(() => {
      if (isMobile) {
        // For mobile, directly update the index without calling goToNext to avoid infinite loop
        setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredItems.length);
      } else {
        // Desktop: use fade transition
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredItems.length);
          setIsTransitioning(false);
        }, 300);
      }
    }, SLIDESHOW_CONFIG.AUTO_ADVANCE_INTERVAL);
  }, [filteredItems.length, isMobile]);

  // Function to reset the auto-advance timer
  const resetAutoAdvanceTimer = useCallback(() => {
    startAutoAdvanceTimer();
  }, [startAutoAdvanceTimer]);

  useEffect(() => {
    if (allItems.length > 0) {
      const service = ContentfulService.getInstance();
      const slideshowItems = service.createRoundRobinOrder(allItems, SLIDESHOW_CONFIG.MAX_ITEMS);
      setFilteredItems(slideshowItems);
      
      logger.log('Slideshow component: Slideshow loaded successfully with', slideshowItems.length, 'items');
    }
  }, [allItems]);

  useEffect(() => {
    if (filteredItems.length === 0) return;

    // Start the auto-advance timer
    startAutoAdvanceTimer();

    // Cleanup function to clear the timer when component unmounts or dependencies change
    return () => {
      if (autoAdvanceIntervalRef.current) {
        clearInterval(autoAdvanceIntervalRef.current);
      }
    };
  }, [filteredItems.length, isMobile, startAutoAdvanceTimer]);

  const handleCategoryClick = (category: string) => {
    if (currentFilter === category) {
      // If clicking the same category, show all images with transition
      setIsTransitioning(true);
      setTimeout(() => {
        const service = ContentfulService.getInstance();
        const slideshowItems = service.createRoundRobinOrder(allItems, SLIDESHOW_CONFIG.MAX_ITEMS);
        setFilteredItems(slideshowItems);
        setCurrentFilter(null);
        setCurrentIndex(0);
        setIsTransitioning(false);
        resetAutoAdvanceTimer(); // Reset timer after transition
      }, SLIDESHOW_CONFIG.TRANSITION_DURATION); // Half of the CSS transition duration
    } else {
      // Filter by the clicked category with transition
      setIsTransitioning(true);
      setTimeout(() => {
        const filtered = allItems.filter((item: SlideshowItem) => item.category === category);
        setFilteredItems(filtered);
        setCurrentFilter(category);
        setCurrentIndex(0);
        setIsTransitioning(false);
        resetAutoAdvanceTimer(); // Reset timer after transition
      }, SLIDESHOW_CONFIG.TRANSITION_DURATION); // Half of the CSS transition duration
    }
  };

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
      resetAutoAdvanceTimer(); // Reset timer after transition
    }, SLIDESHOW_CONFIG.TRANSITION_DURATION * 1.33); // Match CSS transition duration
  };

  const goToPrevious = () => {
    if (filteredItems.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + filteredItems.length) % filteredItems.length);
      setIsTransitioning(false);
      resetAutoAdvanceTimer(); // Reset timer after transition
    }, SLIDESHOW_CONFIG.TRANSITION_DURATION * 1.33); // Match CSS transition duration
  };

  const goToNext = () => {
    if (filteredItems.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredItems.length);
      setIsTransitioning(false);
      resetAutoAdvanceTimer(); // Reset timer after transition
    }, SLIDESHOW_CONFIG.TRANSITION_DURATION * 1.33); // Match CSS transition duration
  };

  // Touch event handlers for swipe functionality (mobile only)
  const onTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(false);
    setSwipeOffset(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !touchStart) return;
    
    const currentTouch = e.targetTouches[0].clientX;
    const diff = touchStart - currentTouch;
    
    setTouchEnd(currentTouch);
    setSwipeOffset(diff);
    
    if (Math.abs(diff) > 10) {
      setIsSwiping(true);
    }
  };

  const onTouchEnd = () => {
    if (!isMobile || !touchStart || !touchEnd) {
      setIsSwiping(false);
      setSwipeOffset(0);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left (fingers move left) - go to next image
      setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredItems.length);
      resetAutoAdvanceTimer(); // Reset timer after swipe
    } else if (isRightSwipe) {
      // Swipe right (fingers move right) - go to previous image
      setCurrentIndex((prevIndex) => (prevIndex - 1 + filteredItems.length) % filteredItems.length);
      resetAutoAdvanceTimer(); // Reset timer after swipe
    }
    
    setIsSwiping(false);
    setSwipeOffset(0);
  };

  if (loading) {
    return (
      <div className="slideshow-container">
        <div className="slideshow-loading">Loading slideshow...</div>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="slideshow-container">
        <div className="slideshow-empty">
          <p>Slideshow content is currently unavailable.</p>
          <p>Please check back later or contact us for more information.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="slideshow-container"
      ref={slideshowRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="slideshow-wrapper">
        <button className="slideshow-button slideshow-prev" onClick={goToPrevious}>
          &#8249;
        </button>
        
        {isMobile ? (
          // Mobile: Horizontal carousel
          <div className="slideshow-carousel">
            <div 
              className={`slideshow-track ${isSwiping ? 'swiping' : ''} ${isTransitioning ? 'transitioning' : ''}`}
              style={{
                transform: `translateX(calc(-${currentIndex * 100}% - ${swipeOffset}px))`
              }}
            >
              {filteredItems.map((item, index) => {
                // Only render images that are currently visible or adjacent (for smooth transitions)
                const isVisible = Math.abs(index - currentIndex) <= 1;
                
                return (
                  <div key={item.id} className="slideshow-slide">
                    {isVisible ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="slideshow-image"
                      />
                    ) : (
                      <div 
                        className="slideshow-image-placeholder"
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          backgroundColor: '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <span style={{ color: '#999', fontSize: '14px' }}>Loading...</span>
                      </div>
                    )}
                    <div className="slideshow-overlay">
                      {item.category && (
                        <button 
                          className={`slideshow-category ${currentFilter ? 'active-filter' : ''}`}
                          onClick={() => handleCategoryClick(item.category)}
                        >
                          {item.category}
                        </button>
                      )}
                      {item.description && (
                        <p className="slideshow-description">{item.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Desktop: Fade transition
          <div className={`slideshow-slide ${isSwiping ? 'swiping' : ''}`}>
            <img 
              src={filteredItems[currentIndex]?.imageUrl} 
              alt={filteredItems[currentIndex]?.title}
              className={`slideshow-image ${isTransitioning ? 'fade-out' : 'fade-in'}`}
            />
            <div className="slideshow-overlay">
              {filteredItems[currentIndex]?.category && (
                <button 
                  className={`slideshow-category ${currentFilter ? 'active-filter' : ''}`}
                  onClick={() => handleCategoryClick(filteredItems[currentIndex]?.category)}
                >
                  {filteredItems[currentIndex]?.category}
                </button>
              )}
              {filteredItems[currentIndex]?.description && (
                <p className="slideshow-description">{filteredItems[currentIndex]?.description}</p>
              )}
            </div>
          </div>
        )}

        <button className="slideshow-button slideshow-next" onClick={goToNext}>
          &#8250;
        </button>
      </div>

      <div className="slideshow-indicators">
        {filteredItems.map((_, index) => (
          <button
            key={index}
            className={`slideshow-indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slideshow; 