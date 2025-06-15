
import { useState } from 'react';
import { Check, CreditCard } from 'lucide-react';
import { usePayment } from '../contexts/PaymentContext';
import type { PaymentMethod } from '../contexts/PaymentContext';
import { usePoints } from '../contexts/PointsContext';

interface PaymentMethodSelectorProps {
  totalAmount: number;
  onPaymentMethodSelect: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({ totalAmount, onPaymentMethodSelect }: PaymentMethodSelectorProps) {
  const { availablePaymentMethods, selectedPaymentMethod, setSelectedPaymentMethod } = usePayment();
  const { canAfford, getFormattedRM, getTotalPoints } = usePoints();
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    onPaymentMethodSelect(method);
  };

  const isPointsAffordable = canAfford(totalAmount);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Select Payment Method</h3>
      
      {availablePaymentMethods.map((method) => {
        const isSelected = selectedPaymentMethod?.id === method.id;
        const isDisabled = method.type === 'points' && !isPointsAffordable;
        
        return (
          <div key={method.id} className="space-y-2">
            <button
              onClick={() => !isDisabled && handleMethodSelect(method)}
              disabled={isDisabled}
              className={`w-full p-4 border rounded-lg text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : isDisabled
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{method.name}</div>
                    <div className="text-sm text-gray-500">{method.description}</div>
                    {method.type === 'points' && (
                      <div className="text-xs text-gray-400 mt-1">
                        Available: {getFormattedRM()} ({getTotalPoints()} points)
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {method.type === 'points' && !isPointsAffordable && (
                    <span className="text-xs text-red-500 font-medium">Insufficient</span>
                  )}
                  {isSelected && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            </button>

            {/* Payment Method Details */}
            {isSelected && method.type !== 'points' && (
              <div className="ml-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCard size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Payment Details</span>
                </div>
                
                {method.type === 'grabpay' && (
                  <div className="text-sm text-gray-600">
                    <p>• You'll be redirected to GrabPay</p>
                    <p>• Complete payment in the Grab app</p>
                    <p>• Return to EarnEats after payment</p>
                  </div>
                )}
                
                {method.type === 'touchngo' && (
                  <div className="text-sm text-gray-600">
                    <p>• You'll be redirected to Touch 'n Go</p>
                    <p>• Scan QR code or use PIN</p>
                    <p>• Payment confirmed instantly</p>
                  </div>
                )}
                
                {method.type === 'bank_transfer' && (
                  <div className="text-sm text-gray-600">
                    <p>• Select your bank via FPX</p>
                    <p>• Login to your online banking</p>
                    <p>• Authorize the payment</p>
                  </div>
                )}
                
                <div className="mt-2 p-2 bg-white rounded border">
                  <div className="text-sm">
                    <span className="text-gray-500">Amount to pay:</span>
                    <span className="font-medium text-gray-900 ml-2">RM {totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
