import React, { useEffect, useState, useRef } from 'react';

import { useContentfulData } from '../hooks/useContentfulData';
import ContentfulService from '../services/contentfulService';
import { convertToGalleryItems, GalleryItem } from '../utils/galleryUtils';
import { logger } from '../utils/logger';
import { GALLERY_CONFIG, TOUCH_CONFIG } from '../constants';
import ImageOptimizer from './ImageOptimizer';
import './Gallery.css';





import { useIsMobile } from '../hooks/useIsMobile';

// Spinner component for loading states
const Spinner: React.FC = () => (
  <div className="spinner">
    <div className="spinner-inner"></div>
  </div>
);

interface GalleryProps {
  selectedCategory?: string | null;
  onCategoryApplied?: () => void;
}

const Gallery: React.FC<GalleryProps> = ({ selectedCategory, onCategoryApplied }) => {
  const { items: allItems, categories, loading } = useContentfulData();
  const [filtered, setFiltered] = useState<GalleryItem[]>([]);
  const [displayedItems, setDisplayedItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loadingMore, setLoadingMore] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(6);
  const [fullscreenImage, setFullscreenImage] = useState<null | {
    url: string;
    title: string;
    index: number;
  }>(null);
  const isMobile = useIsMobile();
  
  // Refs for touch gesture detection
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);
  const galleryItemRefs = useRef<Map<number, HTMLButtonElement | null>>(new Map());

  useEffect(() => {
    if (allItems.length > 0) {
      const service = ContentfulService.getInstance();
      const roundRobinItems = service.createRoundRobinOrder(allItems);
      const galleryItems = convertToGalleryItems(roundRobinItems);
      
      setFiltered(galleryItems);
      // Set initial number of items based on device
      const initialCount = isMobile ? GALLERY_CONFIG.INITIAL_ITEMS_MOBILE : GALLERY_CONFIG.INITIAL_ITEMS_DESKTOP;
      setDisplayedItems(galleryItems.slice(0, initialCount));
      setItemsToShow(initialCount);
      
      logger.log('Gallery component: Gallery loaded successfully with round-robin ordering');
    }
  }, [allItems, isMobile]);

  // Add a debug log for activeCategory only in development
  useEffect(() => {
    logger.log('Active category:', activeCategory);
  }, [activeCategory]);

  // Apply filter when a service card is clicked
  useEffect(() => {
    if (selectedCategory && allItems.length > 0) {
      handleFilter(selectedCategory);
      onCategoryApplied?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // Accessibility: Escape to close, focus trap, return focus when fullscreen opens/closes
  useEffect(() => {
    if (!fullscreenImage) return;

    const overlay = overlayRef.current;
    const closeBtn = closeButtonRef.current;
    if (!overlay || !closeBtn) return;

    const openedBy = galleryItemRefs.current.get(fullscreenImage.index);
    previousActiveRef.current = (openedBy ?? document.activeElement) as HTMLElement | null;
    closeBtn.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullscreenImage(null);
        e.preventDefault();
        return;
      }
      if (e.key === 'ArrowLeft') {
        const idx = fullscreenImage.index;
        const prevIdx = idx <= 0 ? displayedItems.length - 1 : idx - 1;
        const prev = displayedItems[prevIdx];
        if (prev) {
          const url = prev.fields.image.fields.file.url.startsWith('http')
            ? prev.fields.image.fields.file.url
            : `https:${prev.fields.image.fields.file.url}`;
          setFullscreenImage({ url, title: prev.fields.title, index: prevIdx });
        }
        e.preventDefault();
        return;
      }
      if (e.key === 'ArrowRight') {
        const idx = fullscreenImage.index;
        const nextIdx = idx >= displayedItems.length - 1 ? 0 : idx + 1;
        const next = displayedItems[nextIdx];
        if (next) {
          const url = next.fields.image.fields.file.url.startsWith('http')
            ? next.fields.image.fields.file.url
            : `https:${next.fields.image.fields.file.url}`;
          setFullscreenImage({ url, title: next.fields.title, index: nextIdx });
        }
        e.preventDefault();
        return;
      }
      if (e.key === 'Tab') {
        const focusables = overlay.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    overlay.addEventListener('keydown', handleKeyDown);

    return () => {
      overlay.removeEventListener('keydown', handleKeyDown);
    };
  }, [fullscreenImage, displayedItems]);

  // Return focus when fullscreen closes (not when navigating to next/prev)
  useEffect(() => {
    if (!fullscreenImage && previousActiveRef.current) {
      previousActiveRef.current.focus();
      previousActiveRef.current = null;
    }
  }, [fullscreenImage]);

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
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
      const minSwipe = TOUCH_CONFIG.MIN_SWIPE_DISTANCE;
      const backThreshold = 120;

      if (isHorizontalSwipe && Math.abs(deltaX) > minSwipe) {
        touchEvent.preventDefault();
        if (deltaX > backThreshold) {
          setFullscreenImage(null);
        } else if (deltaX > minSwipe && fullscreenImage) {
          const prevIdx = fullscreenImage.index <= 0 ? displayedItems.length - 1 : fullscreenImage.index - 1;
          const prev = displayedItems[prevIdx];
          if (prev) {
            const url = prev.fields.image.fields.file.url.startsWith('http')
              ? prev.fields.image.fields.file.url
              : `https:${prev.fields.image.fields.file.url}`;
            setFullscreenImage({ url, title: prev.fields.title, index: prevIdx });
          }
        } else if (deltaX < -minSwipe && fullscreenImage) {
          const nextIdx = fullscreenImage.index >= displayedItems.length - 1 ? 0 : fullscreenImage.index + 1;
          const next = displayedItems[nextIdx];
          if (next) {
            const url = next.fields.image.fields.file.url.startsWith('http')
              ? next.fields.image.fields.file.url
              : `https:${next.fields.image.fields.file.url}`;
            setFullscreenImage({ url, title: next.fields.title, index: nextIdx });
          }
        }
      }

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
  }, [fullscreenImage, isMobile, displayedItems]);

  const handleFilter = (category: string) => {
    const initialCount = isMobile ? GALLERY_CONFIG.INITIAL_ITEMS_MOBILE : GALLERY_CONFIG.INITIAL_ITEMS_DESKTOP;
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

  const handleLoadMore = () => {
    setLoadingMore(true);
    const nextItems = filtered.slice(0, itemsToShow + GALLERY_CONFIG.LOAD_MORE_INCREMENT);
    setDisplayedItems(nextItems);
    setItemsToShow(itemsToShow + GALLERY_CONFIG.LOAD_MORE_INCREMENT);
    setLoadingMore(false);
  };

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
          <p className="gallery-empty-title">Gallery content is currently unavailable.</p>
          <p className="gallery-empty-message">Please check back later or get in touch to see examples of our work.</p>
          <a href="#contact" className="gallery-empty-cta">Get a Quote</a>
        </div>
      ) : (
        <>
          <div className="gallery-grid">
            {displayedItems.map((item, index) => {
              const imageUrl = item.fields.image.fields.file.url.startsWith('http')
                ? item.fields.image.fields.file.url
                : `https:${item.fields.image.fields.file.url}`;
              return (
                <button
                  type="button"
                  className="gallery-item"
                  key={item.sys.id}
                  ref={el => { galleryItemRefs.current.set(index, el); }}
                  onClick={() => setFullscreenImage({
                    url: imageUrl,
                    title: item.fields.title,
                    index
                  })}
                  aria-label={`View full size: ${item.fields.title}`}
                >
                  <ImageOptimizer
                    src={imageUrl}
                    alt={item.fields.title}
                    className="gallery-item-image"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 33vw"
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
                </button>
              );
            })}
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
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen image viewer"
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
          <div className="gallery-fullscreen-announcer" aria-live="polite" aria-atomic="true">
            Image {fullscreenImage.index + 1} of {displayedItems.length}: {fullscreenImage.title}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
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
