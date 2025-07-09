import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    // Check if environment variables are set
    if (!SPACE_ID || !ACCESS_TOKEN) {
      console.error('Contentful environment variables are not set. Please check your .env file.');
      setLoading(false);
      return;
    }

    const client = createClient({
      space: SPACE_ID,
      accessToken: ACCESS_TOKEN,
    });

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
      })
      .catch(() => setLoading(false));
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
        <div className="slideshow-empty">No images available</div>
      </div>
    );
  }

  return (
    <div className="slideshow-container">
      <div className="slideshow-wrapper">
        <button className="slideshow-button slideshow-prev" onClick={goToPrevious}>
          &#8249;
        </button>
        
        <div className="slideshow-slide">
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