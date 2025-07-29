#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying deployment build...\n');

// Check if dist directory exists
const distPath = './dist';
if (!fs.existsSync(distPath)) {
  console.error('❌ dist directory not found');
  process.exit(1);
}

// Check for required files (minimal server approach)
const requiredFiles = [
  'index.js',
  'public/index.html'
];

const missingFiles = [];

for (const file of requiredFiles) {
  const filePath = path.join(distPath, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
}

if (missingFiles.length > 0) {
  console.error('❌ Missing required files:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  process.exit(1);
}

// Check if files have content
const emptyFiles = [];

for (const file of requiredFiles) {
  const filePath = path.join(distPath, file);
  const stats = fs.statSync(filePath);
  if (stats.size === 0) {
    emptyFiles.push(file);
  }
}

if (emptyFiles.length > 0) {
  console.error('❌ Empty files detected:');
  emptyFiles.forEach(file => console.error(`   - ${file}`));
  process.exit(1);
}

// Check for client assets
const publicPath = path.join(distPath, 'public');
if (fs.existsSync(publicPath)) {
  const assets = fs.readdirSync(publicPath);
  const assetsDir = path.join(publicPath, 'assets');
  let hasAssets = false;
  
  // Check main public directory
  hasAssets = assets.some(file => file.includes('.js') || file.includes('.css'));
  
  // Check assets subdirectory
  if (!hasAssets && fs.existsSync(assetsDir)) {
    const assetFiles = fs.readdirSync(assetsDir);
    hasAssets = assetFiles.some(file => file.includes('.js') || file.includes('.css'));
  }
  
  if (!hasAssets) {
    console.warn('⚠️  No client assets found in public directory');
  }
}

console.log('✅ All required files present and have content');
console.log('✅ Build verification complete');
console.log('\n📋 Deployment checklist:');
console.log('   - [ ] Set DATABASE_URL environment variable');
console.log('   - [ ] Set SESSION_SECRET environment variable');
console.log('   - [ ] Set NODE_ENV=production');
console.log('   - [ ] Ensure database is accessible from Render');
console.log('\n📁 Deployment files:');
console.log('   - index.js (minimal server with all functionality)');
console.log('   - public/ (client build files)'); 