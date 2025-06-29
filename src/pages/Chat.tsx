import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { MessageCircle, Send, Sparkles, DollarSign, UtensilsCrossed, Home, Award, ArrowUp, CheckCircle, CreditCard, Download } from 'lucide-react';
import MobileContainer from '../components/MobileContainer';
import { usePoints } from '../contexts/PointsContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { usePayment } from '../contexts/PaymentContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jsPDF from 'jspdf';
import { useNotifications } from "../contexts/NotificationContext";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

export default function Chat() {
  const [, setLocation] = useLocation();
  const { addNotification } = useNotifications();
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load chat history from localStorage on initialization
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (error) {
        console.error('Error parsing saved chat history:', error);
      }
    }
    return [];
  });
  const [inputValue, setInputValue] = useState('');
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [userOrderHistory, setUserOrderHistory] = useState<any[]>([]);
  const { getTotalPoints, getFormattedRM, getCompletedCategories, canAfford, deductRM } = usePoints();
  const { addToCart, clearCart } = useCart();
  const { processPayment } = usePayment();
  const { user } = useAuth();
  const { cartItems, getTotalItems, getTotalPrice } = useCart();

  const totalPoints = getTotalPoints();
  const availableRM = getFormattedRM();
  const completedSurveys = getCompletedCategories().length;

  // Fetch user's order history for receipt downloads
  useEffect(() => {
    if (user?.email) {
      fetchUserOrderHistory();
    }
  }, [user]);

  const fetchUserOrderHistory = async () => {
    try {
      const response = await fetch(`/api/order-history/${user?.email}`);
      if (response.ok) {
        const orders = await response.json();
        setUserOrderHistory(orders);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    }
  };

  // Food ordering functions
  const handleOrderConfirmation = async (orderItems: any[]) => {
    const orderTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    setPendingOrder({
      items: orderItems,
      total: orderTotal,
      timestamp: new Date()
    });

    setShowPaymentOptions(true);

    // Add assistant message asking for payment method
    const assistantMessage: Message = {
      id: Date.now().toString(),
      content: `Perfect! I've prepared your order:\n\n${orderItems.map(item => `• ${item.quantity}x ${item.name} - RM ${(item.price * item.quantity).toFixed(2)}`).join('\n')}\n\n**Total: RM ${orderTotal.toFixed(2)}**\n\nHow would you like to pay for this order?`,
      sender: 'assistant',
      timestamp: new Date()
    };

    const updatedMessages = [...messages, assistantMessage];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);
  };

  const handlePaymentSelection = async (paymentMethod: 'points' | 'card' | 'grabpay' | 'touchngo') => {
    if (!pendingOrder) return;

    setOrderProcessing(true);
    setShowPaymentOptions(false);

    let paymentSuccess = false;
    let paymentMessage = '';

    try {
      if (paymentMethod === 'points') {
        if (!canAfford(pendingOrder.total)) {
          paymentMessage = `❌ **Payment Failed**\n\nInsufficient balance. You need RM ${pendingOrder.total.toFixed(2)} but only have ${availableRM}.\n\nComplete more surveys to earn points!`;
        } else {
          if (deductRM(pendingOrder.total)) {
            paymentSuccess = true;
            paymentMessage = `✅ **Payment Successful!**\n\nPaid RM ${pendingOrder.total.toFixed(2)} using your points balance.\n\nYour order has been placed and will be prepared shortly!\n\n📄 Your receipt is ready for download.`;
          }
        }
      } else {
        // Handle external payment methods
        const paymentMethodMap = {
          card: { type: 'bank_transfer', name: 'Bank Transfer' },
          grabpay: { type: 'grabpay', name: 'GrabPay' },
          touchngo: { type: 'touchngo', name: "Touch 'n Go" }
        };

        const selectedMethod = paymentMethodMap[paymentMethod];
        const result = await processPayment(pendingOrder.total, selectedMethod);

        if (result) {
          paymentSuccess = true;
          paymentMessage = `✅ **Payment Successful!**\n\nPaid RM ${pendingOrder.total.toFixed(2)} using ${selectedMethod.name}.\n\nYour order has been placed and will be prepared shortly!\n\n📄 Your receipt is ready for download.`;
        } else {
          paymentMessage = `❌ **Payment Failed**\n\nThere was an issue processing your ${selectedMethod.name} payment. Please try again or use a different payment method.`;
        }
      }

      if (paymentSuccess) {
        // Create order in database
        await createChatOrder(pendingOrder, paymentMethod);

        // Clear pending order
        setPendingOrder(null);
      }

    } catch (error) {
      paymentMessage = `❌ **Payment Error**\n\nAn unexpected error occurred. Please try again.`;
    }

    // Add payment result message
    const paymentResultMessage: Message = {
      id: Date.now().toString(),
      content: paymentMessage,
      sender: 'assistant',
      timestamp: new Date()
    };

    const updatedMessages = [...messages, paymentResultMessage];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);

    setOrderProcessing(false);
  };

  const createChatOrder = async (order: any, paymentMethod: string) => {
    try {
      const orderData = {
        userEmail: user?.email || 'guest',
        items: order.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          addOns: []
        })),
        totalAmount: order.total,
        paymentMethod: {
          type: paymentMethod,
          name: paymentMethod === 'points' ? 'Points Balance' : paymentMethod
        }
      };

      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const createdOrder = await response.json();

        // Update order status to completed
        const transactionId = `chat_${Date.now()}`;
        await fetch('/api/update-order-status', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: createdOrder.orderId,
            status: 'completed',
            transactionId: transactionId
          }),
        });

        // Add to completed orders for receipt generation
        const completedOrder = {
          ...createdOrder,
          status: 'completed',
          transactionId: transactionId,
          created_at: new Date().toISOString()
        };

        setCompletedOrders(prev => [completedOrder, ...prev]);
      }
    } catch (error) {
      console.error('Error creating chat order:', error);
    }
  };

  const generateOrderReceipt = (order: any) => {
    const pdf = new jsPDF();

    // Simple black text throughout
    pdf.setTextColor(0, 0, 0);

    // Clean header
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('EarnEats', 105, 20, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Digital Receipt', 105, 28, { align: 'center' });

    // Simple line separator
    pdf.setLineWidth(0.5);
    pdf.line(30, 35, 180, 35);

    let yPosition = 45;

    // Order details
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    pdf.text(`Order ID: ${order.orderId}`, 30, yPosition);
    yPosition += 6;

    pdf.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 30, yPosition);
    yPosition += 6;

    pdf.text(`Customer: ${order.userEmail}`, 30, yPosition);
    yPosition += 6;

    pdf.text(`Status: ${order.status.toUpperCase()}`, 30, yPosition);
    yPosition += 15;

    // Items section
    pdf.setFont('helvetica', 'bold');
    pdf.text('ITEMS:', 30, yPosition);
    yPosition += 8;

    pdf.setFont('helvetica', 'normal');
    order.items.forEach((item: any) => {
      const itemTotal = item.price * item.quantity;
      pdf.text(`${item.quantity}x ${item.name}`, 30, yPosition);
      pdf.text(`RM ${itemTotal.toFixed(2)}`, 150, yPosition, { align: 'right' });
      yPosition += 6;

      // Add-ons
      if (item.addOns && item.addOns.length > 0) {
        item.addOns.forEach((addOn: any) => {
          const addOnTotal = addOn.price * addOn.quantity;
          pdf.text(`  + ${addOn.quantity}x ${addOn.name}`, 35, yPosition);
          pdf.text(`RM ${addOnTotal.toFixed(2)}`, 150, yPosition, { align: 'right' });
          yPosition += 5;
        });
      }
      yPosition += 3;
    });

    // Payment details
    yPosition += 8;
    pdf.setFont('helvetica', 'bold');
    pdf.text('PAYMENT:', 30, yPosition);
    yPosition += 8;

    pdf.setFont('helvetica', 'normal');
    const paymentMethodName = order.paymentMethod.type === 'points' ? 'EarnEats Points' : 
                             order.paymentMethod.type === 'grabpay' ? 'GrabPay' :
                             order.paymentMethod.type === 'touchngo' ? "Touch 'n Go" :
                             order.paymentMethod.type === 'card' ? 'Bank Transfer' : order.paymentMethod.type;

    pdf.text(`Method: ${paymentMethodName}`, 30, yPosition);
    yPosition += 6;

    if (order.transactionId) {
      pdf.text(`Transaction: ${order.transactionId}`, 30, yPosition);
      yPosition += 6;
    }

    // Total with simple line
    yPosition += 8;
    pdf.line(30, yPosition, 180, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TOTAL:', 30, yPosition);
    pdf.text(`RM ${order.totalAmount.toFixed(2)}`, 150, yPosition, { align: 'right' });

    // Simple footer
    yPosition += 20;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Thank you for your order.', 105, yPosition, { align: 'center' });
    yPosition += 5;
    pdf.text('support@earneats.com', 105, yPosition, { align: 'center' });

    // Save the PDF
    pdf.save(`EarnEats_Receipt_${order.orderId}.pdf`);
  };

  const generateChatOrderReceipt = (order: any) => {
    const pdf = new jsPDF();

    // Simple black text throughout
    pdf.setTextColor(0, 0, 0);

    // Clean header
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('EarnEats', 105, 20, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Chat Order Receipt', 105, 28, { align: 'center' });

    // Simple line separator
    pdf.setLineWidth(0.5);
    pdf.line(30, 35, 180, 35);

    let yPosition = 45;

    // Order details
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    pdf.text(`Order ID: ${order.orderId}`, 30, yPosition);
    yPosition += 6;

    pdf.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 30, yPosition);
    yPosition += 6;

    pdf.text(`Customer: ${order.userEmail}`, 30, yPosition);
    yPosition += 6;

    pdf.text(`Method: AI Chat Assistant`, 30, yPosition);
    yPosition += 15;

    // Items section
    pdf.setFont('helvetica', 'bold');
    pdf.text('ITEMS:', 30, yPosition);
    yPosition += 8;

    pdf.setFont('helvetica', 'normal');
    order.items.forEach((item: any) => {
      const itemTotal = item.price * item.quantity;
      pdf.text(`${item.quantity}x ${item.name}`, 30, yPosition);
      pdf.text(`RM ${itemTotal.toFixed(2)}`, 150, yPosition, { align: 'right' });
      yPosition += 6;
    });

    // Payment details
    yPosition += 8;
    pdf.setFont('helvetica', 'bold');
    pdf.text('PAYMENT:', 30, yPosition);
    yPosition += 8;

    pdf.setFont('helvetica', 'normal');
    const paymentMethodName = order.paymentMethod.type === 'points' ? 'EarnEats Points' : 
                             order.paymentMethod.type === 'grabpay' ? 'GrabPay' :
                             order.paymentMethod.type === 'touchngo' ? "Touch 'n Go" :
                             order.paymentMethod.type === 'card' ? 'Bank Transfer' : order.paymentMethod.type;

    pdf.text(`Method: ${paymentMethodName}`, 30, yPosition);
    yPosition += 6;

    if (order.transactionId) {
      pdf.text(`Transaction: ${order.transactionId}`, 30, yPosition);
      yPosition += 6;
    }

    pdf.text(`Status: ${order.status.toUpperCase()}`, 30, yPosition);
    yPosition += 8;

    // Total with simple line
    pdf.line(30, yPosition, 180, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TOTAL:', 30, yPosition);
    pdf.text(`RM ${order.totalAmount.toFixed(2)}`, 150, yPosition, { align: 'right' });

    // Simple footer
    yPosition += 20;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Ordered via AI Chat Assistant', 105, yPosition, { align: 'center' });
    yPosition += 5;
    pdf.text('Thank you for your order.', 105, yPosition, { align: 'center' });

    // Save the PDF
    pdf.save(`chat_receipt_${order.order.orderId}.pdf`);
  };

  // Function to save chat history to localStorage (keep last 5 conversations)
  const saveChatHistory = (newMessages: Message[]) => {
    try {
      // Limit to last 10 messages (approximately 5 conversations assuming user + assistant pairs)
      const limitedMessages = newMessages.slice(-10);
      localStorage.setItem('chatHistory', JSON.stringify(limitedMessages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'earn-money',
      title: 'Start Earning',
      description: 'Complete surveys to earn money for food & accommodation',
      icon: <DollarSign size={16} className="text-green-500" />,
      action: () => setLocation('/')
    },
    {
      id: 'food-order',
      title: 'Order Food',
      description: `Use your ${availableRM} to order delicious meals`,
      icon: <UtensilsCrossed size={16} className="text-orange-500" />,
      action: () => setLocation('/menu')
    },
    {
      id: 'housing',
      title: 'Find Housing',
      description: `Book accommodation with your ${availableRM}`,
      icon: <Home size={16} className="text-purple-500" />,
      action: () => setLocation('/housing')
    },
    {
      id: 'points-status',
      title: 'My Earnings',
      description: `${totalPoints} points • ${completedSurveys}/8 surveys done`,
      icon: <Award size={16} className="text-blue-500" />,
      action: () => setLocation('/points')
    }
  ];

  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu-items');
      if (response.ok) {
        const items = await response.json();
        setMenuItems(items);
      } else {
        console.error('Failed to fetch menu items');
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

    // Knowledge base functions
    const fetchKnowledgeContext = async () => {
      try {
        // First try to get from server
        const response = await fetch('/api/knowledge-context');
        if (response.ok) {
          const data = await response.json();
          return data;
        }

        // Fallback: check for local knowledge updates
        try {
          const localUpdatesResponse = await fetch('/knowledge-updates.json');
          if (localUpdatesResponse.ok) {
            const localUpdates = await localUpdatesResponse.json();
            console.log('📚 Using local knowledge updates:', localUpdates.length, 'recent updates');
            return {
              recentUpdates: localUpdates,
              currentFiles: [],
              lastUpdated: new Date().toISOString(),
              source: 'local'
            };
          }
        } catch (localError) {
          console.log('No local knowledge updates found');
        }

        return null;
      } catch (error) {
        console.error('Error fetching knowledge context:', error);
        return null;
      }
    };

  // Helper function to extract menu items from AI response
  const extractMenuItems = (content: string) => {
    const foundItems = menuItems.filter(item => 
      content.toLowerCase().includes(item.name.toLowerCase()) ||
      content.toLowerCase().includes(item.name.split(' ')[0].toLowerCase())
    );

    return foundItems;
  };

    // Helper function to format markdown text
    const formatMarkdownText = (text: string) => {
        // Replace **bold text** with <strong>bold text</strong>
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Replace *italic text* with <em>italic text</em>
        formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');

        return formattedText;
    };

  // Helper function to format AI response with better styling
  const formatAIResponse = (content: string) => {
    // Extract menu items mentioned in the response
    const mentionedMenuItems = extractMenuItems(content);

    // Split content into paragraphs and format
    const paragraphs = content.split('\n\n').filter(p => p.trim());

    return paragraphs.map((paragraph, index) => {
      // Check if it's a list
      if (paragraph.includes('•') || paragraph.includes('-')) {
        const items = paragraph.split('\n').filter(item => item.trim());
        return (
          <div key={index} className="mb-4">
            {items.map((item, itemIndex) => {
              if (item.includes('•') || item.includes('-')) {
                return (
                  <div key={itemIndex} className="flex items-start gap-2 mb-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span 
                      className="text-gray-200 text-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: formatMarkdownText(item.replace(/[•-]/, '').trim()) 
                      }}
                    />
                  </div>
                );
              }
              return (
                <p 
                  key={itemIndex} 
                  className="text-gray-100 text-sm mb-2"
                  dangerouslySetInnerHTML={{ 
                    __html: formatMarkdownText(item) 
                  }}
                />
              );
            })}
          </div>
        );
      }

      // Check if it's a food recommendation with prices - show clickable cards
      if (paragraph.includes('RM') && (paragraph.includes('recommend') || paragraph.includes('food') || mentionedMenuItems.length > 0)) {
        return (
          <div key={index} className="mb-4">
            <div className="bg-gray-700 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <UtensilsCrossed size={16} className="text-orange-400" />
                <span className="text-orange-400 font-medium text-sm">Food Recommendations</span>
              </div>
              <p 
                className="text-gray-200 text-sm mb-3"
                dangerouslySetInnerHTML={{ 
                  __html: formatMarkdownText(paragraph) 
                }}
              />
            </div>

            {/* Clickable Menu Item Cards */}
            {mentionedMenuItems.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-gray-400 mb-2">Click to view details:</div>
                <div className="grid grid-cols-1 gap-2">
                  {mentionedMenuItems.map((item, itemIdx) => (
                    <button
                      key={itemIdx}
                      onClick={() => setLocation(`/menu/${item.id}`)}
                      className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg p-3 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                            <UtensilsCrossed size={16} className="text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-white text-sm">{item.name}</div>
                            <div className="text-xs text-gray-400 capitalize">{item.category}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold">RM {item.price}</div>
                          <div className="text-xs text-gray-400">View Details →</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      // Check if it's about earning/surveys
      if (paragraph.includes('survey') || paragraph.includes('earn') || paragraph.includes('points')) {
        return (
          <div key={index} className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg p-3 mb-4 border border-green-700/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-green-400" />
              <span className="text-green-400 font-medium text-sm">Earning Opportunity</span>
            </div>
            <p 
              className="text-gray-200 text-sm"
              dangerouslySetInnerHTML={{ 
                __html: formatMarkdownText(paragraph) 
              }}
            />
          </div>
        );
      }

      // Regular paragraph
      return (
        <p 
          key={index} 
          className="text-gray-100 text-sm mb-3 leading-relaxed"
          dangerouslySetInnerHTML={{ 
            __html: formatMarkdownText(paragraph) 
          }}
        />
      );
    });
  };

  // Helper function to extract actionable buttons from AI response
  const extractActionButtons = (content: string) => {
    const actions = [];

    // Check for food ordering mentions
    if (content.toLowerCase().includes('order food') || content.toLowerCase().includes('menu')) {
      actions.push({
        text: 'View Food Menu',
        icon: <UtensilsCrossed size={16} />,
        onClick: () => setLocation('/menu')
      });
    }

    // Check for housing/accommodation mentions
    if (content.toLowerCase().includes('housing') || content.toLowerCase().includes('accommodation') || 
        content.toLowerCase().includes('hostel') || content.toLowerCase().includes('hotel') ||
        content.toLowerCase().includes('stay') || content.toLowerCase().includes('lodging')) {
      actions.push({
        text: 'View Housing Options',
        icon: <Home size={16} />,
        onClick: () => setLocation('/housing')
      });
    }

    // Check for survey mentions
    if (content.toLowerCase().includes('survey') || content.toLowerCase().includes('earn more')) {
      actions.push({
        text: 'Complete Surveys',
        icon: <DollarSign size={16} />,
        onClick: () => setLocation('/')
      });
    }

    // Check for points/earnings mentions
    if (content.toLowerCase().includes('points') || content.toLowerCase().includes('earnings')) {
      actions.push({
        text: 'View My Earnings',
        icon: <Award size={16} />,
        onClick: () => setLocation('/points')
      });
    }

    // Check for receipt/download mentions
    if (content.toLowerCase().includes('receipt') || content.toLowerCase().includes('download')) {
      const latestOrder = userOrderHistory.length > 0 ? userOrderHistory[0] : 
                         completedOrders.length > 0 ? completedOrders[0] : null;

      if (latestOrder) {
        actions.push({
          text: 'Download Latest Receipt',
          icon: <Download size={16} />,
          onClick: () => {
            generateOrderReceipt(latestOrder);
          }
        });
      }
    }

    return actions;
  };

  // Parse order intent from user messages
  const parseOrderIntent = (userQuery: string) => {
    const orderKeywords = ['order', 'buy', 'purchase', 'get', 'want', 'need', 'hungry', 'food', 'eat', 'meal'];
    const confirmKeywords = ['yes', 'sure', 'okay', 'ok', 'agree', 'confirm', 'place order', 'lets do it', 'sounds good'];

    const hasOrderIntent = orderKeywords.some(keyword => 
      userQuery.toLowerCase().includes(keyword)
    );

    const hasConfirmIntent = confirmKeywords.some(keyword => 
      userQuery.toLowerCase().includes(keyword)
    );

    return { hasOrderIntent, hasConfirmIntent };
  };

  // Comprehensive app context for the LLM
  const getComprehensivePrompt = async (userQuery: string, categoryHint?: string) => {
    const foodMenu = {
      drinks: [
        { name: "Fresh Orange Juice", price: 6, description: "Refreshing and healthy" },
        { name: "Iced Coffee", price: 5, description: "Perfect for a caffeine kick" },
        { name: "Green Tea", price: 4, description: "A healthy and calming option" },
        { name: "Mango Smoothie", price: 7, description: "Sweet and tropical smoothie" }
      ],
      meat: [
        { name: "Grilled Rack of Lamb", price: 28, description: "Tender rack of lamb with herbs" },
        { name: "Wagyu Beef Steak", price: 45, description: "Premium Wagyu steak, grilled to perfection" },
        { name: "BBQ Pork Ribs", price: 22, description: "Smoky BBQ pork ribs, fall-off-the-bone tender" }
      ],
      chicken: [
        { name: "Herb Roasted Chicken", price: 18, description: "Juicy roasted chicken with herbs" },
        { name: "Chicken Tikka Masala", price: 16, description: "Creamy and flavorful Indian dish" },
        { name: "Buffalo Chicken Wings", price: 14, description: "Classic spicy wings with dip" },
        { name: "Chicken Parmigiana", price: 19, description: "Breaded chicken with tomato sauce and cheese" }
      ],
      seafood: [
        { name: "Maple Bourbon Glazed Salmon", price: 26, description: "Salmon with sweet and savory glaze" },
        { name: "Garlic Butter Prawns", price: 18, description: "Prawns cooked in garlic butter sauce" },
        { name: "Grilled Fish & Chips", price: 16, description: "Classic battered fish served with chips" }
      ]
    };

    const accommodations = {
      budget: [
        { name: "Budget Hostel Dorm Bed", price: 15, location: "Petaling Jaya", type: "Shared room", description: "Clean and safe hostel dorm perfect for budget travelers" },
        { name: "Capsule Pod Experience", price: 20, location: "Bukit Bintang, KL", type: "Unique space", description: "Futuristic capsule hotel experience" },
        { name: "Student Housing Single Room", price: 25, location: "USJ, Selangor", type: "Private room", description: "Perfect for students with study-friendly environment" }
      ],
      midRange: [
        { name: "Private Room with Breakfast", price: 35, location: "Subang Jaya", type: "Private room", description: "Comfortable private room with breakfast included" },
        { name: "Cozy Studio in City Center", price: 45, location: "Kuala Lumpur", type: "Entire apartment", description: "Modern studio apartment in the heart of KL" }
      ],
      luxury: [
        { name: "Luxury Condo with Pool", price: 85, location: "KLCC, Kuala Lumpur", type: "Entire apartment", description: "Stunning luxury apartment with city views" }
      ]
    };

    const housingOptions = [
      { type: "Budget Hostel", price: "RM 15-25/night", description: "Shared dorm beds, basic amenities" },
      { type: "Private Room", price: "RM 25-35/night", description: "Private room in shared accommodation" },
      { type: "Studio Apartment", price: "RM 35-45/night", description: "Self-contained studio with kitchenette" },
      { type: "Luxury Stay", price: "RM 45+/night", description: "Premium accommodation with full amenities" }
    ];

    // Generate user analytics summary
    const generateAnalyticsSummary = (analytics: any) => {
      if (!analytics || !analytics.orders || !analytics.payments) {
        return "No user data available for analysis.";
      }

      const { orders, payments } = analytics;

      // Calculate spending patterns
      const totalSpent = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
      const avgOrderValue = totalSpent / orders.length || 0;
      const orderFrequency = orders.length;

      // Payment method preferences
      const paymentMethods = orders.reduce((acc: any, order: any) => {
        const method = order.paymentMethod.type;
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      }, {});

      const preferredPayment = Object.keys(paymentMethods).reduce((a, b) => 
        paymentMethods[a] > paymentMethods[b] ? a : b, ''
      );

      // Most ordered items
      const itemFrequency: any = {};
      orders.forEach((order: any) => {
        order.items.forEach((item: any) => {
          itemFrequency[item.name] = (itemFrequency[item.name] || 0) + item.quantity;
        });
      });

      const topItems = Object.entries(itemFrequency)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([name, count]) => `${name} (${count}x)`);

      // Recent activity
      const recentOrders = orders.slice(0, 3);
      const lastOrderDate = orders.length > 0 ? new Date(orders[0].created_at).toLocaleDateString() : 'Never';

      return `
USER SPENDING ANALYTICS:
- Total Orders: ${orderFrequency}
- Total Spent: RM ${totalSpent.toFixed(2)}
- Average Order Value: RM ${avgOrderValue.toFixed(2)}
- Last Order: ${lastOrderDate}
- Preferred Payment: ${preferredPayment}
- Top Ordered Items: ${topItems.join(', ')}
- Recent Order Amounts: ${recentOrders.map((o: any) => `RM ${o.totalAmount}`).join(', ')}
- Payment Methods Used: ${Object.keys(paymentMethods).join(', ')}
      `;
    };

    // Fetch user analytics (replace with your actual API call)
    const fetchUserAnalytics = async () => {
      // Replace with your actual API endpoint for fetching user data
      const mockAnalytics = {
        orders: [
          { id: '1', totalAmount: 25.50, paymentMethod: { type: 'card' }, items: [{ name: 'Wagyu Beef Steak', quantity: 1 }, { name: 'Espresso Martini', quantity: 2 }], created_at: new Date() },
          { id: '2', totalAmount: 15.00, paymentMethod: { type: 'points' }, items: [{ name: 'Herb Roasted Chicken', quantity: 1 }], created_at: new Date() },
          { id: '3', totalAmount: 40.00, paymentMethod: { type: 'card' }, items: [{ name: 'Grilled Lobster Tail', quantity: 1 }], created_at: new Date() }
        ],
        payments: [
          { id: '1', amount: 25.50, type: 'card' },
          { id: '2', amount: 15.00, type: 'points' },
          { id: '3', amount: 40.00, type: 'card' }
        ]
      };
      return mockAnalytics;
    };

    const analytics = await fetchUserAnalytics();
    const analyticsText = analytics ? generateAnalyticsSummary(analytics) : "No order history available for this user.";

    const { hasOrderIntent, hasConfirmIntent } = parseOrderIntent(userQuery);

    const cartInfo = cartItems.length > 0
      ? cartItems.map(item => `- ${item.name} (Qty: ${item.quantity}, Price: RM${item.price})`).join('\n')
      : 'Cart is empty';

    const menuItemsText = Object.entries(foodMenu).map(([category, items]) => 
        `${category.toUpperCase()}:\n${items.map(item => `- ${item.name}: RM ${item.price} (${item.description})`).join('\n')}`
      ).join('\n\n');

    return `You are EarnEats Assistant, a helpful AI for the EarnEats food delivery app in Malaysia.

CURRENT USER STATUS:
- Available Money: ${availableRM}
- Total Points: ${totalPoints} points
- Completed Surveys: ${completedSurveys}/3
- Points can be converted to RM for food orders (roughly 1 point = RM 0.10)

${analyticsText}

AVAILABLE FOOD MENU:
${menuItemsText}

HOUSING OPTIONS AVAILABLE:
${housingOptions.map(option => `- ${option.type}: ${option.price} (${option.description})`).join('\n')}

CURRENT SHOPPING CART:
${cartInfo}
- Cart Total Items: ${getTotalItems()}
- Cart Total Price: RM${getTotalPrice()}

FOOD ORDERING INSTRUCTIONS:
${hasOrderIntent ? `
- The user seems interested in ordering food
- When recommending food items, ask if they'd like to place an order
- If they confirm wanting to order, respond with: "ORDER_CONFIRMATION:" followed by a JSON array of items like:
ORDER_CONFIRMATION: [{"id": "1", "name": "Grilled Rack of Lamb", "price": 20, "quantity": 1}, {"id": "4", "name": "Blood Orange Cocktail", "price": 12, "quantity": 1}]
- Only include this ORDER_CONFIRMATION format when the user explicitly agrees to order
` : ''}

RECEIPT CAPABILITIES:
- You can help users download receipts for their completed orders
- When users ask about receipts or downloading receipts, inform them that you can generate PDF receipts
- Completed orders from this chat session can have receipts downloaded immediately
- Tell users that receipts include order details, payment information, and transaction IDs

${hasConfirmIntent && pendingOrder ? `
- The user seems to be confirming a previous recommendation
- If they're agreeing to a food recommendation you made, include the ORDER_CONFIRMATION format
` : ''}
`;
  };

  // AI Response Generation
  async function generateAIResponse(userMessage: string, menuItems: any[], userEmail?: string, knowledgeContext?: any): Promise<string> {
    const menuItemsText = Object.entries(menuItems).map(([category, items]) => 
        `${category.toUpperCase()}:\n${items.map(item => `- ${item.name}: RM ${item.price} (${item.description})`).join('\n')}`
      ).join('\n\n');

    // Include knowledge context in system prompt
    let knowledgeInfo = '';
    if (knowledgeContext?.currentFiles) {
      const relevantFiles = knowledgeContext.currentFiles
        .filter((file: any) => 
          file.path.includes('Menu') || 
          file.path.includes('Order') || 
          file.path.includes('Cart') ||
          file.path.includes('Payment')
        )
        .slice(0, 5);

      if (relevantFiles.length > 0) {
        knowledgeInfo = `\n\nCURRENT SYSTEM KNOWLEDGE:
${relevantFiles.map((file: any) => 
  `- ${file.path}: ${file.summary?.mainPurpose || 'Application component'} (Updated: ${new Date(file.updated_at).toLocaleDateString()})`
).join('\n')}`;
      }
    }

    const systemPrompt = `You are EarnEats AI Assistant, a helpful food recommendation and ordering assistant for the EarnEats platform.

CURRENT AVAILABLE MENU ITEMS:
${menuItemsText}

USER CONTEXT:
- User Email: ${userEmail || 'Not provided'}
- Current Time: ${new Date().toLocaleString()}
${knowledgeInfo}

CAPABILITIES:
1. Food Recommendations - Suggest items from the available menu based on preferences, budget, dietary needs
2. Order Assistance - Help users add items to cart, calculate totals, provide nutritional info
3. Budget Planning - Suggest meals within user's budget, highlight deals and value options
4. Dietary Support - Recommend items for specific dietary needs (vegetarian, halal, etc.)
5. General Questions - Answer questions about the platform, menu items, or ordering process
6. System Updates - I have access to recent code changes and can provide information about new features

RESPONSE GUIDELINES:
- Always be helpful, friendly, and conversational
- Format recommendations with item names, prices, and brief descriptions
- Include relevant menu item details when making suggestions
- Use emojis sparingly for a friendly tone
- Keep responses concise but informative
- If asked about orders, payments, or account issues, direct users to appropriate sections
- Always recommend items from the available menu when discussing food
- If asked about app features or recent changes, use the system knowledge context

Current user message: "${userMessage}"

Provide a helpful response based on the user's request.`;

    console.log('Constructed system prompt:', systemPrompt);

    try {
      // Get API key
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCZ2i4mYhfTC59fZSQoAIUsIJJmMqvQ5fE';
      console.log('Using API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');

      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-1219" });

      const result = await model.generateContent(systemPrompt);
      const response = result.response.text();
      console.log('AI Response:', response);
      return response;

    } catch (error) {
      console.error('Gemini AI error:', error);
      return "Sorry, I'm having trouble responding right now. Please try again later.";
    }
  }

  const handleSendMessage = async (categoryHint?: string) => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);
    const query = inputValue.trim();
    setInputValue('');

    try {
      // Get API key
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCZ2i4mYhfTC59fZSQoAIUsIJJmMqvQ5fE';
      console.log('Using API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');

      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-1219" });

      // Use comprehensive prompt with category hint if provided
      const comprehensivePrompt = await getComprehensivePrompt(query, categoryHint);
      console.log('Sending prompt to Gemini:', comprehensivePrompt.substring(0, 200) + '...');

      const result = await model.generateContent(comprehensivePrompt);
      console.log('Gemini response received:', result);

      const response = result.response.text();
      console.log('Response text:', response);

      // Check if the response contains an order confirmation
      const orderConfirmationMatch = response.match(/ORDER_CONFIRMATION:\s*(\[.*?\])/);

      let assistantContent = response;

      if (orderConfirmationMatch) {
        try {
          const orderItems = JSON.parse(orderConfirmationMatch[1]);
          // Remove the ORDER_CONFIRMATION part from the response
          assistantContent = response.replace(/ORDER_CONFIRMATION:\s*\[.*?\]/, '').trim();

          // Handle the order confirmation
          setTimeout(() => {
            handleOrderConfirmation(orderItems);
          }, 1000);
        } catch (error) {
          console.error('Error parsing order confirmation:', error);
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantContent,
        sender: 'assistant',
        timestamp: new Date()
      };

      const finalMessages = [...messages, userMessage, assistantMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } catch (error) {
      console.error('Gemini AI error details:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);

      // More specific error handling
      let fallbackResponse = '';

      if (error?.message?.includes('API_KEY')) {
        fallbackResponse = `There's an issue with the API configuration. Let me help you with what I know! You have ${totalPoints} points (${availableRM}). What would you like to know about earning money or ordering food?`;
      } else if (error?.message?.includes('quota') || error?.message?.includes('limit')) {
        fallbackResponse = `The AI service is temporarily busy. I can still help! You have ${totalPoints} points (${availableRM}). Ask me about surveys, food recommendations, or how to use your points!`;
      } else {
        fallbackResponse = `I'm having technical difficulties right now, but I'm here to help! You have ${totalPoints} points (${availableRM}). What would you like to know about the app?`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: fallbackResponse,
        sender: 'assistant',
        timestamp: new Date()
      };

      const finalMessages = [...messages, userMessage, assistantMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);

        addNotification({
          type: 'error',
          title: 'Chat Error 🤖',
          message: 'Unable to connect to chat service. Please try again.',
        });
      }
  };

  const formatAnalyticsResponse = (content: string) => {
    // Check if this is an analytics response
    if (!content.includes('USER SPENDING ANALYTICS:')) {
      return content;
    }

    // Extract analytics data from the content
    const lines = content.split('\n').filter(line => line.trim());
    const analytics: any = {};

    lines.forEach(line => {
      if (line.includes('Total Orders:')) {
        analytics.totalOrders = line.split(':')[1].trim();
      } else if (line.includes('Total Spent:')) {
        analytics.totalSpent = line.split(':')[1].trim();
      } else if (line.includes('Average Order Value:')) {
        analytics.avgOrderValue = line.split(':')[1].trim();
      } else if (line.includes('Last Order:')) {
        analytics.lastOrder = line.split(':')[1].trim();
      } else if (line.includes('Preferred Payment:')) {
        analytics.preferredPayment = line.split(':')[1].trim();
      } else if (line.includes('Top Ordered Items:')) {
        analytics.topItems = line.split(':')[1].trim();
      } else if (line.includes('Recent Order Amounts:')) {
        analytics.recentAmounts = line.split(':')[1].trim();
      } else if (line.includes('Payment Methods Used:')) {
        analytics.paymentMethods = line.split(':')[1].trim();
      }
    });

    const getPaymentIcon = (method: string) => {
      if (method.toLowerCase().includes('card')) return '💳';
      if (method.toLowerCase().includes('points')) return '💰';
      if (method.toLowerCase().includes('grabpay')) return '🚗';
      if (method.toLowerCase().includes('touchngo')) return '📱';
      return '💳';
    };

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="text-lg font-bold">Your Spending Analytics</h3>
              <p className="text-blue-100 text-sm">Here's what I found about your ordering habits</p>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-4 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{analytics.totalOrders || '0'}</div>
                <div className="text-green-100 text-sm font-medium">Total Orders</div>
              </div>
              <span className="text-3xl opacity-80">🛍️</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-4 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold">{analytics.totalSpent || 'RM 0'}</div>
                <div className="text-blue-100 text-sm font-medium">Total Spent</div>
              </div>
              <span className="text-3xl opacity-80">💸</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-4 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">{analytics.avgOrderValue || 'RM 0'}</div>
                <div className="text-purple-100 text-sm font-medium">Avg Order</div>
              </div>
              <span className="text-3xl opacity-80">📈</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white p-4 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">{analytics.lastOrder || 'Never'}</div>
                <div className="text-orange-100 text-sm font-medium">Last Order</div>
              </div>
              <span className="text-3xl opacity-80">📅</span>
            </div>
          </div>
        </div>

        {/* Payment Method Card */}
        {analytics.preferredPayment && (
          <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-3 rounded-full">
                <span className="text-2xl">{getPaymentIcon(analytics.preferredPayment)}</span>
              </div>
              <div className="flex-1">
                <div className="text-gray-800 font-semibold">Preferred Payment Method</div>
                <div className="text-gray-600 text-sm capitalize">{analytics.preferredPayment}</div>
              </div>
              <div className="bg-yellow-50 px-3 py-1 rounded-full">
                <span className="text-yellow-600 text-xs font-medium">Most Used</span>
              </div>
            </div>
          </div>
        )}

        {/* Favorite Items Card */}
        {analytics.topItems && (
          <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="bg-red-100 p-3 rounded-full">
                <span className="text-2xl">🍽️</span>
              </div>
              <div className="flex-1">
                <div className="text-gray-800 font-semibold mb-1">Your Favorite Items</div>
                <div className="text-gray-600 text-sm leading-relaxed">{analytics.topItems}</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Orders Card */}
        {analytics.recentAmounts && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 p-4 rounded-xl">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xl">📊</span>
              <div className="text-indigo-800 font-semibold">Recent Order Amounts</div>
            </div>
            <div className="text-indigo-700 text-sm">{analytics.recentAmounts}</div>
          </div>
        )}

        {/* Payment Methods Used */}
        {analytics.paymentMethods && (
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xl">💳</span>
              <div className="text-gray-800 font-semibold">Payment Methods You've Used</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {analytics.paymentMethods.split(',').map((method: string, index: number) => (
                <span key={index} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-gray-300 capitalize">
                  {getPaymentIcon(method.trim())} {method.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <MobileContainer>
      <div className="bg-gray-900 min-h-screen text-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <button 
            onClick={() => setLocation('/')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowUp size={20} className="rotate-180" />
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle size={20} />
            <span className="font-medium">Earnings Assistant</span>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => {
                setMessages([]);
                localStorage.removeItem('chatHistory');
              }}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-xs text-gray-400 hover:text-white"
              title="Clear chat history"
            >
              Clear
            </button>
          )}
          {messages.length === 0 && <div className="w-8" />}
        </div>

        {/* Earnings Status Bar */}
        <div className="p-4 bg-gradient-to-r from-green-600 to-blue-600 border-b border-gray-800">
          <div className="text-center">
            <div className="text-2xl font-bold">{availableRM}</div>
            <div className="text-sm opacity-90">Available for food orders</div>
            <div className="text-xs opacity-75 mt-1">
              {totalPoints} points • {completedSurveys}/3 surveys completed
            </div>
          </div>
        </div>

        {/* Welcome Message & Quick Actions */}
        {messages.length === 0 && (
          <div className="flex-1 p-4 space-y-6">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <DollarSign size={36} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles size={12} className="text-yellow-800" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Your AI Earnings Assistant
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Complete quick surveys, earn real money, and order delicious food. 
                  I'm here to help you maximize your earnings! 🚀
                </p>
              </div>
            </div>

            {/* Quick Actions with Enhanced Design */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 rounded"></div>
                <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
              </div>

              {quickActions.map((action, index) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="w-full bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 border border-gray-600 rounded-xl p-4 text-left transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center shadow-lg">
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{action.title}</div>
                      <div className="text-sm text-gray-300">{action.description}</div>
                    </div>
                    <div className="text-gray-500">
                      <ArrowUp size={16} className="rotate-45" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Enhanced Earning Potential Card */}
            <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-xl p-5 border border-gray-600 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Award size={16} className="text-white" />
                </div>
                <h4 className="font-semibold text-white">💰 Earning Potential</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-600">
                  <div className="text-lg font-bold text-green-400">RM 0.10-1.00</div>
                  <div className="text-xs text-gray-400">Per Survey</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-600">
                  <div className="text-lg font-bold text-blue-400">2-3 min</div>
                  <div className="text-xs text-gray-400">Time Required</div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-900/20 rounded-lg border border-green-700/30">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">Up to RM 3.00</div>
                  <div className="text-xs text-green-300">Complete all 3 surveys</div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">
                  🎯 Start earning now and order your favorite food!
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-3">
                💬 Ask me anything about earning money or ordering food!
              </p>
              <div className="flex justify-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <Sparkles size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-xl p-3'
                      : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-xl overflow-hidden py-2'
                  }`}
                >
                  {message.sender === 'user' ? (
                    <>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </>
                  ) : (
                    <div className="space-y-3">
                      {/* AI Header */}
                      <div className="bg-gradient-to-r from-green-600 to-blue-600 px-4 py-2 -m-3 mb-3">
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-white" />
                          <span className="text-sm font-medium text-white">EarnEats Assistant</span>
                        </div>
                      </div>

                      {/* AI Response Content */}
                      <div className="px-3 pb-3">
                        <div className="prose prose-sm prose-invert max-w-none">
                          {formatAIResponse(message.content)}
                        </div>

                        {/* Quick Action Buttons from AI response */}
                        {extractActionButtons(message.content).length > 0 && (
                          <div className="mt-4 space-y-2">
                            {extractActionButtons(message.content).map((action, index) => (
                              <button
                                key={index}
                                onClick={action.onClick}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                              >
                                {action.icon}
                                {action.text}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Receipt Download Button for Successful Orders */}
                        {message.content.includes('Payment Successful') && (
                          <div className="mt-4">
                            <button
                              onClick={() => {
                                const latestOrder = completedOrders.length > 0 ? completedOrders[0] : 
                                                   userOrderHistory.length > 0 ? userOrderHistory[0] : null;
                                if (latestOrder) {
                                  generateOrderReceipt(latestOrder);
                                }
                              }}
                              className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 justify-center"
                            >
                              <Download size={16} />
                              Download Receipt (PDF)
                            </button>
                          </div>
                        )}

                        {/* Timestamp */}
                        <p className="text-xs opacity-50 mt-3">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Payment Options Modal */}
            {showPaymentOptions && pendingOrder && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 mx-6 max-w-sm w-full">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Choose Payment Method</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Total: RM {pendingOrder.total.toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Points Payment */}
                    <button
                      onClick={() => handlePaymentSelection('points')}
                      disabled={orderProcessing || !canAfford(pendingOrder.total)}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        canAfford(pendingOrder.total)
                          ? 'border-green-300 bg-green-50 hover:bg-green-100'
                          : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <DollarSign size={20} className={canAfford(pendingOrder.total) ? 'text-green-600' : 'text-gray-400'} />
                          <div>
                            <div className={`font-medium ${canAfford(pendingOrder.total) ? 'text-green-800' : 'text-gray-500'}`}>
                              Points Balance
                            </div>
                            <div className={`text-sm ${canAfford(pendingOrder.total) ? 'text-green-600' : 'text-gray-400'}`}>
                              {availableRM} available
                            </div>
                          </div>
                        </div>
                        {canAfford(pendingOrder.total) && <CheckCircle size={16} className="text-green-600" />}
                      </div>
                    </button>

                    {/* Card Payment */}
                    <button
                      onClick={() => handlePaymentSelection('card')}
                      disabled={orderProcessing}
                      className="w-full p-3 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-left transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard size={20} className="text-blue-600" />
                        <div>
                          <div className="font-medium text-blue-800">Bank Transfer</div>
                          <div className="text-sm text-blue-600">FPX / Online Banking</div>
                        </div>
                      </div>
                    </button>

                    {/* GrabPay */}
                    <button
                      onClick={() => handlePaymentSelection('grabpay')}
                      disabled={orderProcessing}
                      className="w-full p-3 rounded-lg border border-green-300 bg-green-50 hover:bg-green-100 text-left transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">G</div>
                        <div>
                          <div className="font-medium text-green-800">GrabPay</div>
                          <div className="text-sm text-green-600">Digital wallet</div>
                        </div>
                      </div>
                    </button>

                    {/* Touch 'n Go */}
                    <button
                      onClick={() => handlePaymentSelection('touchngo')}
                      disabled={orderProcessing}
                      className="w-full p-3 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-left transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-purple-600 rounded text-white text-xs flex items-center justify-center font-bold">T</div>
                        <div>
                          <div className="font-medium text-purple-800">Touch 'n Go</div>
                          <div className="text-sm text-purple-600">eWallet</div>
                        </div>
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setShowPaymentOptions(false);
                      setPendingOrder(null);
                    }}
                    disabled={orderProcessing}
                    className="w-full mt-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            )}

            {/* Order Processing Indicator */}
            {orderProcessing && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Processing your order...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 bg-gray-800 rounded-2xl p-3 border border-gray-700">
            <input
              type="text"
              placeholder="Ask about earning money or food orders..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className={`p-2 rounded-xl transition-colors ${
                inputValue.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send size={16} />
            </button>
          </div>

          {/* Quick suggestion buttons */}
          <div className="flex gap-2 mt-3 overflow-x-auto">
            <button
              onClick={() => setInputValue('I want to order food for dinner')}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs whitespace-nowrap hover:bg-gray-600 transition-colors"
            >
              Order food
            </button>
            <button
              onClick={() => setInputValue('Recommend food within my budget')}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs whitespace-nowrap hover:bg-gray-600 transition-colors"
            >
              Food recommendations
            </button>
            <button
              onClick={() => setInputValue('Show me affordable housing options')}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs whitespace-nowrap hover:bg-gray-600 transition-colors"
            >
              Housing options
            </button>
            <button
              onClick={() => setInputValue('How to earn more money?')}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs whitespace-nowrap hover:bg-gray-600 transition-colors"
            >
              Earn more money
            </button>
            <button
              onClick={() => setInputValue('What can I afford with my current balance?')}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs whitespace-nowrap hover:bg-gray-600 transition-colors"
            >
              What can I afford?
            </button>
             <button
              onClick={() => setInputValue('What is in my cart?')}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs whitespace-nowrap hover:bg-gray-600 transition-colors"
            >
              What is in my cart?
            </button>
             <button
              onClick={() => setInputValue('Place order for items in my cart')}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs whitespace-nowrap hover:bg-gray-600 transition-colors"
            >
            Place order
            </button>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}