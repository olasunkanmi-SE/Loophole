
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SurveyQuestion {
  id: string;
  type: 'single' | 'multi';
  question: string;
  answers: string[];
}

interface Survey {
  id: string;
  title: string;
  category: string;
  description: string;
  estimatedTime: string;
  basePoints: number;
  questions: SurveyQuestion[];
  schedule?: {
    type: 'daily' | 'weekly' | 'monthly';
    frequency: number;
    nextAvailable: Date;
  };
  targeting?: {
    userBehavior: string[];
    completedCategories: string[];
    pointsRange: { min: number; max: number };
  };
  isActive: boolean;
  multiplier: number;
}

interface UserBehavior {
  completedSurveys: string[];
  averageSessionTime: number;
  preferredCategories: string[];
  lastActivity: Date;
  totalPoints: number;
}

interface SurveyProgress {
  surveyId: string;
  answers: Record<string, string | string[]>;
  currentQuestion: number;
  startedAt: Date;
  lastSaved: Date;
}

interface SurveyContextType {
  surveys: Survey[];
  userBehavior: UserBehavior;
  surveyProgress: Record<string, SurveyProgress>;
  currentMultiplier: number;
  getAvailableSurveys: () => Survey[];
  getPersonalizedSurveys: () => Survey[];
  getScheduledSurveys: () => Survey[];
  startSurvey: (surveyId: string) => void;
  saveSurveyProgress: (surveyId: string, answers: Record<string, any>, currentQuestion: number) => void;
  completeSurvey: (surveyId: string, answers: Record<string, any>) => number;
  updateUserBehavior: (behavior: Partial<UserBehavior>) => void;
  getEstimatedPoints: (surveyId: string) => number;
  getBonusMultiplier: () => number;
  clearSurveyProgress: (surveyId: string) => void;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export const useSurvey = () => {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error('useSurvey must be used within a SurveyProvider');
  }
  return context;
};

interface SurveyProviderProps {
  children: ReactNode;
}

export const SurveyProvider: React.FC<SurveyProviderProps> = ({ children }) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveysLoaded, setSurveysLoaded] = useState(false);

  // Load surveys from database
  useEffect(() => {
    const loadSurveys = async () => {
      try {
        const response = await fetch('/api/admin/surveys');
        if (response.ok) {
          const dbSurveys = await response.json();
          
          // Convert database surveys to survey format
          const formattedSurveys: Survey[] = dbSurveys.map((dbSurvey: any) => ({
            id: dbSurvey.id,
            title: dbSurvey.title,
            category: dbSurvey.category,
            description: dbSurvey.description,
            estimatedTime: dbSurvey.estimatedTime,
            basePoints: dbSurvey.basePoints,
            questions: dbSurvey.questions || [],
            schedule: dbSurvey.schedule ? {
              ...dbSurvey.schedule,
              nextAvailable: new Date(dbSurvey.schedule.nextAvailable)
            } : undefined,
            targeting: dbSurvey.targeting,
            isActive: dbSurvey.isActive,
            multiplier: dbSurvey.multiplier || 1
          }));
          
          setSurveys(formattedSurveys);
        } else {
          // Fallback to default surveys if API fails
          const defaultSurveys = [
            {
              id: 'lifestyle',
              title: 'Lifestyle & Shopping',
              category: 'Consumer Behavior',
              description: 'Questions about shopping habits and lifestyle preferences',
              estimatedTime: '3-5 min',
              basePoints: 8,
              questions: [],
              schedule: { type: 'weekly' as const, frequency: 1, nextAvailable: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
              targeting: { userBehavior: ['new_user'], completedCategories: [], pointsRange: { min: 0, max: 50 } },
              isActive: true,
              multiplier: 1
            }
          ];
          setSurveys(defaultSurveys);
        }
      } catch (error) {
        console.error('Failed to load surveys:', error);
        // Use fallback surveys
        const defaultSurveys = [
          {
            id: 'lifestyle',
            title: 'Lifestyle & Shopping',
            category: 'Consumer Behavior',
            description: 'Questions about shopping habits and lifestyle preferences',
            estimatedTime: '3-5 min',
            basePoints: 8,
            questions: [],
            schedule: { type: 'weekly' as const, frequency: 1, nextAvailable: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
            targeting: { userBehavior: ['new_user'], completedCategories: [], pointsRange: { min: 0, max: 50 } },
            isActive: true,
            multiplier: 1
          }
        ];
        setSurveys(defaultSurveys);
      } finally {
        setSurveysLoaded(true);
      }
    };

    if (!surveysLoaded) {
      loadSurveys();
    }
  }, [surveysLoaded]);

  const [userBehavior, setUserBehavior] = useState<UserBehavior>(() => {
    const saved = localStorage.getItem('userBehavior');
    return saved ? JSON.parse(saved) : {
      completedSurveys: [],
      averageSessionTime: 0,
      preferredCategories: [],
      lastActivity: new Date(),
      totalPoints: 0
    };
  });

  const [surveyProgress, setSurveyProgress] = useState<Record<string, SurveyProgress>>(() => {
    const saved = localStorage.getItem('surveyProgress');
    return saved ? JSON.parse(saved) : {};
  });

  const [currentMultiplier, setCurrentMultiplier] = useState(() => {
    const saved = localStorage.getItem('currentMultiplier');
    return saved ? parseFloat(saved) : 1;
  });

  // Check for weekend bonus or special events
  useEffect(() => {
    const checkBonusMultiplier = () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      
      // Weekend bonus (Saturday = 6, Sunday = 0)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        setCurrentMultiplier(2);
      } else {
        setCurrentMultiplier(1);
      }
      
      localStorage.setItem('currentMultiplier', currentMultiplier.toString());
    };

    checkBonusMultiplier();
    const interval = setInterval(checkBonusMultiplier, 60 * 60 * 1000); // Check every hour
    
    return () => clearInterval(interval);
  }, [currentMultiplier]);

  const getAvailableSurveys = (): Survey[] => {
    const now = new Date();
    return surveys.filter(survey => {
      if (!survey.isActive) return false;
      if (survey.schedule && survey.schedule.nextAvailable > now) return false;
      return true;
    });
  };

  const getPersonalizedSurveys = (): Survey[] => {
    return surveys.filter(survey => {
      if (!survey.targeting) return true;
      
      const { targeting } = survey;
      
      // Check behavior targeting
      if (targeting.userBehavior.length > 0) {
        const hasRequiredBehavior = targeting.userBehavior.some(behavior => {
          switch (behavior) {
            case 'new_user':
              return userBehavior.completedSurveys.length < 3;
            case 'active_user':
              return userBehavior.completedSurveys.length >= 3;
            case 'high_earner':
              return userBehavior.totalPoints > 100;
            default:
              return false;
          }
        });
        if (!hasRequiredBehavior) return false;
      }
      
      // Check points range
      if (targeting.pointsRange) {
        const { min, max } = targeting.pointsRange;
        if (userBehavior.totalPoints < min || userBehavior.totalPoints > max) return false;
      }
      
      return true;
    });
  };

  const getScheduledSurveys = (): Survey[] => {
    const now = new Date();
    return surveys.filter(survey => {
      if (!survey.schedule) return false;
      return survey.schedule.nextAvailable <= now;
    });
  };

  const startSurvey = (surveyId: string) => {
    const progress: SurveyProgress = {
      surveyId,
      answers: {},
      currentQuestion: 0,
      startedAt: new Date(),
      lastSaved: new Date()
    };
    
    const updated = { ...surveyProgress, [surveyId]: progress };
    setSurveyProgress(updated);
    localStorage.setItem('surveyProgress', JSON.stringify(updated));
  };

  const saveSurveyProgress = (surveyId: string, answers: Record<string, any>, currentQuestion: number) => {
    const existing = surveyProgress[surveyId];
    if (!existing) return;
    
    const updated = {
      ...surveyProgress,
      [surveyId]: {
        ...existing,
        answers,
        currentQuestion,
        lastSaved: new Date()
      }
    };
    
    setSurveyProgress(updated);
    localStorage.setItem('surveyProgress', JSON.stringify(updated));
  };

  const completeSurvey = (surveyId: string, answers: Record<string, any>): number => {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return 0;
    
    const basePoints = survey.basePoints;
    const finalPoints = Math.round(basePoints * currentMultiplier);
    
    // Update user behavior
    const updatedBehavior = {
      ...userBehavior,
      completedSurveys: [...userBehavior.completedSurveys, surveyId],
      totalPoints: userBehavior.totalPoints + finalPoints,
      lastActivity: new Date()
    };
    
    setUserBehavior(updatedBehavior);
    localStorage.setItem('userBehavior', JSON.stringify(updatedBehavior));
    
    // Update survey schedule
    if (survey.schedule) {
      const nextAvailable = new Date();
      switch (survey.schedule.type) {
        case 'daily':
          nextAvailable.setDate(nextAvailable.getDate() + 1);
          break;
        case 'weekly':
          nextAvailable.setDate(nextAvailable.getDate() + 7);
          break;
        case 'monthly':
          nextAvailable.setMonth(nextAvailable.getMonth() + 1);
          break;
      }
      
      const updatedSurveys = surveys.map(s =>
        s.id === surveyId 
          ? { ...s, schedule: { ...s.schedule!, nextAvailable } }
          : s
      );
      
      setSurveys(updatedSurveys);
      localStorage.setItem('surveys', JSON.stringify(updatedSurveys));
    }
    
    // Clear progress
    clearSurveyProgress(surveyId);
    
    return finalPoints;
  };

  const updateUserBehavior = (behavior: Partial<UserBehavior>) => {
    const updated = { ...userBehavior, ...behavior };
    setUserBehavior(updated);
    localStorage.setItem('userBehavior', JSON.stringify(updated));
  };

  const getEstimatedPoints = (surveyId: string): number => {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return 0;
    return Math.round(survey.basePoints * currentMultiplier);
  };

  const getBonusMultiplier = (): number => {
    return currentMultiplier;
  };

  const clearSurveyProgress = (surveyId: string) => {
    const updated = { ...surveyProgress };
    delete updated[surveyId];
    setSurveyProgress(updated);
    localStorage.setItem('surveyProgress', JSON.stringify(updated));
  };

  const value: SurveyContextType = {
    surveys,
    userBehavior,
    surveyProgress,
    currentMultiplier,
    getAvailableSurveys,
    getPersonalizedSurveys,
    getScheduledSurveys,
    startSurvey,
    saveSurveyProgress,
    completeSurvey,
    updateUserBehavior,
    getEstimatedPoints,
    getBonusMultiplier,
    clearSurveyProgress,
  };

  return (
    <SurveyContext.Provider value={value}>
      {children}
    </SurveyContext.Provider>
  );
};
