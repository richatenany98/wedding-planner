import { users, events, guests, tasks, type User, type InsertUser, type Event, type InsertEvent, type Guest, type InsertGuest, type Task, type InsertTask } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private guests: Map<number, Guest>;
  private tasks: Map<number, Task>;
  private currentUserId: number;
  private currentEventId: number;
  private currentGuestId: number;
  private currentTaskId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.guests = new Map();
    this.tasks = new Map();
    this.currentUserId = 1;
    this.currentEventId = 1;
    this.currentGuestId = 1;
    this.currentTaskId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Seed default events
    const defaultEvents = [
      {
        name: "Haldi Ceremony",
        description: "Traditional turmeric ceremony",
        date: "2024-03-15",
        time: "10:00 AM - 12:00 PM",
        location: "Family Home, Mumbai",
        progress: 75,
        icon: "sun",
        color: "yellow",
        guestCount: 45
      },
      {
        name: "Mehndi Ceremony",
        description: "Henna application celebration",
        date: "2024-03-16",
        time: "4:00 PM - 8:00 PM",
        location: "Hotel Taj Palace, Delhi",
        progress: 90,
        icon: "hand-paper",
        color: "green",
        guestCount: 80
      },
      {
        name: "Sangeet Night",
        description: "Music and dance celebration",
        date: "2024-03-17",
        time: "7:00 PM - 11:00 PM",
        location: "Grand Ballroom, Mumbai",
        progress: 60,
        icon: "music",
        color: "purple",
        guestCount: 200
      },
      {
        name: "Wedding Ceremony",
        description: "Sacred wedding rituals",
        date: "2024-03-18",
        time: "9:00 AM - 1:00 PM",
        location: "Temple Gardens, Delhi",
        progress: 85,
        icon: "ring",
        color: "red",
        guestCount: 350
      },
      {
        name: "Reception",
        description: "Celebration dinner party",
        date: "2024-03-18",
        time: "7:00 PM - 12:00 AM",
        location: "Luxury Resort, Goa",
        progress: 40,
        icon: "champagne-glasses",
        color: "indigo",
        guestCount: 500
      }
    ];

    defaultEvents.forEach(event => {
      const id = this.currentEventId++;
      this.events.set(id, { ...event, id });
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

  // Event methods
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = { ...insertEvent, id, progress: 0, guestCount: 0 };
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
    const guest: Guest = { ...insertGuest, id };
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
    const task: Task = { ...insertTask, id };
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
}

export const storage = new MemStorage();
