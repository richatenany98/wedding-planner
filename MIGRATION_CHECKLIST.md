# 🚀 Azure Database Migration Checklist

## Pre-Migration Setup

### ✅ Prerequisites
- [ ] Azure account with active subscription
- [ ] Azure CLI installed (`az --version`)
- [ ] PostgreSQL client tools installed (`pg_dump --version`, `psql --version`)
- [ ] Your Neon database is accessible

### ✅ Azure Database Creation
- [ ] Create resource group: `weddingwizard-rg`
- [ ] Create PostgreSQL Flexible Server: `weddingwizard-db`
- [ ] Configure firewall rules (allow Azure services + your IP)
- [ ] Create database: `weddingwizard`
- [ ] Note down connection string

### ✅ Update Migration Script
- [ ] Edit `migrate-to-azure.js`
- [ ] Update Azure connection string with your actual credentials
- [ ] Test connection to Azure database

---

## Migration Process

### ✅ Step 1: Export from Neon
```bash
node migrate-to-azure.js export
```
- [ ] Backup file created: `neon_backup.sql`
- [ ] Verify file size and content
- [ ] Check table counts in backup

### ✅ Step 2: Import to Azure
```bash
node migrate-to-azure.js import
```
- [ ] Schema imported successfully
- [ ] Data imported successfully
- [ ] Verify table counts match

### ✅ Step 3: Test Application
- [ ] Update local `.env` with Azure DATABASE_URL
- [ ] Run application locally: `npm run dev`
- [ ] Test all functionality:
  - [ ] User registration/login
  - [ ] Wedding profile creation
  - [ ] Guest management
  - [ ] Vendor management
  - [ ] Budget tracking
  - [ ] Task management

---

## Azure App Service Deployment

### ✅ Create App Service
- [ ] Create App Service Plan: `weddingwizard-plan`
- [ ] Create Web App: `weddingwizard-app`
- [ ] Configure Node.js runtime

### ✅ Environment Variables
- [ ] Set `DATABASE_URL` (Azure connection string)
- [ ] Set `SESSION_SECRET` (strong production secret)
- [ ] Set `NODE_ENV=production`

### ✅ Deploy Application
- [ ] Choose deployment method (GitHub Actions recommended)
- [ ] Deploy code to Azure
- [ ] Verify deployment success

---

## Post-Migration Verification

### ✅ Data Integrity
- [ ] All tables have correct row counts
- [ ] Relationships between tables intact
- [ ] No data corruption or missing records

### ✅ Application Functionality
- [ ] All pages load correctly
- [ ] CRUD operations work
- [ ] Authentication works
- [ ] File uploads work
- [ ] Real-time features work

### ✅ Performance
- [ ] Page load times acceptable
- [ ] Database queries perform well
- [ ] No timeout errors

---

## Security & Monitoring

### ✅ Security Setup
- [ ] SSL enabled (default in Azure)
- [ ] Strong passwords configured
- [ ] Firewall rules properly set
- [ ] Environment variables secured

### ✅ Monitoring
- [ ] Azure Monitor enabled
- [ ] Application Insights configured
- [ ] Alerts set up for critical issues
- [ ] Backup retention configured

---

## Rollback Plan

### ✅ Keep Neon Active
- [ ] Don't delete Neon database yet
- [ ] Keep Neon connection string handy
- [ ] Test rollback procedure

### ✅ Rollback Procedure
If issues occur:
1. [ ] Update `DATABASE_URL` back to Neon
2. [ ] Deploy change to Azure
3. [ ] Verify application works with Neon
4. [ ] Investigate Azure issues
5. [ ] Retry migration when ready

---

## Cleanup (After Successful Migration)

### ✅ Decommission Neon
- [ ] Confirm Azure migration is stable (1-2 weeks)
- [ ] Export final backup from Neon
- [ ] Delete Neon project
- [ ] Update documentation

### ✅ Update Documentation
- [ ] Update deployment guides
- [ ] Update environment variable documentation
- [ ] Update team on new database setup

---

## Cost Optimization

### ✅ Monitor Usage
- [ ] Track Azure database costs
- [ ] Monitor App Service usage
- [ ] Optimize based on actual usage patterns
- [ ] Consider scaling down if over-provisioned

---

## ✅ Migration Complete!

**Congratulations!** Your WeddingWizard app is now running on Azure Database for PostgreSQL.

**Next Steps:**
1. Monitor performance and costs
2. Set up automated backups
3. Configure alerts for critical issues
4. Plan for future scaling needs 