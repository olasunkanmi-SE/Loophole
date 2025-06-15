
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  type: 'survey' | 'points' | 'streak' | 'referral' | 'special';
  requirement: number;
  currentProgress: number;
}

interface Streak {
  type: 'survey' | 'order';
  current: number;
  best: number;
  lastDate: string;
}

interface GamificationContextType {
  achievements: Achievement[];
  streaks: Record<string, Streak>;
  level: number;
  experience: number;
  experienceToNext: number;
  unlockAchievement: (achievementId: string) => void;
  updateStreak: (type: 'survey' | 'order') => void;
  addExperience: (amount: number) => void;
  getUnlockedAchievements: () => Achievement[];
  getAvailableAchievements: () => Achievement[];
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

const initialAchievements: Achievement[] = [
  {
    id: 'first_survey',
    title: 'Survey Explorer',
    description: 'Complete your first survey',
    icon: '🎯',
    type: 'survey',
    requirement: 1,
    currentProgress: 0,
  },
  {
    id: 'survey_master',
    title: 'Survey Master',
    description: 'Complete all survey categories',
    icon: '🏆',
    type: 'survey',
    requirement: 8,
    currentProgress: 0,
  },
  {
    id: 'first_points',
    title: 'Point Collector',
    description: 'Earn your first 10 points',
    icon: '💰',
    type: 'points',
    requirement: 10,
    currentProgress: 0,
  },
  {
    id: 'high_roller',
    title: 'High Roller',
    description: 'Accumulate 100 points',
    icon: '💎',
    type: 'points',
    requirement: 100,
    currentProgress: 0,
  },
  {
    id: 'streak_3',
    title: 'Getting Started',
    description: 'Complete surveys for 3 consecutive days',
    icon: '🔥',
    type: 'streak',
    requirement: 3,
    currentProgress: 0,
  },
  {
    id: 'streak_7',
    title: 'Weekly Warrior',
    description: 'Complete surveys for 7 consecutive days',
    icon: '⚡',
    type: 'streak',
    requirement: 7,
    currentProgress: 0,
  },
  {
    id: 'first_referral',
    title: 'Social Butterfly',
    description: 'Refer your first friend',
    icon: '🦋',
    type: 'referral',
    requirement: 1,
    currentProgress: 0,
  },
];

interface GamificationProviderProps {
  children: ReactNode;
}

export const GamificationProvider: React.FC<GamificationProviderProps> = ({ children }) => {
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('achievements');
    return saved ? JSON.parse(saved) : initialAchievements;
  });

  const [streaks, setStreaks] = useState<Record<string, Streak>>(() => {
    const saved = localStorage.getItem('streaks');
    return saved ? JSON.parse(saved) : {
      survey: { type: 'survey', current: 0, best: 0, lastDate: '' },
      order: { type: 'order', current: 0, best: 0, lastDate: '' }
    };
  });

  const [experience, setExperience] = useState(() => {
    const saved = localStorage.getItem('userExperience');
    return saved ? parseInt(saved) : 0;
  });

  // Calculate level based on experience (every 100 XP = 1 level)
  const level = Math.floor(experience / 100) + 1;
  const experienceToNext = 100 - (experience % 100);

  const unlockAchievement = (achievementId: string) => {
    setAchievements(prev => {
      const updated = prev.map(achievement => 
        achievement.id === achievementId && !achievement.unlockedAt
          ? { ...achievement, unlockedAt: new Date() }
          : achievement
      );
      localStorage.setItem('achievements', JSON.stringify(updated));
      return updated;
    });
  };

  const updateStreak = (type: 'survey' | 'order') => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    setStreaks(prev => {
      const currentStreak = prev[type];
      let newCurrent = 1;

      if (currentStreak.lastDate === yesterday) {
        newCurrent = currentStreak.current + 1;
      } else if (currentStreak.lastDate === today) {
        newCurrent = currentStreak.current; // Same day, no change
      }

      const newBest = Math.max(newCurrent, currentStreak.best);
      
      const updated = {
        ...prev,
        [type]: {
          ...currentStreak,
          current: newCurrent,
          best: newBest,
          lastDate: today,
        }
      };
      
      localStorage.setItem('streaks', JSON.stringify(updated));
      return updated;
    });
  };

  const addExperience = (amount: number) => {
    setExperience(prev => {
      const newExp = prev + amount;
      localStorage.setItem('userExperience', newExp.toString());
      return newExp;
    });
  };

  const getUnlockedAchievements = () => {
    return achievements.filter(a => a.unlockedAt);
  };

  const getAvailableAchievements = () => {
    return achievements.filter(a => !a.unlockedAt);
  };

  const value: GamificationContextType = {
    achievements,
    streaks,
    level,
    experience,
    experienceToNext,
    unlockAchievement,
    updateStreak,
    addExperience,
    getUnlockedAchievements,
    getAvailableAchievements,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};
