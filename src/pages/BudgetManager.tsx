
import { useState } from 'react';
import { useLocation } from 'wouter';
import MobileHeader from '../components/MobileHeader';
import MobileContainer from '../components/MobileContainer';
import { useFinancial } from '../contexts/FinancialContext';
import { Plus, Target, AlertTriangle, TrendingUp } from 'lucide-react';

export default function BudgetManager() {
  const [, setLocation] = useLocation();
  const { 
    budgetGoals, 
    addBudgetGoal, 
    updateBudgetGoal, 
    deleteBudgetGoal, 
    getBudgetStatus,
    budgetAlerts,
    clearAlert
  } = useFinancial();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: '',
    monthlyLimit: '',
    alertThreshold: '80'
  });

  const categories = ['Food', 'Housing', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Education', 'Others'];

  const handleAddBudget = () => {
    if (newBudget.category && newBudget.monthlyLimit) {
      addBudgetGoal({
        category: newBudget.category,
        monthlyLimit: parseFloat(newBudget.monthlyLimit),
        currentSpent: 0,
        alertThreshold: parseInt(newBudget.alertThreshold)
      });
      setNewBudget({ category: '', monthlyLimit: '', alertThreshold: '80' });
      setShowAddForm(false);
    }
  };

  return (
    <MobileContainer>
      <div className="bg-gray-50 min-h-screen">
        <MobileHeader title="Budget Manager" onBack={() => setLocation('/financial-analytics')} />

        {/* Budget Alerts */}
        {budgetAlerts.length > 0 && (
          <div className="p-4 space-y-2">
            {budgetAlerts.map((alert, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg flex items-center justify-between ${
                  alert.severity === 'high' ? 'bg-red-50 border border-red-200' :
                  alert.severity === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-blue-50 border border-blue-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={`w-4 h-4 ${
                    alert.severity === 'high' ? 'text-red-500' :
                    alert.severity === 'medium' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`} />
                  <span className={`text-sm ${
                    alert.severity === 'high' ? 'text-red-700' :
                    alert.severity === 'medium' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {alert.message}
                  </span>
                </div>
                <button 
                  onClick={() => clearAlert(index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Add Budget Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Budget Goal</span>
          </button>

          {/* Add Budget Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">New Budget Goal</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newBudget.category}
                    onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Limit (RM)</label>
                  <input
                    type="number"
                    value={newBudget.monthlyLimit}
                    onChange={(e) => setNewBudget({ ...newBudget, monthlyLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alert Threshold (%)</label>
                  <select
                    value={newBudget.alertThreshold}
                    onChange={(e) => setNewBudget({ ...newBudget, alertThreshold: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="50">50% - Early warning</option>
                    <option value="75">75% - Moderate warning</option>
                    <option value="80">80% - Recommended</option>
                    <option value="90">90% - Late warning</option>
                  </select>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleAddBudget}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium"
                  >
                    Add Budget
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Budget Goals List */}
          <div className="space-y-3">
            {budgetGoals.map((goal) => {
              const status = getBudgetStatus(goal.category);
              const isOverBudget = status.percentage > 100;
              const isNearLimit = status.percentage >= goal.alertThreshold;

              return (
                <div key={goal.id} className="bg-white rounded-lg p-4 border shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-gray-800">{goal.category}</span>
                    </div>
                    <button
                      onClick={() => deleteBudgetGoal(goal.id)}
                      className="text-gray-400 hover:text-red-500 text-sm"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Spent this month</span>
                      <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-800'}`}>
                        RM {status.spent.toFixed(2)} / RM {status.limit.toFixed(2)}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          isOverBudget ? 'bg-red-500' :
                          isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(status.percentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className={`font-medium ${
                        isOverBudget ? 'text-red-600' :
                        isNearLimit ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {status.percentage.toFixed(0)}% used
                      </span>
                      {!isOverBudget && (
                        <span className="text-gray-500">
                          RM {(status.limit - status.spent).toFixed(2)} remaining
                        </span>
                      )}
                      {isOverBudget && (
                        <span className="text-red-500 font-medium">
                          RM {(status.spent - status.limit).toFixed(2)} over budget
                        </span>
                      )}
                    </div>
                  </div>

                  {isNearLimit && (
                    <div className={`mt-3 p-2 rounded text-xs ${
                      isOverBudget ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {isOverBudget 
                        ? '⚠️ You have exceeded your budget for this category'
                        : '🔔 Approaching your budget limit'
                      }
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {budgetGoals.length === 0 && !showAddForm && (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Budget Goals</h3>
              <p className="text-gray-500 mb-4">Set your first budget goal to start tracking your spending</p>
            </div>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}
