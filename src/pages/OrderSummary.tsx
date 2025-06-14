
import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, Minus, X } from "lucide-react";
import { useCart } from "../contexts/CartContext";

export default function OrderSummary() {
  const [, setLocation] = useLocation();
  const { cartItems, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCart();

  const handlePlaceOrder = () => {
    alert(`Order placed successfully! Total: RM ${getTotalPrice()}`);
    clearCart();
    setLocation("/");
  };

  const getItemTotalPrice = (item: any) => {
    const itemPrice = item.price * item.quantity;
    const addOnsPrice = item.addOns.reduce((sum: number, addOn: any) => 
      sum + (addOn.price * addOn.quantity), 0
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
        {/* Selected Items Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-600 font-medium">SELECTED ITEMS</h2>
          <div className="flex gap-2">
            <button 
              onClick={clearCart}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 text-sm"
            >
              CLEAR ALL
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
              CONFIRM
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="space-y-6">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
              {/* Main Item */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">x{item.quantity}</span>
                  <span className="font-medium text-gray-800">{item.name}</span>
                </div>
                <span className="font-bold text-gray-800">RM {getItemTotalPrice(item)}</span>
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

        {/* Total */}
        <div className="mt-8 mb-4">
          <div className="flex items-center justify-between text-xl font-bold text-gray-800">
            <span>Total</span>
            <span>RM {getTotalPrice()}</span>
          </div>
        </div>

        {/* Place Order Button */}
        <button 
          onClick={handlePlaceOrder}
          className="w-full bg-green-600 text-white py-4 rounded-lg font-medium text-lg"
        >
          PLACE ORDER RM{getTotalPrice()}
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
    </div>
  );
}
