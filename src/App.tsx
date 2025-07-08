import React from 'react';
import './App.css';
import headerImage from './images/lightin-up-utah-header.jpg';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="header">
  <div className="header-image-container">
    <img src={headerImage} alt="LightinUpUtah" className="header-logo-image" />
  </div>
  <nav className="header-nav">
    <div className="container">
      <a href="#services">Services</a>
      <a href="#gallery">Gallery</a>
      <a href="#contact">Contact</a>
    </div>
  </nav>
</header>

      <section className="hero">
        <div className="container">
          <h2 className="hero-title">Professional LED Car Lighting Installation</h2>
          <p className="hero-subtitle">Transform your vehicle with custom LED lighting solutions in Salt Lake City, Utah</p>
          <div className="hero-info">
            <h3>Hi, I'm Braden!</h3>
            <p>Professional lighting installer specializing in halos, light bars, underglow, and everything in between.</p>
            <a href="#contact" className="cta-button">Get a Quote</a>
          </div>
        </div>
      </section>

      <section id="services" className="services">
        <div className="container">
          <h2>Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>Halos</h3>
              <p>Custom halo lighting for headlights and taillights</p>
            </div>
            <div className="service-card">
              <h3>Light Bars</h3>
              <p>LED light bars for enhanced visibility and style</p>
            </div>
            <div className="service-card">
              <h3>Underglow</h3>
              <p>Stunning underglow lighting systems</p>
            </div>
            <div className="service-card">
              <h3>Custom Solutions</h3>
              <p>Anything in between - we handle all LED installations</p>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="gallery">
        <div className="container">
          <h2>Gallery</h2>
          <p className="gallery-placeholder">Photo gallery coming soon - check out our Instagram for latest work!</p>
        </div>
      </section>

      <section id="contact" className="contact">
        <div className="container">
          <h2>Get In Touch</h2>
          <div className="contact-info">
            <p><strong>Location:</strong> Salt Lake City, Utah</p>
            <p><strong>Instagram:</strong> @lightinuputah</p>
            <p><strong>Ready to light up your ride?</strong> Hit me up on Instagram!</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 LightinUpUtah - Professional LED Car Lighting Installation</p>
        </div>
      </footer>
    </div>
  );
};

export default App;