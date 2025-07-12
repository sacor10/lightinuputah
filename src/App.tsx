import React from 'react';
import './App.css';
import headerImage from './images/logo.png';
import Gallery from './components/Gallery';
import Slideshow from './components/Slideshow';
import ContactForm from './components/ContactForm';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="header">
        <div className="header-flex">
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
        </div>
      </header>

      <section className="slideshow-section">
        <div className="container">
          <Slideshow />
        </div>
      </section>

      <section className="hero">
        <div className="container">
          <h2 className="hero-title">Professional LED Car Lighting Installation</h2>
          <p className="hero-subtitle">Transform your vehicle with custom LED lighting solutions in Salt Lake City, Utah</p>
          <div className="hero-info">
            <h3>Hi, I'm Braden!</h3>
            <p>Professional lighting installer specializing in full LED systems, headlights, interior lighting, underglow, and everything in between.</p>
            <a href="#contact" className="cta-button">Get a Quote</a>
          </div>
        </div>
      </section>

      <section id="services" className="services">
        <div className="container">
          <h2>Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>Full LED Systems</h3>
              <p>Complete LED lighting system installations for your vehicle</p>
            </div>
            <div className="service-card">
              <h3>Headlights</h3>
              <p>Custom headlight modifications and LED upgrades</p>
            </div>
            <div className="service-card">
              <h3>Starlights/Interior Lights</h3>
              <p>Interior lighting solutions including starlight headliners</p>
            </div>
            <div className="service-card">
              <h3>Underglow/Exterior Lights</h3>
              <p>Exterior lighting including underglow and accent lighting</p>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="gallery">
        <Gallery />
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
              <p><a href="https://www.instagram.com/direct/t/104833807708713/" target="_blank" rel="noopener noreferrer">Hit me up on Instagram! →</a></p>
            </div>
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