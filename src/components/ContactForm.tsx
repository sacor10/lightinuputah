import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import './ContactForm.css';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      setErrorMessage('Please enter your email');
      return false;
    }
    if (!formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    if (!formData.message.trim()) {
      setErrorMessage('Please enter your message');
      return false;
    }
    if (!recaptchaToken) {
      setErrorMessage('Please complete the reCAPTCHA verification');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
      } else {
        const errorData = await response.json();
        setSubmitStatus('error');
        setErrorMessage(errorData.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name.trim() && 
                     formData.email.trim() && 
                     formData.email.includes('@') && 
                     formData.message.trim() && 
                     recaptchaToken;

  return (
    <div className="contact-form-container">
      <h3>Send us a message</h3>
      
      {submitStatus === 'success' && (
        <div className="success-message">
          <p>Thank you for your message! We'll get back to you soon.</p>
          <p>You should receive a confirmation email shortly.</p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Message *</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={5}
            required
            disabled={isSubmitting}
            placeholder="Tell us about your lighting project..."
          />
        </div>

        <div className="recaptcha-container">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || ''}
            onChange={handleRecaptchaChange}
          />
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default ContactForm; 