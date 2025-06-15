
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import MobileHeader from '../components/MobileHeader';
import MobileContainer from '../components/MobileContainer';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface PaymentRecord {
  _id: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  orderId: string;
  status: string;
  created_at: string;
}

export default function PaymentHistory() {
  const [, setLocation] = useLocation();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email) {
      fetchPaymentHistory();
    }
  }, [user]);

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch(`/api/payment-history/${user?.email}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
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

  if (loading) {
    return (
      <MobileContainer>
        <div className="bg-white min-h-screen">
          <MobileHeader title="Payment History" onBack={() => setLocation('/')} />
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading payment history...</div>
          </div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="bg-gray-50 min-h-screen">
        <MobileHeader title="Payment History" onBack={() => setLocation('/')} />
        
        <div className="p-4">
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
              <p className="text-gray-500">Your payment transactions will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment._id} className="bg-white rounded-lg p-4 shadow-sm border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getPaymentMethodIcon(payment.paymentMethod)}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {getPaymentMethodName(payment.paymentMethod)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.transactionId}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        RM {payment.amount.toFixed(2)}
                      </div>
                      <div className="flex items-center space-x-1">
                        {payment.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-xs font-medium ${
                          payment.status === 'completed' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(payment.created_at)}</span>
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
