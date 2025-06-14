
import { useState } from "react";
import MobileHeader from "../components/MobileHeader";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import MenuItem from "../components/MenuItem";
import CheckoutBar from "../components/CheckoutBar";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface CartItem {
  id: string;
  quantity: number;
  price: number;
}

const categories = [
  { id: "drink", name: "Drink" },
  { id: "meat", name: "Meat" },
  { id: "chicken", name: "Chicken" },
  { id: "seafood", name: "Seafood" },
];

const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Grilled Rack of Lamb",
    description: "rack of lamb, perfectly seasoned and marinated...",
    price: 20,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop",
    category: "meat"
  },
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
    id: "4",
    name: "Blood Orange Cocktail",
    description: "This blood orange cocktail is refreshing and...",
    price: 12,
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop",
    category: "drink"
  },
];

export default function FoodMenu() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("drink");
  const [cart, setCart] = useState<Record<string, CartItem>>({});

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (itemId: string) => {
    const item = menuItems.find(item => item.id === itemId);
    if (!item) return;

    setCart(prevCart => {
      const existingItem = prevCart[itemId];
      return {
        ...prevCart,
        [itemId]: {
          id: itemId,
          quantity: existingItem ? existingItem.quantity + 1 : 1,
          price: item.price
        }
      };
    });
  };

  const cartItems = Object.values(cart);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      <MobileHeader 
        title="Back"
        cartCount={totalItems}
        onBack={() => window.history.back()}
      />
      
      <SearchBar 
        placeholder="Search"
        value={searchTerm}
        onChange={setSearchTerm}
      />
      
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
        totalPrice={totalPrice}
        itemCount={totalItems}
        onCheckout={() => alert('Checkout functionality would go here!')}
      />
    </div>
  );
}
