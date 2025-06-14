
// In-memory storage using Maps
const usersMap = new Map<string, User>();
const profilesMap = new Map<string, UserProfile>();
const bridgesMap = new Map<number, Bridge>();

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

// Initialize with some sample bridges data
bridgesMap.set(1, {
  id: 1,
  created_at: "2024-01-01T00:00:00Z",
  title: "Golden Gate Bridge",
  note: "Famous suspension bridge in San Francisco",
  latitude: 37.8199,
  longitude: -122.4783,
  image_url: "https://example.com/golden-gate.jpg"
});

bridgesMap.set(2, {
  id: 2,
  created_at: "2024-01-02T00:00:00Z",
  title: "Brooklyn Bridge",
  note: "Historic bridge connecting Manhattan and Brooklyn",
  latitude: 40.7061,
  longitude: -73.9969,
  image_url: "https://example.com/brooklyn-bridge.jpg"
});

// Auth functions
export async function signUp(email: string, password: string): Promise<User> {
  // Check if user already exists
  if (usersMap.has(email)) {
    throw new Error('User already exists with this email');
  }

  const user: User = {
    id: Date.now().toString(),
    email,
    password,
  };

  usersMap.set(email, user);
  localStorage.setItem('currentUser', JSON.stringify(user));
  return user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const user = usersMap.get(email);
  
  if (!user || user.password !== password) {
    throw new Error('Invalid credentials');
  }
  
  localStorage.setItem('currentUser', JSON.stringify(user));
  return user;
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
  // Check if profile already exists for this email
  if (profilesMap.has(profileData.email)) {
    throw new Error('Profile already exists for this email');
  }

  const profile: UserProfile = {
    ...profileData,
    id: Date.now(),
    created_at: new Date().toISOString(),
  };

  profilesMap.set(profileData.email, profile);
  return profile;
}

export async function getProfile(email: string): Promise<UserProfile | null> {
  return profilesMap.get(email) || null;
}

// Bridges functions
export async function getBridges(): Promise<Bridge[]> {
  return Array.from(bridgesMap.values());
}

export async function getBridge(id: number): Promise<Bridge | null> {
  return bridgesMap.get(id) || null;
}

// Helper function to get all data (for debugging)
export function getStorageData() {
  return {
    users: Array.from(usersMap.entries()),
    profiles: Array.from(profilesMap.entries()),
    bridges: Array.from(bridgesMap.entries())
  };
}
