# Migration Guide: Heroku Static + Netlify Functions

This guide walks you through migrating from Heroku running `server-with-contact.js` to using Heroku as a static site with Netlify handling the contact form functionality.

## Architecture Overview

**Before:**
- Heroku runs Express server with `/api/contact` endpoint
- Single platform handles both static files and API

**After:**
- Heroku serves static files only
- Netlify Functions handle contact form submissions
- Separation of concerns and better scalability

## Migration Steps

### 1. Set Up Netlify

1. **Create Netlify Account**
   - Sign up at [netlify.com](https://www.netlify.com)
   - Create a new site

2. **Connect Repository**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `build`

3. **Configure Environment Variables**
   - Go to Site Settings > Environment Variables
   - Add the following variables:
     - `SENDGRID_API_KEY`: Your SendGrid API key
     - `RECAPTCHA_SECRET_KEY`: Your reCAPTCHA secret key
     - `REACT_APP_RECAPTCHA_SITE_KEY`: Your reCAPTCHA site key

### 2. Update Heroku Configuration

1. **Deploy Updated Code**
   - The `Procfile` now points to `server-static.js`
   - This server only serves static files

2. **Remove Server Dependencies (Optional)**
   - You can remove these from `package.json` if not needed elsewhere:
     - `@sendgrid/mail`
     - `cors`
     - `dotenv`

### 3. Test the Setup

1. **Test Netlify Function Locally**
   ```bash
   npm install -g netlify-cli
   netlify dev
   ```

2. **Test Contact Form**
   - Submit a test message through the contact form
   - Verify emails are sent correctly
   - Check Netlify function logs

### 4. Update DNS (If Needed)

If you want to use a custom domain:
1. Configure domain in Netlify
2. Update DNS records to point to Netlify
3. Set up redirects if needed

## File Changes Summary

### New Files Created
- `netlify/functions/contact.js` - Contact form handler
- `netlify/functions/package.json` - Function dependencies
- `netlify.toml` - Netlify configuration
- `server-static.js` - Static file server for Heroku
- `NETLIFY_SETUP.md` - Netlify setup documentation
- `MIGRATION_GUIDE.md` - This guide

### Modified Files
- `src/components/ContactForm.tsx` - Updated to use Netlify function
- `package.json` - Added new scripts
- `Procfile` - Updated to use static server

## Benefits of This Architecture

1. **Cost Optimization**
   - Netlify Functions are pay-per-use
   - Heroku static hosting is more cost-effective

2. **Performance**
   - Static files served from CDN
   - Better caching and faster loading

3. **Scalability**
   - Functions auto-scale based on demand
   - No server management required

4. **Maintenance**
   - Less server-side code to maintain
   - Automatic deployments from Git

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure Netlify function includes proper CORS headers
   - Check that your Heroku domain is allowed

2. **Environment Variables**
   - Verify all variables are set in Netlify dashboard
   - Check that variable names match exactly

3. **Function Not Found**
   - Ensure `netlify.toml` is configured correctly
   - Check that function is in the right directory

4. **Email Not Sending**
   - Verify SendGrid API key is correct
   - Check Netlify function logs for errors

### Monitoring

1. **Netlify Function Logs**
   - Available in Netlify dashboard
   - Monitor for errors and performance

2. **Heroku Logs**
   - Check for static file serving issues
   - Monitor performance metrics

## Rollback Plan

If you need to rollback:
1. Revert `Procfile` to use `server-with-contact.js`
2. Revert `ContactForm.tsx` to use `/api/contact`
3. Deploy the old version to Heroku

## Support

For issues with:
- **Netlify**: Check Netlify documentation and community
- **Heroku**: Check Heroku documentation
- **SendGrid**: Check SendGrid support
- **reCAPTCHA**: Check Google reCAPTCHA documentation 