# Migration Guide: Netlify Static + Netlify Functions

This guide walks you through deploying your React app to Netlify with Netlify Functions handling the contact form functionality.

## Architecture Overview

**Before:**
- Express server with `/api/contact` endpoint
- Single server handling both static files and API

**After:**
- Netlify serves static files only
- Netlify Functions handle contact form processing
- Better separation of concerns and cost optimization

## Migration Steps

### 1. Update Contact Form Configuration

The contact form now uses Netlify Functions instead of a server endpoint:

```typescript
// In ContactForm.tsx
const NETLIFY_FUNCTIONS_URL = process.env.REACT_APP_NETLIFY_FUNCTIONS_URL || '/.netlify/functions';
const contactEndpoint = `${NETLIFY_FUNCTIONS_URL}/contact`;
```

### 2. Update Netlify Configuration

Ensure your `netlify.toml` is properly configured:

```toml
[build]
  publish = "build"
  functions = "netlify/functions"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  node_bundler = "esbuild"
```

### 3. Environment Variables

Update your environment variables:

```bash
# Remove Heroku-specific variables
# REACT_APP_HEROKU_APP_NAME

# Add Netlify-specific variables
REACT_APP_NETLIFY_SITE_ID=your-site-id
REACT_APP_NETLIFY_FUNCTIONS_URL=https://your-site.netlify.app/.netlify/functions
```

## Benefits of Migration

- **Cost Optimization**: Netlify static hosting is more cost-effective
- **Performance**: CDN distribution for static assets
- **Scalability**: Automatic scaling for functions
- **Maintenance**: Less server management overhead

## Testing

1. **Local Testing**:
   ```bash
   npm run test:netlify
   npm run test:contact
   ```

2. **Production Testing**:
   - Deploy to Netlify
   - Test contact form functionality
   - Verify CORS headers work correctly

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Check that your Netlify domain is allowed
   - Verify function URL is correct

2. **Function Not Found**:
   - Ensure `netlify/functions/contact.js` exists
   - Check `netlify.toml` configuration

3. **Environment Variables**:
   - Verify all required variables are set in Netlify dashboard
   - Check variable naming (REACT_APP_ prefix for client-side)

### Debugging

1. **Netlify Function Logs**:
   ```bash
   netlify functions:logs
   ```

2. **Build Logs**:
   - Check Netlify dashboard for build errors
   - Verify build output directory

3. **Rollback Strategy**:
   - Keep previous deployment as backup
   - Use Netlify's rollback feature if needed

## Resources

- **Netlify**: Check Netlify documentation
- **Functions**: Netlify Functions documentation
- **Deployment**: Netlify deployment guides 