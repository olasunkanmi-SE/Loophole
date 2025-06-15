const API_BASE_URL = '/api';

export interface User {
  id: string;
  email: string;
}

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  location?: string;
  bio?: string;
  profile_image_url?: string | null;
  created_at: string;
}

// Authentication functions
export async function signIn(email: string, password: string): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Sign in failed');
    }

    const user = await response.json();
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Error in signIn:', error);
    throw error;
  }
}

export async function signUp(email: string, password: string): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Sign up failed');
    }

    const user = await response.json();
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Error in signUp:', error);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  localStorage.removeItem('currentUser');
}

export async function resetPassword(email: string, newPassword: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Password reset failed');
    }
  } catch (error) {
    console.error('Error in resetPassword:', error);
    throw error;
  }
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
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Profile creation failed');
    }

    const profile = await response.json();
    console.log('Profile created successfully:', profile);
    return profile;
  } catch (error) {
    console.error('Error in createProfile:', error);
    throw error;
  }
}

export async function getProfile(email: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/${encodeURIComponent(email)}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Profile doesn't exist
      }
      throw new Error('Failed to fetch profile');
    }

    const profile = await response.json();
    return profile;
  } catch (error) {
    console.error('Error in getProfile:', error);
    throw error;
  }
}

export async function updateProfile(email: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in updateProfile:', error);
    throw error;
  }
}

// Placeholder functions (keeping for compatibility)
export async function getBridges(): Promise<any[]> {
  return [];
}

export async function getBridge(id: string): Promise<any> {
  return null;
}