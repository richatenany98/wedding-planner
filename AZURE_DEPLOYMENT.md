# Azure Deployment Guide for WeddingWizard

## 🚀 Quick Start

### 1. Database Setup (Keep Neon)
- **Use your existing Neon PostgreSQL database**
- **No need to create Azure Database for PostgreSQL**
- **Select "No database" when creating Azure App Service**

### 2. Azure App Service Creation

#### Step 1: Create App Service
1. Go to Azure Portal → App Services → Create
2. **Basics:**
   - **Name**: `weddingwizard-app` (or your preferred name)
   - **Publish**: Code
   - **Runtime stack**: Node.js (LTS)
   - **Operating system**: Linux
   - **Region**: Choose closest to your users
   - **App Service Plan**: Basic B1 or Standard S1 (recommended)

#### Step 2: Database Configuration
- **Database**: Select **"No database"** or **"Skip database"**
- **We'll use your existing Neon PostgreSQL**

#### Step 3: Review & Create
- Review settings and create the App Service

### 3. Environment Variables Setup

In Azure Portal → Your App Service → Configuration → Application settings:

```
DATABASE_URL=postgresql://neondb_owner:npg_C8PmhdYaXf4k@ep-small-violet-adrgdmdm-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
SESSION_SECRET=your-production-session-secret-here-make-it-long-and-random
NODE_ENV=production
PORT=8080
```

### 4. Deployment Methods

#### Option A: GitHub Actions (Recommended)
1. Push your code to GitHub
2. In Azure Portal → App Service → Deployment Center
3. Choose **GitHub** as source
4. Connect your repository
5. Set branch to `main` or `master`
6. Azure will auto-deploy on push

#### Option B: Azure CLI
```bash
# Install Azure CLI
npm install -g azure-cli

# Login to Azure
az login

# Deploy
az webapp up --name weddingwizard-app --resource-group your-resource-group
```

#### Option C: VS Code Extension
1. Install "Azure App Service" extension
2. Right-click project folder
3. Select "Deploy to Web App"

### 5. Build Configuration

Your `package.json` already has the correct scripts:
- `build`: Builds both client and server
- `start`: Runs the production server

### 6. Custom Domain (Optional)
1. Go to App Service → Custom domains
2. Add your domain
3. Configure DNS records
4. Enable HTTPS

### 7. Monitoring & Scaling
- **Application Insights**: Enable for monitoring
- **Auto-scaling**: Configure based on CPU/memory usage
- **Backup**: Enable automated backups

## 🔧 Troubleshooting

### Common Issues:
1. **Build fails**: Check Node.js version compatibility
2. **Database connection**: Verify DATABASE_URL is correct
3. **Port issues**: Ensure PORT=8080 is set
4. **Session issues**: Check SESSION_SECRET is set

### Logs:
- View logs in Azure Portal → App Service → Log stream
- Check Application Insights for detailed monitoring

## 💰 Cost Optimization

### Free Tier (F1):
- Limited resources, good for testing
- 1GB RAM, shared CPU

### Basic Tier (B1):
- $13/month, dedicated resources
- 1.75GB RAM, shared CPU

### Standard Tier (S1):
- $73/month, better performance
- 1.75GB RAM, shared CPU

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit secrets to code
2. **HTTPS**: Always enable HTTPS in production
3. **Session Secret**: Use a strong, random session secret
4. **Database**: Keep Neon database secure with proper access controls

## 📊 Performance Tips

1. **Enable compression** in Azure App Service
2. **Use CDN** for static assets
3. **Optimize images** before deployment
4. **Monitor performance** with Application Insights

## 🚀 Next Steps

1. Deploy to staging environment first
2. Test all functionality thoroughly
3. Set up monitoring and alerts
4. Configure automated backups
5. Set up CI/CD pipeline for future updates 