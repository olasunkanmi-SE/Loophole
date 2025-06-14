
import { Plus } from "lucide-react";
import { useLocation } from "wouter";

interface MenuItemProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  onAddToCart?: (id: string) => void;
}

export default function MenuItem({ id, name, description, price, image, onAddToCart }: MenuItemProps) {
  const [, setLocation] = useLocation();

  const handleItemClick = () => {
    setLocation(`/menu/${id}`);
  };

  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4 cursor-pointer"
      onClick={handleItemClick}
    >
      <div className="aspect-square relative">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 text-lg leading-tight">
          {name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 leading-relaxed">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-gray-800">
            RM {price}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(id);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
