#!/bin/bash

echo "🚀 Building for Render..."

# Exit on any error
set -e

echo "📦 Installing dependencies..."
npm install --include=dev

echo "🔨 Building client..."
npm run build:client

echo "📁 Creating dist directory..."
mkdir -p dist

echo "📋 Copying server file..."
cp render-server.js dist/index.js

echo "✅ Build complete!"
echo "📁 Files in dist:"
ls -la dist/
echo "📁 Files in dist/public:"
ls -la dist/public/ 