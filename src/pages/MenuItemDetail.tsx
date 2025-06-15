
import { useState } from "react";
import { useRoute } from "wouter";
import { ArrowLeft, Plus, Minus, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";
import { useCart } from "../contexts/CartContext";

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

// This would typically come from your menu data
const menuItems: MenuItem[] = [
  // Meat Category
  {
    id: "1",
    name: "Grilled Rack of Lamb",
    description: "rack of lamb, perfectly seasoned and marinated...",
    price: 20,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop",
    category: "meat"
  },
  {
    id: "5",
    name: "Wagyu Beef Steak",
    description: "Premium wagyu beef, grilled to perfection with herbs",
    price: 35,
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=400&fit=crop",
    category: "meat"
  },
  {
    id: "6",
    name: "BBQ Pork Ribs",
    description: "Slow-cooked pork ribs with smoky BBQ sauce",
    price: 18,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop",
    category: "meat"
  },
  {
    id: "7",
    name: "Venison Medallions",
    description: "Tender venison with juniper berry sauce",
    price: 28,
    image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=400&fit=crop",
    category: "meat"
  },

  // Seafood Category
  {
    id: "2", 
    name: "Maple Bourbon Glazed Salmon",
    description: "A classic combination of sweet and savory never...",
    price: 20,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop",
    category: "seafood"
  },
  {
    id: "3",
    name: "Garlic Butter Clams",
    description: "better than garlic butter clams you can't find...",
    price: 15,
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=400&fit=crop",
    category: "seafood"
  },
  {
    id: "8",
    name: "Grilled Lobster Tail",
    description: "Fresh lobster tail with lemon butter sauce",
    price: 32,
    image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&h=400&fit=crop",
    category: "seafood"
  },
  {
    id: "9",
    name: "Pan-Seared Scallops",
    description: "Perfectly seared scallops with cauliflower puree",
    price: 24,
    image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&h=400&fit=crop",
    category: "seafood"
  },

  // Chicken Category
  {
    id: "10",
    name: "Herb Roasted Chicken",
    description: "Free-range chicken with rosemary and thyme",
    price: 16,
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=400&fit=crop",
    category: "chicken"
  },
  {
    id: "11",
    name: "Chicken Tikka Masala",
    description: "Creamy tomato curry with tender chicken pieces",
    price: 14,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=400&fit=crop",
    category: "chicken"
  },
  {
    id: "12",
    name: "Buffalo Chicken Wings",
    description: "Crispy wings tossed in spicy buffalo sauce",
    price: 12,
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=400&fit=crop",
    category: "chicken"
  },
  {
    id: "13",
    name: "Chicken Cordon Bleu",
    description: "Stuffed chicken breast with ham and swiss cheese",
    price: 18,
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop",
    category: "chicken"
  },

  // Drink Category
  {
    id: "4",
    name: "Blood Orange Cocktail",
    description: "This blood orange cocktail with mezcal is nothing short of mouthwatering",
    price: 80,
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop",
    category: "drink"
  },
  {
    id: "14",
    name: "Classic Mojito",
    description: "Fresh mint, lime, and white rum over ice",
    price: 10,
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=400&fit=crop",
    category: "drink"
  },
  {
    id: "15",
    name: "Espresso Martini",
    description: "Coffee cocktail with vodka and coffee liqueur",
    price: 14,
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop",
    category: "drink"
  },
  {
    id: "16",
    name: "Tropical Paradise",
    description: "Pineapple, coconut, and passion fruit blend",
    price: 11,
    image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400&h=400&fit=crop",
    category: "drink"
  },
];

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

  if (!match || !params?.id) return null;

  const menuItem = menuItems.find(item => item.id === params.id);
  if (!menuItem) return <div>Menu item not found</div>;

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
              alert('Added to cart!');
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
