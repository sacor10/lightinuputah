# Local Development Guide

## Running the Server Locally

### Option 1: Netlify Dev (Recommended)

First, you need to build the React app:
```bash
npm run build
```

Then start the Netlify dev server:
```bash
npm run serve-netlify
```

The server will be available at: http://localhost:8888

### Option 2: React Dev Server (No Functions)

If you only want to develop the UI without testing the contact form:
```bash
npm start
```

This runs on http://localhost:3000 but won't have Netlify Functions.

## Environment Variables for Local Testing

Set these environment variables in PowerShell:

```powershell
$env:BREVO_API_KEY="your-brevo-api-key"
$env:RECAPTCHA_SECRET_KEY="your-recaptcha-secret"
$env:REACT_APP_RECAPTCHA_SITE_KEY="your-recaptcha-site-key"
```

## Testing the Contact Function

Once the server is running on http://localhost:8888:

1. Navigate to your site at http://localhost:8888
2. Go to the contact form page
3. Fill out the form with test data
4. Submit and check the console for any errors

## Testing the Function Directly

You can test the function with a tool like curl or Postman:

```bash
curl -X POST http://localhost:8888/.netlify/functions/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Test message","recaptchaToken":"test-token"}'
```

Note: This will likely fail reCAPTCHA validation since it's not a real token.

## Troubleshooting

### 404 Error on `/.netlify/functions/contact`

- Make sure you built the app first: `npm run build`
- Make sure you're running `npm run serve-netlify` not `npm start`
- Check that the function file exists at `netlify/functions/contact.js`

### Module Not Found Error

- Make sure dependencies are installed: `cd netlify/functions && npm install`
- Check that `@getbrevo/brevo` is listed in `netlify/functions/package.json`

### Brevo API Errors

- Verify your API key is set correctly
- Check the Brevo dashboard to ensure your account is active
- Make sure your sender email is verified in Brevo
