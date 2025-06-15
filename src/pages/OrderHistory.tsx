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

    // Color scheme
    const primaryColor = [34, 197, 94]; // Green
    const secondaryColor = [59, 130, 246]; // Blue
    const grayColor = [107, 114, 128]; // Gray
    const lightGrayColor = [249, 250, 251]; // Light gray

    // Brand header with background
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 35, 'F');

    // Brand logo/name
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🍽️ EarnEats', 105, 15, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Your Food Delivery Partner', 105, 25, { align: 'center' });

    // Receipt title with accent
    pdf.setFillColor(...lightGrayColor);
    pdf.rect(15, 40, 180, 12, 'F');

    pdf.setTextColor(...grayColor);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DIGITAL RECEIPT', 105, 48, { align: 'center' });

    // Order info box
    pdf.setTextColor(0, 0, 0);
    pdf.setDrawColor(...grayColor);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(15, 58, 180, 25, 3, 3, 'S');

    let yPosition = 68;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Order Information', 20, yPosition);

    yPosition += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);

    // Two-column layout for order info
    pdf.text(`Order ID: ${order.orderId}`, 20, yPosition);
    pdf.text(`Date: ${formatDate(order.created_at)}`, 110, yPosition);
    yPosition += 5;
    pdf.text(`Customer: ${order.userEmail}`, 20, yPosition);
    pdf.text(`Status: ${order.status.toUpperCase()}`, 110, yPosition);

    // Items section with modern styling
    yPosition += 15;
    pdf.setFillColor(...secondaryColor);
    pdf.rect(15, yPosition - 3, 180, 8, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ITEMS ORDERED', 20, yPosition + 2);

    yPosition += 12;
    pdf.setTextColor(0, 0, 0);

    // Items with better formatting
    order.items.forEach((item, index) => {
      // Alternating row colors
      if (index % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(15, yPosition - 3, 180, 8, 'F');
      }

      const itemTotal = item.price * item.quantity;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);

      // Item name and quantity
      pdf.text(`${item.quantity}x`, 20, yPosition);
      pdf.text(`${item.name}`, 30, yPosition);
      pdf.text(`RM ${itemTotal.toFixed(2)}`, 175, yPosition, { align: 'right' });
      yPosition += 6;

      // Add-ons with indentation
      if (item.addOns && item.addOns.length > 0) {
        pdf.setTextColor(...grayColor);
        pdf.setFontSize(8);
        item.addOns.forEach(addOn => {
          const addOnTotal = addOn.price * addOn.quantity;
          pdf.text(`  + ${addOn.quantity}x ${addOn.name}`, 35, yPosition);
          pdf.text(`+RM ${addOnTotal.toFixed(2)}`, 175, yPosition, { align: 'right' });
          yPosition += 4;
        });
        pdf.setTextColor(0, 0, 0);
      }
      yPosition += 2;
    });

    // Payment section
    yPosition += 8;
    pdf.setFillColor(...lightGrayColor);
    pdf.rect(15, yPosition - 3, 180, 25, 'F');

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PAYMENT DETAILS', 20, yPosition + 2);

    yPosition += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);

    const paymentMethodName = getPaymentMethodName(order.paymentMethod.type);
    const paymentIcon = order.paymentMethod.type === 'points' ? '🪙' : 
                       order.paymentMethod.type === 'grabpay' ? '🟢' :
                       order.paymentMethod.type === 'touchngo' ? '🔵' : '🏦';

    pdf.text(`${paymentIcon} Payment Method: ${paymentMethodName}`, 20, yPosition);
    yPosition += 5;

    if (order.transactionId) {
      pdf.text(`Transaction ID: ${order.transactionId}`, 20, yPosition);
      yPosition += 5;
    }

    // Total section with emphasis
    yPosition += 8;
    pdf.setFillColor(...primaryColor);
    pdf.rect(15, yPosition - 5, 180, 15, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TOTAL AMOUNT', 20, yPosition + 2);
    pdf.text(`RM ${order.totalAmount.toFixed(2)}`, 175, yPosition + 2, { align: 'right' });

    // QR Code placeholder (visual representation)
    yPosition += 25;
    pdf.setTextColor(0, 0, 0);
    pdf.setDrawColor(...grayColor);
    pdf.rect(140, yPosition, 30, 30, 'S');
    pdf.setFontSize(8);
    pdf.text('QR Code', 155, yPosition + 16, { align: 'center' });
    pdf.text('(Verify Receipt)', 155, yPosition + 20, { align: 'center' });

    // Company info and footer
    pdf.setFontSize(8);
    pdf.setTextColor(...grayColor);
    pdf.text('Receipt generated on ' + new Date().toLocaleString(), 20, yPosition + 10);
    pdf.text('Powered by EarnEats AI Assistant', 20, yPosition + 15);

    // Social media and contact info
    pdf.text('📧 support@earneats.com  📱 +60 12-345-6789', 20, yPosition + 25);
    pdf.text('🌐 www.earneats.com  📍 Kuala Lumpur, Malaysia', 20, yPosition + 30);

    // Thank you message with emoji
    yPosition += 40;
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🙏 Thank you for choosing EarnEats!', 105, yPosition, { align: 'center' });

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Rate your experience and earn points! 🌟', 105, yPosition + 6, { align: 'center' });

    // Decorative border
    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(2);
    pdf.rect(10, 5, 190, pdf.internal.pageSize.height - 15, 'S');

    // Save the PDF
    pdf.save(`EarnEats_Receipt_${order.orderId}.pdf`);
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