import React, { useEffect, useState } from 'react';
import { createClient } from 'contentful';
import './Gallery.css';

// Replace with your Contentful space and access token
const SPACE_ID = 't1sp0p547p5j';
const ACCESS_TOKEN = 'Gkh_nWrGd8CVpBnJ1q92nE0YVsomXalZk3bJrdTUbIY';

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

const Gallery: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = createClient({
      space: SPACE_ID,
      accessToken: ACCESS_TOKEN,
    });

    client.getEntries({ content_type: CONTENT_TYPE })
      .then((response) => {
        setItems(response.items);
        setFiltered(response.items);
        // Extract unique categories
        const cats = Array.from(new Set(response.items.map((item: any) => item.fields.category)));
        setCategories(cats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleFilter = (category: string) => {
    setActiveCategory(category);
    if (category === 'All') {
      setFiltered(items);
    } else {
      setFiltered(items.filter(item => item.fields.category === category));
    }
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
        <div className="gallery-loading">Loading gallery...</div>
      ) : (
        <div className="gallery-grid">
          {filtered.map(item => (
            <div className="gallery-item" key={item.sys.id}>
              <img
                src={item.fields.image.fields.file.url.startsWith('http')
                  ? item.fields.image.fields.file.url
                  : `https:${item.fields.image.fields.file.url}`}
                alt={item.fields.title}
              />
              <div className="gallery-overlay">
                <h3>{item.fields.title}</h3>
                {item.fields.category && (
                  <span className="category-tag">{item.fields.category}</span>
                )}
                {item.fields.description && <p>{item.fields.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
