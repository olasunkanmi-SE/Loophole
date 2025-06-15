import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, getProfile, signOut as apiSignOut, signIn as apiSignIn, signUp as apiSignUp } from '../api/client';

interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  profile_image_url?: string;
}

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isLoadingProfile: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const refreshProfile = async () => {
    if (!user?.email || isLoadingProfile) return;

    try {
      setIsLoadingProfile(true);
      console.log("Refreshing profile for:", user.email);
      const profile = await getProfile(user.email);
      console.log("Profile loaded:", profile);
      setUserProfile(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Don't set profile to null on error to avoid infinite loops
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email);
      const userData = await apiSignIn(email, password);
      console.log('User data received:', userData);
      setUser(userData);

      // Fetch user profile
      console.log('Fetching profile for:', email);
      const profile = await getProfile(email);
      console.log('Profile fetched:', profile);
      setUserProfile(profile);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    const user = await apiSignUp(email, password);
    setUser(user);
  };

  const signOut = async () => {
    await apiSignOut();
    setUser(null);
    setUserProfile(null);
  };

  useEffect(() => {
    // Check for existing user session
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      refreshProfile();
    } else {
      setUserProfile(null);
    }
  }, [user]);

  const value = {
    user,
    userProfile,
    loading,
    isLoadingProfile,
    signIn,
    signUp,
    signOut,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}