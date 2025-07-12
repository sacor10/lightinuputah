#!/usr/bin/env node

// Heroku-specific build script
// This script handles the build process for Heroku deployments

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Heroku build process...');

try {
  // Step 1: Run security audit (but don't fail if vulnerabilities found)
  console.log('🔍 Running security audit...');
  try {
    execSync('npm audit', { stdio: 'inherit' });
    console.log('✅ Security audit completed');
  } catch (error) {
    console.log('⚠️  Security vulnerabilities found, but continuing build...');
    console.log('   Run "npm audit fix --force" locally to fix vulnerabilities');
  }

  // Step 2: Build the application with optimizations
  console.log('🏗️  Building application...');
  const buildEnv = {
    ...process.env,
    GENERATE_SOURCEMAP: 'false',
    INLINE_RUNTIME_CHUNK: 'false',
    NODE_ENV: 'production'
  };
  
  execSync('npx react-scripts build', { 
    stdio: 'inherit',
    env: buildEnv
  });
  console.log('✅ Build completed successfully');

  // Step 3: Verify build output
  if (fs.existsSync('./build')) {
    console.log('✅ Build directory created');
    const buildFiles = fs.readdirSync('./build');
    console.log(`📁 Build contains ${buildFiles.length} items`);
    
    // Check bundle sizes
    if (fs.existsSync('./build/static/js')) {
      const jsFiles = fs.readdirSync('./build/static/js');
      console.log(`📦 JavaScript bundles: ${jsFiles.length} files`);
    }
  } else {
    throw new Error('Build directory not found');
  }

  console.log('🎉 Heroku build completed successfully!');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 