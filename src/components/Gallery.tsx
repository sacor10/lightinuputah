import React, { useEffect, useState } from 'react';
import { createClient } from 'contentful';
import './Gallery.css';

// Contentful configuration from environment variables
const SPACE_ID = process.env.REACT_APP_CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN;

// The Contentful content type ID for your gallery items
const CONTENT_TYPE = 'galleryItem';

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

const Gallery: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [displayedItems, setDisplayedItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(6);

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

    client.getEntries({ content_type: CONTENT_TYPE })
      .then((response) => {
        const sortedItems = response.items.sort((a: any, b: any) => 
          a.fields.title.localeCompare(b.fields.title)
        );
        setItems(sortedItems);
        setFiltered(sortedItems);
        setDisplayedItems(sortedItems.slice(0, 6));
        // Extract unique categories
        const cats = Array.from(new Set(sortedItems.map((item: any) => item.fields.category)));
        setCategories(cats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleFilter = (category: string) => {
    setActiveCategory(category);
    setItemsToShow(6); // Reset to show first 6 items when filtering
    if (category === 'All') {
      const newFiltered = items;
      setFiltered(newFiltered);
      setDisplayedItems(newFiltered.slice(0, 6));
    } else {
      const newFiltered = items.filter(item => item.fields.category === category);
      setFiltered(newFiltered);
      setDisplayedItems(newFiltered.slice(0, 6));
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    
    // Simulate a small delay to show the loading state and make the transition smoother
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const nextItems = filtered.slice(0, itemsToShow + 6);
    setDisplayedItems(nextItems);
    setItemsToShow(itemsToShow + 6);
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
                />
                <div className="gallery-overlay">
                  {item.fields.category && (
                    <span className="category-tag">{item.fields.category}</span>
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
