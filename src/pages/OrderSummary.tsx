import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, Minus, X } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { usePoints } from "../contexts/PointsContext";
import { usePayment } from "../contexts/PaymentContext";
import type { PaymentMethod } from "../contexts/PaymentContext";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import PaymentProcessing from "../components/PaymentProcessing";

export default function OrderSummary() {
  const [, setLocation] = useLocation();
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);
  const [showPaymentProcessing, setShowPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);

  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
  } = useCart();
  const { canAfford, deductRM, getFormattedRM, getTotalPoints } = usePoints();
  const { processPayment, isProcessing } = usePayment();

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      alert("Please select a payment method");
      return;
    }

    const orderTotal = parseFloat(getTotalPrice());

    if (selectedPaymentMethod.type === "points") {
      if (!canAfford(orderTotal)) {
        setShowInsufficientFunds(true);
        return;
      }

      if (deductRM(orderTotal)) {
        setPaymentSuccess(true);
        setShowPaymentProcessing(true);
        setTimeout(() => {
          clearCart();
          setLocation("/");
        }, 2000);
      } else {
        setShowInsufficientFunds(true);
      }
    } else {
      // Handle other payment methods
      setShowPaymentProcessing(true);
      const success = await processPayment(orderTotal, selectedPaymentMethod);
      setPaymentSuccess(success);

      if (success) {
        setTimeout(() => {
          clearCart();
          setLocation("/");
        }, 2000);
      }
    }
  };

  const handlePaymentRetry = () => {
    setPaymentSuccess(null);
    setShowPaymentProcessing(false);
  };

  const getItemTotalPrice = (item: any) => {
    const itemPrice = item.price * item.quantity;
    const addOnsPrice = item.addOns.reduce(
      (sum: number, addOn: any) => sum + addOn.price * addOn.quantity,
      0,
    );
    return itemPrice + addOnsPrice;
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white p-4 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setLocation("/menu")}
            className="flex items-center text-gray-600"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
          <h1 className="text-lg font-semibold">ORDER SUMMARY</h1>
          <div className="w-8"></div>
        </div>

        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-gray-500 text-lg">Your cart is empty</p>
          <button
            onClick={() => setLocation("/menu")}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between shadow-sm">
        <button
          onClick={() => setLocation("/menu")}
          className="flex items-center text-gray-600"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>
        <h1 className="text-lg font-semibold text-gray-800">ORDER SUMMARY</h1>
        <button onClick={() => setLocation("/menu")}>
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="p-4">
        {/* Cart Items - Always visible */}
        <div className="space-y-6">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
              {/* Main Item */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">x{item.quantity}</span>
                  <span className="font-medium text-gray-800">{item.name}</span>
                </div>
                <span className="font-bold text-gray-800">
                  RM {getItemTotalPrice(item)}
                </span>
              </div>

              {/* Add-ons */}
              {item.addOns.length > 0 && (
                <div className="ml-6 space-y-1 mb-4">
                  {item.addOns.map((addOn) => (
                    <div key={addOn.id} className="text-sm text-gray-600">
                      x{addOn.quantity} {addOn.name}
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                  >
                    <Minus size={16} className="text-gray-600" />
                  </button>
                  <span className="font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  onClick={() => setLocation(`/menu/${item.id}`)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 text-sm"
                >
                  EDIT
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Available Balance */}
        <div className="mt-8 mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between text-sm text-blue-800">
            <span>Available Balance</span>
            <span className="font-medium">{getFormattedRM()}</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            {getTotalPoints()} points (1 point = RM 1.00)
          </p>
        </div>

        {/* Total */}
        <div className="mt-4 mb-4">
          <div className="flex items-center justify-between text-xl font-bold text-gray-800">
            <span>Total</span>
            <span>RM {getTotalPrice()}</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mt-6">
          <PaymentMethodSelector
            totalAmount={parseFloat(getTotalPrice())}
            onPaymentMethodSelect={handlePaymentMethodSelect}
          />
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={!selectedPaymentMethod || isProcessing}
          className={`w-full py-4 rounded-lg font-medium text-lg mt-6 ${
            selectedPaymentMethod && !isProcessing
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isProcessing ? "PROCESSING..." : `PLACE ORDER RM${getTotalPrice()}`}
        </button>
      </div>

      {/* Bottom Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-red-500 rounded-full w-6 h-6 flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="font-medium">Checkout</span>
        </div>
        <span className="font-bold text-lg">Total: RM {getTotalPrice()}</span>
      </div>

      {/* Insufficient Funds Modal */}
      {showInsufficientFunds && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 mx-6 text-center max-w-sm">
            <div className="text-4xl mb-4">💳</div>
            <h2 className="text-xl font-bold text-red-600 mb-3">
              Insufficient Balance
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              You don't have enough money to complete this order.
            </p>
            <div className="space-y-2 mb-6">
              <p className="text-sm">
                <span className="text-gray-600">Order Total: </span>
                <span className="font-bold">RM {getTotalPrice()}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Your Balance: </span>
                <span className="font-bold text-blue-600">
                  {getFormattedRM()}
                </span>
              </p>
            </div>
            <p className="text-sm text-blue-600 mb-4">
              💡 Take more quizzes to earn points and convert them to money!
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowInsufficientFunds(false);
                  setLocation("/");
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Take Quizzes
              </button>
              <button
                onClick={() => setShowInsufficientFunds(false)}
                className="text-gray-600 px-4 py-2 rounded-lg"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      <PaymentProcessing
        isOpen={showPaymentProcessing}
        isProcessing={isProcessing}
        paymentSuccess={paymentSuccess}
        paymentMethod={selectedPaymentMethod?.name || ""}
        amount={parseFloat(getTotalPrice())}
        onClose={() => {
          setShowPaymentProcessing(false);
          setPaymentSuccess(null);
        }}
        onRetry={handlePaymentRetry}
      />
    </div>
  );
}