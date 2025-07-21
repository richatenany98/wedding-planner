#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🎉 Welcome to WeddingWizard Setup!');
console.log('');
console.log('To run this application, you need a PostgreSQL database.');
console.log('');
console.log('📋 Setup Options:');
console.log('');
console.log('1. 🌟 EASIEST: Use Neon Database (Free Cloud Database)');
console.log('   - Go to https://neon.tech');
console.log('   - Sign up for a free account');
console.log('   - Create a new project');
console.log('   - Copy the connection string');
console.log('');
console.log('2. 🏠 LOCAL: Install PostgreSQL locally');
console.log('   - macOS: brew install postgresql');
console.log('   - Start PostgreSQL and create a database');
console.log('');
console.log('📝 Once you have a database, create a .env file with:');
console.log('');
console.log('DATABASE_URL="your-database-connection-string"');
console.log('SESSION_SECRET="your-super-secret-session-key"');
console.log('NODE_ENV="development"');
console.log('');
console.log('🚀 Then run:');
console.log('npm run db:push');
console.log('npx tsx server/seed.ts');
console.log('npm run dev');
console.log('');
console.log('🌐 Open http://localhost:5000 in your browser');
console.log('');
console.log('👤 Default login: sarah.johnson / password123');
console.log('');
console.log('Need help? Check SETUP.md for detailed instructions.'); 