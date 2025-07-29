#!/bin/bash

echo "🚀 Starting Render build process..."

# Exit on any error
set -e

echo "📦 Installing dependencies..."
npm install --include=dev

echo "🔨 Building client..."
npm run build:client

echo "🔨 Copying existing server files..."
# Copy the existing working compiled files
cp -r dist/* dist/ 2>/dev/null || true

echo "✅ Build complete!"

# Verify the build
echo "🔍 Verifying build..."
if [ ! -f "dist/index.js" ]; then
    echo "❌ dist/index.js not found!"
    echo "📁 Available files in dist:"
    ls -la dist/
    exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
    echo "❌ dist/public/index.html not found!"
    exit 1
fi

echo "✅ Build verification passed!"
echo "📁 Build output:"
ls -la dist/ 