
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import MobileHeader from '../components/MobileHeader';
import MobileContainer from '../components/MobileContainer';
import { 
  Package, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  User
} from 'lucide-react';

interface OrderData {
  _id: string;
  orderId: string;
  userEmail: string;
  items: any[];
  totalAmount: number;
  paymentMethod: any;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  created_at: string;
  transactionId?: string;
}

interface UserOrdersProps {
  userEmail?: string;
}

export default function UserOrders({ userEmail }: UserOrdersProps) {
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Get userEmail from URL if not passed as prop
  const currentPath = window.location.pathname;
  const pathParts = currentPath.split('/');
  const emailFromPath = pathParts[pathParts.length - 1];
  const targetEmail = userEmail || decodeURIComponent(emailFromPath);

  useEffect(() => {
    if (targetEmail) {
      fetchUserOrders();
      fetchUserDetails();
    }
  }, [targetEmail]);

  const fetchUserOrders = async () => {
    try {
      const response = await fetch(`/api/order-history/${encodeURIComponent(targetEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else if (response.status === 404) {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`/api/profile/${encodeURIComponent(targetEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      case 'refunded': return <Package size={14} />;
      default: return <Package size={14} />;
    }
  };

  const getPaymentMethodDisplay = (method: string) => {
    const methodMap: Record<string, { name: string; icon: string }> = {
      'points': { name: 'EarnEats Points', icon: '💰' },
      'grabpay': { name: 'GrabPay', icon: '🚗' },
      'touchngo': { name: 'Touch \'n Go', icon: '📱' },
      'bank_transfer': { name: 'Bank Transfer', icon: '🏦' },
      'boost': { name: 'Boost', icon: '🚀' },
      'shopeepay': { name: 'ShopeePay', icon: '🛍️' },
      'fpx': { name: 'FPX Banking', icon: '🔐' }
    };
    
    return methodMap[method.toLowerCase()] || { name: method, icon: '💳' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalSpent = orders.filter(o => o.status === 'completed').reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  if (loading) {
    return (
      <MobileContainer>
        <div className="bg-white min-h-screen">
          <MobileHeader 
            title="User Orders" 
            onBack={() => setLocation('/admin/users')}
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
          title="User Orders" 
          onBack={() => setLocation('/admin/users')}
        />

        <div className="p-4 space-y-4">
          {/* User Info Card */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{user?.name || 'User'}</h2>
                <p className="text-sm text-gray-600">{targetEmail}</p>
              </div>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{totalOrders}</div>
                <div className="text-xs text-gray-500">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">{completedOrders}</div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">RM {totalSpent.toFixed(2)}</div>
                <div className="text-xs text-gray-500">Total Spent</div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
                <p className="text-gray-500">This user hasn't placed any orders yet.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-4">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium text-gray-900">{order.orderId}</div>
                      <div className="text-sm text-gray-500">{order.items.length} item(s)</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">RM {order.totalAmount.toFixed(2)}</div>
                      <div className="flex items-center justify-end space-x-1 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-3 space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        <span>{item.quantity}x {item.name}</span>
                        {item.addOns && item.addOns.length > 0 && (
                          <div className="ml-4 text-xs text-gray-500">
                            {item.addOns.map((addOn: any, addOnIndex: number) => (
                              <div key={addOnIndex}>+ {addOn.quantity}x {addOn.name}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Payment Method */}
                  <div className="flex items-center justify-between mb-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Payment:</span>
                      <span className="flex items-center space-x-1">
                        <span>{getPaymentMethodDisplay(order.paymentMethod.type).icon}</span>
                        <span>{getPaymentMethodDisplay(order.paymentMethod.type).name}</span>
                      </span>
                    </div>
                  </div>

                  {/* Order Date and Transaction ID */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                    {order.transactionId && (
                      <span>ID: {order.transactionId}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
