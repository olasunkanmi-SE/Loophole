
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BudgetGoal {
  id: string;
  category: string;
  monthlyLimit: number;
  currentSpent: number;
  alertThreshold: number; // Percentage (e.g., 80 for 80%)
  created_at: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  created_at: string;
}

export interface SpendingTransaction {
  id: string;
  amount: number;
  category: string;
  merchant: string;
  date: string;
  paymentMethod: string;
  description?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank' | 'ewallet' | 'points' | 'card';
  isDefault: boolean;
  enabled: boolean;
  details: any;
}

interface FinancialContextType {
  // Budget Goals
  budgetGoals: BudgetGoal[];
  addBudgetGoal: (goal: Omit<BudgetGoal, 'id' | 'created_at'>) => void;
  updateBudgetGoal: (id: string, updates: Partial<BudgetGoal>) => void;
  deleteBudgetGoal: (id: string) => void;
  getBudgetStatus: (category: string) => { spent: number; limit: number; percentage: number };

  // Savings Goals
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'created_at'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  addToSavingsGoal: (id: string, amount: number) => void;

  // Spending Tracking
  transactions: SpendingTransaction[];
  addTransaction: (transaction: Omit<SpendingTransaction, 'id'>) => void;
  getSpendingByCategory: (timeRange?: 'week' | 'month' | 'year') => Record<string, number>;
  getSpendingByMerchant: (timeRange?: 'week' | 'month' | 'year') => Record<string, number>;

  // Payment Methods
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => void;
  deletePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;

  // Analytics
  getTotalSpent: (timeRange?: 'week' | 'month' | 'year') => number;
  getAverageOrderValue: (timeRange?: 'week' | 'month' | 'year') => number;
  getSpendingTrend: (timeRange?: 'week' | 'month' | 'year') => Array<{ date: string; amount: number }>;
  exportFinancialData: () => void;

  // Alerts
  budgetAlerts: Array<{ type: 'budget' | 'savings'; message: string; severity: 'low' | 'medium' | 'high' }>;
  clearAlert: (index: number) => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [transactions, setTransactions] = useState<SpendingTransaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [budgetAlerts, setBudgetAlerts] = useState<Array<{ type: 'budget' | 'savings'; message: string; severity: 'low' | 'medium' | 'high' }>>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedBudgets = localStorage.getItem('budgetGoals');
    const savedSavings = localStorage.getItem('savingsGoals');
    const savedTransactions = localStorage.getItem('financialTransactions');
    const savedPaymentMethods = localStorage.getItem('paymentMethods');

    if (savedBudgets) setBudgetGoals(JSON.parse(savedBudgets));
    if (savedSavings) setSavingsGoals(JSON.parse(savedSavings));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedPaymentMethods) {
      setPaymentMethods(JSON.parse(savedPaymentMethods));
    } else {
      // Set default payment methods
      const defaultMethods: PaymentMethod[] = [
        {
          id: '1',
          name: 'EarnEats Points',
          type: 'points',
          isDefault: true,
          enabled: true,
          details: {}
        },
        {
          id: '2',
          name: 'GrabPay',
          type: 'ewallet',
          isDefault: false,
          enabled: true,
          details: { provider: 'Grab' }
        },
        {
          id: '3',
          name: 'Touch \'n Go eWallet',
          type: 'ewallet',
          isDefault: false,
          enabled: true,
          details: { provider: 'TNG' }
        },
        {
          id: '4',
          name: 'Maybank',
          type: 'bank',
          isDefault: false,
          enabled: true,
          details: { bank: 'Maybank', accountType: 'FPX' }
        }
      ];
      setPaymentMethods(defaultMethods);
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('budgetGoals', JSON.stringify(budgetGoals));
  }, [budgetGoals]);

  useEffect(() => {
    localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('financialTransactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  // Budget Goals functions
  const addBudgetGoal = (goal: Omit<BudgetGoal, 'id' | 'created_at'>) => {
    const newGoal: BudgetGoal = {
      ...goal,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    setBudgetGoals(prev => [...prev, newGoal]);
  };

  const updateBudgetGoal = (id: string, updates: Partial<BudgetGoal>) => {
    setBudgetGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    ));
  };

  const deleteBudgetGoal = (id: string) => {
    setBudgetGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const getBudgetStatus = (category: string) => {
    const goal = budgetGoals.find(g => g.category === category);
    if (!goal) return { spent: 0, limit: 0, percentage: 0 };

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlySpent = transactions
      .filter(t => t.category === category && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      spent: monthlySpent,
      limit: goal.monthlyLimit,
      percentage: goal.monthlyLimit > 0 ? (monthlySpent / goal.monthlyLimit) * 100 : 0
    };
  };

  // Savings Goals functions
  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'created_at'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    setSavingsGoals(prev => [...prev, newGoal]);
  };

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    ));
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const addToSavingsGoal = (id: string, amount: number) => {
    setSavingsGoals(prev => prev.map(goal => 
      goal.id === id 
        ? { ...goal, currentAmount: Math.min(goal.currentAmount + amount, goal.targetAmount) }
        : goal
    ));
  };

  // Transaction functions
  const addTransaction = (transaction: Omit<SpendingTransaction, 'id'>) => {
    const newTransaction: SpendingTransaction = {
      ...transaction,
      id: Date.now().toString()
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // Check budget alerts
    checkBudgetAlerts(newTransaction);
  };

  const checkBudgetAlerts = (transaction: SpendingTransaction) => {
    const goal = budgetGoals.find(g => g.category === transaction.category);
    if (goal) {
      const status = getBudgetStatus(transaction.category);
      if (status.percentage >= goal.alertThreshold) {
        const severity = status.percentage >= 100 ? 'high' : status.percentage >= 90 ? 'medium' : 'low';
        setBudgetAlerts(prev => [...prev, {
          type: 'budget',
          message: `You've spent ${status.percentage.toFixed(0)}% of your ${transaction.category} budget`,
          severity
        }]);
      }
    }
  };

  const getSpendingByCategory = (timeRange: 'week' | 'month' | 'year' = 'month') => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeRange) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return transactions
      .filter(t => new Date(t.date) >= filterDate)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
  };

  const getSpendingByMerchant = (timeRange: 'week' | 'month' | 'year' = 'month') => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeRange) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return transactions
      .filter(t => new Date(t.date) >= filterDate)
      .reduce((acc, t) => {
        acc[t.merchant] = (acc[t.merchant] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
  };

  // Payment Methods functions
  const addPaymentMethod = (method: Omit<PaymentMethod, 'id'>) => {
    const newMethod: PaymentMethod = {
      ...method,
      id: Date.now().toString()
    };
    setPaymentMethods(prev => [...prev, newMethod]);
  };

  const updatePaymentMethod = (id: string, updates: Partial<PaymentMethod>) => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === id ? { ...method, ...updates } : method
    ));
  };

  const deletePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
  };

  const setDefaultPaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };

  // Analytics functions
  const getTotalSpent = (timeRange: 'week' | 'month' | 'year' = 'month') => {
    const spending = getSpendingByCategory(timeRange);
    return Object.values(spending).reduce((sum, amount) => sum + amount, 0);
  };

  const getAverageOrderValue = (timeRange: 'week' | 'month' | 'year' = 'month') => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeRange) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const relevantTransactions = transactions.filter(t => new Date(t.date) >= filterDate);
    const total = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
    return relevantTransactions.length > 0 ? total / relevantTransactions.length : 0;
  };

  const getSpendingTrend = (timeRange: 'week' | 'month' | 'year' = 'month') => {
    // Implementation for spending trend analysis
    const now = new Date();
    const trend = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const daySpending = transactions
        .filter(t => t.date.startsWith(date.toISOString().split('T')[0]))
        .reduce((sum, t) => sum + t.amount, 0);
      
      trend.push({
        date: date.toISOString().split('T')[0],
        amount: daySpending
      });
    }
    
    return trend;
  };

  const exportFinancialData = () => {
    const data = {
      budgetGoals,
      savingsGoals,
      transactions,
      paymentMethods,
      exportDate: new Date().toISOString(),
      summary: {
        totalSpent: getTotalSpent(),
        averageOrderValue: getAverageOrderValue(),
        spendingByCategory: getSpendingByCategory(),
        spendingByMerchant: getSpendingByMerchant()
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAlert = (index: number) => {
    setBudgetAlerts(prev => prev.filter((_, i) => i !== index));
  };

  const value = {
    budgetGoals,
    addBudgetGoal,
    updateBudgetGoal,
    deleteBudgetGoal,
    getBudgetStatus,
    savingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addToSavingsGoal,
    transactions,
    addTransaction,
    getSpendingByCategory,
    getSpendingByMerchant,
    paymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    getTotalSpent,
    getAverageOrderValue,
    getSpendingTrend,
    exportFinancialData,
    budgetAlerts,
    clearAlert
  };

  return <FinancialContext.Provider value={value}>{children}</FinancialContext.Provider>;
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
}
