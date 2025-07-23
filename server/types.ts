import { User } from "@shared/schema";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
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
