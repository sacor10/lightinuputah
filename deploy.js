#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment process...');

// Check if build directory exists
const buildPath = path.join(__dirname, 'build');
if (!fs.existsSync(buildPath)) {
  console.log('📦 Building React application...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Build directory already exists');
}

// Check if server files exist
const serverFiles = ['server.js', 'server-enhanced.js', 'cluster-config.js'];
for (const file of serverFiles) {
  if (!fs.existsSync(path.join(__dirname, file))) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
}

console.log('✅ All required files present');

// Set production environment
process.env.NODE_ENV = 'production';

console.log('🎯 Starting clustered server...');
console.log('📊 Server will be available at: http://localhost:3000');
console.log('📈 Memory monitoring enabled');
console.log('🔄 Auto-restart on memory pressure enabled');

// Start the enhanced server
try {
  execSync('node server-enhanced.js', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Server startup failed:', error.message);
  process.exit(1);
} 