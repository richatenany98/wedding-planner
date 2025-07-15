import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  name: text("name").notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  progress: integer("progress").default(0),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  guestCount: integer("guest_count").default(0),
});

export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  relation: text("relation").notNull(),
  eventIds: text("event_ids").array(),
  rsvpStatus: text("rsvp_status").default("pending"),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  status: text("status").notNull().default("todo"),
  assignedTo: text("assigned_to").notNull(),
  dueDate: text("due_date"),
  eventId: integer("event_id"),
});

export const budgetItems = pgTable("budget_items", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  vendor: text("vendor").notNull(),
  description: text("description"),
  estimatedAmount: integer("estimated_amount").notNull(),
  actualAmount: integer("actual_amount").default(0),
  paidAmount: integer("paid_amount").default(0),
  status: text("status").notNull().default("pending"),
  eventId: integer("event_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  name: true,
  description: true,
  date: true,
  time: true,
  location: true,
  icon: true,
  color: true,
});

export const insertGuestSchema = createInsertSchema(guests).pick({
  name: true,
  email: true,
  phone: true,
  relation: true,
  eventIds: true,
  rsvpStatus: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  category: true,
  status: true,
  assignedTo: true,
  dueDate: true,
  eventId: true,
});

export const insertBudgetItemSchema = createInsertSchema(budgetItems).pick({
  category: true,
  vendor: true,
  description: true,
  estimatedAmount: true,
  actualAmount: true,
  paidAmount: true,
  status: true,
  eventId: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Guest = typeof guests.$inferSelect;
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type BudgetItem = typeof budgetItems.$inferSelect;
export type InsertBudgetItem = z.infer<typeof insertBudgetItemSchema>;
