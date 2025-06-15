
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, DollarSign, TrendingUp, Users, CreditCard, Settings, Download, RefreshCw } from 'lucide-react';

interface FinancialStats {
  totalRevenue: number;
  totalPointsDistributed: number;
  totalPointsRedeemed: number;
  activeUsers: number;
  conversionRate: number;
  monthlyRevenue: number[];
  paymentMethods: Record<string, number>;
  pointsDistribution: Record<string, number>;
}

interface ConversionRate {
  pointsToRM: number;
  lastUpdated: string;
  updatedBy: string;
}

export default function AdminFinance() {
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    totalPointsDistributed: 0,
    totalPointsRedeemed: 0,
    activeUsers: 0,
    conversionRate: 1,
    monthlyRevenue: [],
    paymentMethods: {},
    pointsDistribution: {}
  });
  const [conversionRate, setConversionRate] = useState<ConversionRate>({
    pointsToRM: 1,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'admin'
  });
  const [newConversionRate, setNewConversionRate] = useState<string>('1');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/financial-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setConversionRate(data.conversionRate);
        setNewConversionRate(data.conversionRate.pointsToRM.toString());
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConversionRate = async () => {
    try {
      setUpdating(true);
      const response = await fetch('/api/admin/update-conversion-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pointsToRM: parseFloat(newConversionRate),
          updatedBy: 'admin'
        })
      });
      
      if (response.ok) {
        await fetchFinancialData();
        alert('Conversion rate updated successfully!');
      }
    } catch (error) {
      console.error('Error updating conversion rate:', error);
      alert('Failed to update conversion rate');
    } finally {
      setUpdating(false);
    }
  };

  const exportFinancialReport = async () => {
    try {
      const response = await fetch('/api/admin/export-financial-report');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setLocation('/admin/dashboard')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Financial Management</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchFinancialData}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <button
                onClick={exportFinancialReport}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                <Download size={16} />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  RM {stats.totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Points Distributed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalPointsDistributed.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Points Redeemed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalPointsRedeemed.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.activeUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Conversion Rate Management */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Conversion Rate Management</h2>
              <Settings className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Rate: 1 Point = RM {conversionRate.pointsToRM}
                </label>
                <p className="text-xs text-gray-500 mb-4">
                  Last updated: {new Date(conversionRate.lastUpdated).toLocaleString()} by {conversionRate.updatedBy}
                </p>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newConversionRate}
                    onChange={(e) => setNewConversionRate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="New conversion rate"
                  />
                  <button
                    onClick={updateConversionRate}
                    disabled={updating || newConversionRate === conversionRate.pointsToRM.toString()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg"
                  >
                    {updating ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Changing the conversion rate will affect all future point redemptions. 
                  Current user balances will be recalculated based on the new rate.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method Analytics */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Method Analytics</h2>
            
            <div className="space-y-4">
              {Object.entries(stats.paymentMethods).map(([method, count]) => {
                const total = Object.values(stats.paymentMethods).reduce((sum, c) => sum + (typeof c === 'number' ? c : 0), 0);
                const numericCount = typeof count === 'number' ? count : 0;
                const percentage = total > 0 ? ((numericCount / total) * 100).toFixed(1) : '0';
                
                // Get proper display name and icon for payment method
                const getPaymentMethodDisplay = (methodKey: string) => {
                  const methodMap: Record<string, { name: string; icon: string; color: string }> = {
                    'points': { name: 'EarnEats Points', icon: '💰', color: 'bg-yellow-500' },
                    'grabpay': { name: 'GrabPay', icon: '🚗', color: 'bg-green-500' },
                    'touchngo': { name: 'Touch \'n Go', icon: '📱', color: 'bg-blue-500' },
                    'bank_transfer': { name: 'Bank Transfer', icon: '🏦', color: 'bg-purple-500' },
                    'boost': { name: 'Boost', icon: '🚀', color: 'bg-orange-500' },
                    'shopeepay': { name: 'ShopeePay', icon: '🛍️', color: 'bg-red-500' },
                    'maybank_qr': { name: 'Maybank QR', icon: '🏛️', color: 'bg-indigo-500' },
                    'cimb_pay': { name: 'CIMB Pay', icon: '💳', color: 'bg-teal-500' },
                    'fpx': { name: 'FPX Banking', icon: '🔐', color: 'bg-gray-500' },
                    'bigpay': { name: 'BigPay', icon: '✈️', color: 'bg-cyan-500' },
                    'mcash': { name: 'MCash', icon: '📲', color: 'bg-pink-500' }
                  };
                  
                  return methodMap[methodKey.toLowerCase()] || { 
                    name: methodKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
                    icon: '💳', 
                    color: 'bg-gray-500' 
                  };
                };
                
                const methodDisplay = getPaymentMethodDisplay(method);
                
                return (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 ${methodDisplay.color} rounded mr-3`}></div>
                      <span className="text-lg mr-2">{methodDisplay.icon}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {methodDisplay.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{numericCount}</div>
                      <div className="text-xs text-gray-500">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
              
              {Object.keys(stats.paymentMethods).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-2 block">📊</span>
                  <p>No payment method data available yet</p>
                  <p className="text-xs">Data will appear as users make payments</p>
                </div>
              )}
            </div>
          </div>

          {/* Points Distribution by Category */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Points Distribution by Category</h2>
            
            <div className="space-y-4">
              {Object.entries(stats.pointsDistribution).map(([category, points]) => {
                const total = Object.values(stats.pointsDistribution).reduce((sum, p) => sum + p, 0);
                const percentage = total > 0 ? ((points / total) * 100).toFixed(1) : '0';
                
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {category}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{points}</div>
                      <div className="text-xs text-gray-500">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Tracking */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Monthly Revenue Trend</h2>
            
            <div className="space-y-3">
              {stats.monthlyRevenue.slice(-6).map((revenue, index) => {
                const month = new Date();
                month.setMonth(month.getMonth() - (5 - index));
                const monthName = month.toLocaleDateString('en-US', { month: 'short' });
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{monthName}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      RM {revenue.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
