
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use environment variables for database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/myapp';

// Create postgres client
export const sql = postgres(connectionString);

// Create drizzle instance
export const db = drizzle(sql, { schema });

export * from './schema';
