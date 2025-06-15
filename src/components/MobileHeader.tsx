import { ArrowLeft, ShoppingCart, Menu } from "lucide-react";
import { usePoints } from "../contexts/PointsContext";

interface MobileHeaderProps {
  title: string;
  onBack?: () => void;
  cartCount?: number;
  onMenuClick?: () => void;
}

export default function MobileHeader({ title, onBack, cartCount = 0, onMenuClick }: MobileHeaderProps) {
  const { getTotalPoints, getFormattedRM } = usePoints();
  const totalPoints = getTotalPoints();

  return (
    <div className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
      <div className="flex items-center">
        {onBack && (
          <button onClick={onBack} className="mr-3">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
        )}
        <h1 className="text-lg font-medium text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center space-x-3">
        {/* Points Display */}
        {totalPoints > 0 && (
          <div className="flex items-center bg-blue-50 px-2 py-1 rounded-full">
            <span className="text-xs font-medium text-blue-700">
              {totalPoints}pts
            </span>
            <span className="text-xs text-blue-600 ml-1">
              ({getFormattedRM()})
            </span>
          </div>
        )}

        {/* Cart */}
        {cartCount > 0 && (
          <div className="relative">
            <ShoppingCart size={20} className="text-gray-600" />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </div>
          </div>
        )}

        {onMenuClick && (
          <button onClick={onMenuClick}>
            <Menu size={20} className="text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
}