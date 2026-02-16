
import { db, pgClient } from '../src/db';
import { seedActions } from '../src/db/seed-actions';
import { units } from '../src/db/schema';

async function main() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Seed Actions
    await seedActions(db);
    
    // Seed Basic Units
    console.log('Seeding standard units...');
    await db.insert(units).values([
      { label: 'One', symbol: 'one' },
      { label: 'Kilogram', symbol: 'kg' },
      { label: 'Hour', symbol: 'h' },
      { label: 'Meter', symbol: 'm' },
      { label: 'Liter', symbol: 'l' }
    ]).onConflictDoNothing();
    
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pgClient.end();
  }
}

main();
