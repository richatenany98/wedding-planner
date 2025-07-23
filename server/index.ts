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
import { setupVite, serveStatic, log } from "./vite";
import "./types";
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
    ? ['https://wedding-planner-hjgegeadbnaqfkge.canadacentral-01.azurewebsites.net']
    : ['http://localhost:5000', 'http://localhost:5173'],
  credentials: true,
}));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'strict'
  },
  name: 'weddingwizard.sid'
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File uploads
const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storageConfig,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
  }
});

// Authentication middleware
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

// Authorization middleware
import { Request, Response, NextFunction } from "express";

export const authorizeUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const requestedWeddingProfileId =
      req.query.weddingProfileId ||
      req.body.weddingProfileId ||
      req.params.weddingProfileId;

    if (
      requestedWeddingProfileId &&
      user.weddingProfileId !== parseInt(requestedWeddingProfileId as string)
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    next();
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(403).json({ error: "Access denied" });
  }
};

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  const originalJson = res.json;
  res.json = function (body, ...args) {
    const duration = Date.now() - start;
    log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    return originalJson.apply(res, [body, ...args]);
  };
  next();
});

(async () => {
  // Upload route
  app.post('/api/upload-contract', authenticateUser, upload.single('contract'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  });

  // Download route
  app.get('/api/download-contract/:filename', authenticateUser, (req, res) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    res.download(filePath, req.params.filename.split('-').slice(2).join('-'));
  });

  // Register your API routes
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
    throw err;
  });

  // Serve Vite frontend
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    const distPath = path.join(__dirname, '../dist/public');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Listen on port
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  server.listen({ port, host: "0.0.0.0" }, () => {
    log(`✅ Server running on port ${port}`);
  });
})();

// Healthcheck
app.get('/health', (_req, res) => {
  res.send('✅ Server is alive');
});