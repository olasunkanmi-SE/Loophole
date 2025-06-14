import { db, authUsers, userProfiles, bridges } from '../db';
import { eq } from 'drizzle-orm';
import type { AuthUser, UserProfile, Bridge, NewUserProfile } from '../db/schema';

// Auth functions
export async function signUp(email: string, password: string): Promise<AuthUser> {
  try {
    const [user] = await db.insert(authUsers).values({
      email,
      password,
    }).returning();

    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique')) {
      throw new Error('User with this email already exists');
    }
    throw new Error('Failed to create user');
  }
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  try {
    const [user] = await db
      .select()
      .from(authUsers)
      .where(eq(authUsers.email, email))
      .limit(1);

    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  } catch (error) {
    throw new Error('Invalid credentials');
  }
}

export async function signOut(): Promise<void> {
  localStorage.removeItem('currentUser');
}

export function getCurrentUser(): AuthUser | null {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
}

// Profile functions
export async function createProfile(profileData: Omit<NewUserProfile, 'id' | 'createdAt'>): Promise<UserProfile> {
  try {
    const [profile] = await db.insert(userProfiles).values({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      phone: profileData.phone,
      location: profileData.location,
      bio: profileData.bio,
      profileImageUrl: profileData.profileImageUrl,
    }).returning();

    return profile;
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique')) {
      throw new Error('Profile with this email already exists');
    }
    throw new Error('Failed to create profile');
  }
}

export async function getProfile(email: string): Promise<UserProfile | null> {
  try {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.email, email))
      .limit(1);

    return profile || null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

// Bridges functions
export async function getBridges(): Promise<Bridge[]> {
  try {
    return await db.select().from(bridges);
  } catch (error) {
    console.error('Error fetching bridges:', error);
    return [];
  }
}

export async function getBridge(id: number): Promise<Bridge | null> {
  try {
    const [bridge] = await db
      .select()
      .from(bridges)
      .where(eq(bridges.id, id))
      .limit(1);

    return bridge || null;
  } catch (error) {
    console.error('Error fetching bridge:', error);
    return null;
  }
}