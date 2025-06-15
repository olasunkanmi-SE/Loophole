
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute - Loading:', loading, 'User:', user, 'Profile:', userProfile);
    
    if (!loading) {
      if (!user) {
        console.log('No user, redirecting to signin');
        setLocation('/signin');
      } else if (!userProfile) {
        console.log('User exists but no profile, redirecting to create-profile');
        setLocation('/create-profile');
      } else {
        console.log('User and profile exist, allowing access');
      }
    }
  }, [user, userProfile, loading, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  return <>{children}</>;
}
