# LightinUpUtah

**Website:** [www.lightinuputah.com](https://www.lightinuputah.com)

Professional LED car lighting installation services website storefront for LightinUpUtah

## Environment Setup

This project uses Contentful CMS for content management and includes a contact form with SendGrid email integration and reCAPTCHA protection. To set up the environment variables:

1. Create a `.env` file in the project root
2. Add the following variables with your actual Contentful credentials:

```env
# Contentful CMS Configuration
REACT_APP_CONTENTFUL_SPACE_ID=your_space_id_here
REACT_APP_CONTENTFUL_ACCESS_TOKEN=your_access_token_here

# SendGrid Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here

# reCAPTCHA Configuration
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
```

3. Restart your development server after creating the `.env` file

**Important Security Notes:**
- Never commit your `.env` file to version control
- The `.env` file is already included in `.gitignore`
- Use different API keys for development and production environments
- Consider using Contentful's preview tokens for development and delivery tokens for production

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see above)

3. Start the development server:
```bash
npm start
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (not recommended)
- `npm run dev-contact` - Runs the app with contact form functionality
- `npm run serve-contact` - Serves the production build with contact form

## Contact Form

The application includes a contact form with the following features:
- reCAPTCHA v2 protection
- SendGrid email integration
- Email threading for customer replies
- Professional email templates

For detailed setup instructions, see `CONTACT_FORM_SETUP.md`.