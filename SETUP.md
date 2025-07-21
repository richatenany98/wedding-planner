# WeddingWizard Local Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL Database** (local or cloud)

## Quick Setup Options

### Option 1: Use Neon Database (Recommended - Free)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://username:password@host/database`)
4. Create a `.env` file in the root directory with:

```env
DATABASE_URL="your-neon-connection-string"
SESSION_SECRET="your-super-secret-session-key"
NODE_ENV="development"
```

### Option 2: Local PostgreSQL

1. Install PostgreSQL:
   - **macOS**: `brew install postgresql`
   - **Ubuntu**: `sudo apt-get install postgresql postgresql-contrib`
   - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)

2. Create a database:
   ```bash
   createdb weddingwizard
   ```

3. Create a `.env` file with:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/weddingwizard"
   SESSION_SECRET="your-super-secret-session-key"
   NODE_ENV="development"
   ```

## Installation Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up the database**:
   ```bash
   npm run db:push
   ```

3. **Seed the database with sample data**:
   ```bash
   npx tsx server/seed.ts
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and go to `http://localhost:5000`

## Default Login

- **Username**: `sarah.johnson`
- **Password**: `password123`
- **Role**: Bride

## Features

- **Multi-role support**: Bride, Groom, Planner, Parents, Family
- **Event management**: Traditional Indian wedding events
- **Guest management**: RSVP tracking and bulk import
- **Task management**: Kanban-style boards
- **Budget tracking**: Vendor expense management
- **Vendor management**: Contract and contact tracking

## Troubleshooting

- If you get database connection errors, check your `DATABASE_URL` in the `.env` file
- Make sure PostgreSQL is running if using local database
- Check that all dependencies are installed with `npm install` 