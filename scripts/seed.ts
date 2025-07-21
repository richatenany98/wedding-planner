import 'dotenv/config';
import { db } from '../server/db';
import { users } from '../shared/schema';

async function seed() {
  try {
    await db.insert(users).values({
      username: 'seeduser',
      password: 'testpassword', // ⚠️ hash this in real apps
      role: 'admin',
      name: 'Seed User',
      weddingProfileId: null, // optional
    });

    console.log('✅ Seed user created');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();