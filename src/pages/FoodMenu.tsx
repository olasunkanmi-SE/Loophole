
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
    description: "This blood orange cocktail is refreshing and...",
    price: 12,
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
    <div className="bg-gray-50 min-h-screen">
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
