import { User } from "@shared/schema";

// Extend Express types
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

declare module 'express' {
  interface Request {
    user?: User;
  }
} 