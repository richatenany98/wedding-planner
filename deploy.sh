#!/bin/bash

echo "Building the application..."
npm run build

echo "Deploying to Azure..."
# You'll need to run this command manually with your Azure credentials
echo "Please run: az webapp deployment source config-zip --resource-group YOUR_RESOURCE_GROUP --name wedding-planner-hjgegeadbnaqfkge --src dist.zip"

echo "Creating deployment package..."
cd dist
zip -r ../dist.zip .
cd ..

echo "Deployment package created as dist.zip"
echo "Upload this file to Azure Web App" 