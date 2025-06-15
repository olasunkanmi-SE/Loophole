import React, { createContext, useContext, useState } from 'react';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'grabpay' | 'touchngo' | 'bank_transfer' | 'points';
  icon: string;
  enabled: boolean;
  description: string;
}

interface PaymentContextType {
  availablePaymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  setSelectedPaymentMethod: (method: PaymentMethod) => void;
  processPayment: (amount: number, method: PaymentMethod) => Promise<boolean>;
  isProcessing: boolean;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

const defaultPaymentMethods: PaymentMethod[] = [
  {
    id: 'points',
    name: 'EarnEats Points',
    type: 'points',
    icon: '💰',
    enabled: true,
    description: 'Use your earned points (1 point = RM 1.00)'
  },
  {
    id: 'grabpay',
    name: 'GrabPay',
    type: 'grabpay',
    icon: '🚗',
    enabled: true,
    description: 'Pay with your GrabPay wallet'
  },
  {
    id: 'touchngo',
    name: 'Touch \'n Go eWallet',
    type: 'touchngo',
    icon: '📱',
    enabled: true,
    description: 'Pay with Touch \'n Go eWallet'
  },
  {
    id: 'boost',
    name: 'Boost',
    type: 'touchngo',
    icon: '🚀',
    enabled: true,
    description: 'Pay with Boost eWallet'
  },
  {
    id: 'shopeepay',
    name: 'ShopeePay',
    type: 'touchngo',
    icon: '🛍️',
    enabled: true,
    description: 'Pay with ShopeePay wallet'
  },
  {
    id: 'maybank_qr',
    name: 'Maybank QRPay',
    type: 'bank_transfer',
    icon: '🏦',
    enabled: true,
    description: 'Scan QR to pay with Maybank'
  },
  {
    id: 'cimb_pay',
    name: 'CIMB Pay',
    type: 'bank_transfer',
    icon: '🏛️',
    enabled: true,
    description: 'Pay with CIMB Bank'
  },
  {
    id: 'fpx',
    name: 'Online Banking (FPX)',
    type: 'bank_transfer',
    icon: '💳',
    enabled: true,
    description: 'Direct bank transfer via FPX'
  },
  {
    id: 'bigpay',
    name: 'BigPay',
    type: 'touchngo',
    icon: '✈️',
    enabled: true,
    description: 'Pay with BigPay card or wallet'
  },
  {
    id: 'mcash',
    name: 'MCash',
    type: 'touchngo',
    icon: '📲',
    enabled: true,
    description: 'Pay with MCash mobile wallet'
  }
];

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [availablePaymentMethods] = useState<PaymentMethod[]>(defaultPaymentMethods);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processPayment = async (amount: number, method: PaymentMethod): Promise<boolean> => {
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      switch (method.type) {
        case 'points':
          // Points payment is handled by PointsContext
          return true;

        case 'grabpay':
          // Simulate GrabPay API call
          console.log(`Processing GrabPay payment of RM ${amount}`);
          return Math.random() > 0.1; // 90% success rate

        case 'touchngo':
          // Simulate Touch 'n Go API call
          console.log(`Processing Touch 'n Go payment of RM ${amount}`);
          return Math.random() > 0.1; // 90% success rate

        case 'bank_transfer':
          // Simulate FPX bank transfer
          console.log(`Processing bank transfer of RM ${amount}`);
          return Math.random() > 0.05; // 95% success rate

        default:
          return false;
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const value = {
    availablePaymentMethods,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    processPayment,
    isProcessing
  };

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}