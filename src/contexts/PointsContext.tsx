
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { convertPointsToRM, formatRM, canAffordOrder } from '../utils/pointsConverter';

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
  getAvailableRM: () => number;
  getFormattedRM: () => string;
  canAfford: (amount: number) => boolean;
  deductRM: (amount: number) => boolean;
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

  const getAvailableRM = () => {
    return convertPointsToRM(getTotalPoints());
  };

  const getFormattedRM = () => {
    return formatRM(getAvailableRM());
  };

  const canAfford = (amount: number) => {
    return canAffordOrder(getTotalPoints(), amount);
  };

  const deductRM = (amount: number) => {
    const totalPoints = getTotalPoints();
    if (!canAffordOrder(totalPoints, amount)) {
      return false;
    }
    
    // Calculate points to deduct (amount * conversion rate)
    const pointsToDeduct = amount * 10; // 10 points = 1 RM
    let remainingToDeduct = pointsToDeduct;
    
    // Deduct from categories proportionally
    const newPoints = { ...points };
    
    // Deduct from lifestyle first, then digital, then food
    if (remainingToDeduct > 0 && newPoints.lifestyle > 0) {
      const deductFromLifestyle = Math.min(remainingToDeduct, newPoints.lifestyle);
      newPoints.lifestyle -= deductFromLifestyle;
      remainingToDeduct -= deductFromLifestyle;
    }
    
    if (remainingToDeduct > 0 && newPoints.digital > 0) {
      const deductFromDigital = Math.min(remainingToDeduct, newPoints.digital);
      newPoints.digital -= deductFromDigital;
      remainingToDeduct -= deductFromDigital;
    }
    
    if (remainingToDeduct > 0 && newPoints.food > 0) {
      const deductFromFood = Math.min(remainingToDeduct, newPoints.food);
      newPoints.food -= deductFromFood;
      remainingToDeduct -= deductFromFood;
    }
    
    setPoints(newPoints);
    return true;
  };

  const value: PointsContextType = {
    points,
    addPoints,
    getTotalPoints,
    getCompletedCategories,
    getAvailableRM,
    getFormattedRM,
    canAfford,
    deductRM,
  };

  return (
    <PointsContext.Provider value={value}>
      {children}
    </PointsContext.Provider>
  );
};
