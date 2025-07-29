#!/bin/bash

echo "🚀 Preparing for Render deployment..."

# Exit on any error
set -e

echo "📦 Installing dependencies..."
npm install --include=dev

echo "🔨 Building client..."
npm run build:client

echo "🔍 Checking for existing server files..."
if [ ! -f "dist/index.js" ]; then
    echo "❌ Server files not found. Please ensure the server has been built locally first."
    echo "💡 Run 'npm run build' locally to generate the server files."
    exit 1
fi

echo "✅ All files present!"
echo "📁 Deployment files:"
ls -la dist/

echo "🚀 Ready for Render deployment!" 