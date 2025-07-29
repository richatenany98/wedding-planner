import 'dotenv/config';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import session from "express-session";
import path from "path";
import { fileURLToPath } from 'url';
import bcrypt from "bcryptjs";
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database setup
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Import schema (we'll define it inline to avoid import issues)
const users = {
  id: 'id',
  username: 'username',
  password: 'password',
  role: 'role',
  name: 'name',
  weddingProfileId: 'wedding_profile_id'
};

// Function to ensure user exists
async function ensureUserExists() {
  try {
    console.log('🔍 Checking if user exists...');
    
    // Check if user exists
    const result = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      ['richatenany']
    );
    
    if (result.rows.length === 0) {
      console.log('👤 Creating user account...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      // Create user
      await pool.query(
        'INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4)',
        ['richatenany', hashedPassword, 'Richa Tenany', 'bride']
      );
      
      console.log('✅ User account created successfully');
      console.log('🔑 Login credentials:');
      console.log('   Username: richatenany');
      console.log('   Password: password123');
    } else {
      console.log('✅ User account already exists');
    }
  } catch (error) {
    console.error('❌ Error ensuring user exists:', error);
  }
}

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

// Database helper functions
async function getUserByUsername(username) {
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Database error:', error);
        return null;
    }
}

async function getUser(id) {
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Database error:', error);
        return null;
    }
}

// Authentication middleware
function authenticateUser(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    next();
}

// Authentication routes
app.post("/api/auth/login", async (req, res) => {
    try {
        console.log('Login attempt received:', { username: req.body.username });
        const { username, password } = req.body;
        
        // Get user from database
        const user = await getUserByUsername(username);
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            console.log('Login failed: invalid credentials for username:', username);
            return res.status(401).json({ error: "Invalid credentials" });
        }
        
        // Set session
        req.session.userId = user.id;
        console.log('Login successful for user:', user.id);
        
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: "Login failed" });
    }
});

app.post("/api/auth/register", async (req, res) => {
    try {
        console.log('Registration attempt received:', { username: req.body.username, name: req.body.name });
        const { username, password, name, email, role = 'user' } = req.body;
        
        // Check if username already exists
        const existingUser = await getUserByUsername(username);
        if (existingUser) {
            console.log('Registration failed: username already exists:', username);
            return res.status(400).json({ error: "Username already exists" });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Create user in database
        const result = await pool.query(
            'INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, hashedPassword, name, role]
        );
        
        const user = result.rows[0];
        
        // Set session
        req.session.userId = user.id;
        console.log('Registration successful for user:', user.id);
        
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
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
        
        const user = await getUser(req.session.userId);
        if (!user) {
            req.session.destroy(() => {});
            return res.status(401).json({ error: "Invalid session" });
        }
        
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Session check error:', error);
        res.status(500).json({ error: "Session check failed" });
    }
});

// Wedding profile routes
app.post("/api/wedding-profile", authenticateUser, async (req, res) => {
    try {
        console.log('Creating wedding profile:', req.body);
        
        const {
            brideName,
            groomName,
            weddingStartDate,
            weddingEndDate,
            venue,
            city,
            state,
            guestCount,
            budget,
            functions,
            isComplete = true
        } = req.body;
        
        // Create wedding profile
        const result = await pool.query(
            `INSERT INTO wedding_profiles 
            (bride_name, groom_name, wedding_start_date, wedding_end_date, venue, city, state, guest_count, budget, functions, is_complete) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
            RETURNING *`,
            [brideName, groomName, weddingStartDate, weddingEndDate, venue, city, state, guestCount, budget, functions, isComplete]
        );
        
        const weddingProfile = result.rows[0];
        
        // Update user with wedding profile ID
        await pool.query(
            'UPDATE users SET wedding_profile_id = $1 WHERE id = $2',
            [weddingProfile.id, req.session.userId]
        );
        
        console.log('Wedding profile created:', weddingProfile.id);
        res.status(201).json(weddingProfile);
    } catch (error) {
        console.error("Wedding profile creation error:", error);
        res.status(400).json({ error: "Failed to create wedding profile" });
    }
});

app.get("/api/wedding-profile/:id", authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'SELECT * FROM wedding_profiles WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Wedding profile not found" });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Wedding profile fetch error:", error);
        res.status(500).json({ error: "Failed to fetch wedding profile" });
    }
});

// Events routes
app.post("/api/events", authenticateUser, async (req, res) => {
    try {
        console.log('Creating event:', req.body);
        
        const {
            name,
            description,
            date,
            time,
            location,
            guestCount,
            icon,
            color,
            progress = 0,
            weddingProfileId
        } = req.body;
        
        const result = await pool.query(
            `INSERT INTO events 
            (name, description, date, time, location, guest_count, icon, color, progress, wedding_profile_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *`,
            [name, description, date, time, location, guestCount, icon, color, progress, weddingProfileId]
        );
        
        const event = result.rows[0];
        console.log('Event created:', event.id);
        res.status(201).json(event);
    } catch (error) {
        console.error("Event creation error:", error);
        res.status(400).json({ error: "Failed to create event" });
    }
});

app.get("/api/events", authenticateUser, async (req, res) => {
    try {
        const { weddingProfileId } = req.query;
        
        let query = 'SELECT * FROM events';
        let params = [];
        
        if (weddingProfileId) {
            query += ' WHERE wedding_profile_id = $1';
            params.push(weddingProfileId);
        }
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error("Events fetch error:", error);
        res.status(500).json({ error: "Failed to fetch events" });
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
app.listen({ port, host: "0.0.0.0" }, async () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`🔗 Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
    
    // Ensure user exists when server starts
    await ensureUserExists();
}); 