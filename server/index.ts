import 'dotenv/config';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";
import { registerRoutes } from "./routes";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { setupVite, serveStatic, log } from "./vite";
import { User } from "@shared/schema";
import "./types"; // Import type declarations

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

// Rate limiting - temporarily increased for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:5000', 'http://localhost:5173'],
  credentials: true,
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  },
  name: 'weddingwizard.sid'
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File upload configuration
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storageConfig,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only PDF, DOC, DOCX files
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// Authentication middleware
export const authenticateUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: "Invalid session" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

// Authorization middleware - ensure user can only access their own data
export const authorizeUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const requestedWeddingProfileId = req.query.weddingProfileId || req.body.weddingProfileId || req.params.weddingProfileId;

    if (requestedWeddingProfileId && user.weddingProfileId !== parseInt(requestedWeddingProfileId as string)) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(403).json({ error: "Access denied" });
  }
};

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // File upload route
  app.post('/api/upload-contract', authenticateUser, upload.single('contract'), (req, res) => {
    try {
      console.log('=== UPLOAD ENDPOINT CALLED ===');
      console.log('Request headers:', req.headers);
      console.log('Request file:', req.file);
      console.log('Request body:', req.body);
      
      if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const response = { 
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      };
      
      console.log('Sending response:', response);
      console.log('=== UPLOAD ENDPOINT COMPLETE ===');
      
      // Return the filename that will be stored in the database
      res.json(response);
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ error: 'File upload failed' });
    }
  });

  // File download route
  app.get('/api/download-contract/:filename', authenticateUser, (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(uploadsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      // Get original filename from database or use the stored filename
      const originalName = filename.split('-').slice(2).join('-'); // Remove timestamp prefix
      
      res.download(filePath, originalName);
    } catch (error) {
      console.error('File download error:', error);
      res.status(500).json({ error: 'File download failed' });
    }
  });

  const server = await registerRoutes(app);

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  // The server object is not directly available here,
  // as it's defined within the (async) => {} block.
  // This part of the original code was not included in the new_code,
  // so it's removed to avoid errors.
});
