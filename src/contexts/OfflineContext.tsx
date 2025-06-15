
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CachedSurvey {
  id: string;
  category: string;
  questions: any[];
  answers: Record<string, any>;
  completedAt?: Date;
  syncedAt?: Date;
}

interface OfflineContextType {
  isOnline: boolean;
  cachedSurveys: CachedSurvey[];
  pendingSurveys: CachedSurvey[];
  cacheSurvey: (survey: Omit<CachedSurvey, 'id'>) => string;
  updateCachedSurvey: (id: string, answers: Record<string, any>) => void;
  completeCachedSurvey: (id: string) => void;
  syncPendingSurveys: () => Promise<void>;
  getCachedSurvey: (category: string) => CachedSurvey | undefined;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedSurveys, setCachedSurveys] = useState<CachedSurvey[]>(() => {
    const saved = localStorage.getItem('cachedSurveys');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline) {
      syncPendingSurveys();
    }
  }, [isOnline]);

  const cacheSurvey = (surveyData: Omit<CachedSurvey, 'id'>): string => {
    const survey: CachedSurvey = {
      ...surveyData,
      id: Date.now().toString(),
    };

    setCachedSurveys(prev => {
      const updated = [...prev.filter(s => s.category !== survey.category), survey];
      localStorage.setItem('cachedSurveys', JSON.stringify(updated));
      return updated;
    });

    return survey.id;
  };

  const updateCachedSurvey = (id: string, answers: Record<string, any>) => {
    setCachedSurveys(prev => {
      const updated = prev.map(survey =>
        survey.id === id ? { ...survey, answers } : survey
      );
      localStorage.setItem('cachedSurveys', JSON.stringify(updated));
      return updated;
    });
  };

  const completeCachedSurvey = (id: string) => {
    setCachedSurveys(prev => {
      const updated = prev.map(survey =>
        survey.id === id 
          ? { ...survey, completedAt: new Date() }
          : survey
      );
      localStorage.setItem('cachedSurveys', JSON.stringify(updated));
      return updated;
    });
  };

  const syncPendingSurveys = async () => {
    const pending = cachedSurveys.filter(s => s.completedAt && !s.syncedAt);
    
    for (const survey of pending) {
      try {
        // In a real app, you'd sync with the backend here
        console.log('Syncing survey:', survey.category);
        
        // Mark as synced
        setCachedSurveys(prev => {
          const updated = prev.map(s =>
            s.id === survey.id ? { ...s, syncedAt: new Date() } : s
          );
          localStorage.setItem('cachedSurveys', JSON.stringify(updated));
          return updated;
        });
      } catch (error) {
        console.error('Failed to sync survey:', survey.id, error);
      }
    }
  };

  const getCachedSurvey = (category: string): CachedSurvey | undefined => {
    return cachedSurveys.find(s => s.category === category);
  };

  const pendingSurveys = cachedSurveys.filter(s => s.completedAt && !s.syncedAt);

  const value: OfflineContextType = {
    isOnline,
    cachedSurveys,
    pendingSurveys,
    cacheSurvey,
    updateCachedSurvey,
    completeCachedSurvey,
    syncPendingSurveys,
    getCachedSurvey,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};
