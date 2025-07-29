# Render Deployment Guide

## Prerequisites
- A Render account
- Your database URL (Neon, PostgreSQL, etc.)
- A session secret for security

## Deployment Steps

1. **Connect your GitHub repository to Render**
   - Go to [render.com](https://render.com)
   - Create a new Web Service
   - Connect your GitHub repository

2. **Configure the service**
   - **Name**: `wedding-wizard` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

3. **Environment Variables**
   Set these in your Render dashboard:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Your database connection string
   - `SESSION_SECRET`: A secure random string for session management
   - `HTTPS`: `true`

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application

## Troubleshooting

### Common Issues

1. **"Cannot find module '/opt/render/project/src/dist/index.js'"**
   - This means the build process failed
   - Check the build logs in Render dashboard
   - Ensure all dependencies are in `package.json`

2. **Database connection issues**
   - Verify your `DATABASE_URL` is correct
   - Ensure your database is accessible from Render's servers

3. **Port issues**
   - Render automatically sets the `PORT` environment variable
   - Your app should listen on `process.env.PORT || 5000`

## Local Testing

Before deploying, test locally:
```bash
npm run build
npm start
```

## File Structure
```
dist/
├── index.js          # Main server file
├── routes.js         # API routes
├── storage.js        # Database operations
├── db.js            # Database connection
├── shared/
│   └── schema.js    # Database schema
└── public/          # Client build files
``` 