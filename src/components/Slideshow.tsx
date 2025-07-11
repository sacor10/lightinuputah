import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from 'contentful';
import './Slideshow.css';

// Contentful configuration from environment variables
const SPACE_ID = process.env.REACT_APP_CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN;

// The Contentful content type ID for your gallery items
const CONTENT_TYPE = 'galleryItem';

interface SlideshowItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  description?: string;
}

// Hook to detect mobile devices
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

const Slideshow: React.FC = () => {
  const [items, setItems] = useState<SlideshowItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<SlideshowItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
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
  const minSwipeDistance = 50;

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
    }, 5000);
  }, [filteredItems.length, isMobile]);

  // Function to reset the auto-advance timer
  const resetAutoAdvanceTimer = useCallback(() => {
    startAutoAdvanceTimer();
  }, [startAutoAdvanceTimer]);

  useEffect(() => {
    // Debug logging
    console.log('Slideshow component: Checking environment variables...');
    console.log('SPACE_ID:', SPACE_ID ? 'Set' : 'Not set');
    console.log('ACCESS_TOKEN:', ACCESS_TOKEN ? 'Set' : 'Not set');
    
    // Check if environment variables are set
    if (!SPACE_ID || !ACCESS_TOKEN) {
      console.error('Contentful environment variables are not set. Please check your .env file.');
      console.error('SPACE_ID:', SPACE_ID);
      console.error('ACCESS_TOKEN:', ACCESS_TOKEN);
      setLoading(false);
      return;
    }

    console.log('Slideshow component: Creating Contentful client...');
    const client = createClient({
      space: SPACE_ID,
      accessToken: ACCESS_TOKEN,
    });

    console.log('Slideshow component: Fetching entries from Contentful...');
    client.getEntries({ 
      content_type: CONTENT_TYPE,
      limit: 100 // Get more items to ensure we have enough for the sorting logic
    })
      .then((response) => {
        const allItems: SlideshowItem[] = response.items.map((item: any) => ({
          id: item.sys.id,
          title: item.fields.title,
          imageUrl: item.fields.image.fields.file.url.startsWith('http')
            ? item.fields.image.fields.file.url
            : `https:${item.fields.image.fields.file.url}`,
          category: item.fields.category,
          description: item.fields.description
        }));

        // Sort all items alphabetically by title
        allItems.sort((a, b) => a.title.localeCompare(b.title));

        // Get unique categories sorted A-Z
        const categories = Array.from(new Set(allItems.map(item => item.category))).sort();

        // Group items by category
        const itemsByCategory = new Map<string, SlideshowItem[]>();
        allItems.forEach(item => {
          if (!itemsByCategory.has(item.category)) {
            itemsByCategory.set(item.category, []);
          }
          itemsByCategory.get(item.category)!.push(item);
        });

        // Create round-robin order: one from each category in sequence
        const slideshowItems: SlideshowItem[] = [];
        let maxItemsPerCategory = 0;
        
        // Find the maximum number of items in any category
        categories.forEach(category => {
          const categoryItems = itemsByCategory.get(category);
          if (categoryItems) {
            maxItemsPerCategory = Math.max(maxItemsPerCategory, categoryItems.length);
          }
        });

        // Build round-robin order
        for (let round = 0; round < maxItemsPerCategory && slideshowItems.length < 10; round++) {
          categories.forEach(category => {
            if (slideshowItems.length >= 10) return; // Stop if we reach 10 items
            
            const categoryItems = itemsByCategory.get(category);
            if (categoryItems && categoryItems[round]) {
              slideshowItems.push(categoryItems[round]);
            }
          });
        }

        setItems(slideshowItems);
        setFilteredItems(slideshowItems);
        setLoading(false);
        console.log('Slideshow component: Slideshow loaded successfully with', slideshowItems.length, 'items');
      })
      .catch((error) => {
        console.error('Slideshow component: Error fetching from Contentful:', error);
        setLoading(false);
      });
  }, []);

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
        setFilteredItems(items);
        setCurrentFilter(null);
        setCurrentIndex(0);
        setIsTransitioning(false);
        resetAutoAdvanceTimer(); // Reset timer after transition
      }, 300); // Half of the CSS transition duration
    } else {
      // Filter by the clicked category with transition
      setIsTransitioning(true);
      setTimeout(() => {
        const filtered = items.filter(item => item.category === category);
        setFilteredItems(filtered);
        setCurrentFilter(category);
        setCurrentIndex(0);
        setIsTransitioning(false);
        resetAutoAdvanceTimer(); // Reset timer after transition
      }, 300); // Half of the CSS transition duration
    }
  };

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
      resetAutoAdvanceTimer(); // Reset timer after transition
    }, 400); // Match CSS transition duration
  };

  const goToPrevious = () => {
    if (filteredItems.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + filteredItems.length) % filteredItems.length);
      setIsTransitioning(false);
      resetAutoAdvanceTimer(); // Reset timer after transition
    }, 400); // Match CSS transition duration
  };

  const goToNext = () => {
    if (filteredItems.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredItems.length);
      setIsTransitioning(false);
      resetAutoAdvanceTimer(); // Reset timer after transition
    }, 400); // Match CSS transition duration
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
              {filteredItems.map((item, index) => (
                <div key={item.id} className="slideshow-slide">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="slideshow-image"
                  />
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
              ))}
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