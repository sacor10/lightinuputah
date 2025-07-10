import React, { useEffect, useState, useRef } from 'react';
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

const Slideshow: React.FC = () => {
  const [items, setItems] = useState<SlideshowItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<SlideshowItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);
  
  // Touch/swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const slideshowRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

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

    // Don't auto-advance if there's only one image in the filtered set
    if (filteredItems.length === 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredItems.length);
        setIsTransitioning(false);
      }, 300); // Half of the CSS transition duration
    }, 5000);

    return () => clearInterval(interval);
  }, [filteredItems.length, currentIndex]);

  const handleCategoryClick = (category: string) => {
    if (currentFilter === category) {
      // If clicking the same category, show all images with transition
      setIsTransitioning(true);
      setTimeout(() => {
        setFilteredItems(items);
        setCurrentFilter(null);
        setCurrentIndex(0);
        setIsTransitioning(false);
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
      }, 300); // Half of the CSS transition duration
    }
  };

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  const goToPrevious = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + filteredItems.length) % filteredItems.length);
      setIsTransitioning(false);
    }, 300);
  };

  const goToNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredItems.length);
      setIsTransitioning(false);
    }, 300);
  };

  // Touch event handlers for swipe functionality
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    if (touchStart && Math.abs(e.targetTouches[0].clientX - touchStart) > 10) {
      setIsSwiping(true);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsSwiping(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
    
    setIsSwiping(false);
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