import React, { useEffect, useState } from 'react';
import { createClient } from 'contentful';
import './Gallery.css';

// Contentful configuration from environment variables
const SPACE_ID = process.env.REACT_APP_CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN;

// The Contentful content type ID for your gallery items
const CONTENT_TYPE = 'galleryItem';

// Interface for type safety (used in component logic)
interface GalleryItemFields {
  title: string;
  image: {
    fields: {
      file: {
        url: string;
      };
    };
  };
  category: string;
  description?: string;
}

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
  const [items, setItems] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [displayedItems, setDisplayedItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(6);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Debug logging
    console.log('Gallery component: Checking environment variables...');
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

    console.log('Gallery component: Creating Contentful client...');
    const client = createClient({
      space: SPACE_ID,
      accessToken: ACCESS_TOKEN,
    });

    console.log('Gallery component: Fetching entries from Contentful...');
    client.getEntries({ 
      content_type: CONTENT_TYPE,
      limit: 100 // Get more items to ensure we have enough for the sorting logic
    })
      .then((response) => {
        console.log('Gallery component: Contentful response received:', response.items.length, 'items');
        
        // Sort all items alphabetically by title
        const sortedItems = response.items.sort((a: any, b: any) => 
          a.fields.title.localeCompare(b.fields.title)
        );

        // Get unique categories sorted A-Z (filter out null/undefined categories)
        const categories = Array.from(new Set(
          sortedItems
            .map((item: any) => item.fields.category)
            .filter((category: any): category is string => typeof category === 'string')
        )).sort();

        // Group items by category
        const itemsByCategory = new Map<string, any[]>();
        sortedItems.forEach(item => {
          const category = item.fields.category;
          if (typeof category === 'string') {
            if (!itemsByCategory.has(category)) {
              itemsByCategory.set(category, []);
            }
            itemsByCategory.get(category)!.push(item);
          }
        });

        // Create round-robin order: one from each category in sequence
        const roundRobinItems: any[] = [];
        let maxItemsPerCategory = 0;
        
        // Find the maximum number of items in any category
        categories.forEach(category => {
          const categoryItems = itemsByCategory.get(category);
          if (categoryItems) {
            maxItemsPerCategory = Math.max(maxItemsPerCategory, categoryItems.length);
          }
        });

        // Build round-robin order
        for (let round = 0; round < maxItemsPerCategory; round++) {
          categories.forEach(category => {
            const categoryItems = itemsByCategory.get(category);
            if (categoryItems && categoryItems[round]) {
              roundRobinItems.push(categoryItems[round]);
            }
          });
        }

        setItems(roundRobinItems);
        setFiltered(roundRobinItems);
        // Set initial number of items based on device
        const initialCount = isMobile ? 3 : 6;
        setDisplayedItems(roundRobinItems.slice(0, initialCount));
        setItemsToShow(initialCount);
        setCategories(categories);
        setLoading(false);
        console.log('Gallery component: Gallery loaded successfully with round-robin ordering');
      })
      .catch((error) => {
        console.error('Gallery component: Error fetching from Contentful:', error);
        setLoading(false);
      });
  }, [isMobile]);

  const handleFilter = (category: string) => {
    // If clicking the same category that's already active, toggle to 'All'
    const initialCount = isMobile ? 3 : 6;
    if (activeCategory === category) {
      setActiveCategory('All');
      setItemsToShow(initialCount); // Reset to show first N items when filtering
      const newFiltered = items;
      setFiltered(newFiltered);
      setDisplayedItems(newFiltered.slice(0, initialCount));
    } else {
      // Otherwise, set the new category
      setActiveCategory(category);
      setItemsToShow(initialCount); // Reset to show first N items when filtering
      if (category === 'All') {
        const newFiltered = items;
        setFiltered(newFiltered);
        setDisplayedItems(newFiltered.slice(0, initialCount));
      } else {
        const newFiltered = items.filter(item => item.fields.category === category);
        setFiltered(newFiltered);
        setDisplayedItems(newFiltered.slice(0, initialCount));
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

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>Gallery</h2>
        <p>Check out our latest work!</p>
      </div>
      <div className="category-filter">
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
      ) : items.length === 0 ? (
        <div className="gallery-empty">
          <p>Gallery content is currently unavailable.</p>
          <p>Please check back later or contact us for more information.</p>
        </div>
      ) : (
        <>
          <div className="gallery-grid">
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
    </div>
  );
};

export default Gallery;
