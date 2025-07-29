#!/bin/bash

echo "🧹 Cleaning up Azure deployment configurations..."

# Remove Azure workflow file (already done)
if [ -f ".github/workflows/azure-webapps.yml" ]; then
    rm .github/workflows/azure-webapps.yml
    echo "✅ Removed Azure workflow file"
else
    echo "ℹ️  Azure workflow file already removed"
fi

# Check for Azure-related files
echo "🔍 Checking for other Azure-related files..."

if [ -f "publishProfile.xml" ]; then
    echo "⚠️  Found publishProfile.xml - you may want to remove this if no longer needed"
fi

if [ -f "AZURE_DEPLOYMENT.md" ]; then
    echo "⚠️  Found AZURE_DEPLOYMENT.md - you may want to remove this if no longer needed"
fi

if [ -f "AZURE_DATABASE_MIGRATION.md" ]; then
    echo "⚠️  Found AZURE_DATABASE_MIGRATION.md - you may want to remove this if no longer needed"
fi

echo "✅ Cleanup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Push your changes to GitHub"
echo "2. Set up your Render deployment"
echo "3. Configure environment variables in Render dashboard"
echo "4. Remove any Azure-related secrets from GitHub repository settings" 