import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import './ContactForm.css';
import { API_ENDPOINTS } from '../constants';
import { validateEmail, validateField, validateForm, validatePhone, isGmailEmail } from '../utils/validation';
import { ContactFormData, ValidationErrors } from '../types';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [isNonGmailWarningDismissed, setIsNonGmailWarningDismissed] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Format phone number for display: (xxx) xxx-xxxx
  const formatPhoneNumber = (digits: string): string => {
    const cleaned = digits.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return `(${cleaned}`;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  // Get display value for phone field (formatted)
  const getPhoneDisplayValue = (): string => {
    return formatPhoneNumber(formData.phone);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // For phone field, extract digits and format for display
    let processedValue = value;
    if (name === 'phone') {
      // Extract only digits
      const digitsOnly = value.replace(/\D/g, '');
      // Limit to 10 digits
      const limitedDigits = digitsOnly.slice(0, 10);
      // Store raw digits in formData
      processedValue = limitedDigits;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof ContactFormData]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    // Reset non-gmail warning dismissal when email changes
    if (name === 'email') {
      setIsNonGmailWarningDismissed(false);
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

  const validateFormData = (): boolean => {
    const validation = validateForm(formData, recaptchaToken);
    setValidationErrors(validation.errors);
    setErrorMessage(validation.errorMessage);
    return validation.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!validateFormData()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Use Netlify Function endpoint from constants
      const response = await fetch(API_ENDPOINTS.CONTACT, {
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
        setFormData({ name: '', email: '', phone: '', message: '' });
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

  // Helper function to determine field validation state
  const getFieldValidationState = (name: keyof ContactFormData): 'valid' | 'invalid' | 'warning' | 'neutral' => {
    const value = formData[name];
    const error = validationErrors[name];
    
    if (error) {
      return 'invalid';
    }
    
    if (name === 'name') {
      const trimmed = value.trim();
      if (trimmed.length >= 5 && trimmed.length <= 50) {
        return 'valid';
      }
    } else if (name === 'email') {
      if (validateEmail(value)) {
        const emailLower = value.toLowerCase().trim();
        if (isGmailEmail(value)) {
          return 'valid';
        } else if (emailLower.includes('@gmail') && !emailLower.endsWith('@gmail.com')) {
          // User is in the process of typing @gmail.com, don't show warning yet
          return 'valid';
        } else if (!isNonGmailWarningDismissed) {
          // Valid email that doesn't contain @gmail, show warning
          return 'warning';
        } else {
          return 'valid';
        }
      }
    } else if (name === 'phone') {
      if (validatePhone(value)) {
        return 'valid';
      }
    } else if (name === 'message') {
      const trimmed = value.trim();
      if (trimmed.length >= 10 && trimmed.length <= 1000) {
        return 'valid';
      }
    }
    
    return 'neutral';
  };

  const isFormValid = formData.name.trim().length >= 5 && 
                     formData.name.trim().length <= 50 &&
                     validateEmail(formData.email) && 
                     validatePhone(formData.phone) &&
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
            className={getFieldValidationState('name')}
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
            className={getFieldValidationState('email')}
          />
          <small className="hint-text">Must be a valid email address (e.g., user@example.com)</small>
          {validationErrors.email && (
            <div className="field-error">{validationErrors.email}</div>
          )}
          {getFieldValidationState('email') === 'warning' && !isNonGmailWarningDismissed && (
            <div className="field-warning">
              <button
                type="button"
                className="warning-dismiss"
                onClick={() => setIsNonGmailWarningDismissed(true)}
                aria-label="Dismiss warning"
              >
                ×
              </button>
              <span>Please check your email's spam folder for our response!</span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={getPhoneDisplayValue()}
            onChange={handleInputChange}
            onBlur={handleBlur}
            required
            disabled={isSubmitting}
            className={getFieldValidationState('phone')}
          />
          {validationErrors.phone && (
            <div className="field-error">{validationErrors.phone}</div>
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
            className={getFieldValidationState('message')}
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