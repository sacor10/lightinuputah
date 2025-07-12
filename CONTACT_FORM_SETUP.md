# Contact Form Setup Guide

This guide explains how to set up and use the contact form with reCAPTCHA and SendGrid email functionality.

## Features

- **Contact Form**: Name, email, and message fields
- **reCAPTCHA v2**: "I'm not a robot" verification
- **SendGrid Integration**: Sends two emails per submission
- **Email Threading**: Customer replies go to info@lightinuputah.com

## Email Flow

1. **Contact Submission Email** → `info@lightinuputah.com`
   - From: `info@lightinuputah.com`
   - Reply-To: Customer's email
   - Subject: "New Contact: [Customer Name]"

2. **Receipt Confirmation Email** → Customer's email
   - From: `info@lightinuputah.com`
   - Reply-To: `info@lightinuputah.com`
   - Subject: "Thanks for contacting Lightin Up Utah!"

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key_here

# reCAPTCHA  
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
```

**Important Security Notes:**
- Never commit your `.env` file to version control
- The `.env` file is already included in `.gitignore`
- Use different API keys for development and production environments
- Keep your API keys secure and rotate them regularly

### 2. Install Dependencies

```bash
npm install
```

### 3. Build and Run

For development with contact form:
```bash
npm run dev-contact
```

For production:
```bash
npm run build
npm run serve-contact
```

## File Structure

- `src/components/ContactForm.tsx` - React contact form component
- `src/components/ContactForm.css` - Contact form styles
- `server-with-contact.js` - Express server with contact API
- `src/App.tsx` - Updated to include contact form

## API Endpoint

- **POST** `/api/contact`
- **Body**: `{ name, email, message, recaptchaToken }`
- **Response**: `{ success: boolean, message: string }`

## Security Features

- reCAPTCHA v2 verification
- Email validation
- Input sanitization
- CORS protection
- Error handling

## Security Best Practices

**CRITICAL: API Key Security**
- Never commit API keys or secrets to version control
- Use environment variables for all sensitive configuration
- Rotate API keys regularly
- Use different keys for development and production
- Monitor API key usage for suspicious activity

**Environment Variable Management**
- Keep your `.env` file local and never commit it
- Use `.env.example` files with placeholder values for documentation
- Set environment variables securely in production environments
- Consider using a secrets management service for production

## Email Templates

Both emails use professional HTML templates with:
- Responsive design
- Brand colors
- Contact information
- Professional formatting

## Troubleshooting

### Common Issues

1. **reCAPTCHA not working**
   - Check that `REACT_APP_RECAPTCHA_SITE_KEY` is set correctly
   - Verify the domain is authorized in Google reCAPTCHA console

2. **Emails not sending**
   - Verify `SENDGRID_API_KEY` is correct
   - Check SendGrid account status and sending limits
   - Ensure `info@lightinuputah.com` is verified in SendGrid

3. **Form validation errors**
   - Check browser console for JavaScript errors
   - Verify all required fields are filled
   - Ensure reCAPTCHA is completed

### Testing

1. Fill out the contact form
2. Complete reCAPTCHA verification
3. Submit the form
4. Check for success message
5. Verify both emails are received

## Production Deployment

For production deployment:

1. Set environment variables on your hosting platform
2. Use `npm run build` to create production build
3. Deploy with `server-with-contact.js` as the entry point
4. Ensure HTTPS is enabled for reCAPTCHA to work

## Support

For issues or questions, contact the development team or refer to the SendGrid and reCAPTCHA documentation. 