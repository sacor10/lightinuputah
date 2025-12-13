import { FORM_VALIDATION } from '../constants';
import { ContactFormData, ValidationErrors } from '../types';

export const validateEmail = (email: string): boolean => {
  return FORM_VALIDATION.EMAIL_REGEX.test(email);
};

export const isGmailEmail = (email: string): boolean => {
  if (!validateEmail(email)) {
    return false;
  }
  const emailLower = email.toLowerCase().trim();
  return emailLower.endsWith('@gmail.com');
};

export const validatePhone = (phone: string): boolean => {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  // Check if it's exactly 10 digits (area code + 7 digits)
  return FORM_VALIDATION.PHONE_REGEX.test(digitsOnly);
};

export const validateField = (name: keyof ContactFormData, value: string): string | undefined => {
  switch (name) {
    case 'name':
      if (!value.trim()) {
        return 'Name is required';
      }
      if (value.trim().length < FORM_VALIDATION.NAME_MIN_LENGTH) {
        return `Name must be at least ${FORM_VALIDATION.NAME_MIN_LENGTH} characters`;
      }
      if (value.trim().length > FORM_VALIDATION.NAME_MAX_LENGTH) {
        return `Name must be no more than ${FORM_VALIDATION.NAME_MAX_LENGTH} characters`;
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
    case 'phone':
      if (!value.trim()) {
        return 'Phone number is required';
      }
      if (!validatePhone(value)) {
        return 'Phone number must be 10 digits with area code (numbers only)';
      }
      break;
    case 'message':
      if (!value.trim()) {
        return 'Message is required';
      }
      if (value.trim().length < FORM_VALIDATION.MESSAGE_MIN_LENGTH) {
        return `Message must be at least ${FORM_VALIDATION.MESSAGE_MIN_LENGTH} characters`;
      }
      if (value.trim().length > FORM_VALIDATION.MESSAGE_MAX_LENGTH) {
        return `Message must be no more than ${FORM_VALIDATION.MESSAGE_MAX_LENGTH} characters`;
      }
      break;
  }
  return undefined;
};

export const validateForm = (formData: ContactFormData, recaptchaToken: string | null): {
  isValid: boolean;
  errors: ValidationErrors;
  errorMessage: string;
} => {
  const errors: ValidationErrors = {};
  
  errors.name = validateField('name', formData.name);
  errors.email = validateField('email', formData.email);
  errors.phone = validateField('phone', formData.phone);
  errors.message = validateField('message', formData.message);
  
  let errorMessage = '';
  
  if (!recaptchaToken) {
    errorMessage = 'Please complete the reCAPTCHA verification';
  } else {
    const hasErrors = Object.values(errors).some(error => error !== undefined);
    if (hasErrors) {
      errorMessage = 'Please fix the validation errors above';
    }
  }
  
  return {
    isValid: !errorMessage && Object.values(errors).every(error => error === undefined),
    errors,
    errorMessage
  };
}; 