import React, { Suspense, useEffect, useRef, useState, useCallback } from 'react';

import './App.css';
import ContactForm from './components/ContactForm';
import ErrorBoundary from './components/ErrorBoundary';
import LaserBackground from './components/LaserBackground';
import { ReactComponent as LogoSvg } from './images/logo.svg';
import { useIsMobile } from './hooks/useIsMobile';

// Lazy load heavy components
const Gallery = React.lazy(() => import('./components/Gallery'));
const Slideshow = React.lazy(() => import('./components/Slideshow'));

// Loading fallback components
const SlideshowSkeleton: React.FC = () => (
  <div className="slideshow-skeleton">
    <div className="skeleton-slide"></div>
  </div>
);

const GallerySkeleton: React.FC = () => (
  <div className="gallery-skeleton">
    <div className="skeleton-title"></div>
    <div className="skeleton-grid">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="skeleton-item"></div>
      ))}
    </div>
  </div>
);

const App: React.FC = () => {
  const isMobile = useIsMobile();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isShrunk, setIsShrunk] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleServiceClick = useCallback((category: string) => {
    setSelectedCategory(category);
    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Intersection Observer: when the sentinel scrolls out of view, shrink the header
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Sentinel not visible → user has scrolled past it → shrink
        setIsShrunk(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="App">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className={`header${isShrunk ? ' shrunk' : ''}`}>
        <LaserBackground />
        <div className="header-flex">
          <div className="header-image-container">
            <LogoSvg
              aria-label="LightinUpUtah"
              className="header-logo-image"
              style={{ display: 'block' }}
            />
          </div>
          <nav className="header-nav">
            <div className="container">
              <a href="#services">Services</a>
              <a href="#gallery">Gallery</a>
              <a href="#contact">Contact</a>
              <a href="#legality" className="nav-disclaimer">Disclaimer</a>
            </div>
          </nav>
        </div>
      </header>
      {/* Invisible sentinel — when it scrolls behind the sticky header, the header shrinks */}
      <div ref={sentinelRef} aria-hidden="true" style={{ height: 1, marginTop: -1 }} />

      <main id="main-content">
      <section className="hero">
        <iframe
          className="hero-video hero-youtube"
          src="https://www.youtube.com/embed/DuyaDGjMzuE?autoplay=1&mute=1&loop=1&playlist=DuyaDGjMzuE&controls=0&modestbranding=1&rel=0&showinfo=0&enablejsapi=1&origin=https://localhost&disablekb=1&fs=0"
          frameBorder="0"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          title="G-Wagon LED Lighting Background Video"
        />
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1 className="hero-title">Professional LED Car Lighting Installation</h1>
          <p className="hero-subtitle">Transform your vehicle with custom LED lighting solutions in Salt Lake City, Utah</p>
        </div>
      </section>

      <section className="slideshow-section">
        <div className="container">
          <ErrorBoundary>
            <Suspense fallback={<SlideshowSkeleton />}>
              <Slideshow />
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>

      <section className="about">
        <div className="container">
          <h3>We are Lightin' Up Utah!</h3>
          <p>Vehicle lighting installers specializing in full LED systems, headlights, interior lighting, underglow, and everything in between.</p>
          <a href="#contact" className="cta-button">Get a Quote</a>
        </div>
      </section>

      <section id="services" className="services">
        <div className="container">
          <h2>Our Services</h2>
          <div className="services-grid">
            <button className="service-card" onClick={() => handleServiceClick('full LED systems')}>
              <h3>Full LED Systems</h3>
              <p>Complete LED lighting system installations for your vehicle</p>
            </button>
            <button className="service-card" onClick={() => handleServiceClick('headlights')}>
              <h3>Headlights</h3>
              <p>Custom headlight modifications and LED upgrades</p>
            </button>
            <button className="service-card" onClick={() => handleServiceClick('starlights/interior lights')}>
              <h3>Starlights/Interior Lights</h3>
              <p>Interior lighting solutions including starlight headliners</p>
            </button>
            <button className="service-card" onClick={() => handleServiceClick('underglow/exterior lights')}>
              <h3>Underglow/Exterior Lights</h3>
              <p>Exterior lighting including underglow and accent lighting</p>
            </button>
          </div>
        </div>
      </section>

      <section id="gallery" className="gallery">
        <ErrorBoundary>
          <Suspense fallback={<GallerySkeleton />}>
            <Gallery selectedCategory={selectedCategory} onCategoryApplied={() => setSelectedCategory(null)} />
          </Suspense>
        </ErrorBoundary>
      </section>

      <section id="contact" className="contact">
        <div className="container">
          <h2>Get In Touch</h2>
          <div className="contact-content">
            <div className="contact-form-section">
              <ContactForm />
            </div>
            <div className="contact-info">
              <h3>Contact Information</h3>
              <p><strong>Location:</strong> Salt Lake City, Utah</p>
              <p><strong>Email:</strong> info@lightinuputah.com</p>
              <p><strong>Instagram:</strong> <a href="https://www.instagram.com/lightinuputah/" target="_blank" rel="noopener noreferrer">@lightinuputah</a></p>
              {isMobile ? (
                <p><a href="https://www.instagram.com/lightinuputah/" target="_blank" rel="noopener noreferrer">Hit me up on Instagram! →</a></p>
              ) : (
                <p><a href="https://www.instagram.com/direct/t/104833807708713/" target="_blank" rel="noopener noreferrer">Hit me up on Instagram! →</a></p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="legality" className="legality">
        <div className="container">
          <h2>Is underglow or LED lighting on my vehicle legal?</h2>
          <p className="legality-intro">
            LED underglow, accent lights, and interior lighting on your vehicle are <strong className="legality-highlight-green">not specifically banned</strong> in Utah.
            Under <strong><a href="https://le.utah.gov/xcode/Title41/Chapter6A/41-6a-S1616.html" target="_blank" rel="noopener noreferrer">Utah Code §41-6a-1616</a></strong>, the law prohibits certain colors and flashing lights on non-emergency vehicles,
            but there is no specific prohibition against underglow or LED accent lighting on cars and trucks.
          </p>
          <div className="legality-cards">
            <div className="legality-card legality-card-restricted">
              <h3>Restricted on Non-Emergency Vehicles</h3>
              <ul>
                <li><strong>Red and blue lights</strong> — reserved for emergency vehicles</li>
                <li><strong>Flashing, rotating, or strobing lights</strong> — not permitted while driving on public roads</li>
                <li><strong>Lights that impersonate emergency vehicles</strong> — any configuration that could be mistaken for law enforcement or emergency services</li>
              </ul>
            </div>
            <div className="legality-card legality-card-tips">
              <h3>Tips for Staying Legal</h3>
              <ul>
                <li>Avoid <strong>red and blue</strong> colors on exterior lighting</li>
                <li>Turn off any <strong>flashing or strobing modes</strong> while driving on public roads</li>
                <li>Keep underglow and accent lights in <strong>legal colors</strong> like green, white, amber, or purple</li>
                <li>Make sure your lighting <strong>does not obstruct</strong> required vehicle lights (headlights, brake lights, turn signals)</li>
              </ul>
            </div>
          </div>
          <p className="legality-link">
            Read the full statute: <a href="https://le.utah.gov/xcode/Title41/Chapter6A/41-6a-S1616.html" target="_blank" rel="noopener noreferrer">Utah Code §41-6a-1616</a>
          </p>
          <p className="legality-disclaimer">
            <em>This information is provided for general reference only and does not constitute legal advice. Laws can change — always verify current regulations with local authorities.</em>
          </p>
        </div>
      </section>

      </main>
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 LightinUpUtah - Professional LED Car Lighting Installation</p>
        </div>
      </footer>
    </div>
  );
};

export default App;