# Azure Database Migration Guide

## 🚀 Migrating from Neon to Azure Database for PostgreSQL

### Prerequisites
- Azure account with subscription
- Azure CLI installed
- Your existing Neon database (for data export)
- pg_dump and psql tools (or use Azure Data Studio)

---

## Step 1: Create Azure Database for PostgreSQL

### 1.1 Create PostgreSQL Flexible Server
```bash
# Login to Azure
az login

# Create resource group (if you don't have one)
az group create --name weddingwizard-rg --location eastus

# Create PostgreSQL Flexible Server
az postgres flexible-server create \
  --resource-group weddingwizard-rg \
  --name weddingwizard-db \
  --location eastus \
  --admin-user dbadmin \
  --admin-password "YourStrongPassword123!" \
  --sku-name Standard_B1ms \
  --version 15 \
  --storage-size 32
```

### 1.2 Configure Firewall Rules
```bash
# Allow Azure services
az postgres flexible-server firewall-rule create \
  --resource-group weddingwizard-rg \
  --name weddingwizard-db \
  --rule-name allow-azure-services \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Allow your IP (replace with your actual IP)
az postgres flexible-server firewall-rule create \
  --resource-group weddingwizard-rg \
  --name weddingwizard-db \
  --rule-name allow-my-ip \
  --start-ip-address YOUR_IP_ADDRESS \
  --end-ip-address YOUR_IP_ADDRESS
```

### 1.3 Create Database
```bash
# Create the database
az postgres flexible-server db create \
  --resource-group weddingwizard-rg \
  --server-name weddingwizard-db \
  --database-name weddingwizard
```

---

## Step 2: Export Data from Neon

### 2.1 Export Schema and Data
```bash
# Export everything from Neon
pg_dump "postgresql://neondb_owner:npg_C8PmhdYaXf4k@ep-small-violet-adrgdmdm-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" \
  --clean --if-exists --no-owner --no-privileges \
  --file neon_backup.sql
```

### 2.2 Alternative: Export via Neon Console
1. Go to Neon Console
2. Select your project
3. Go to "SQL Editor"
4. Run: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`
5. Export each table individually if needed

---

## Step 3: Import Data to Azure

### 3.1 Get Azure Connection String
```bash
# Get the connection string
az postgres flexible-server show \
  --resource-group weddingwizard-rg \
  --name weddingwizard-db \
  --query "connectionString"
```

### 3.2 Import Data
```bash
# Import the backup to Azure
psql "postgresql://dbadmin:YourStrongPassword123!@weddingwizard-db.postgres.database.azure.com:5432/weddingwizard?sslmode=require" \
  -f neon_backup.sql
```

---

## Step 4: Update Application Configuration

### 4.1 Update Environment Variables
Replace your Neon DATABASE_URL with Azure connection string:

```bash
# New Azure DATABASE_URL format
DATABASE_URL="postgresql://dbadmin:YourStrongPassword123!@weddingwizard-db.postgres.database.azure.com:5432/weddingwizard?sslmode=require"
```

### 4.2 Update Drizzle Configuration
Your `drizzle.config.ts` should work as-is, just update the DATABASE_URL.

---

## Step 5: Verify Migration

### 5.1 Check Data Integrity
```sql
-- Connect to Azure database and run:
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM wedding_profiles;
SELECT COUNT(*) FROM guests;
SELECT COUNT(*) FROM vendors;
SELECT COUNT(*) FROM budget_items;
SELECT COUNT(*) FROM tasks;
```

### 5.2 Test Application
1. Update your local `.env` file with Azure DATABASE_URL
2. Run your application locally
3. Verify all functionality works
4. Check that all data is accessible

---

## Step 6: Deploy to Azure App Service

### 6.1 Create App Service
```bash
# Create App Service Plan
az appservice plan create \
  --resource-group weddingwizard-rg \
  --name weddingwizard-plan \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --resource-group weddingwizard-rg \
  --plan weddingwizard-plan \
  --name weddingwizard-app \
  --runtime "NODE|18-lts"
```

### 6.2 Configure Environment Variables
```bash
# Set environment variables
az webapp config appsettings set \
  --resource-group weddingwizard-rg \
  --name weddingwizard-app \
  --settings \
    DATABASE_URL="postgresql://dbadmin:YourStrongPassword123!@weddingwizard-db.postgres.database.azure.com:5432/weddingwizard?sslmode=require" \
    SESSION_SECRET="your-production-session-secret" \
    NODE_ENV="production"
```

---

## Step 7: Security and Optimization

### 7.1 Enable SSL
Azure Database for PostgreSQL requires SSL by default (good for security).

### 7.2 Configure Connection Pooling
```bash
# Enable connection pooling
az postgres flexible-server parameter set \
  --resource-group weddingwizard-rg \
  --server-name weddingwizard-db \
  --name max_connections \
  --value 100
```

### 7.3 Set Up Monitoring
1. Enable Azure Monitor for PostgreSQL
2. Set up alerts for high CPU/memory usage
3. Configure backup retention policies

---

## Troubleshooting

### Common Issues:

1. **Connection Timeout**
   - Check firewall rules
   - Verify connection string format
   - Ensure SSL is enabled

2. **Authentication Errors**
   - Verify username/password
   - Check if user has proper permissions

3. **Data Import Errors**
   - Check for encoding issues
   - Verify schema compatibility
   - Look for constraint violations

### Useful Commands:
```bash
# Test connection
psql "postgresql://dbadmin:YourStrongPassword123!@weddingwizard-db.postgres.database.azure.com:5432/weddingwizard?sslmode=require"

# Check server status
az postgres flexible-server show \
  --resource-group weddingwizard-rg \
  --name weddingwizard-db

# View logs
az postgres flexible-server logs list \
  --resource-group weddingwizard-rg \
  --server-name weddingwizard-db
```

---

## Cost Comparison

### Neon (Current):
- Serverless: Pay per query
- ~$5-20/month for typical usage

### Azure Database for PostgreSQL:
- Standard_B1ms: ~$25/month
- Standard_B2s: ~$50/month
- Standard_D2s_v3: ~$70/month

### Recommendation:
- Start with Standard_B1ms for development
- Scale up based on usage patterns

---

## Rollback Plan

If you need to rollback to Neon:
1. Keep your Neon database active during migration
2. Update DATABASE_URL back to Neon connection string
3. Deploy the change
4. Your app will be back to using Neon

---

## Next Steps After Migration

1. ✅ Test all functionality thoroughly
2. ✅ Set up automated backups
3. ✅ Configure monitoring and alerts
4. ✅ Update documentation
5. ✅ Plan for future scaling
6. ✅ Consider decommissioning Neon (after confirming everything works) 