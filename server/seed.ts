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
      functions: ['ganesh-puja', 'haldi', 'sangeet', 'wedding', 'reception'],
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
        name: 'Ganesh Puja',
        description: 'Prayer ceremony to Lord Ganesha for auspicious beginnings',
        date: '2024-12-19',
        time: '10:00 AM',
        location: 'Hotel Prayer Room',
        progress: 90,
        guestCount: 30,
        icon: 'flower',
        color: 'orange',
        weddingProfileId: weddingProfile[0].id,
      },
      {
        name: 'Haldi Ceremony',
        description: 'Turmeric ceremony for purification and blessings',
        date: '2024-12-20',
        time: '11:00 AM',
        location: 'Bridal Suite',
        progress: 85,
        guestCount: 40,
        icon: 'sun',
        color: 'yellow',
        weddingProfileId: weddingProfile[0].id,
      },
      {
        name: 'Sangeet Night',
        description: 'Musical celebration with dance and performances',
        date: '2024-12-17',
        time: '7:00 PM',
        location: 'Event Venue',
        type: 'sangeet',
        status: 'confirmed',
        progress: 60,
        guestCount: 200,
        icon: 'music',
        color: 'purple',
        weddingProfileId: weddingProfile[0].id,
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
        weddingProfileId: weddingProfile[0].id,
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
        weddingProfileId: weddingProfile[0].id,
      },
    ];

    await db.insert(events).values(sampleEvents);

    // Create sample guests
    const sampleGuests = [
      {
        name: 'Rahul Kumar',
        email: 'rahul@email.com',
        phone: '9876543210',
        side: 'Friend',
        rsvpStatus: 'confirmed',
        weddingProfileId: weddingProfile[0].id,
      },
      {
        name: 'Priya Sharma',
        email: 'priya@email.com',
        phone: '9876543211',
        side: 'Family',
        rsvpStatus: 'pending',
        weddingProfileId: weddingProfile[0].id,
      },
      {
        name: 'Amit Patel',
        email: 'amit@email.com',
        phone: '9876543212',
        side: 'Colleague',
        rsvpStatus: 'confirmed',
        weddingProfileId: weddingProfile[0].id,
      },
      {
        name: 'Neha Gupta',
        email: 'neha@email.com',
        phone: '9876543213',
        side: 'Family',
        rsvpStatus: 'confirmed',
        weddingProfileId: weddingProfile[0].id,
      },
      {
        name: 'Arjun Singh',
        email: 'arjun@email.com',
        phone: '9876543214',
        side: 'Friend',
        rsvpStatus: 'pending',
        weddingProfileId: weddingProfile[0].id,
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
        weddingProfileId: weddingProfile[0].id,
      },
      {
        title: 'Choose wedding photographer',
        description: 'Research and book photographer',
        category: 'photography',
        status: 'inprogress',
        assignedTo: 'groom',
        dueDate: '2024-11-20',
        eventId: null,
        weddingProfileId: weddingProfile[0].id,
      },
      {
        title: 'Send invitations',
        description: 'Send out wedding invitations',
        category: 'invitations',
        status: 'todo',
        assignedTo: 'bride',
        dueDate: '2024-11-30',
        eventId: null,
        weddingProfileId: weddingProfile[0].id,
      },
      {
        title: 'Choose mandap design',
        description: 'Select mandap decoration style',
        category: 'decor',
        status: 'todo',
        assignedTo: 'bride',
        dueDate: '2024-12-01',
        eventId: null,
        weddingProfileId: weddingProfile[0].id,
      },
      {
        title: 'Book catering service',
        description: 'Hire catering company',
        category: 'food',
        status: 'inprogress',
        assignedTo: 'groom',
        dueDate: '2024-11-25',
        eventId: null,
        weddingProfileId: weddingProfile[0].id,
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
        weddingProfileId: weddingProfile[0].id,
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
        weddingProfileId: weddingProfile[0].id,
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
        weddingProfileId: weddingProfile[0].id,
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
        weddingProfileId: weddingProfile[0].id,
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
        weddingProfileId: weddingProfile[0].id,
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
        weddingProfileId: weddingProfile[0].id,
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