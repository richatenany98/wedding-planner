import { db } from './db';
import { users, events, guests, tasks, budgetItems, vendors, weddingProfiles } from '@shared/schema';

async function seed() {
  try {
    console.log('Seeding database...');

    // Clear existing data
    await db.delete(vendors);
    await db.delete(budgetItems);
    await db.delete(tasks);
    await db.delete(guests);
    await db.delete(events);
    await db.delete(users);
    await db.delete(weddingProfiles);

    // Create sample wedding profile
    const weddingProfile = await db.insert(weddingProfiles).values({
      brideName: 'Sarah Johnson',
      groomName: 'Michael Davis',
      weddingStartDate: '2024-12-20',
      weddingEndDate: '2024-12-22',
      venue: 'Grand Oak Resort',
      city: 'Napa Valley',
      state: 'California',
      guestCount: 200,
      budget: 75000,
      functions: ['rehearsal-dinner', 'ceremony', 'cocktail-hour', 'reception'],
      theme: 'elegant',
      isComplete: true,
    }).returning();

    // Create sample user
    const user = await db.insert(users).values({
      username: 'sarah.johnson',
      password: 'password123',
      role: 'bride',
      name: 'Sarah Johnson',
      weddingProfileId: weddingProfile[0].id,
    }).returning();

    // Create sample events
    const sampleEvents = [
      {
        name: 'Rehearsal Dinner',
        description: 'Pre-wedding dinner with close family and friends',
        date: '2024-12-19',
        time: '6:00 PM',
        location: 'Private Dining Room',
        progress: 80,
        guestCount: 50,
        icon: 'champagne-glasses',
        color: 'indigo',
      },
      {
        name: 'Wedding Ceremony',
        description: 'The main wedding ceremony',
        date: '2024-12-20',
        time: '4:00 PM',
        location: 'Garden Pavilion',
        progress: 95,
        guestCount: 200,
        icon: 'ring',
        color: 'red',
      },
      {
        name: 'Cocktail Hour',
        description: 'Pre-reception drinks and appetizers',
        date: '2024-12-17',
        time: '7:00 PM',
        location: 'Event Venue',
        type: 'sangeet',
        status: 'confirmed',
        progress: 60,
        guestCount: 200,
        icon: 'music',
        color: 'purple',
      },
      {
        name: 'Wedding Ceremony',
        description: 'Main wedding ceremony',
        date: '2024-12-18',
        time: '11:00 AM',
        location: 'Temple',
        type: 'wedding',
        status: 'confirmed',
        progress: 85,
        guestCount: 350,
        icon: 'ring',
        color: 'red',
      },
      {
        name: 'Reception',
        description: 'Celebration dinner party',
        date: '2024-12-18',
        time: '7:00 PM',
        location: 'Luxury Resort',
        type: 'reception',
        status: 'confirmed',
        progress: 40,
        guestCount: 500,
        icon: 'champagne-glasses',
        color: 'indigo',
      },
    ];

    await db.insert(events).values(sampleEvents);

    // Create sample guests
    const sampleGuests = [
      {
        name: 'Rahul Kumar',
        email: 'rahul@email.com',
        phone: '9876543210',
        relation: 'Friend',
        eventIds: ['1', '2', '3', '4', '5'],
        rsvpStatus: 'confirmed',
      },
      {
        name: 'Priya Sharma',
        email: 'priya@email.com',
        phone: '9876543211',
        relation: 'Family',
        eventIds: ['1', '2', '3', '4', '5'],
        rsvpStatus: 'pending',
      },
      {
        name: 'Amit Patel',
        email: 'amit@email.com',
        phone: '9876543212',
        relation: 'Colleague',
        eventIds: ['3', '4', '5'],
        rsvpStatus: 'confirmed',
      },
      {
        name: 'Neha Gupta',
        email: 'neha@email.com',
        phone: '9876543213',
        relation: 'Family',
        eventIds: ['1', '2', '3', '4', '5'],
        rsvpStatus: 'confirmed',
      },
      {
        name: 'Arjun Singh',
        email: 'arjun@email.com',
        phone: '9876543214',
        relation: 'Friend',
        eventIds: ['3', '4', '5'],
        rsvpStatus: 'pending',
      },
    ];

    await db.insert(guests).values(sampleGuests);

    // Create sample tasks
    const sampleTasks = [
      {
        title: 'Book wedding venue',
        description: 'Find and book the perfect venue',
        category: 'venue',
        status: 'done',
        assignedTo: 'bride',
        dueDate: '2024-11-15',
        eventId: null,
      },
      {
        title: 'Choose wedding photographer',
        description: 'Research and book photographer',
        category: 'photography',
        status: 'inprogress',
        assignedTo: 'groom',
        dueDate: '2024-11-20',
        eventId: null,
      },
      {
        title: 'Send invitations',
        description: 'Send out wedding invitations',
        category: 'invitations',
        status: 'todo',
        assignedTo: 'bride',
        dueDate: '2024-11-30',
        eventId: null,
      },
      {
        title: 'Choose mandap design',
        description: 'Select mandap decoration style',
        category: 'decor',
        status: 'todo',
        assignedTo: 'bride',
        dueDate: '2024-12-01',
        eventId: null,
      },
      {
        title: 'Book catering service',
        description: 'Hire catering company',
        category: 'food',
        status: 'inprogress',
        assignedTo: 'groom',
        dueDate: '2024-11-25',
        eventId: null,
      },
    ];

    await db.insert(tasks).values(sampleTasks);

    // Create sample budget items
    const sampleBudgetItems = [
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
      {
        category: 'music',
        vendor: 'Bollywood Beats',
        description: 'DJ and sound system for sangeet',
        estimatedAmount: 40000,
        actualAmount: 35000,
        paidAmount: 17500,
        status: 'partial',
        eventId: null,
      },
    ];

    await db.insert(budgetItems).values(sampleBudgetItems);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();