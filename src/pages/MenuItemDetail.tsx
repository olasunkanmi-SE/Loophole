import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { ArrowLeft, Plus, Minus, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";
import { useCart } from "../contexts/CartContext";
import { useNotifications } from "../contexts/NotificationContext";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface AddOn {
  id: string;
  name: string;
  price: number;
}

// Menu items will be fetched from database

const addOns: AddOn[] = [
  { id: "chili", name: "Chili Salt Rim", price: 40 },
  { id: "jalapeno", name: "Jalapeno Slices", price: 10 },
  { id: "soda", name: "Club Soda", price: 20 },
];

export default function MenuItemDetail() {
  const [match, params] = useRoute("/menu/:id");
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({});
  const [portionSize, setPortionSize] = useState("More Portion");
  const { addToCart, getTotalItems } = useCart();
  const { addNotification } = useNotifications();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  if (!match || !params?.id) return null;

  const menuItem = menuItems.find(item => item.id === params.id);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading menu item...</p>
        </div>
      </div>
    );
  }

  if (!menuItem) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="p-4">
          <p>Menu item not found</p>
        </div>
      </div>
    );
  }

  const handleAddOnChange = (addOnId: string, change: number) => {
    setSelectedAddOns(prev => {
      const currentQuantity = prev[addOnId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);

      if (newQuantity === 0) {
        const { [addOnId]: removed, ...rest } = prev;
        return rest;
      }

      return { ...prev, [addOnId]: newQuantity };
    });
  };

  const calculateTotal = () => {
    const basePrice = menuItem.price * quantity;
    const addOnPrice = Object.entries(selectedAddOns).reduce((total, [addOnId, qty]) => {
      const addOn = addOns.find(a => a.id === addOnId);
      return total + (addOn ? addOn.price * qty : 0);
    }, 0);
    return basePrice + addOnPrice;
  };

  const getSelectedAddOnsText = () => {
    const selected = Object.entries(selectedAddOns)
      .filter(([_, qty]) => qty > 0)
      .map(([addOnId, qty]) => {
        const addOn = addOns.find(a => a.id === addOnId);
        return addOn ? `+ ${addOn.name.toLowerCase()} x ${qty}` : '';
      })
      .filter(Boolean);

    return selected.length > 0 ? selected.join('  ') : '';
  };

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
        <button 
          onClick={() => setLocation('/order-summary')}
          className="relative"
        >
          <ShoppingCart size={24} className="text-gray-600" />
          {getTotalItems() > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {getTotalItems()}
            </span>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Product Image and Info */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-6">
          <div className="flex">
            <div className="w-24 h-24 flex-shrink-0">
              <img 
                src={menuItem.image} 
                alt={menuItem.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 p-4">
              <h1 className="text-lg font-semibold text-gray-800 mb-2">
                {menuItem.name}
              </h1>
              <p className="text-gray-600 text-sm mb-3">
                {menuItem.description}
              </p>
              <p className="text-lg font-bold text-gray-800">
                RM {menuItem.price}
              </p>
            </div>
          </div>
        </div>

        {/* Portion Size */}
        <div className="mb-6">
          <div className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full inline-block text-sm font-medium mb-4">
            {portionSize}
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-200 rounded-full mr-3"></div>
              <span className="text-gray-600">None</span>
            </div>
          </div>
        </div>

        {/* Add-ons */}
        <div className="space-y-3 mb-6">
          {addOns.map((addOn) => (
            <div key={addOn.id} className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center flex-1">
                <button
                  onClick={() => handleAddOnChange(addOn.id, -1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center mr-4"
                  disabled={!selectedAddOns[addOn.id]}
                >
                  <Minus size={16} className="text-gray-600" />
                </button>
                <span className="flex-1 text-gray-800">{addOn.name}</span>
                <span className="text-gray-800 font-medium mr-4">RM{addOn.price}</span>
                <span className="text-gray-600 mr-4">x {selectedAddOns[addOn.id] || 0}</span>
                <button
                  onClick={() => handleAddOnChange(addOn.id, 1)}
                  className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Add-ons Summary */}
        {getSelectedAddOnsText() && (
          <div className="text-sm text-gray-600 mb-4">
            {getSelectedAddOnsText()}
          </div>
        )}

        {/* Quantity and Add to Cart */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center mr-4"
            >
              <Minus size={16} className="text-gray-600" />
            </button>
            <span className="text-lg font-medium mx-2">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center ml-4"
            >
              <Plus size={16} />
            </button>
          </div>

          <button 
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium flex-1 ml-6"
            onClick={() => {
              const cartItem = {
                id: menuItem.id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: quantity,
                image: menuItem.image,
                addOns: Object.entries(selectedAddOns)
                  .filter(([_, qty]) => qty > 0)
                  .map(([addOnId, qty]) => {
                    const addOn = addOns.find(a => a.id === addOnId);
                    return {
                      id: addOnId,
                      name: addOn?.name || '',
                      price: addOn?.price || 0,
                      quantity: qty
                    };
                  })
              };
              addToCart(cartItem);
              addNotification({
                type: 'success',
                title: 'Added to Cart! 🛒',
                message: `${menuItem.name} has been added to your cart`,
              });
              setLocation('/menu');
            }}
          >
            ADD TO CART RM {calculateTotal()}
          </button>
        </div>
      </div>

      {/* Bottom Navigation Indicator */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
}