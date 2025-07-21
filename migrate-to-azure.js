#!/usr/bin/env node

/**
 * Migration Script: Neon to Azure Database for PostgreSQL
 * 
 * This script helps migrate your WeddingWizard data from Neon to Azure
 * 
 * Usage:
 * 1. Export from Neon: node migrate-to-azure.js export
 * 2. Import to Azure: node migrate-to-azure.js import
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const config = {
  neon: {
    url: "postgresql://neondb_owner:npg_C8PmhdYaXf4k@ep-small-violet-adrgdmdm-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
  },
  azure: {
    url: "postgresql://dbadmin:WeddingWizard2024!@weddingwizard-db.postgres.database.azure.com:5432/weddingwizard?sslmode=require"
  },
  backupFile: join(__dirname, 'neon_backup.sql')
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m'  // Yellow
  };
  console.log(`${colors[type]}[${timestamp}] ${message}\x1b[0m`);
}

function checkPrerequisites() {
  try {
    // Check if pg_dump is available
    execSync('pg_dump --version', { stdio: 'pipe' });
    log('✅ pg_dump is available', 'success');
  } catch (error) {
    log('❌ pg_dump not found. Please install PostgreSQL client tools.', 'error');
    process.exit(1);
  }

  try {
    // Check if psql is available
    execSync('psql --version', { stdio: 'pipe' });
    log('✅ psql is available', 'success');
  } catch (error) {
    log('❌ psql not found. Please install PostgreSQL client tools.', 'error');
    process.exit(1);
  }
}

function exportFromNeon() {
  log('🚀 Starting export from Neon...', 'info');
  
  try {
    const command = `pg_dump "${config.neon.url}" --clean --if-exists --no-owner --no-privileges --file "${config.backupFile}"`;
    
    log('📤 Exporting database schema and data...', 'info');
    execSync(command, { stdio: 'inherit' });
    
    // Check if backup file was created
    const stats = readFileSync(config.backupFile, 'utf8');
    const lineCount = stats.split('\n').length;
    
    log(`✅ Export completed successfully!`, 'success');
    log(`📁 Backup file: ${config.backupFile}`, 'info');
    log(`📊 File size: ${(stats.length / 1024 / 1024).toFixed(2)} MB`, 'info');
    log(`📝 Lines: ${lineCount}`, 'info');
    
    // Show table counts from backup
    const tableMatches = stats.match(/COPY public\.(\w+) \(/g);
    if (tableMatches) {
      log('📋 Tables found in backup:', 'info');
      tableMatches.forEach(match => {
        const tableName = match.match(/COPY public\.(\w+) \(/)[1];
        log(`   - ${tableName}`, 'info');
      });
    }
    
  } catch (error) {
    log(`❌ Export failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

function importToAzure() {
  log('🚀 Starting import to Azure...', 'info');
  
  if (!readFileSync(config.backupFile, 'utf8')) {
    log('❌ Backup file not found. Run export first.', 'error');
    process.exit(1);
  }
  
  try {
    const command = `psql "${config.azure.url}" -f "${config.backupFile}"`;
    
    log('📥 Importing database schema and data...', 'info');
    execSync(command, { stdio: 'inherit' });
    
    log('✅ Import completed successfully!', 'success');
    log('🔍 Verifying data...', 'info');
    
    // Verify import by checking table counts
    const verifyCommand = `psql "${config.azure.url}" -c "SELECT 'users' as table_name, COUNT(*) as count FROM users UNION ALL SELECT 'wedding_profiles', COUNT(*) FROM wedding_profiles UNION ALL SELECT 'guests', COUNT(*) FROM guests UNION ALL SELECT 'vendors', COUNT(*) FROM vendors UNION ALL SELECT 'budget_items', COUNT(*) FROM budget_items UNION ALL SELECT 'tasks', COUNT(*) FROM tasks;"`;
    
    const result = execSync(verifyCommand, { encoding: 'utf8' });
    log('📊 Table counts in Azure:', 'info');
    console.log(result);
    
  } catch (error) {
    log(`❌ Import failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🔧 WeddingWizard Database Migration Tool

Usage:
  node migrate-to-azure.js <command>

Commands:
  export    Export data from Neon to backup file
  import    Import data from backup file to Azure
  help      Show this help message

Prerequisites:
  - PostgreSQL client tools (pg_dump, psql)
  - Azure Database for PostgreSQL created
  - Firewall rules configured
  - Updated Azure connection string in config

Examples:
  node migrate-to-azure.js export
  node migrate-to-azure.js import

⚠️  Important:
  - Update the Azure connection string in this script before running
  - Ensure your Azure database is running and accessible
  - Test the migration on a copy first
  `);
}

// Main execution
const command = process.argv[2];

if (!command || command === 'help') {
  showHelp();
  process.exit(0);
}

log('🔧 WeddingWizard Database Migration Tool', 'info');
checkPrerequisites();

switch (command) {
  case 'export':
    exportFromNeon();
    break;
  case 'import':
    importToAzure();
    break;
  default:
    log(`❌ Unknown command: ${command}`, 'error');
    showHelp();
    process.exit(1);
} 