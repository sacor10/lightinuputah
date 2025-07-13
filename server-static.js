const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || (process.env.NETLIFY_DEV ? 8888 : 3000);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable helmet's CSP
}));

// Add our own CSP headers
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: https://images.ctfassets.net; connect-src 'self' https://cdn.contentful.com https://images.ctfassets.net https://www.google.com; frame-src 'self' https://www.google.com; object-src 'none';"
  );
  next();
});

// Compression middleware
app.use(compression());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Cache static assets
app.use('/static', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  next();
});

// Cache images
app.use(/\.(png|jpg|jpeg|gif|svg|ico)$/, (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  next();
});

// Don't cache HTML files
app.use(/\.html$/, (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  next();
});

// Serve React app for all other routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).send('Internal server error');
});

app.listen(PORT, () => {
  console.log(`Static server running on port ${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'build')}`);
}); 