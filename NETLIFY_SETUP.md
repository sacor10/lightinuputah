# Netlify Setup Guide

This guide explains how to set up the contact form functionality on Netlify.

## Environment Variables

You need to set the following environment variables in your Netlify dashboard:

### Required Variables

1. **BREVO_API_KEY**
   - Your Brevo API key for sending emails
   - Get this from your Brevo dashboard at https://www.brevo.com

2. **RECAPTCHA_SECRET_KEY**
   - Your reCAPTCHA secret key for server-side verification
   - Get this from Google reCAPTCHA admin console

### Frontend Variables (in React app)

1. **REACT_APP_RECAPTCHA_SITE_KEY**
   - Your reCAPTCHA site key for client-side verification
   - This should be set in your build environment

## Setting Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Navigate to your site settings
3. Go to "Environment variables"
4. Add each variable with its corresponding value

## Function Dependencies

The Netlify Function requires the `@getbrevo/brevo` package. This is managed in `netlify/functions/package.json`.

## Testing the Function

You can test the function locally using Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Test the function locally
netlify dev
```

## Function Endpoint

The contact form function is available at: `/.netlify/functions/contact`

## CORS Configuration

The function includes CORS headers to allow cross-origin requests from your Netlify domain.

## Error Handling

The function includes comprehensive error handling for:
- Missing required fields
- Invalid email format
- reCAPTCHA verification failures
- Brevo API errors
- Network errors

## Email Templates

The function sends two emails:
1. **Contact submission** to info@lightinuputah.com
2. **Confirmation receipt** to the customer

Both emails use HTML templates with styling for professional appearance. 