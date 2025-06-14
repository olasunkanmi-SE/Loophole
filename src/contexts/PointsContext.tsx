
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CategoryPoints {
  lifestyle: number;
  digital: number;
  food: number;
}

interface PointsContextType {
  points: CategoryPoints;
  addPoints: (category: keyof CategoryPoints, points: number) => void;
  getTotalPoints: () => number;
  getCompletedCategories: () => string[];
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export const usePoints = () => {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
};

interface PointsProviderProps {
  children: ReactNode;
}

export const PointsProvider: React.FC<PointsProviderProps> = ({ children }) => {
  const [points, setPoints] = useState<CategoryPoints>({
    lifestyle: 0,
    digital: 0,
    food: 0
  });

  const addPoints = (category: keyof CategoryPoints, newPoints: number) => {
    setPoints(prev => ({
      ...prev,
      [category]: newPoints
    }));
  };

  const getTotalPoints = () => {
    return points.lifestyle + points.digital + points.food;
  };

  const getCompletedCategories = () => {
    const completed: string[] = [];
    if (points.lifestyle > 0) completed.push('Lifestyle & Shopping');
    if (points.digital > 0) completed.push('Digital & Tech');
    if (points.food > 0) completed.push('Food & Dining');
    return completed;
  };

  const value: PointsContextType = {
    points,
    addPoints,
    getTotalPoints,
    getCompletedCategories,
  };

  return (
    <PointsContext.Provider value={value}>
      {children}
    </PointsContext.Provider>
  );
};
