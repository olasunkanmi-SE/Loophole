
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { bridges } from '../src/db/schema';

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/myapp';
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

async function setupDatabase() {
  try {
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('Seeding initial data...');
    
    // Seed bridges data
    await db.insert(bridges).values([
      {
        title: 'Golden Gate Bridge',
        note: 'Famous suspension bridge in San Francisco',
        latitude: '37.8199',
        longitude: '-122.4783',
        imageUrl: 'https://example.com/golden-gate.jpg',
      },
      {
        title: 'Brooklyn Bridge',
        note: 'Historic bridge connecting Manhattan and Brooklyn',
        latitude: '40.7061',
        longitude: '-73.9969',
        imageUrl: 'https://example.com/brooklyn-bridge.jpg',
      },
    ]);
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await sql.end();
  }
}

setupDatabase();
