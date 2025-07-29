import 'dotenv/config';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import session from "express-session";
import path from "path";
import { fileURLToPath } from 'url';
import bcrypt from "bcryptjs";

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

// API test route
app.get('/api/test', (_req, res) => {
    res.json({ message: "API is working", timestamp: new Date().toISOString() });
});

// Authentication routes
app.post("/api/auth/login", async (req, res) => {
    try {
        console.log('Login attempt received:', { username: req.body.username });
        const { username, password } = req.body;
        
        // For now, use a simple authentication
        // In production, you'd want to connect to your database
        if (username === 'admin' && password === 'password') {
            // Set session
            req.session.userId = 1;
            console.log('Login successful for user:', 1);
            
            res.json({
                id: 1,
                username: 'admin',
                name: 'Admin User',
                email: 'admin@example.com'
            });
        } else {
            console.log('Login failed: invalid credentials for username:', username);
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: "Login failed" });
    }
});

app.post("/api/auth/register", async (req, res) => {
    try {
        console.log('Registration attempt received:', { username: req.body.username, name: req.body.name });
        const { username, password, name, email } = req.body;
        
        // For now, just return success
        // In production, you'd want to save to database
        const user = {
            id: 1,
            username,
            name,
            email
        };
        
        // Set session
        req.session.userId = user.id;
        console.log('Registration successful for user:', user.id);
        
        res.status(201).json(user);
    } catch (error) {
        console.error("Registration error:", error);
        res.status(400).json({ error: "Registration failed" });
    }
});

app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Logout failed" });
        }
        res.json({ message: "Logged out successfully" });
    });
});

app.get("/api/auth/me", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        
        // For now, return a mock user
        // In production, you'd fetch from database
        const user = {
            id: req.session.userId,
            username: 'admin',
            name: 'Admin User',
            email: 'admin@example.com'
        };
        
        res.json(user);
    } catch (error) {
        console.error('Session check error:', error);
        res.status(500).json({ error: "Session check failed" });
    }
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