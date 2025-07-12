import React, { useState, useEffect, useRef } from 'react';

interface ImageOptimizerProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  placeholder?: string;
}

const ImageOptimizer: React.FC<ImageOptimizerProps> = ({
  src,
  alt,
  className = '',
  onClick,
  loading = 'lazy',
  sizes = '(max-width: 768px) 100vw, 50vw',
  placeholder
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate responsive image sources
  const generateSrcSet = (imageUrl: string) => {
    // For Contentful images, we can add width parameters
    const baseUrl = imageUrl.split('?')[0];
    const params = imageUrl.includes('?') ? imageUrl.split('?')[1] : '';
    
    // Generate different sizes for responsive images
    const widths = [400, 800, 1200, 1600];
    return widths
      .map(width => `${baseUrl}?w=${width}&q=80&${params}`)
      .join(', ');
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current || loading === 'eager') {
      setIsInView(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before image comes into view
        threshold: 0.1
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setIsError(true);
    if (imgRef.current) {
      imgRef.current.style.display = 'none';
    }
  };

  const imageUrl = src.startsWith('http') ? src : `https:${src}`;
  const srcSet = generateSrcSet(imageUrl);

  return (
    <div 
      className={`image-optimizer ${className} ${isLoaded ? 'loaded' : ''}`}
      ref={imgRef}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Placeholder/Blur effect */}
      {placeholder && !isLoaded && (
        <div 
          className="image-placeholder"
          style={{
            backgroundImage: `url(${placeholder})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1
          }}
        />
      )}

      {/* Main image */}
      {isInView && (
        <img
          src={imageUrl}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`optimized-image ${isLoaded ? 'fade-in' : ''}`}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            position: 'relative',
            zIndex: 2
          }}
        />
      )}

      {/* Loading spinner */}
      {!isLoaded && !isError && isInView && (
        <div className="image-loading">
          <div className="spinner"></div>
        </div>
      )}

      {/* Error fallback */}
      {isError && (
        <div className="image-error">
          <span>Image unavailable</span>
        </div>
      )}
    </div>
  );
};

export default ImageOptimizer; 