import 'dotenv/config';
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
  getWeddingProfiles(): Promise<WeddingProfile[]>;
  createWeddingProfile(profile: InsertWeddingProfile): Promise<WeddingProfile>;
  updateWeddingProfile(id: number, profile: Partial<WeddingProfile>): Promise<WeddingProfile | undefined>;
  
  // Event methods
  getEvents(weddingProfileId?: number): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Guest methods
  getGuests(weddingProfileId?: number): Promise<Guest[]>;
  getGuest(id: number): Promise<Guest | undefined>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  updateGuest(id: number, guest: Partial<Guest>): Promise<Guest | undefined>;
  deleteGuest(id: number): Promise<boolean>;
  
  // Task methods
  getTasks(weddingProfileId?: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Budget methods
  getBudgetItems(weddingProfileId?: number): Promise<BudgetItem[]>;
  getBudgetItem(id: number): Promise<BudgetItem | undefined>;
  createBudgetItem(budgetItem: InsertBudgetItem): Promise<BudgetItem>;
  updateBudgetItem(id: number, budgetItem: Partial<BudgetItem>): Promise<BudgetItem | undefined>;
  deleteBudgetItem(id: number): Promise<boolean>;
  
  // Vendor methods
  getVendors(weddingProfileId?: number): Promise<Vendor[]>;
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
    
    this.seedData().catch(console.error);
  }

  private async seedData() {
    // Create a wedding profile
    const weddingProfile: WeddingProfile = {
      id: this.currentWeddingProfileId++,
      brideName: "Richa Tenany",
      groomName: "John Doe",
      weddingStartDate: "2024-06-15",
      weddingEndDate: "2024-06-16",
      venue: "Grand Hotel",
      city: "New York",
      state: "NY",
      guestCount: 150,
      budget: 50000,
      functions: ["Rehearsal Dinner", "Wedding Ceremony", "Reception"],
      createdAt: new Date(),
      isComplete: false,
    };
    this.weddingProfiles.set(weddingProfile.id, weddingProfile);

    // Create a user with hashed password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash("password123", 12);
    const user: User = {
      id: this.currentUserId++,
      username: "richa",
      password: hashedPassword,
      role: "bride",
      name: "Richa Tenany",
      weddingProfileId: weddingProfile.id,
    };
    this.users.set(user.id, user);

    // Create events
    const events: Event[] = [
      {
        id: this.currentEventId++,
        name: "Rehearsal Dinner",
        description: "Intimate dinner with close family and wedding party",
        date: "2024-06-14",
        time: "18:00",
        location: "Grand Hotel Restaurant",
        progress: 100,
        icon: "utensils",
        color: "blue",
        guestCount: 30,
        weddingProfileId: weddingProfile.id,
      },
      {
        id: this.currentEventId++,
        name: "Wedding Ceremony",
        description: "The main wedding ceremony",
        date: "2024-06-15",
        time: "16:00",
        location: "Grand Hotel Garden",
        progress: 75,
        icon: "heart",
        color: "pink",
        guestCount: 150,
        weddingProfileId: weddingProfile.id,
      },
      {
        id: this.currentEventId++,
        name: "Reception",
        description: "Wedding reception with dinner and dancing",
        date: "2024-06-15",
        time: "18:00",
        location: "Grand Hotel Ballroom",
        progress: 60,
        icon: "music",
        color: "purple",
        guestCount: 150,
        weddingProfileId: weddingProfile.id,
      },
    ];

    events.forEach(event => this.events.set(event.id, event));

    // Create guests
    const guests: Guest[] = [
      {
        id: this.currentGuestId++,
        name: "Nikesh Patel",
        email: "nikesh@example.com",
        phone: "+1-555-0123",
        side: "bride",
        rsvpStatus: "confirmed",
        weddingProfileId: weddingProfile.id,
      },
      {
        id: this.currentGuestId++,
        name: "Priya Sharma",
        email: "priya@example.com",
        phone: "+1-555-0124",
        side: "bride",
        rsvpStatus: "pending",
        weddingProfileId: weddingProfile.id,
      },
    ];

    guests.forEach(guest => this.guests.set(guest.id, guest));

    // Create tasks
    const tasks: Task[] = [
      {
        id: this.currentTaskId++,
        title: "Book wedding venue",
        description: "Secure the main wedding venue",
        category: "venue",
        status: "completed",
        assignedTo: "bride",
        dueDate: "2024-01-15",
        eventId: events[1].id,
        weddingProfileId: weddingProfile.id,
      },
      {
        id: this.currentTaskId++,
        title: "Choose wedding photographer",
        description: "Select and book wedding photographer",
        category: "photography",
        status: "in-progress",
        assignedTo: "bride",
        dueDate: "2024-02-01",
        eventId: events[1].id,
        weddingProfileId: weddingProfile.id,
      },
      {
        id: this.currentTaskId++,
        title: "Send invitations",
        description: "Send wedding invitations to guests",
        category: "invitations",
        status: "todo",
        assignedTo: "bride",
        dueDate: "2024-03-01",
        eventId: events[1].id,
        weddingProfileId: weddingProfile.id,
      },
      {
        id: this.currentTaskId++,
        title: "Book catering service",
        description: "Secure catering for reception",
        category: "catering",
        status: "in-progress",
        assignedTo: "groom",
        dueDate: "2024-02-15",
        eventId: events[2].id,
        weddingProfileId: weddingProfile.id,
      },
      {
        id: this.currentTaskId++,
        title: "Book catering service",
        description: "Secure catering for reception",
        category: "catering",
        status: "todo",
        assignedTo: "groom",
        dueDate: "2024-02-15",
        eventId: events[2].id,
        weddingProfileId: weddingProfile.id,
      },
    ];

    tasks.forEach(task => this.tasks.set(task.id, task));

    // Create budget items
    const budgetItems: BudgetItem[] = [
      {
        id: this.currentBudgetItemId++,
        category: "venue",
        vendor: "Royal Banquet Hall",
        description: "Wedding ceremony and reception venue",
        estimatedAmount: 15000,
        actualAmount: 15000,
        paidAmount: 7500,
        status: "partial",
        paidBy: "bride",
        eventId: events[1].id,
        weddingProfileId: weddingProfile.id,
      },
      {
        id: this.currentBudgetItemId++,
        category: "catering",
        vendor: "Gourmet Catering Co.",
        description: "Wedding reception catering",
        estimatedAmount: 8000,
        actualAmount: 0,
        paidAmount: 0,
        status: "pending",
        paidBy: "groom",
        eventId: events[2].id,
        weddingProfileId: weddingProfile.id,
      },
    ];

    budgetItems.forEach(budgetItem => this.budgetItems.set(budgetItem.id, budgetItem));

    // Create vendors
    const vendors: Vendor[] = [
      {
        id: this.currentVendorId++,
        name: "Royal Banquet Hall",
        category: "venue",
        contact: "Sarah Johnson",
        email: "sarah@royalbanquet.com",
        phone: "+1-555-0100",
        address: "123 Main St, New York, NY",
        website: "www.royalbanquet.com",
        contractUrl: "https://example.com/contract1.pdf",
        notes: "Beautiful venue with excellent service",
        totalPrice: 15000,
        securityDeposit: 5000,
        paidBy: "bride",
        weddingProfileId: weddingProfile.id,
      },
      {
        id: this.currentVendorId++,
        name: "Gourmet Catering Co.",
        category: "catering",
        contact: "Mike Chen",
        email: "mike@gourmetcatering.com",
        phone: "+1-555-0101",
        address: "456 Oak Ave, New York, NY",
        website: "www.gourmetcatering.com",
        contractUrl: null,
        notes: "Highly recommended by previous clients",
        totalPrice: 8000,
        securityDeposit: 2000,
        paidBy: "groom",
        weddingProfileId: weddingProfile.id,
      },
    ];

    vendors.forEach(vendor => this.vendors.set(vendor.id, vendor));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = { 
      ...user, 
      id,
      weddingProfileId: user.weddingProfileId || null,
    };
    this.users.set(id, newUser);
    return newUser;
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

  async getWeddingProfiles(): Promise<WeddingProfile[]> {
    return Array.from(this.weddingProfiles.values());
  }

  async createWeddingProfile(profile: InsertWeddingProfile): Promise<WeddingProfile> {
    const id = this.currentWeddingProfileId++;
    const newProfile: WeddingProfile = { 
      ...profile, 
      id,
      createdAt: new Date(),
      isComplete: profile.isComplete || false
    };
    this.weddingProfiles.set(id, newProfile);
    
    // Automatically create guest entries for bride and groom
    // Extract last names from bride and groom names
    const brideLastName = this.extractLastName(profile.brideName);
    const groomLastName = this.extractLastName(profile.groomName);
    
    // Create bride guest entry
    await this.createGuest({
      name: profile.brideName,
      email: '',
      phone: '',
      side: brideLastName,
      rsvpStatus: 'confirmed',
      weddingProfileId: newProfile.id,
    });
    
    // Create groom guest entry
    await this.createGuest({
      name: profile.groomName,
      email: '',
      phone: '',
      side: groomLastName,
      rsvpStatus: 'confirmed',
      weddingProfileId: newProfile.id,
    });
    
    return newProfile;
  }

  private extractLastName(fullName: string): string {
    const nameParts = fullName.trim().split(' ');
    return nameParts.length > 1 ? nameParts[nameParts.length - 1] : fullName;
  }

  async updateWeddingProfile(id: number, profileUpdate: Partial<WeddingProfile>): Promise<WeddingProfile | undefined> {
    const profile = this.weddingProfiles.get(id);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...profileUpdate };
    this.weddingProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  // Event methods
  async getEvents(weddingProfileId?: number): Promise<Event[]> {
    const events = Array.from(this.events.values());
    return weddingProfileId 
      ? events.filter(event => event.weddingProfileId === weddingProfileId)
      : events;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const newEvent: Event = { 
      ...event, 
      id, 
      progress: 0, 
      guestCount: event.guestCount || 0,
      description: event.description || null
    };
    this.events.set(id, newEvent);
    return newEvent;
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
  async getGuests(weddingProfileId?: number): Promise<Guest[]> {
    const allGuests = Array.from(this.guests.values());
    if (weddingProfileId) {
      return allGuests.filter(guest => guest.weddingProfileId === weddingProfileId);
    }
    return allGuests;
  }

  async getGuest(id: number): Promise<Guest | undefined> {
    return this.guests.get(id);
  }

  async createGuest(guest: InsertGuest): Promise<Guest> {
    const id = this.currentGuestId++;
    const newGuest: Guest = { 
      ...guest, 
      id,
      email: guest.email || null,
      phone: guest.phone || null,
      rsvpStatus: guest.rsvpStatus || null
    };
    this.guests.set(id, newGuest);
    return newGuest;
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
  async getTasks(weddingProfileId?: number): Promise<Task[]> {
    const allTasks = Array.from(this.tasks.values());
    if (weddingProfileId) {
      return allTasks.filter(task => task.weddingProfileId === weddingProfileId);
    }
    return allTasks;
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const newTask: Task = { 
      ...task, 
      id,
      description: task.description || null,
      dueDate: task.dueDate || null,
      eventId: task.eventId || null,
      status: task.status || "todo",
      weddingProfileId: task.weddingProfileId || null,
    };
    this.tasks.set(id, newTask);
    return newTask;
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
  async getBudgetItems(weddingProfileId?: number): Promise<BudgetItem[]> {
    const allBudgetItems = Array.from(this.budgetItems.values());
    if (weddingProfileId) {
      return allBudgetItems.filter(budgetItem => budgetItem.weddingProfileId === weddingProfileId);
    }
    return allBudgetItems;
  }

  async getBudgetItem(id: number): Promise<BudgetItem | undefined> {
    return this.budgetItems.get(id);
  }

  async createBudgetItem(budgetItem: InsertBudgetItem): Promise<BudgetItem> {
    const id = this.currentBudgetItemId++;
    const newBudgetItem: BudgetItem = { 
      ...budgetItem, 
      id,
      description: budgetItem.description || null,
      actualAmount: budgetItem.actualAmount || 0,
      paidAmount: budgetItem.paidAmount || 0,
      eventId: budgetItem.eventId || null,
      status: budgetItem.status || "pending",
      paidBy: budgetItem.paidBy || null,
      weddingProfileId: budgetItem.weddingProfileId || null,
    };
    this.budgetItems.set(id, newBudgetItem);
    return newBudgetItem;
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
  async getVendors(weddingProfileId?: number): Promise<Vendor[]> {
    const allVendors = Array.from(this.vendors.values());
    if (weddingProfileId) {
      return allVendors.filter(vendor => vendor.weddingProfileId === weddingProfileId);
    }
    return allVendors;
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const id = this.currentVendorId++;
    const newVendor: Vendor = { 
      ...vendor, 
      id,
      contact: vendor.contact || null,
      email: vendor.email || null,
      phone: vendor.phone || null,
      address: vendor.address || null,
      website: vendor.website || null,
      contractUrl: vendor.contractUrl || null,
      notes: vendor.notes || null,

      totalPrice: vendor.totalPrice || null,
      securityDeposit: vendor.securityDeposit || null,
      paidBy: vendor.paidBy || null,
      weddingProfileId: vendor.weddingProfileId || null,
    };
    this.vendors.set(id, newVendor);
    return newVendor;
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
      .values({
        ...insertUser,
        weddingProfileId: insertUser.weddingProfileId || null,
      })
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

  async getEvents(weddingProfileId?: number): Promise<Event[]> {
    if (weddingProfileId) {
      return await db.select().from(events).where(eq(events.weddingProfileId, weddingProfileId));
    }
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
    return (result.rowCount || 0) > 0;
  }

  async getGuests(weddingProfileId?: number): Promise<Guest[]> {
    if (weddingProfileId) {
      return await db.select().from(guests).where(eq(guests.weddingProfileId, weddingProfileId));
    }
    return await db.select().from(guests);
  }

  async getGuest(id: number): Promise<Guest | undefined> {
    const [guest] = await db.select().from(guests).where(eq(guests.id, id));
    return guest || undefined;
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const [guest] = await db
      .insert(guests)
      .values({
        ...insertGuest,
        email: insertGuest.email || null,
        phone: insertGuest.phone || null,
        rsvpStatus: insertGuest.rsvpStatus || null
      })
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
    return (result.rowCount || 0) > 0;
  }

  async getTasks(weddingProfileId?: number): Promise<Task[]> {
    if (weddingProfileId) {
      return await db.select().from(tasks).where(eq(tasks.weddingProfileId, weddingProfileId));
    }
    // If no weddingProfileId provided, return all tasks (backward compatibility)
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
    return (result.rowCount || 0) > 0;
  }

  async getBudgetItems(weddingProfileId?: number): Promise<BudgetItem[]> {
    if (weddingProfileId) {
      return await db.select().from(budgetItems).where(eq(budgetItems.weddingProfileId, weddingProfileId));
    }
    // If no weddingProfileId provided, return all budget items (backward compatibility)
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
    return (result.rowCount || 0) > 0;
  }

  async getVendors(weddingProfileId?: number): Promise<Vendor[]> {
    if (weddingProfileId) {
      return await db.select().from(vendors).where(eq(vendors.weddingProfileId, weddingProfileId));
    }
    // If no weddingProfileId provided, return all vendors (backward compatibility)
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
    return (result.rowCount || 0) > 0;
  }

  async getWeddingProfile(id: number): Promise<WeddingProfile | undefined> {
    const [profile] = await db.select().from(weddingProfiles).where(eq(weddingProfiles.id, id));
    return profile || undefined;
  }

  async getWeddingProfiles(): Promise<WeddingProfile[]> {
    return await db.select().from(weddingProfiles);
  }

  async createWeddingProfile(insertProfile: InsertWeddingProfile): Promise<WeddingProfile> {
    const [profile] = await db
      .insert(weddingProfiles)
      .values(insertProfile)
      .returning();
    
    // Automatically create guest entries for bride and groom
    if (profile) {
      // Extract last names from bride and groom names
      const brideLastName = this.extractLastName(insertProfile.brideName);
      const groomLastName = this.extractLastName(insertProfile.groomName);
      
      // Create bride guest entry
      await this.createGuest({
        name: insertProfile.brideName,
        email: '',
        phone: '',
        side: brideLastName,
        rsvpStatus: 'confirmed',
        weddingProfileId: profile.id,
      });
      
      // Create groom guest entry
      await this.createGuest({
        name: insertProfile.groomName,
        email: '',
        phone: '',
        side: groomLastName,
        rsvpStatus: 'confirmed',
        weddingProfileId: profile.id,
      });
    }
    
    return profile;
  }

  private extractLastName(fullName: string): string {
    const nameParts = fullName.trim().split(' ');
    return nameParts.length > 1 ? nameParts[nameParts.length - 1] : fullName;
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
