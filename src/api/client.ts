
import { getDatabase } from '../db/mongodb';

interface User {
  id: string;
  email: string;
  password: string;
}

interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  profile_image_url?: string;
  created_at: string;
}

interface Bridge {
  id: number;
  created_at: string;
  title: string;
  note?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
}

// Auth functions
export async function signUp(email: string, password: string): Promise<User> {
  try {
    const db = await getDatabase();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const user: User = {
      id: Date.now().toString(),
      email,
      password,
    };

    await usersCollection.insertOne(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Error in signUp:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string): Promise<User> {
  try {
    const db = await getDatabase();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email, password });
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const userObj: User = {
      id: user.id,
      email: user.email,
      password: user.password
    };

    localStorage.setItem('currentUser', JSON.stringify(userObj));
    return userObj;
  } catch (error) {
    console.error('Error in signIn:', error);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  localStorage.removeItem('currentUser');
}

export function getCurrentUser(): User | null {
  try {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

// Profile functions
export async function createProfile(profileData: Omit<UserProfile, 'id' | 'created_at'>): Promise<UserProfile> {
  try {
    const db = await getDatabase();
    const profilesCollection = db.collection('profiles');

    // Check if profile already exists for this email
    const existingProfile = await profilesCollection.findOne({ email: profileData.email });
    if (existingProfile) {
      throw new Error('Profile already exists for this email');
    }

    const profile: UserProfile = {
      ...profileData,
      id: Date.now(),
      created_at: new Date().toISOString(),
    };

    await profilesCollection.insertOne(profile);
    return profile;
  } catch (error) {
    console.error('Error in createProfile:', error);
    throw error;
  }
}

export async function getProfile(email: string): Promise<UserProfile | null> {
  try {
    const db = await getDatabase();
    const profilesCollection = db.collection('profiles');

    const profile = await profilesCollection.findOne({ email });
    return profile ? {
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      bio: profile.bio,
      profile_image_url: profile.profile_image_url,
      created_at: profile.created_at
    } : null;
  } catch (error) {
    console.error('Error in getProfile:', error);
    return null;
  }
}

// Bridges functions
export async function getBridges(): Promise<Bridge[]> {
  try {
    const db = await getDatabase();
    const bridgesCollection = db.collection('bridges');

    // Initialize with sample data if collection is empty
    const count = await bridgesCollection.countDocuments();
    if (count === 0) {
      const sampleBridges = [
        {
          id: 1,
          created_at: "2024-01-01T00:00:00Z",
          title: "Golden Gate Bridge",
          note: "Famous suspension bridge in San Francisco",
          latitude: 37.8199,
          longitude: -122.4783,
          image_url: "https://example.com/golden-gate.jpg"
        },
        {
          id: 2,
          created_at: "2024-01-02T00:00:00Z",
          title: "Brooklyn Bridge",
          note: "Historic bridge connecting Manhattan and Brooklyn",
          latitude: 40.7061,
          longitude: -73.9969,
          image_url: "https://example.com/brooklyn-bridge.jpg"
        }
      ];
      await bridgesCollection.insertMany(sampleBridges);
    }

    const bridges = await bridgesCollection.find({}).toArray();
    return bridges.map(bridge => ({
      id: bridge.id,
      created_at: bridge.created_at,
      title: bridge.title,
      note: bridge.note,
      latitude: bridge.latitude,
      longitude: bridge.longitude,
      image_url: bridge.image_url
    }));
  } catch (error) {
    console.error('Error in getBridges:', error);
    return [];
  }
}

export async function getBridge(id: number): Promise<Bridge | null> {
  try {
    const db = await getDatabase();
    const bridgesCollection = db.collection('bridges');

    const bridge = await bridgesCollection.findOne({ id });
    return bridge ? {
      id: bridge.id,
      created_at: bridge.created_at,
      title: bridge.title,
      note: bridge.note,
      latitude: bridge.latitude,
      longitude: bridge.longitude,
      image_url: bridge.image_url
    } : null;
  } catch (error) {
    console.error('Error in getBridge:', error);
    return null;
  }
}

// Helper function to get all data (for debugging)
export async function getStorageData() {
  try {
    const db = await getDatabase();
    const users = await db.collection('users').find({}).toArray();
    const profiles = await db.collection('profiles').find({}).toArray();
    const bridges = await db.collection('bridges').find({}).toArray();
    
    return {
      users,
      profiles,
      bridges
    };
  } catch (error) {
    console.error('Error in getStorageData:', error);
    return {
      users: [],
      profiles: [],
      bridges: []
    };
  }
}
