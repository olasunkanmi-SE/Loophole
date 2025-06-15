
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import MobileHeader from '../components/MobileHeader';
import MobileContainer from '../components/MobileContainer';
import { 
  Search, 
  Filter, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  RefreshCw,
  Calendar,
  DollarSign
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
  updated_at: string;
  transactionId?: string;
}

export default function AdminOrders() {
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showPartialRefundModal, setShowPartialRefundModal] = useState(false);
  const [partialRefundAmount, setPartialRefundAmount] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        fetchOrders(); // Refresh orders
        setShowOrderModal(false);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const verifyPayment = async (orderId: string) => {
    try {
      const transactionId = `verified_${Date.now()}`;
      const response = await fetch(`/api/admin/orders/${orderId}/verify-payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId }),
      });
      if (response.ok) {
        fetchOrders();
        alert('Payment verified successfully!');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Failed to verify payment');
    }
  };

  const processRefund = async (orderId: string, amount: number) => {
    if (!confirm(`Are you sure you want to process a refund of RM ${amount.toFixed(2)}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, type: 'full' }),
      });
      if (response.ok) {
        fetchOrders();
        setShowOrderModal(false);
        alert('Refund processed successfully!');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('Failed to process refund');
    }
  };

  const processPartialRefund = async () => {
    const amount = parseFloat(partialRefundAmount);
    if (!amount || amount <= 0 || amount > (selectedOrder?.totalAmount || 0)) {
      alert('Please enter a valid refund amount');
      return;
    }

    if (!confirm(`Are you sure you want to process a partial refund of RM ${amount.toFixed(2)}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder?.orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, type: 'partial' }),
      });
      if (response.ok) {
        fetchOrders();
        setShowOrderModal(false);
        setShowPartialRefundModal(false);
        setPartialRefundAmount('');
        alert('Partial refund processed successfully!');
      }
    } catch (error) {
      console.error('Error processing partial refund:', error);
      alert('Failed to process partial refund');
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
      case 'refunded': return <RefreshCw size={14} />;
      default: return <Package size={14} />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.created_at);
      const today = new Date();
      const diffTime = today.getTime() - orderDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (dateFilter) {
        case 'today':
          matchesDate = diffDays <= 1;
          break;
        case 'week':
          matchesDate = diffDays <= 7;
          break;
        case 'month':
          matchesDate = diffDays <= 30;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const OrderCard = ({ order }: { order: OrderData }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium text-gray-900">{order.orderId}</div>
          <div className="text-sm text-gray-600">{order.userEmail}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            {order.status}
          </span>
          <button
            onClick={() => {
              setSelectedOrder(order);
              setShowOrderModal(true);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-500">Total Amount</div>
          <div className="font-semibold text-green-600">RM {order.totalAmount.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Items</div>
          <div className="font-semibold">{order.items.length} item(s)</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Payment: {order.paymentMethod.type}</span>
        <span>{new Date(order.created_at).toLocaleString()}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <MobileContainer>
        <div className="bg-white min-h-screen">
          <MobileHeader 
            title="Order Management" 
            onBack={() => setLocation('/admin/dashboard')}
          />
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </MobileContainer>
    );
  }

  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <MobileContainer>
      <div className="bg-gray-50 min-h-screen">
        <MobileHeader 
          title="Order Management" 
          onBack={() => setLocation('/admin/dashboard')}
        />

        <div className="p-4 space-y-4">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                  statusFilter === 'all' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                  statusFilter === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                  statusFilter === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setStatusFilter('cancelled')}
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                  statusFilter === 'cancelled' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Cancelled
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDateFilter('all')}
                className={`px-3 py-1 text-sm rounded-full ${
                  dateFilter === 'all' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setDateFilter('today')}
                className={`px-3 py-1 text-sm rounded-full ${
                  dateFilter === 'today' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateFilter('week')}
                className={`px-3 py-1 text-sm rounded-full ${
                  dateFilter === 'week' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                This Week
              </button>
            </div>
          </div>

          {/* Enhanced Analytics */}
          <div className="bg-white rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-800">Order Analytics</h3>
            
            {/* Main Stats */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="font-semibold text-lg">{orders.length}</div>
                <div className="text-xs text-gray-500">Total Orders</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <div className="font-semibold text-lg text-yellow-600">
                  {orders.filter(o => o.status === 'pending').length}
                </div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="font-semibold text-lg text-green-600">
                  {orders.filter(o => o.status === 'completed').length}
                </div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="font-semibold text-sm text-blue-600">
                  RM {totalRevenue.toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">Revenue</div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <div className="font-semibold text-sm text-red-600">
                  {orders.filter(o => o.status === 'cancelled').length}
                </div>
                <div className="text-xs text-gray-500">Cancelled</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="font-semibold text-sm text-purple-600">
                  {orders.filter(o => o.status === 'refunded').length}
                </div>
                <div className="text-xs text-gray-500">Refunded</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="font-semibold text-sm text-gray-600">
                  RM {orders.length > 0 ? (totalRevenue / orders.filter(o => o.status === 'completed').length || 1).toFixed(0) : '0'}
                </div>
                <div className="text-xs text-gray-500">Avg Order</div>
              </div>
            </div>
          </div>

          {/* Order List */}
          <div className="space-y-3">
            {filteredOrders.map(order => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <Package size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No orders found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Partial Refund Modal */}
        {showPartialRefundModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-sm w-full">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Partial Refund</h3>
                <p className="text-sm text-gray-600">Order: {selectedOrder.orderId}</p>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Refund Amount (Max: RM {selectedOrder.totalAmount.toFixed(2)})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    max={selectedOrder.totalAmount}
                    value={partialRefundAmount}
                    onChange={(e) => setPartialRefundAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowPartialRefundModal(false);
                      setPartialRefundAmount('');
                    }}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processPartialRefund}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Process Refund
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-sm w-full max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Order Details</h3>
                <p className="text-sm text-gray-600">{selectedOrder.orderId}</p>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Customer</h4>
                  <p className="text-sm text-gray-600">{selectedOrder.userEmail}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Items ({selectedOrder.items.length})</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>RM {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total Amount</span>
                    <span>RM {selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Payment</h4>
                  <p className="text-sm text-gray-600">Method: {selectedOrder.paymentMethod.type}</p>
                  {selectedOrder.transactionId && (
                    <p className="text-sm text-gray-600">Transaction: {selectedOrder.transactionId}</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <div className="flex gap-2 flex-wrap">
                    {['pending', 'completed', 'cancelled', 'refunded'].map(status => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.orderId, status)}
                        className={`px-3 py-1 text-xs rounded-full ${
                          selectedOrder.status === status
                            ? getStatusColor(status)
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Verification Section */}
                <div>
                  <h4 className="font-medium mb-2">Payment Verification</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Payment Status:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        selectedOrder.transactionId 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedOrder.transactionId ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    {!selectedOrder.transactionId && selectedOrder.status === 'pending' && (
                      <button
                        onClick={() => verifyPayment(selectedOrder.orderId)}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        Verify Payment
                      </button>
                    )}
                  </div>
                </div>

                {/* Refund Processing Section */}
                {selectedOrder.status === 'completed' && selectedOrder.transactionId && (
                  <div>
                    <h4 className="font-medium mb-2">Refund Processing</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => processRefund(selectedOrder.orderId, selectedOrder.totalAmount)}
                        className="w-full py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                      >
                        Process Full Refund (RM {selectedOrder.totalAmount.toFixed(2)})
                      </button>
                      <button
                        onClick={() => setShowPartialRefundModal(true)}
                        className="w-full py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700"
                      >
                        Process Partial Refund
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 space-y-1">
                  <p>Created: {new Date(selectedOrder.created_at).toLocaleString()}</p>
                  <p>Updated: {new Date(selectedOrder.updated_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileContainer>
  );
}
