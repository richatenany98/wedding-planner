import { users, events, guests, tasks, budgetItems, vendors, weddingProfiles, type User, type InsertUser, type WeddingProfile, type InsertWeddingProfile, type Event, type InsertEvent, type Guest, type InsertGuest, type Task, type InsertTask, type BudgetItem, type InsertBudgetItem, type Vendor, type InsertVendor } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Wedding Profile methods
  getWeddingProfile(id: number): Promise<WeddingProfile | undefined>;
  createWeddingProfile(profile: InsertWeddingProfile): Promise<WeddingProfile>;
  updateWeddingProfile(id: number, profile: Partial<WeddingProfile>): Promise<WeddingProfile | undefined>;
  
  // Event methods
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Guest methods
  getGuests(): Promise<Guest[]>;
  getGuest(id: number): Promise<Guest | undefined>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  updateGuest(id: number, guest: Partial<Guest>): Promise<Guest | undefined>;
  deleteGuest(id: number): Promise<boolean>;
  
  // Task methods
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Budget methods
  getBudgetItems(): Promise<BudgetItem[]>;
  getBudgetItem(id: number): Promise<BudgetItem | undefined>;
  createBudgetItem(budgetItem: InsertBudgetItem): Promise<BudgetItem>;
  updateBudgetItem(id: number, budgetItem: Partial<BudgetItem>): Promise<BudgetItem | undefined>;
  deleteBudgetItem(id: number): Promise<boolean>;
  
  // Vendor methods
  getVendors(): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<Vendor>): Promise<Vendor | undefined>;
  deleteVendor(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private weddingProfiles: Map<number, WeddingProfile>;
  private events: Map<number, Event>;
  private guests: Map<number, Guest>;
  private tasks: Map<number, Task>;
  private budgetItems: Map<number, BudgetItem>;
  private vendors: Map<number, Vendor>;
  private currentUserId: number;
  private currentWeddingProfileId: number;
  private currentEventId: number;
  private currentGuestId: number;
  private currentTaskId: number;
  private currentBudgetItemId: number;
  private currentVendorId: number;

  constructor() {
    this.users = new Map();
    this.weddingProfiles = new Map();
    this.events = new Map();
    this.guests = new Map();
    this.tasks = new Map();
    this.budgetItems = new Map();
    this.vendors = new Map();
    this.currentUserId = 1;
    this.currentWeddingProfileId = 1;
    this.currentEventId = 1;
    this.currentGuestId = 1;
    this.currentTaskId = 1;
    this.currentBudgetItemId = 1;
    this.currentVendorId = 1;
    
    this.seedData();
  }

  private seedData() {
    // No default events - users will set up their own events

    // Seed budget items
    const budgetItems = [
      {
        category: 'venue',
        vendor: 'Royal Banquet Hall',
        description: 'Wedding venue booking',
        estimatedAmount: 150000,
        actualAmount: 145000,
        paidAmount: 50000,
        status: 'partial',
        eventId: null,
      },
      {
        category: 'photography',
        vendor: 'Moments Studio',
        description: 'Wedding photography and videography',
        estimatedAmount: 75000,
        actualAmount: 80000,
        paidAmount: 80000,
        status: 'paid',
        eventId: null,
      },
      {
        category: 'catering',
        vendor: 'Delicious Catering',
        description: 'Food and beverages for all events',
        estimatedAmount: 200000,
        actualAmount: null,
        paidAmount: null,
        status: 'pending',
        eventId: null,
      },
      {
        category: 'attire',
        vendor: 'Elegant Fashions',
        description: 'Bridal lehenga and accessories',
        estimatedAmount: 100000,
        actualAmount: 95000,
        paidAmount: 95000,
        status: 'paid',
        eventId: null,
      },
      {
        category: 'flowers',
        vendor: 'Blooms & Blossoms',
        description: 'Floral decorations and garlands',
        estimatedAmount: 50000,
        actualAmount: null,
        paidAmount: null,
        status: 'pending',
        eventId: null,
      },
    ];

    budgetItems.forEach(budgetItem => {
      const id = this.currentBudgetItemId++;
      this.budgetItems.set(id, { ...budgetItem, id });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userUpdate: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Wedding Profile methods
  async getWeddingProfile(id: number): Promise<WeddingProfile | undefined> {
    return this.weddingProfiles.get(id);
  }

  async createWeddingProfile(insertProfile: InsertWeddingProfile): Promise<WeddingProfile> {
    const id = this.currentWeddingProfileId++;
    const profile: WeddingProfile = { 
      ...insertProfile, 
      id,
      createdAt: new Date(),
      isComplete: insertProfile.isComplete || false
    };
    this.weddingProfiles.set(id, profile);
    return profile;
  }

  async updateWeddingProfile(id: number, profileUpdate: Partial<WeddingProfile>): Promise<WeddingProfile | undefined> {
    const profile = this.weddingProfiles.get(id);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...profileUpdate };
    this.weddingProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = { 
      ...insertEvent, 
      id, 
      progress: 0, 
      guestCount: 0,
      description: insertEvent.description || null
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, eventUpdate: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...eventUpdate };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Guest methods
  async getGuests(): Promise<Guest[]> {
    return Array.from(this.guests.values());
  }

  async getGuest(id: number): Promise<Guest | undefined> {
    return this.guests.get(id);
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const id = this.currentGuestId++;
    const guest: Guest = { 
      ...insertGuest, 
      id,
      email: insertGuest.email || null,
      phone: insertGuest.phone || null,
      eventIds: insertGuest.eventIds || null,
      rsvpStatus: insertGuest.rsvpStatus || null
    };
    this.guests.set(id, guest);
    return guest;
  }

  async updateGuest(id: number, guestUpdate: Partial<Guest>): Promise<Guest | undefined> {
    const guest = this.guests.get(id);
    if (!guest) return undefined;
    
    const updatedGuest = { ...guest, ...guestUpdate };
    this.guests.set(id, updatedGuest);
    return updatedGuest;
  }

  async deleteGuest(id: number): Promise<boolean> {
    return this.guests.delete(id);
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = { 
      ...insertTask, 
      id,
      description: insertTask.description || null,
      dueDate: insertTask.dueDate || null,
      eventId: insertTask.eventId || null
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Budget methods
  async getBudgetItems(): Promise<BudgetItem[]> {
    return Array.from(this.budgetItems.values());
  }

  async getBudgetItem(id: number): Promise<BudgetItem | undefined> {
    return this.budgetItems.get(id);
  }

  async createBudgetItem(insertBudgetItem: InsertBudgetItem): Promise<BudgetItem> {
    const id = this.currentBudgetItemId++;
    const budgetItem: BudgetItem = {
      ...insertBudgetItem,
      id,
      description: insertBudgetItem.description || null,
      actualAmount: insertBudgetItem.actualAmount || null,
      paidAmount: insertBudgetItem.paidAmount || null,
      eventId: insertBudgetItem.eventId || null
    };
    this.budgetItems.set(id, budgetItem);
    return budgetItem;
  }

  async updateBudgetItem(id: number, budgetItemUpdate: Partial<BudgetItem>): Promise<BudgetItem | undefined> {
    const budgetItem = this.budgetItems.get(id);
    if (!budgetItem) return undefined;
    
    const updatedBudgetItem = { ...budgetItem, ...budgetItemUpdate };
    this.budgetItems.set(id, updatedBudgetItem);
    return updatedBudgetItem;
  }

  async deleteBudgetItem(id: number): Promise<boolean> {
    return this.budgetItems.delete(id);
  }

  // Vendor methods
  async getVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const id = this.currentVendorId++;
    const vendor: Vendor = {
      ...insertVendor,
      id,
      contactInfo: insertVendor.contactInfo || null,
      notes: insertVendor.notes || null,
      contractUploaded: insertVendor.contractUploaded || false,
      eventId: insertVendor.eventId || null
    };
    this.vendors.set(id, vendor);
    return vendor;
  }

  async updateVendor(id: number, vendorUpdate: Partial<Vendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;
    
    const updatedVendor = { ...vendor, ...vendorUpdate };
    this.vendors.set(id, updatedVendor);
    return updatedVendor;
  }

  async deleteVendor(id: number): Promise<boolean> {
    return this.vendors.delete(id);
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userUpdate: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userUpdate)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async updateEvent(id: number, eventUpdate: Partial<Event>): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set(eventUpdate)
      .where(eq(events.id, id))
      .returning();
    return event || undefined;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return result.rowCount > 0;
  }

  async getGuests(): Promise<Guest[]> {
    return await db.select().from(guests);
  }

  async getGuest(id: number): Promise<Guest | undefined> {
    const [guest] = await db.select().from(guests).where(eq(guests.id, id));
    return guest || undefined;
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const [guest] = await db
      .insert(guests)
      .values(insertGuest)
      .returning();
    return guest;
  }

  async updateGuest(id: number, guestUpdate: Partial<Guest>): Promise<Guest | undefined> {
    const [guest] = await db
      .update(guests)
      .set(guestUpdate)
      .where(eq(guests.id, id))
      .returning();
    return guest || undefined;
  }

  async deleteGuest(id: number): Promise<boolean> {
    const result = await db.delete(guests).where(eq(guests.id, id));
    return result.rowCount > 0;
  }

  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(taskUpdate)
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount > 0;
  }

  async getBudgetItems(): Promise<BudgetItem[]> {
    return await db.select().from(budgetItems);
  }

  async getBudgetItem(id: number): Promise<BudgetItem | undefined> {
    const [budgetItem] = await db.select().from(budgetItems).where(eq(budgetItems.id, id));
    return budgetItem || undefined;
  }

  async createBudgetItem(insertBudgetItem: InsertBudgetItem): Promise<BudgetItem> {
    const [budgetItem] = await db
      .insert(budgetItems)
      .values(insertBudgetItem)
      .returning();
    return budgetItem;
  }

  async updateBudgetItem(id: number, budgetItemUpdate: Partial<BudgetItem>): Promise<BudgetItem | undefined> {
    const [budgetItem] = await db
      .update(budgetItems)
      .set(budgetItemUpdate)
      .where(eq(budgetItems.id, id))
      .returning();
    return budgetItem || undefined;
  }

  async deleteBudgetItem(id: number): Promise<boolean> {
    const result = await db.delete(budgetItems).where(eq(budgetItems.id, id));
    return result.rowCount > 0;
  }

  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors);
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const [vendor] = await db
      .insert(vendors)
      .values(insertVendor)
      .returning();
    return vendor;
  }

  async updateVendor(id: number, vendorUpdate: Partial<Vendor>): Promise<Vendor | undefined> {
    const [vendor] = await db
      .update(vendors)
      .set(vendorUpdate)
      .where(eq(vendors.id, id))
      .returning();
    return vendor || undefined;
  }

  async deleteVendor(id: number): Promise<boolean> {
    const result = await db.delete(vendors).where(eq(vendors.id, id));
    return result.rowCount > 0;
  }

  async getWeddingProfile(id: number): Promise<WeddingProfile | undefined> {
    const [profile] = await db.select().from(weddingProfiles).where(eq(weddingProfiles.id, id));
    return profile || undefined;
  }

  async createWeddingProfile(insertProfile: InsertWeddingProfile): Promise<WeddingProfile> {
    const [profile] = await db
      .insert(weddingProfiles)
      .values(insertProfile)
      .returning();
    return profile;
  }

  async updateWeddingProfile(id: number, profileUpdate: Partial<WeddingProfile>): Promise<WeddingProfile | undefined> {
    const [profile] = await db
      .update(weddingProfiles)
      .set(profileUpdate)
      .where(eq(weddingProfiles.id, id))
      .returning();
    return profile || undefined;
  }
}

export const storage = new DatabaseStorage();
