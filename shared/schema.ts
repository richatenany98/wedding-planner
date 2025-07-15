import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  name: text("name").notNull(),
  weddingProfileId: integer("wedding_profile_id"),
});

export const weddingProfiles = pgTable("wedding_profiles", {
  id: serial("id").primaryKey(),
  brideName: text("bride_name").notNull(),
  groomName: text("groom_name").notNull(),
  weddingDate: text("wedding_date").notNull(),
  venue: text("venue").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  guestCount: integer("guest_count").notNull(),
  budget: integer("budget").notNull(),
  functions: text("functions").array().notNull(),
  theme: text("theme").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isComplete: boolean("is_complete").default(false),
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

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  contact: text("contact"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  website: text("website"),
  contractUrl: text("contract_url"),
  notes: text("notes"),
  status: text("status").notNull().default("active"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
}).extend({
  weddingProfileId: z.number().optional(),
});

export const insertWeddingProfileSchema = createInsertSchema(weddingProfiles).pick({
  brideName: true,
  groomName: true,
  weddingDate: true,
  venue: true,
  city: true,
  state: true,
  guestCount: true,
  budget: true,
  functions: true,
  theme: true,
  isComplete: true,
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

export const insertVendorSchema = createInsertSchema(vendors).pick({
  name: true,
  category: true,
  contact: true,
  email: true,
  phone: true,
  address: true,
  website: true,
  contractUrl: true,
  notes: true,
  status: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type WeddingProfile = typeof weddingProfiles.$inferSelect;
export type InsertWeddingProfile = z.infer<typeof insertWeddingProfileSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Guest = typeof guests.$inferSelect;
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type BudgetItem = typeof budgetItems.$inferSelect;
export type InsertBudgetItem = z.infer<typeof insertBudgetItemSchema>;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
