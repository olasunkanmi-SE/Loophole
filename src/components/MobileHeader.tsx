
import { ArrowLeft, ShoppingCart } from "lucide-react";

interface MobileHeaderProps {
  title?: string;
  onBack?: () => void;
  cartCount?: number;
}

export default function MobileHeader({ title = "Back", onBack, cartCount = 0 }: MobileHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-800 font-medium"
      >
        <ArrowLeft size={20} />
        {title}
      </button>
      
      <div className="relative">
        <button className="p-2 bg-gray-100 rounded-full">
          <ShoppingCart size={20} className="text-gray-600" />
        </button>
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </div>
    </header>
  );
}
