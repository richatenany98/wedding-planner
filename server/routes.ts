import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertGuestSchema, insertTaskSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid event data" });
    }
  });

  app.put("/api/events/:id", async (req, res) => {
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

  app.delete("/api/events/:id", async (req, res) => {
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
  app.get("/api/guests", async (req, res) => {
    try {
      const guests = await storage.getGuests();
      res.json(guests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch guests" });
    }
  });

  app.post("/api/guests", async (req, res) => {
    try {
      const guestData = insertGuestSchema.parse(req.body);
      const guest = await storage.createGuest(guestData);
      res.status(201).json(guest);
    } catch (error) {
      res.status(400).json({ error: "Invalid guest data" });
    }
  });

  app.put("/api/guests/:id", async (req, res) => {
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

  app.delete("/api/guests/:id", async (req, res) => {
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
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
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

  app.delete("/api/tasks/:id", async (req, res) => {
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
  app.get("/api/export/guests", async (req, res) => {
    try {
      const guests = await storage.getGuests();
      const events = await storage.getEvents();
      
      const csv = [
        "Name,Email,Phone,Relation,Events,RSVP Status",
        ...guests.map(guest => {
          const guestEvents = guest.eventIds ? 
            guest.eventIds.map(id => events.find(e => e.id === parseInt(id))?.name).filter(Boolean).join(";") : 
            "";
          return `"${guest.name}","${guest.email || ""}","${guest.phone || ""}","${guest.relation}","${guestEvents}","${guest.rsvpStatus}"`;
        })
      ].join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=guests.csv");
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export guests" });
    }
  });

  app.get("/api/export/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      
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

  const httpServer = createServer(app);
  return httpServer;
}
