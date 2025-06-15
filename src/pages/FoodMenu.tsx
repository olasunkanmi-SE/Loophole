import { useState } from "react";
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

const menuItems: MenuItem[] = [
  // Meat Category
  {
    id: "1",
    name: "Grilled Rack of Lamb",
    description: "Premium rack of lamb, perfectly seasoned and marinated with herbs",
    price: 28,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop",
    category: "meat"
  },
  {
    id: "5",
    name: "Wagyu Beef Steak",
    description: "Premium wagyu beef, grilled to perfection with rosemary",
    price: 45,
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=400&fit=crop",
    category: "meat"
  },
  {
    id: "6",
    name: "BBQ Pork Ribs",
    description: "Slow-cooked pork ribs with smoky BBQ sauce and coleslaw",
    price: 22,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop",
    category: "meat"
  },

  // Seafood Category
  {
    id: "2", 
    name: "Maple Bourbon Glazed Salmon",
    description: "Fresh Atlantic salmon with maple bourbon glaze and vegetables",
    price: 26,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop",
    category: "seafood"
  },
  {
    id: "3",
    name: "Garlic Butter Prawns",
    description: "Fresh prawns sautéed in garlic butter with herbs",
    price: 18,
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=400&fit=crop",
    category: "seafood"
  },
  {
    id: "8",
    name: "Grilled Fish & Chips",
    description: "Beer-battered fish with crispy fries and tartar sauce",
    price: 16,
    image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&h=400&fit=crop",
    category: "seafood"
  },

  // Chicken Category
  {
    id: "10",
    name: "Herb Roasted Chicken",
    description: "Half roasted chicken with rosemary, thyme and roasted vegetables",
    price: 18,
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=400&fit=crop",
    category: "chicken"
  },
  {
    id: "11",
    name: "Chicken Tikka Masala",
    description: "Tender chicken in creamy tomato curry with basmati rice",
    price: 16,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=400&fit=crop",
    category: "chicken"
  },
  {
    id: "12",
    name: "Buffalo Chicken Wings",
    description: "Crispy wings tossed in spicy buffalo sauce with celery sticks",
    price: 14,
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=400&fit=crop",
    category: "chicken"
  },
  {
    id: "13",
    name: "Chicken Parmigiana",
    description: "Breaded chicken breast with marinara sauce and melted cheese",
    price: 19,
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop",
    category: "chicken"
  },

  // Drink Category
  {
    id: "4",
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice with pulp",
    price: 6,
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop",
    category: "drink"
  },
  {
    id: "14",
    name: "Iced Coffee",
    description: "Cold brew coffee served over ice with milk",
    price: 5,
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=400&fit=crop",
    category: "drink"
  },
  {
    id: "15",
    name: "Green Tea",
    description: "Premium jasmine green tea served hot",
    price: 4,
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop",
    category: "drink"
  },
  {
    id: "16",
    name: "Mango Smoothie",
    description: "Fresh mango blended with yogurt and honey",
    price: 7,
    image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400&h=400&fit=crop",
    category: "drink"
  },
];

export default function FoodMenu() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("drink");
  const { addToCart, getTotalItems, getTotalPrice } = useCart();
  const [location, setLocation] = useLocation();
  const { getFormattedRM } = usePoints();

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
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
        {filteredItems.map((item) => (
          <MenuItem
            key={item.id}
            id={item.id}
            name={item.name}
            description={item.description}
            price={item.price}
            image={item.image}
            onAddToCart={handleAddToCart}
          />
        ))}
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