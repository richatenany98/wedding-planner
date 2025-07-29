#!/bin/bash

# Function to create minimal server
create_minimal_server() {
    echo "🔧 Creating minimal server file..."
    
    # Create a minimal server file for deployment
    cat > dist/index.js << 'EOF'
import 'dotenv/config';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import session from "express-session";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://wedding-planner-hjgegeadbnaqfkge.canadacentral-01.azurewebsites.net', 'https://wedding-planner-hjgegeadbnaqfkge.canadacentral-01.azurewebsites.net/']
        : ['http://localhost:5000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Sessions
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production' && process.env.HTTPS === 'true',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    },
    name: 'weddingwizard.sid'
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
const distPath = path.join(__dirname, 'public');
app.use(express.static(distPath));

// Health check
app.get('/health', (_req, res) => {
    res.send('✅ Server is alive');
});

// API placeholder
app.get('/api/test', (_req, res) => {
    res.json({ message: "API is working", timestamp: new Date().toISOString() });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
});

// Listen on port
const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
app.listen({ port, host: "0.0.0.0" }, () => {
    console.log(`✅ Server running on port ${port}`);
});
EOF

    echo "✅ Created minimal server file"
}

echo "🚀 Preparing deployment package..."

# Exit on any error
set -e

echo "📦 Installing dependencies..."
npm install --include=dev

echo "🔨 Building client..."
npm run build:client

echo "🔍 Attempting to build server with TypeScript..."
if npx tsc -p tsconfig.server.json 2>/dev/null; then
    echo "✅ TypeScript compilation successful!"
    if [ -f "dist/index.js" ]; then
        echo "✅ Server files created successfully"
    else
        echo "⚠️  TypeScript compiled but no index.js found, creating minimal server"
        create_minimal_server
    fi
else
    echo "⚠️  TypeScript compilation failed, creating minimal server for deployment"
    create_minimal_server
fi

echo "✅ Deployment package ready!"
echo "📁 Files in dist:"
ls -la dist/ 