import { useState, useEffect } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileContainer from "../components/MobileContainer";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import MenuItem from "../components/MenuItem";
import CheckoutBar from "../components/CheckoutBar";
import { useLocation } from 'wouter';
import { useCart } from "../contexts/CartContext";
import { usePoints } from "../contexts/PointsContext";
import { History } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const categories = [
  { id: "drink", name: "Drink" },
  { id: "meat", name: "Meat" },
  { id: "chicken", name: "Chicken" },
  { id: "seafood", name: "Seafood" },
];

export default function FoodMenu() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("drink");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, getTotalItems, getTotalPrice } = useCart();
  const [location, setLocation] = useLocation();
  const { getFormattedRM } = usePoints();

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

const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory && item.available;
  });

  const handleAddToCart = (itemId: string) => {
    const menuItem = menuItems.find(item => item.id === itemId);
    if (menuItem) {
      addToCart({
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        image: menuItem.image,
        addOns: []
      });
    }
  };

  return (
    <MobileContainer>
      <div className="bg-gray-50 min-h-screen">
        <MobileHeader 
          title="Back" 
          onBack={() => window.history.back()} 
          cartCount={getTotalItems()}
        />

      <SearchBar 
        placeholder="Search"
        value={searchTerm}
        onChange={setSearchTerm}
      />

      {/* Order History Button */}
      <div className="p-4 pt-0">
        <button
          onClick={() => setLocation('/order-history')}
          className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-3 flex items-center justify-center gap-2 transition-colors"
        >
          <History size={20} className="text-blue-600" />
          <span className="text-blue-600 font-medium">View Order History</span>
        </button>
      </div>

      <CategoryFilter 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <div className="px-4 py-2 grid grid-cols-2 gap-3 pb-20">
        {loading ? (
          <div className="col-span-2 text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading menu items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-2 text-center py-8">
            <p className="text-gray-500">No menu items found</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <MenuItem
              key={item.id}
              id={item.id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
              onAddToCart={handleAddToCart}
            />
          ))
        )}
      </div>

      <CheckoutBar 
        totalPrice={getTotalPrice()}
        itemCount={getTotalItems()}
        onCheckout={() => setLocation('/order-summary')}
      />
      </div>
    </MobileContainer>
  );
}