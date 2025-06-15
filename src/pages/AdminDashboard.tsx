import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import MobileHeader from '../components/MobileHeader';
import MobileContainer from '../components/MobileContainer';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  ShoppingCart, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Clock,
  Settings,
  UserCheck,
  Package,
  CreditCard
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalSurveys: number;
  totalRevenue: number;
  todayOrders: number;
  activeUsers: number;
  recentOrders: any[];
  recentUsers: any[];
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalSurveys: 0,
    totalRevenue: 0,
    todayOrders: 0,
    activeUsers: 0,
    recentOrders: [],
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }: any) => (
    <div className={`bg-gradient-to-br ${color} text-white p-4 rounded-xl shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm opacity-90">{title}</div>
          {subtitle && <div className="text-xs opacity-75 mt-1">{subtitle}</div>}
        </div>
        <Icon size={28} className="opacity-80" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <MobileContainer>
        <div className="bg-white min-h-screen">
          <MobileHeader 
            title="Admin Dashboard" 
            onBack={() => setLocation('/')}
          />
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="bg-gray-50 min-h-screen">
        <MobileHeader 
          title="Admin Dashboard" 
          onBack={() => setLocation('/')}
        />

        <div className="p-4 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={Users}
              title="Total Users"
              value={stats.totalUsers}
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              icon={ShoppingCart}
              title="Total Orders"
              value={stats.totalOrders}
              subtitle="All time"
              color="from-green-500 to-green-600"
            />
            <StatCard
              icon={DollarSign}
              title="Revenue"
              value={`RM ${stats.totalRevenue.toFixed(2)}`}
              subtitle="Total earned"
              color="from-purple-500 to-purple-600"
            />
            <StatCard
              icon={Clock}
              title="Today"
              value={stats.todayOrders}
              subtitle="Orders today"
              color="from-orange-500 to-orange-600"
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={FileText}
              title="Surveys"
              value={stats.totalSurveys}
              subtitle="Completed"
              color="from-indigo-500 to-indigo-600"
            />
            <StatCard
              icon={UserCheck}
              title="Active Users"
              value={stats.activeUsers}
              subtitle="This week"
              color="from-teal-500 to-teal-600"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLocation('/admin/users')}
                className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Users size={20} />
                <span className="text-sm font-medium">Manage Users</span>
              </button>
              <button
                onClick={() => setLocation('/admin/orders')}
                className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Package size={20} />
                <span className="text-sm font-medium">View Orders</span>
              </button>
              <button
                onClick={() => setLocation('/admin/surveys')}
                className="flex items-center gap-2 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <FileText size={20} />
                <span className="text-sm font-medium">Surveys</span>
              </button>
              <button
                onClick={() => setLocation('/admin/menu')}
                className="flex items-center gap-2 p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Settings size={20} />
                <span className="text-sm font-medium">Menu Items</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <button
                onClick={() => setLocation('/admin/finance')}
                className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <CreditCard size={20} />
                <span className="text-sm font-medium">Finance</span>
              </button>
              <button
                onClick={() => setLocation('/admin/content')}
                className="flex items-center gap-2 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <FileText size={20} />
                <span className="text-sm font-medium">Content</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
            {stats.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {stats.recentOrders.slice(0, 5).map((order: any) => (
                  <div key={order.orderId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{order.orderId}</div>
                      <div className="text-sm text-gray-600">{order.userEmail}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">RM {order.totalAmount}</div>
                      <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Database Connection</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payment Gateway</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">AI Chat Service</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Running</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}