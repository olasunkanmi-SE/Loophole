
import { ArrowLeft, ShoppingCart, Menu } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import SlideMenu from "./SlideMenu";
import { useCart } from "../contexts/CartContext";

interface MobileHeaderProps {
  title?: string;
  onBack?: () => void;
  cartCount?: number;
}

export default function MobileHeader({ title = "Back", onBack, cartCount = 0 }: MobileHeaderProps) {
  const [, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  
  return (
    <>
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-800 font-medium"
        >
          <ArrowLeft size={20} />
          {title}
        </button>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <button 
              onClick={() => {
                const totalItems = getTotalItems();
                if (totalItems === 0) {
                  setLocation('/menu');
                } else {
                  setLocation('/order-summary');
                }
              }}
              className="p-2 bg-gray-100 rounded-full"
            >
              <ShoppingCart size={20} className="text-gray-600" />
            </button>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 bg-gray-100 rounded-full"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
        </div>
      </header>

      <SlideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />
    </>
  );
}
