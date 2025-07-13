const fs = require('fs');
const path = require('path');

// Read the build directory
const buildDir = path.join(__dirname, 'build', 'static', 'js');
const files = fs.readdirSync(buildDir).filter(file => file.endsWith('.js'));

console.log('📦 Bundle Analysis Report');
console.log('========================\n');

let totalSize = 0;
const fileSizes = [];

files.forEach(file => {
  const filePath = path.join(buildDir, file);
  const stats = fs.statSync(filePath);
  const sizeInBytes = stats.size;
  const sizeInKB = (sizeInBytes / 1024).toFixed(2);
  
  fileSizes.push({
    name: file,
    size: sizeInKB,
    bytes: sizeInBytes
  });
  
  totalSize += sizeInBytes;
});

// Sort by size (largest first)
fileSizes.sort((a, b) => b.bytes - a.bytes);

console.log('File sizes (uncompressed):');
fileSizes.forEach(file => {
  console.log(`  ${file.name}: ${file.size} KB`);
});

console.log(`\nTotal JavaScript size: ${(totalSize / 1024).toFixed(2)} KB`);
console.log(`Estimated gzipped size: ~${(totalSize / 1024 * 0.3).toFixed(2)} KB`);

console.log('\n📊 Analysis:');
if (totalSize < 500 * 1024) { // Less than 500KB
  console.log('✅ Bundle size is excellent!');
} else if (totalSize < 1000 * 1024) { // Less than 1MB
  console.log('✅ Bundle size is good');
} else {
  console.log('⚠️  Bundle size could be optimized');
}

console.log('\n💡 Recommendations:');
if (fileSizes.length > 1) {
  console.log('✅ Good code splitting detected');
} else {
  console.log('💡 Consider implementing code splitting with React.lazy()');
}

console.log('✅ Consider enabling gzip compression on your server');
console.log('✅ Monitor bundle size in production with web-vitals'); 