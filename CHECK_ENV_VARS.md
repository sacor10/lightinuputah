# Environment Variables Checker

This guide helps you verify that all required environment variables are set in Netlify.

## Required Environment Variables

Your Netlify function needs these 3 environment variables:

1. **BREVO_API_KEY** - For sending emails via Brevo
2. **RECAPTCHA_SECRET_KEY** - For server-side reCAPTCHA verification  
3. **REACT_APP_RECAPTCHA_SITE_KEY** - For client-side reCAPTCHA display

## How to Check in Netlify

### Option 1: Netlify Dashboard
1. Go to https://app.netlify.com
2. Select your site: `lightinuputah`
3. Click **Site settings**
4. Click **Environment variables** in the left sidebar
5. Verify all 3 variables are listed

### Option 2: Netlify CLI
```bash
# Install Netlify CLI if needed
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link your local project to Netlify site
netlify link

# List all environment variables
netlify env:list
```

## How to Set Missing Variables

### Via Netlify Dashboard:
1. Go to Site settings → Environment variables
2. Click **Add a variable**
3. Enter variable name and value
4. Click **Create environment variable**

### Via Netlify CLI:
```bash
netlify env:set BREVO_API_KEY "your-brevo-api-key"
netlify env:set RECAPTCHA_SECRET_KEY "your-recaptcha-secret"
netlify env:set REACT_APP_RECAPTCHA_SITE_KEY "your-recaptcha-site-key"
```

## How to Get Your API Keys

### Brevo API Key:
1. Go to https://www.brevo.com
2. Navigate to **Settings** → **SMTP & API**
3. Copy your existing API key or generate a new one
4. Copy the key (you won't see it again!)

### reCAPTCHA Keys:
1. Go to https://www.google.com/recaptcha/admin
2. Create a new site or select existing site
3. Copy the **Site Key** (for REACT_APP_RECAPTCHA_SITE_KEY)
4. Copy the **Secret Key** (for RECAPTCHA_SECRET_KEY)

## After Setting Variables

1. **Trigger a new deploy:**
   ```bash
   git push origin main
   ```
   Or manually trigger in Netlify dashboard

2. **Wait for deployment to complete**

3. **Test the contact form** on your live site

4. **Check function logs:**
   - Go to Netlify dashboard
   - Navigate to **Functions** → **contact**
   - Click **Logs** to see if there are any errors

## Verify Logs Show the Error

After deployment, if you still get an error, check the function logs in Netlify. You should now see specific messages like:
- `BREVO_API_KEY is not set in environment variables`
- `CRITICAL: RECAPTCHA_SECRET_KEY environment variable is not set`

This will help you identify exactly which variable is missing.


