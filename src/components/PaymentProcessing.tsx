
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PaymentProcessingProps {
  isOpen: boolean;
  isProcessing: boolean;
  paymentSuccess: boolean | null;
  paymentMethod: string;
  amount: number;
  onClose: () => void;
  onRetry: () => void;
}

export default function PaymentProcessing({
  isOpen,
  isProcessing,
  paymentSuccess,
  paymentMethod,
  amount,
  onClose,
  onRetry
}: PaymentProcessingProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
        {isProcessing && (
          <>
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Processing Payment{dots}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Please wait while we process your {paymentMethod} payment of RM {amount.toFixed(2)}
            </p>
            <div className="flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </>
        )}

        {!isProcessing && paymentSuccess === true && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-green-600 mb-2">Payment Successful!</h3>
            <p className="text-gray-600 text-sm mb-4">
              Your payment of RM {amount.toFixed(2)} via {paymentMethod} has been processed successfully.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700"
            >
              Continue
            </button>
          </>
        )}

        {!isProcessing && paymentSuccess === false && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-600 mb-2">Payment Failed</h3>
            <p className="text-gray-600 text-sm mb-4">
              We couldn't process your {paymentMethod} payment. Please try again or choose a different payment method.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onRetry}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
