
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import MobileHeader from '../components/MobileHeader';
import MobileContainer from '../components/MobileContainer';
import { useAuth } from '../contexts/AuthContext';
import { usePoints } from '../contexts/PointsContext';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Calendar, 
  Target,
  Download,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface SpendingData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface MonthlyData {
  month: string;
  spent: number;
  earned: number;
}

interface BudgetGoal {
  category: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
}

export default function FinancialAnalytics() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { points } = usePoints();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);

  // Sample data - replace with actual API calls
  const [spendingData] = useState<SpendingData[]>([
    { category: 'Food', amount: 245.50, percentage: 65, color: '#3B82F6' },
    { category: 'Housing', amount: 85.00, percentage: 22, color: '#10B981' },
    { category: 'Transport', amount: 32.50, percentage: 9, color: '#F59E0B' },
    { category: 'Others', amount: 15.00, percentage: 4, color: '#EF4444' }
  ]);

  const [monthlyData] = useState<MonthlyData[]>([
    { month: 'Jan', spent: 320, earned: 45 },
    { month: 'Feb', spent: 280, earned: 38 },
    { month: 'Mar', spent: 380, earned: 52 },
    { month: 'Apr', spent: 310, earned: 41 },
    { month: 'May', spent: 295, earned: 48 },
    { month: 'Jun', spent: 378, earned: 55 }
  ]);

  const [budgetGoals] = useState<BudgetGoal[]>([
    { category: 'Food', budgetAmount: 300, spentAmount: 245.50, percentage: 82 },
    { category: 'Housing', budgetAmount: 100, spentAmount: 85.00, percentage: 85 },
    { category: 'Transport', budgetAmount: 50, spentAmount: 32.50, percentage: 65 }
  ]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const totalSpent = spendingData.reduce((sum, item) => sum + item.amount, 0);
  const totalEarned = points * 1.0; // Assuming 1 point = RM 1
  const netBalance = totalEarned - totalSpent;

  const exportData = () => {
    const data = {
      user: user?.email,
      exportDate: new Date().toISOString(),
      spendingData,
      monthlyData,
      budgetGoals,
      summary: {
        totalSpent,
        totalEarned,
        netBalance,
        pointsBalance: points
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <MobileContainer>
        <div className="bg-white min-h-screen">
          <MobileHeader title="Financial Analytics" onBack={() => setLocation('/')} />
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading analytics...</div>
          </div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="bg-gray-50 min-h-screen">
        <MobileHeader 
          title="Financial Analytics" 
          onBack={() => setLocation('/')}
          rightContent={
            <button 
              onClick={exportData}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Download size={20} />
            </button>
          }
        />

        {/* Overview Cards */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Spent</p>
                  <p className="text-xl font-bold">RM {totalSpent.toFixed(2)}</p>
                </div>
                <TrendingDown className="w-6 h-6 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Earned</p>
                  <p className="text-xl font-bold">RM {totalEarned.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-6 h-6 text-green-200" />
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${netBalance >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Net Balance</p>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  RM {netBalance.toFixed(2)}
                </p>
              </div>
              {netBalance >= 0 ? (
                <ArrowUpRight className="w-8 h-8 text-green-500" />
              ) : (
                <ArrowDownRight className="w-8 h-8 text-red-500" />
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 mb-4">
          <div className="bg-white rounded-lg p-1 flex">
            {['overview', 'spending', 'budget', 'goals'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4 pb-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Monthly Trend */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Monthly Trend</h3>
                <div className="space-y-3">
                  {monthlyData.slice(-3).map((month, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-600">{month.month}</span>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-red-600 text-sm">-RM {month.spent}</div>
                          <div className="text-green-600 text-sm">+RM {month.earned}</div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          month.earned - month.spent >= 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {month.earned - month.spent >= 0 ? '+' : ''}
                          RM {(month.earned - month.spent).toFixed(0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Payment Methods</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">💰</span>
                      <span className="text-gray-700">EarnEats Points</span>
                    </div>
                    <span className="text-sm text-gray-500">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🚗</span>
                      <span className="text-gray-700">GrabPay</span>
                    </div>
                    <span className="text-sm text-gray-500">30%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">📱</span>
                      <span className="text-gray-700">Touch 'n Go</span>
                    </div>
                    <span className="text-sm text-gray-500">25%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'spending' && (
            <div className="space-y-4">
              {/* Spending Breakdown */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Spending Breakdown</h3>
                <div className="space-y-4">
                  {spendingData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">{item.category}</span>
                        <span className="font-medium">RM {item.amount.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${item.percentage}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {item.percentage}% of total spending
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Merchants */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Top Merchants</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 text-sm font-bold">KFC</span>
                      </div>
                      <span className="text-gray-700">KFC Malaysia</span>
                    </div>
                    <span className="font-medium">RM 89.50</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 text-sm font-bold">McD</span>
                      </div>
                      <span className="text-gray-700">McDonald's</span>
                    </div>
                    <span className="font-medium">RM 67.20</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm font-bold">SB</span>
                      </div>
                      <span className="text-gray-700">Starbucks</span>
                    </div>
                    <span className="font-medium">RM 45.80</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="space-y-4">
              {/* Budget Overview */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Budget Goals</h3>
                <div className="space-y-4">
                  {budgetGoals.map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">{goal.category}</span>
                        <span className="text-sm text-gray-500">
                          RM {goal.spentAmount.toFixed(2)} / RM {goal.budgetAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all ${
                            goal.percentage > 90 ? 'bg-red-500' :
                            goal.percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className={`font-medium ${
                          goal.percentage > 90 ? 'text-red-600' :
                          goal.percentage > 75 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {goal.percentage.toFixed(0)}% used
                        </span>
                        <span className="text-gray-500">
                          RM {(goal.budgetAmount - goal.spentAmount).toFixed(2)} remaining
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Set New Budget */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Set Monthly Budget</h4>
                <p className="text-blue-600 text-sm mb-3">
                  Based on your spending patterns, we recommend a monthly budget of RM 450.
                </p>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium">
                  Update Budget Goals
                </button>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-4">
              {/* Savings Goals */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Savings Goals</h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-purple-800">New Laptop</span>
                      <span className="text-sm text-purple-600">Goal: RM 2,500</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2 mb-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '32%' }} />
                    </div>
                    <div className="flex justify-between text-xs text-purple-600">
                      <span>RM 800 saved</span>
                      <span>32% complete</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-800">Emergency Fund</span>
                      <span className="text-sm text-green-600">Goal: RM 1,000</span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2 mb-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }} />
                    </div>
                    <div className="flex justify-between text-xs text-green-600">
                      <span>RM 650 saved</span>
                      <span>65% complete</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">💡 Savings Tips</h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Save RM 15/week by cooking 2 more meals at home</li>
                  <li>• Earn extra RM 25/month by completing all surveys</li>
                  <li>• Use points for 20% of your food orders to save cash</li>
                </ul>
              </div>

              {/* Add New Goal */}
              <button className="w-full bg-gray-800 text-white py-3 rounded-lg font-medium">
                + Add New Savings Goal
              </button>
            </div>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}
