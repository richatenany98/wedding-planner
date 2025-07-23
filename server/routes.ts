import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertGuestSchema, insertTaskSchema, insertBudgetItemSchema, insertVendorSchema, insertUserSchema, insertWeddingProfileSchema, type User } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authenticateUser, authorizeUser } from "./index";
import "./types"; // Import type declarations

export async function registerRoutes(app: Express): Promise<Server> {
  // Clear rate limit for development
  app.get("/api/clear-rate-limit", (req, res) => {
    res.json({ message: "Rate limit cleared" });
  });

  // Test route
  app.get("/api/test", (req, res) => {
    res.json({ message: "API is working", timestamp: new Date().toISOString() });
  });

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log('Login attempt received:', { username: req.body.username });
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
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
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        console.log('Registration failed: username already exists:', userData.username);
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const userWithHashedPassword = { ...userData, password: hashedPassword };
      
      const user = await storage.createUser(userWithHashedPassword);
      
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
      
      const user = await storage.getUser(req.session.userId);
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
      const profileData = insertWeddingProfileSchema.parse(req.body);
      const weddingProfile = await storage.createWeddingProfile(profileData);
      
      // Associate the profile with the current user
      await storage.updateUser((req as any).user!.id, { weddingProfileId: weddingProfile.id });
      
      res.status(201).json(weddingProfile);
    } catch (error) {
      console.error("Wedding profile creation error:", error);
      res.status(400).json({ error: "Failed to create wedding profile" });
    }
  });

  app.get("/api/wedding-profile", authenticateUser, async (req, res) => {
    try {
      const user = (req as any).user!;
      if (!user.weddingProfileId) {
        return res.status(404).json({ error: "No wedding profile found" });
      }
      
      const profile = await storage.getWeddingProfile(user.weddingProfileId);
      if (!profile) {
        return res.status(404).json({ error: "Wedding profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wedding profile" });
    }
  });

  app.get("/api/wedding-profile/:id", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const profile = await storage.getWeddingProfile(id);
      if (!profile) {
        return res.status(404).json({ error: "Wedding profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wedding profile" });
    }
  });

  // Events routes
  app.get("/api/events", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const weddingProfileId = (req as any).user!.weddingProfileId;
      if (!weddingProfileId) {
        return res.status(404).json({ error: "No wedding profile found" });
      }
      
      const events = await storage.getEvents(weddingProfileId);
      // Sort events by date for consistent ordering
      const sortedEvents = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      res.json(sortedEvents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/events", authenticateUser, authorizeUser, async (req, res) => {
    try {
      console.log("Received event data:", req.body);
      const eventData = insertEventSchema.parse({
        ...req.body,
        weddingProfileId: req.user!.weddingProfileId
      });
      console.log("Parsed event data:", eventData);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Event creation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(400).json({ error: "Invalid event data", details: errorMessage });
    }
  });

  app.put("/api/events/:id", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const eventData = req.body;
      const event = await storage.updateEvent(id, eventData);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid event data" });
    }
  });

  app.delete("/api/events/:id", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEvent(id);
      if (!success) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // Guests routes
  app.get("/api/guests", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const weddingProfileId = req.user!.weddingProfileId;
      if (!weddingProfileId) {
        return res.status(404).json({ error: "No wedding profile found" });
      }
      
      const guests = await storage.getGuests(weddingProfileId);
      res.json(guests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch guests" });
    }
  });

  app.post("/api/guests", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const guestData = insertGuestSchema.parse({
        ...req.body,
        weddingProfileId: req.user!.weddingProfileId
      });
      const guest = await storage.createGuest(guestData);
      res.status(201).json(guest);
    } catch (error) {
      res.status(400).json({ error: "Invalid guest data" });
    }
  });

  app.put("/api/guests/:id", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const guestData = req.body;
      const guest = await storage.updateGuest(id, guestData);
      if (!guest) {
        return res.status(404).json({ error: "Guest not found" });
      }
      res.json(guest);
    } catch (error) {
      res.status(400).json({ error: "Invalid guest data" });
    }
  });

  app.delete("/api/guests/:id", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGuest(id);
      if (!success) {
        return res.status(404).json({ error: "Guest not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete guest" });
    }
  });

  // Tasks routes
  app.get("/api/tasks", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const weddingProfileId = req.user!.weddingProfileId;
      if (!weddingProfileId) {
        return res.status(404).json({ error: "No wedding profile found" });
      }
      
      const tasks = await storage.getTasks(weddingProfileId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse({
        ...req.body,
        weddingProfileId: req.user!.weddingProfileId
      });
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.put("/api/tasks/:id", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const taskData = req.body;
      const task = await storage.updateTask(id, taskData);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.delete("/api/tasks/:id", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      if (!success) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Export routes
  app.get("/api/export/guests", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const weddingProfileId = req.user!.weddingProfileId;
      if (!weddingProfileId) {
        return res.status(404).json({ error: "No wedding profile found" });
      }
      
      const guests = await storage.getGuests(weddingProfileId);
      
      const csv = [
        "Name,Email,Phone,Side,RSVP Status",
        ...guests.map(guest => 
          `"${guest.name}","${guest.email || ""}","${guest.phone || ""}","${guest.side}","${guest.rsvpStatus || "pending"}"`
        )
      ].join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=guests.csv");
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export guests" });
    }
  });

  app.get("/api/export/tasks", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const weddingProfileId = req.user!.weddingProfileId;
      if (!weddingProfileId) {
        return res.status(404).json({ error: "No wedding profile found" });
      }
      
      const tasks = await storage.getTasks(weddingProfileId);
      
      const csv = [
        "Title,Description,Category,Status,Assigned To,Due Date",
        ...tasks.map(task => 
          `"${task.title}","${task.description || ""}","${task.category}","${task.status}","${task.assignedTo}","${task.dueDate || ""}"`
        )
      ].join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=tasks.csv");
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export tasks" });
    }
  });

  // Budget routes
  app.get("/api/budget", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const weddingProfileId = req.user!.weddingProfileId;
      if (!weddingProfileId) {
        return res.status(404).json({ error: "No wedding profile found" });
      }
      
      const budgetItems = await storage.getBudgetItems(weddingProfileId);
      res.json(budgetItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch budget items" });
    }
  });

  app.post("/api/budget", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const budgetData = insertBudgetItemSchema.parse({
        ...req.body,
        weddingProfileId: req.user!.weddingProfileId
      });
      const budgetItem = await storage.createBudgetItem(budgetData);
      res.status(201).json(budgetItem);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget data" });
    }
  });

  app.put("/api/budget/:id", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const budgetData = req.body;
      const budgetItem = await storage.updateBudgetItem(id, budgetData);
      if (!budgetItem) {
        return res.status(404).json({ error: "Budget item not found" });
      }
      res.json(budgetItem);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget data" });
    }
  });

  app.delete("/api/budget/:id", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBudgetItem(id);
      if (!success) {
        return res.status(404).json({ error: "Budget item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete budget item" });
    }
  });

  // Vendor routes
  app.get("/api/vendors", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const weddingProfileId = req.user!.weddingProfileId;
      if (!weddingProfileId) {
        return res.status(404).json({ error: "No wedding profile found" });
      }
      
      const vendors = await storage.getVendors(weddingProfileId);
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vendors" });
    }
  });

  app.post("/api/vendors", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const vendorData = insertVendorSchema.parse({
        ...req.body,
        weddingProfileId: req.user!.weddingProfileId
      });
      const vendor = await storage.createVendor(vendorData);
      res.status(201).json(vendor);
    } catch (error) {
      res.status(400).json({ error: "Invalid vendor data" });
    }
  });

  app.put("/api/vendors/:id", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vendorData = req.body;
      const vendor = await storage.updateVendor(id, vendorData);
      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      res.status(400).json({ error: "Invalid vendor data" });
    }
  });

  app.delete("/api/vendors/:id", authenticateUser, authorizeUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVendor(id);
      if (!success) {
        return res.status(404).json({ error: "Vendor not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vendor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
