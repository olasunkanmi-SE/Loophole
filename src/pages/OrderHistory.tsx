
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Calendar, Download, Package, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import MobileContainer from '../components/MobileContainer';
import MobileHeader from '../components/MobileHeader';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  addOns: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface Order {
  _id: string;
  orderId: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: {
    type: string;
    name: string;
  };
  status: 'pending' | 'completed' | 'cancelled';
  transactionId?: string;
  created_at: string;
}

export default function OrderHistory() {
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email) {
      fetchOrderHistory();
    }
  }, [user]);

  const fetchOrderHistory = async () => {
    try {
      const response = await fetch(`/api/order-history/${user?.email}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setLoading(false);
    }
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

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'grabpay': return '🚗';
      case 'touchngo': return '📱';
      case 'bank_transfer': return '🏦';
      case 'points': return '💰';
      default: return '💳';
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'grabpay': return 'GrabPay';
      case 'touchngo': return 'Touch \'n Go';
      case 'bank_transfer': return 'Bank Transfer';
      case 'points': return 'EarnEats Points';
      default: return method;
    }
  };

  const downloadReceipt = (order: Order) => {
    generatePDFReceipt(order);
  };

  const generatePDFReceipt = (order: Order) => {
    const pdf = new jsPDF();
    
    // Set font size and style
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    
    // Header
    pdf.text('EARNEATS RECEIPT', 105, 20, { align: 'center' });
    
    // Draw line under header
    pdf.setLineWidth(0.5);
    pdf.line(20, 25, 190, 25);
    
    // Order details
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    let yPosition = 35;
    
    pdf.text(`Order ID: ${order.orderId}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Date: ${formatDate(order.created_at)}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Customer: ${order.userEmail}`, 20, yPosition);
    yPosition += 10;
    
    // Items section
    pdf.setFont('helvetica', 'bold');
    pdf.text('ITEMS ORDERED:', 20, yPosition);
    yPosition += 8;
    
    pdf.setFont('helvetica', 'normal');
    order.items.forEach(item => {
      const itemTotal = item.price * item.quantity;
      pdf.text(`${item.quantity}x ${item.name}`, 25, yPosition);
      pdf.text(`RM ${itemTotal.toFixed(2)}`, 150, yPosition);
      yPosition += 5;
      
      // Add-ons
      if (item.addOns && item.addOns.length > 0) {
        item.addOns.forEach(addOn => {
          const addOnTotal = addOn.price * addOn.quantity;
          pdf.text(`   + ${addOn.quantity}x ${addOn.name}`, 30, yPosition);
          pdf.text(`RM ${addOnTotal.toFixed(2)}`, 150, yPosition);
          yPosition += 4;
        });
      }
      yPosition += 3;
    });
    
    // Payment details
    yPosition += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.text('PAYMENT DETAILS:', 20, yPosition);
    yPosition += 8;
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Payment Method: ${getPaymentMethodName(order.paymentMethod.type)}`, 20, yPosition);
    yPosition += 6;
    
    if (order.transactionId) {
      pdf.text(`Transaction ID: ${order.transactionId}`, 20, yPosition);
      yPosition += 6;
    }
    
    pdf.text(`Status: ${order.status.toUpperCase()}`, 20, yPosition);
    yPosition += 10;
    
    // Total
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TOTAL:', 20, yPosition);
    pdf.text(`RM ${order.totalAmount.toFixed(2)}`, 150, yPosition);
    yPosition += 15;
    
    // Footer
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Thank you for your order!', 105, yPosition, { align: 'center' });
    yPosition += 4;
    pdf.text('Visit us again at EarnEats.', 105, yPosition, { align: 'center' });
    
    // Save the PDF
    pdf.save(`receipt_${order.orderId}.pdf`);
  };

  if (loading) {
    return (
      <MobileContainer>
        <div className="bg-white min-h-screen">
          <MobileHeader title="Order History" onBack={() => setLocation('/')} />
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading order history...</div>
          </div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="bg-gray-50 min-h-screen">
        <MobileHeader title="Order History" onBack={() => setLocation('/')} />
        
        <div className="p-4">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-500 mb-4">Your order history will appear here</p>
              <button
                onClick={() => setLocation('/menu')}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg p-4 shadow-sm border">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Package className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Order #{order.orderId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        RM {order.totalAmount.toFixed(2)}
                      </div>
                      <div className="flex items-center space-x-1">
                        {order.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : order.status === 'cancelled' ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />
                        )}
                        <span className={`text-xs font-medium ${
                          order.status === 'completed' ? 'text-green-600' : 
                          order.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
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
                            {item.addOns.map((addOn, addOnIndex) => (
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
                        <span>{getPaymentMethodIcon(order.paymentMethod.type)}</span>
                        <span>{getPaymentMethodName(order.paymentMethod.type)}</span>
                      </span>
                    </div>
                    {order.status === 'completed' && (
                      <button
                        onClick={() => downloadReceipt(order)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-xs">Receipt</span>
                      </button>
                    )}
                  </div>

                  {/* Order Date */}
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(order.created_at)}</span>
                    {order.transactionId && (
                      <span className="ml-auto">ID: {order.transactionId}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}
