
import React, { useEffect, useState } from 'react';
import { X, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export default function Toast({ 
  id, 
  type = 'info', 
  title, 
  message, 
  duration = 4000, 
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-close timer
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <Check className="w-5 h-5 text-green-600" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-600" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700'
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-600" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div
      className={`transform transition-all duration-300 ease-out mb-2 ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`bg-white rounded-lg shadow-lg border ${typeStyles.borderColor} overflow-hidden`}>
        <div className={`${typeStyles.bgColor} px-4 py-3`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {typeStyles.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${typeStyles.titleColor}`}>
                  {title}
                </p>
                {message && (
                  <p className={`text-xs mt-1 ${typeStyles.messageColor}`}>
                    {message}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 rounded-full hover:bg-white/50 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className={`h-full transition-all ease-linear ${
              type === 'success' ? 'bg-green-600' :
              type === 'error' ? 'bg-red-600' :
              type === 'warning' ? 'bg-yellow-600' :
              'bg-blue-600'
            }`}
            style={{ 
              width: '100%',
              animation: `progressShrink ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>
    </div>
  );
}
