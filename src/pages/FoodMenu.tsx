import { useState } from "react";
import MobileHeader from "../components/MobileHeader";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import MenuItem from "../components/MenuItem";
import CheckoutBar from "../components/CheckoutBar";
import { useLocation, useNavigate } from 'react-router-dom';

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
  const location = useLocation();
  const navigate = useNavigate();

  const setLocation = (path: string) => {
    navigate(path);
  };

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

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  return (
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
  );
}
```

```
Updated MobileHeader and CheckoutBar to use getTotalItems and getTotalPrice, and updated onCheckout to navigate to /order-summary.
```

```replit_final_file
import { useState } from "react";
import MobileHeader from "../components/MobileHeader";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import MenuItem from "../components/MenuItem";
import CheckoutBar from "../components/CheckoutBar";
import { useLocation, useNavigate } from 'react-router-dom';

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
  const location = useLocation();
  const navigate = useNavigate();

  const setLocation = (path: string) => {
    navigate(path);
  };

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

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  return (
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
  );
}
```import React, { createContext, useState, useContext } from 'react';

interface CartItem {
  id: string;
  quantity: number;
  price: number;
}

interface CartContextType {
  cart: Record<string, CartItem>;
  addToCart: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Record<string, CartItem>>({});

  const addToCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart[itemId];
      const itemPrice = menuItems.find(item => item.id === itemId)?.price || 0; // Get price from menuItems
      return {
        ...prevCart,
        [itemId]: {
          id: itemId,
          quantity: existingItem ? existingItem.quantity + 1 : 1,
          price: itemPrice
        }
      };
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const newCart = { ...prevCart };
      delete newCart[itemId];
      return newCart;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart => {
      const itemPrice = menuItems.find(item => item.id === itemId)?.price || 0; // Get price from menuItems
      return {
        ...prevCart,
        [itemId]: {
          id: itemId,
          quantity: quantity,
          price: itemPrice
        }
      };
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

```

Now, let's create the Order Summary page.

```typescript
import React from 'react';
import { useCart } from '../contexts/CartContext';
import MobileHeader from '../components/MobileHeader';

const OrderSummary = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const cartItems = Object.values(cart);

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <MobileHeader
        title="Order Summary"
        onBack={() => window.history.back()}
        cartCount={0} // No cart count on order summary page
      />

      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Order Details</h2>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <ul>
            {cartItems.map(item => (
              <li key={item.id} className="mb-4 border-b pb-2">
                <div className="flex items-center">
                  <span className="font-semibold">{menuItems.find(menuItem => menuItem.id === item.id)?.name}</span>
                  <div className="ml-auto flex items-center">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                    >
                      -
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="bg-red-200 hover:bg-red-300 px-2 py-1 rounded ml-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="text-gray-600">Price: ${item.price}</p>
                <p className="text-gray-600">Subtotal: ${item.quantity * item.price}</p>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Total Items: {getTotalItems()}</h3>
          <h3 className="text-xl font-semibold">Total Price: ${getTotalPrice()}</h3>
        </div>
        <button className="bg-green-500 text-white rounded px-4 py-2 mt-4">Checkout</button>
      </div>
    </div>
  );
};

export default OrderSummary;

```

Finally, I'll update the `App.tsx` to include the `CartProvider` and the `OrderSummary` route.

```typescript
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FoodMenu from './pages/FoodMenu';
import OrderSummary from './pages/OrderSummary';
import { CartProvider } from './contexts/CartContext';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<FoodMenu />} />
          <Route path="/order-summary" element={<OrderSummary />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
```

```
Created CartContext, OrderSummary component and updated App.tsx to include CartProvider and OrderSummary route.
```

```replit_final_file
import { useState } from "react";
import MobileHeader from "../components/MobileHeader";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import MenuItem from "../components/MenuItem";
import CheckoutBar from "../components/CheckoutBar";
import { useLocation, useNavigate } from 'react-router-dom';
import React, { createContext, useContext } from 'react';

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

interface CartContextType {
  cart: Record<string, CartItem>;
  addToCart: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Record<string, CartItem>>({});

  const addToCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart[itemId];
      const itemPrice = menuItems.find(item => item.id === itemId)?.price || 0; // Get price from menuItems
      return {
        ...prevCart,
        [itemId]: {
          id: itemId,
          quantity: existingItem ? existingItem.quantity + 1 : 1,
          price: itemPrice
        }
      };
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const newCart = { ...prevCart };
      delete newCart[itemId];
      return newCart;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart => {
      const itemPrice = menuItems.find(item => item.id === itemId)?.price || 0; // Get price from menuItems
      return {
        ...prevCart,
        [itemId]: {
          id: itemId,
          quantity: quantity,
          price: itemPrice
        }
      };
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

const OrderSummary = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const cartItems = Object.values(cart);

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <MobileHeader
        title="Order Summary"
        onBack={() => window.history.back()}
        cartCount={0} // No cart count on order summary page
      />

      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Order Details</h2>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <ul>
            {cartItems.map(item => (
              <li key={item.id} className="mb-4 border-b pb-2">
                <div className="flex items-center">
                  <span className="font-semibold">{menuItems.find(menuItem => menuItem.id === item.id)?.name}</span>
                  <div className="ml-auto flex items-center">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                    >
                      -
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="bg-red-200 hover:bg-red-300 px-2 py-1 rounded ml-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="text-gray-600">Price: ${item.price}</p>
                <p className="text-gray-600">Subtotal: ${item.quantity * item.price}</p>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Total Items: {getTotalItems()}</h3>
          <h3 className="text-xl font-semibold">Total Price: ${getTotalPrice()}</h3>
        </div>
        <button className="bg-green-500 text-white rounded px-4 py-2 mt-4">Checkout</button>
      </div>
    </div>
  );
};

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FoodMenu from './pages/FoodMenu';
import {CartProvider} from './contexts/CartContext'
import OrderSummary from './pages/OrderSummary';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<FoodMenu />} />
          <Route path="/order-summary" element={<OrderSummary />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;

export default function FoodMenu() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("drink");
  const {cart, addToCart} = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const setLocation = (path: string) => {
    navigate(path);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (itemId: string) => {
    addToCart(itemId);
  };

  const cartItems = Object.values(cart);

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  return (
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
  );
}