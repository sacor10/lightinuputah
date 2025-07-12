import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import './ContactForm.css';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  message?: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: ''
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (name: keyof ContactFormData, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) {
          return 'Name is required';
        }
        if (value.trim().length < 5) {
          return 'Name must be at least 5 characters';
        }
        if (value.trim().length > 50) {
          return 'Name must be no more than 50 characters';
        }
        break;
      case 'email':
        if (!value.trim()) {
          return 'Email is required';
        }
        if (!validateEmail(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'message':
        if (!value.trim()) {
          return 'Message is required';
        }
        if (value.trim().length < 10) {
          return 'Message must be at least 10 characters';
        }
        if (value.trim().length > 1000) {
          return 'Message must be no more than 1000 characters';
        }
        break;
    }
    return undefined;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof ContactFormData]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name as keyof ContactFormData, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    errors.name = validateField('name', formData.name);
    errors.email = validateField('email', formData.email);
    errors.message = validateField('message', formData.message);
    
    if (!recaptchaToken) {
      setErrorMessage('Please complete the reCAPTCHA verification');
      return false;
    }
    
    setValidationErrors(errors);
    
    // Check if there are any validation errors
    const hasErrors = Object.values(errors).some(error => error !== undefined);
    
    if (hasErrors) {
      setErrorMessage('Please fix the validation errors above');
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
        setValidationErrors({});
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

  const isFormValid = formData.name.trim().length >= 5 && 
                     formData.name.trim().length <= 50 &&
                     validateEmail(formData.email) && 
                     formData.message.trim().length >= 10 && 
                     formData.message.trim().length <= 1000 &&
                     recaptchaToken;

  return (
    <div className="contact-form-container">
      <h3>Ready to light up your ride? Send us a message!</h3>
      
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
            onBlur={handleBlur}
            required
            disabled={isSubmitting}
            placeholder="Enter your full name (5-50 characters)"
            className={validationErrors.name ? 'error' : ''}
          />
          <small className="hint-text">5-50 characters required</small>
          {validationErrors.name && (
            <div className="field-error">{validationErrors.name}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
            required
            disabled={isSubmitting}
            placeholder="Enter your email address"
            className={validationErrors.email ? 'error' : ''}
          />
          <small className="hint-text">Must be a valid email address (e.g., user@example.com)</small>
          {validationErrors.email && (
            <div className="field-error">{validationErrors.email}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="message">Message *</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            onBlur={handleBlur}
            rows={5}
            required
            disabled={isSubmitting}
            placeholder="Tell us about your lighting project... (10-1000 characters)"
            className={validationErrors.message ? 'error' : ''}
          />
          <small className="hint-text">10-1000 characters required</small>
          {validationErrors.message && (
            <div className="field-error">{validationErrors.message}</div>
          )}
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