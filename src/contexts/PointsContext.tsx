import React, { createContext, useContext, useState, ReactNode } from 'react';
import { convertPointsToRM, formatRM, canAffordOrder } from '../utils/pointsConverter';

interface CategoryPoints {
  lifestyle: number;
  digital: number;
  food: number;
  entertainment: number;
  travel: number;
  health: number;
  education: number;
  finance: number;
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
  const [points, setPoints] = useState<CategoryPoints>(() => {
    // Load points from localStorage on initialization
    const savedPoints = localStorage.getItem('userPoints');
    if (savedPoints) {
      try {
        return JSON.parse(savedPoints);
      } catch (error) {
        console.error('Error parsing saved points:', error);
      }
    }
    return {
      lifestyle: 0,
      digital: 0,
      food: 0,
      entertainment: 0,
      travel: 0,
      health: 0,
      education: 0,
      finance: 0
    };
  });

  const addPoints = (category: keyof CategoryPoints, newPoints: number) => {
    const updatedPoints = {
      ...points,
      [category]: newPoints
    };
    setPoints(updatedPoints);
    localStorage.setItem('userPoints', JSON.stringify(updatedPoints));
  };

  const getTotalPoints = () => {
    const total = Object.values(points).reduce((total, categoryPoints) => {
      const pointValue = typeof categoryPoints === 'number' && !isNaN(categoryPoints) ? categoryPoints : 0;
      return total + pointValue;
    }, 0);
    return isNaN(total) ? 0 : total;
  };

  const getCompletedCategories = () => {
    const completed: string[] = [];
    if (points.lifestyle > 0) completed.push('Lifestyle & Shopping');
    if (points.digital > 0) completed.push('Digital & Tech');
    if (points.food > 0) completed.push('Food & Dining');
    if (points.entertainment > 0) completed.push('Entertainment');
    if (points.travel > 0) completed.push('Travel');
    if (points.health > 0) completed.push('Health');
    if (points.education > 0) completed.push('Education');
    if (points.finance > 0) completed.push('Finance');
    return completed;
  };

  const getAvailableRM = () => {
    return convertPointsToRM(getTotalPoints());
  };

  const getFormattedRM = () => {
    const totalPoints = getTotalPoints();
    const rmValue = convertPointsToRM(totalPoints);
    const finalValue = isNaN(rmValue) ? 0 : rmValue;
    return `RM ${finalValue.toFixed(2)}`;
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
    const pointsToDeduct = amount * 1; // 1 point = 1 RM
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

    if (remainingToDeduct > 0 && newPoints.entertainment > 0) {
      const deductFromEntertainment = Math.min(remainingToDeduct, newPoints.entertainment);
      newPoints.entertainment -= deductFromEntertainment;
      remainingToDeduct -= deductFromEntertainment;
    }

    if (remainingToDeduct > 0 && newPoints.travel > 0) {
      const deductFromTravel = Math.min(remainingToDeduct, newPoints.travel);
      newPoints.travel -= deductFromTravel;
      remainingToDeduct -= deductFromTravel;
    }

    if (remainingToDeduct > 0 && newPoints.health > 0) {
      const deductFromHealth = Math.min(remainingToDeduct, newPoints.health);
      newPoints.health -= deductFromHealth;
      remainingToDeduct -= deductFromHealth;
    }

    if (remainingToDeduct > 0 && newPoints.education > 0) {
      const deductFromEducation = Math.min(remainingToDeduct, newPoints.education);
      newPoints.education -= deductFromEducation;
      remainingToDeduct -= deductFromEducation;
    }

    if (remainingToDeduct > 0 && newPoints.finance > 0) {
      const deductFromFinance = Math.min(remainingToDeduct, newPoints.finance);
      newPoints.finance -= deductFromFinance;
      remainingToDeduct -= deductFromFinance;
    }

    setPoints(newPoints);
    localStorage.setItem('userPoints', JSON.stringify(newPoints));
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