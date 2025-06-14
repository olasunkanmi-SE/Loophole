
const API_BASE = window.location.hostname.includes('replit') 
  ? `${window.location.protocol}//${window.location.hostname}:3001`
  : 'http://localhost:3001';

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
export async function signUp(email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE}/auth_users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: Date.now().toString(),
        email,
        password,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.status}`);
    }
    
    const user = await response.json();
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check if the JSON server is running.');
    }
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  const response = await fetch(`${API_BASE}/auth_users?email=${email}&password=${password}`);
  const users = await response.json();
  
  if (users.length === 0) {
    throw new Error('Invalid credentials');
  }
  
  const user = users[0];
  localStorage.setItem('currentUser', JSON.stringify(user));
  return user;
}

export async function signOut() {
  localStorage.removeItem('currentUser');
}

export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
}

// Profile functions
export async function createProfile(profileData: Omit<UserProfile, 'id' | 'created_at'>) {
  try {
    const response = await fetch(`${API_BASE}/user_profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...profileData,
        id: Date.now(),
        created_at: new Date().toISOString(),
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create profile: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check if the JSON server is running.');
    }
    throw error;
  }
}

export async function getProfile(email: string): Promise<UserProfile | null> {
  const response = await fetch(`${API_BASE}/user_profiles?email=${email}`);
  const profiles = await response.json();
  return profiles.length > 0 ? profiles[0] : null;
}

// Bridges functions
export async function getBridges(): Promise<Bridge[]> {
  const response = await fetch(`${API_BASE}/bridges`);
  return response.json();
}

export async function getBridge(id: number): Promise<Bridge | null> {
  const response = await fetch(`${API_BASE}/bridges/${id}`);
  if (!response.ok) return null;
  return response.json();
}
