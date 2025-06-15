
import { MongoClient, Db } from 'mongodb';

const DATABASE_URL = import.meta.env.VITE_DATABASE_URL || 'mongodb+srv://kosemani:omowunmi888@cluster0.4i82g.mongodb.net/learn?retryWrites=true';

let client: MongoClient;
let db: Db;

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(DATABASE_URL);
    await client.connect();
    db = client.db('learn');
    console.log('Connected to MongoDB Atlas');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function getDatabase(): Promise<Db> {
  if (!db) {
    return await connectToDatabase();
  }
  return db;
}

export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close();
  }
}
