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

// Security middleware - Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect(`https://${req.headers.host}${req.url}`);
        }
        next();
    });
}

// Security headers
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
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS - Very permissive for Render.com debugging
app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
}));

// Sessions - More permissive for debugging
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: true,
    saveUninitialized: true, // Allow uninitialized sessions
    cookie: {
        secure: false, // Set to false for debugging
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax' // More permissive
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

// Session test route
app.get('/api/session-test', (req, res) => {
    res.json({ 
        sessionId: req.sessionID,
        userId: req.session.userId,
        hasSession: !!req.session.userId,
        session: req.session
    });
});

// Database helper functions
async function getUserByUsername(username) {
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        const user = result.rows[0];
        if (user) {
            // Transform snake_case to camelCase for frontend, but preserve password for auth
            return {
                id: user.id,
                username: user.username,
                password: user.password, // Keep password for authentication
                name: user.name,
                role: user.role,
                weddingProfileId: user.wedding_profile_id, // Transform this field
                createdAt: user.created_at,
                updatedAt: user.updated_at
            };
        }
        return null;
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
        const user = result.rows[0];
        if (user) {
            // Transform snake_case to camelCase for frontend
            return {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                weddingProfileId: user.wedding_profile_id, // Transform this field
                createdAt: user.created_at,
                updatedAt: user.updated_at
            };
        }
        return null;
    } catch (error) {
        console.error('Database error:', error);
        return null;
    }
}

// Authentication middleware - Updated with better logging
function authenticateUser(req, res, next) {
    console.log('🔐 Auth check - Session ID:', req.sessionID);
    console.log('🔐 Auth check - User ID:', req.session.userId);
    console.log('🔐 Auth check - Session:', req.session);
    console.log('🔐 Auth check - Headers:', req.headers);
    console.log('🔐 Auth check - Cookies:', req.headers.cookie);
    
    if (!req.session.userId) {
        console.log('❌ Authentication failed: No user ID in session');
        console.log('❌ Full session object:', req.session);
        return res.status(401).json({ error: "Not authenticated" });
    }
    
    console.log('✅ Authentication successful for user:', req.session.userId);
    next();
}

// Authentication routes
app.post("/api/auth/login", async (req, res) => {
    try {
        console.log('Login attempt received:', { username: req.body.username });
        console.log('Full request body:', req.body);
        const { username, password } = req.body;
        
        // Get user from database
        const user = await getUserByUsername(username);
        console.log('User found from database:', user ? { id: user.id, username: user.username, hasPassword: !!user.password } : null);
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            console.log('Login failed: invalid credentials for username:', username);
            return res.status(401).json({ error: "Invalid credentials" });
        }
        
        // Set session
        req.session.userId = user.id;
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: "Session error" });
            }
            console.log('Login successful for user:', user.id);
            console.log('Session saved with ID:', req.sessionID);
            
            const { password: _, ...userWithoutPassword } = user;
            console.log('Sending user data to frontend:', userWithoutPassword);
            res.json(userWithoutPassword);
        });
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
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: "Session error" });
            }
            console.log('Registration successful for user:', user.id);
            
            const { password: _, ...userWithoutPassword } = user;
            res.status(201).json(userWithoutPassword);
        });
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
        console.log('Session check - Session ID:', req.sessionID);
        console.log('Session check - User ID:', req.session.userId);
        
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
        console.log('User ID from session:', req.session.userId);
        
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
        
        // Update user with wedding profile ID - use session user ID, not request body
        await pool.query(
            'UPDATE users SET wedding_profile_id = $1 WHERE id = $2',
            [weddingProfile.id, req.session.userId]
        );
        
        // Transform snake_case to camelCase for frontend
        const transformedProfile = {
            id: weddingProfile.id,
            brideName: weddingProfile.bride_name,
            groomName: weddingProfile.groom_name,
            weddingStartDate: weddingProfile.wedding_start_date,
            weddingEndDate: weddingProfile.wedding_end_date,
            venue: weddingProfile.venue,
            city: weddingProfile.city,
            state: weddingProfile.state,
            guestCount: weddingProfile.guest_count,
            budget: weddingProfile.budget,
            functions: weddingProfile.functions,
            isComplete: weddingProfile.is_complete,
            createdAt: weddingProfile.created_at,
            updatedAt: weddingProfile.updated_at
        };
        
        console.log('Wedding profile created:', weddingProfile.id);
        console.log('User updated with wedding profile ID:', req.session.userId);
        res.status(201).json(transformedProfile);
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
        
        // Transform snake_case to camelCase for frontend
        const profile = result.rows[0];
        const transformedProfile = {
            id: profile.id,
            brideName: profile.bride_name,
            groomName: profile.groom_name,
            weddingStartDate: profile.wedding_start_date,
            weddingEndDate: profile.wedding_end_date,
            venue: profile.venue,
            city: profile.city,
            state: profile.state,
            guestCount: profile.guest_count,
            budget: profile.budget,
            functions: profile.functions,
            isComplete: profile.is_complete,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at
        };
        
        console.log('📋 Wedding profile fetched:', transformedProfile);
        res.json(transformedProfile);
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
        console.log('📅 Events request received');
        console.log('📅 Query params:', req.query);
        console.log('📅 Session user ID:', req.session.userId);
        
        const { weddingProfileId } = req.query;
        
        let query = 'SELECT * FROM events';
        let params = [];
        
        if (weddingProfileId) {
            query += ' WHERE wedding_profile_id = $1';
            params.push(weddingProfileId);
        }
        
        console.log('📅 Executing query:', query, 'with params:', params);
        const result = await pool.query(query, params);
        console.log('📅 Found events:', result.rows.length);
        
        res.json(result.rows);
    } catch (error) {
        console.error("Events fetch error:", error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});

// Guest routes
app.post("/api/guests", authenticateUser, async (req, res) => {
    try {
        console.log('Creating guest:', req.body);
        
        const {
            name,
            email,
            phone,
            side,
            rsvpStatus = 'pending',
            weddingProfileId
        } = req.body;
        
        const result = await pool.query(
            `INSERT INTO guests 
            (name, email, phone, side, rsvp_status, wedding_profile_id) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`,
            [name, email, phone, side, rsvpStatus, weddingProfileId]
        );
        
        const guest = result.rows[0];
        console.log('Guest created:', guest.id);
        res.status(201).json(guest);
    } catch (error) {
        console.error("Guest creation error:", error);
        res.status(400).json({ error: "Failed to create guest" });
    }
});

app.get("/api/guests", authenticateUser, async (req, res) => {
    try {
        console.log('👥 Guests request received');
        console.log('👥 Query params:', req.query);
        
        const { weddingProfileId } = req.query;
        
        let query = 'SELECT * FROM guests';
        let params = [];
        
        if (weddingProfileId) {
            query += ' WHERE wedding_profile_id = $1';
            params.push(weddingProfileId);
        }
        
        console.log('👥 Executing query:', query, 'with params:', params);
        const result = await pool.query(query, params);
        console.log('👥 Found guests:', result.rows.length);
        
        res.json(result.rows);
    } catch (error) {
        console.error("Guests fetch error:", error);
        res.status(500).json({ error: "Failed to fetch guests" });
    }
});

app.put("/api/guests/:id", authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Updating guest:', id, 'with data:', req.body);
        
        const {
            name,
            email,
            phone,
            side,
            rsvpStatus
        } = req.body;
        
        const result = await pool.query(
            `UPDATE guests 
            SET name = $1, email = $2, phone = $3, side = $4, rsvp_status = $5, updated_at = NOW()
            WHERE id = $6 
            RETURNING *`,
            [name, email, phone, side, rsvpStatus, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Guest not found" });
        }
        
        const guest = result.rows[0];
        console.log('Guest updated:', guest.id);
        res.json(guest);
    } catch (error) {
        console.error("Guest update error:", error);
        res.status(400).json({ error: "Failed to update guest" });
    }
});

app.delete("/api/guests/:id", authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Deleting guest:', id);
        
        const result = await pool.query(
            'DELETE FROM guests WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Guest not found" });
        }
        
        console.log('Guest deleted:', id);
        res.json({ message: "Guest deleted successfully" });
    } catch (error) {
        console.error("Guest deletion error:", error);
        res.status(400).json({ error: "Failed to delete guest" });
    }
});

// Budget routes
app.post("/api/budget", authenticateUser, async (req, res) => {
    try {
        console.log('Creating budget item:', req.body);
        
        const {
            category,
            vendor,
            estimatedAmount,
            paidAmount = 0,
            status = 'pending',
            paidBy,
            eventId,
            weddingProfileId
        } = req.body;
        
        const result = await pool.query(
            `INSERT INTO budget_items 
            (category, vendor, estimated_amount, paid_amount, status, paid_by, event_id, wedding_profile_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`,
            [category, vendor, estimatedAmount, paidAmount, status, paidBy, eventId, weddingProfileId]
        );
        
        const budgetItem = result.rows[0];
        console.log('Budget item created:', budgetItem.id);
        res.status(201).json(budgetItem);
    } catch (error) {
        console.error("Budget item creation error:", error);
        res.status(400).json({ error: "Failed to create budget item" });
    }
});

app.get("/api/budget", authenticateUser, async (req, res) => {
    try {
        console.log('💰 Budget request received');
        console.log('💰 Query params:', req.query);
        
        const { weddingProfileId } = req.query;
        
        let query = 'SELECT * FROM budget_items';
        let params = [];
        
        if (weddingProfileId) {
            query += ' WHERE wedding_profile_id = $1';
            params.push(weddingProfileId);
        }
        
        console.log('💰 Executing query:', query, 'with params:', params);
        const result = await pool.query(query, params);
        console.log('💰 Found budget items:', result.rows.length);
        
        res.json(result.rows);
    } catch (error) {
        console.error("Budget fetch error:", error);
        res.status(500).json({ error: "Failed to fetch budget items" });
    }
});

app.put("/api/budget/:id", authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Updating budget item:', id, 'with data:', req.body);
        
        const {
            category,
            vendor,
            estimatedAmount,
            paidAmount,
            status,
            paidBy,
            eventId
        } = req.body;
        
        const result = await pool.query(
            `UPDATE budget_items 
            SET category = $1, vendor = $2, estimated_amount = $3, paid_amount = $4, status = $5, paid_by = $6, event_id = $7, updated_at = NOW()
            WHERE id = $8 
            RETURNING *`,
            [category, vendor, estimatedAmount, paidAmount, status, paidBy, eventId, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Budget item not found" });
        }
        
        const budgetItem = result.rows[0];
        console.log('Budget item updated:', budgetItem.id);
        res.json(budgetItem);
    } catch (error) {
        console.error("Budget item update error:", error);
        res.status(400).json({ error: "Failed to update budget item" });
    }
});

app.delete("/api/budget/:id", authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Deleting budget item:', id);
        
        const result = await pool.query(
            'DELETE FROM budget_items WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Budget item not found" });
        }
        
        console.log('Budget item deleted:', id);
        res.json({ message: "Budget item deleted successfully" });
    } catch (error) {
        console.error("Budget item deletion error:", error);
        res.status(400).json({ error: "Failed to delete budget item" });
    }
});

// Vendor routes
app.post("/api/vendors", authenticateUser, async (req, res) => {
    try {
        console.log('Creating vendor:', req.body);
        
        const {
            name,
            category,
            contactPerson,
            email,
            phone,
            address,
            securityDeposit = 0,
            totalAmount = 0,
            weddingProfileId
        } = req.body;
        
        const result = await pool.query(
            `INSERT INTO vendors 
            (name, category, contact_person, email, phone, address, security_deposit, total_amount, wedding_profile_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *`,
            [name, category, contactPerson, email, phone, address, securityDeposit, totalAmount, weddingProfileId]
        );
        
        const vendor = result.rows[0];
        console.log('Vendor created:', vendor.id);
        res.status(201).json(vendor);
    } catch (error) {
        console.error("Vendor creation error:", error);
        res.status(400).json({ error: "Failed to create vendor" });
    }
});

app.get("/api/vendors", authenticateUser, async (req, res) => {
    try {
        console.log('🏢 Vendors request received');
        console.log('🏢 Query params:', req.query);
        
        const { weddingProfileId } = req.query;
        
        let query = 'SELECT * FROM vendors';
        let params = [];
        
        if (weddingProfileId) {
            query += ' WHERE wedding_profile_id = $1';
            params.push(weddingProfileId);
        }
        
        console.log('🏢 Executing query:', query, 'with params:', params);
        const result = await pool.query(query, params);
        console.log('🏢 Found vendors:', result.rows.length);
        
        res.json(result.rows);
    } catch (error) {
        console.error("Vendors fetch error:", error);
        res.status(500).json({ error: "Failed to fetch vendors" });
    }
});

app.put("/api/vendors/:id", authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Updating vendor:', id, 'with data:', req.body);
        
        const {
            name,
            category,
            contactPerson,
            email,
            phone,
            address,
            securityDeposit,
            totalAmount
        } = req.body;
        
        const result = await pool.query(
            `UPDATE vendors 
            SET name = $1, category = $2, contact_person = $3, email = $4, phone = $5, address = $6, security_deposit = $7, total_amount = $8, updated_at = NOW()
            WHERE id = $9 
            RETURNING *`,
            [name, category, contactPerson, email, phone, address, securityDeposit, totalAmount, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Vendor not found" });
        }
        
        const vendor = result.rows[0];
        console.log('Vendor updated:', vendor.id);
        res.json(vendor);
    } catch (error) {
        console.error("Vendor update error:", error);
        res.status(400).json({ error: "Failed to update vendor" });
    }
});

app.delete("/api/vendors/:id", authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Deleting vendor:', id);
        
        const result = await pool.query(
            'DELETE FROM vendors WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Vendor not found" });
        }
        
        console.log('Vendor deleted:', id);
        res.json({ message: "Vendor deleted successfully" });
    } catch (error) {
        console.error("Vendor deletion error:", error);
        res.status(400).json({ error: "Failed to delete vendor" });
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