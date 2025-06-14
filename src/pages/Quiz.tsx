import { useState } from "react";
import MobileHeader from "../components/MobileHeader";
import { useLocation } from "wouter";

interface CategoryCard {
  id: string;
  title: string;
  icon: string;
  description: string;
}

const categories: CategoryCard[] = [
  {
    id: "lifestyle",
    title: "Lifestyle & Shopping",
    icon: "🛍️",
    description: "Fashion, home decor, and smart shopping"
  },
  {
    id: "digital",
    title: "Digital & Tech",
    icon: "💻",
    description: "Technology, apps, and digital innovations"
  },
  {
    id: "food",
    title: "Food & Dining",
    icon: "🍽️",
    description: "Cuisine, cooking, and dining experiences"
  }
];

const categoryRoutes: Record<string, string> = {
  lifestyle: "/questionnaire/lifestyle",
  digital: "/questionnaire/digital",
  food: "/questionnaire/food"
};

interface CategoryCardProps {
  category: CategoryCard;
  isSelected: boolean;
  onSelect: (categoryId: string) => void;
  onNavigate: (categoryId: string) => void;
}

function CategoryCardComponent({ category, isSelected, onSelect, onNavigate }: CategoryCardProps) {
  const handleClick = () => {
    onNavigate(category.id);
  };

  return (
    <div 
      className={`w-full cursor-pointer transition-all duration-200 hover:transform hover:scale-[1.01]`}
      onClick={handleClick}
    >
      <div className={`relative w-full rounded-lg border p-6 text-center ${
        isSelected 
          ? 'bg-gray-900 text-white border-gray-900' 
          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
      }`}>
        <div className="text-3xl mb-3">
          {category.icon}
        </div>

        <h3 className="text-lg font-medium mb-2">
          {category.title}
        </h3>

        <p className={`text-sm ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
          {category.description}
        </p>
      </div>
    </div>
  );
}

export default function Quiz() {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [, setLocation] = useLocation();

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleCategoryNavigate = (categoryId: string) => {
    const route = categoryRoutes[categoryId];
    if (route) {
      setLocation(route);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <MobileHeader 
        title="Interests" 
        onBack={() => window.history.back()}
      />

      <div className="p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-light text-gray-900 mb-2">
            Choose Your Interests
          </h2>
          <p className="text-gray-500">
            Select categories that match your preferences
          </p>
        </div>

        {/* Category Cards */}
        <div className="space-y-4 mb-8">
          {categories.map((category) => (
            <CategoryCardComponent
              key={category.id}
              category={category}
              isSelected={selectedCategories.has(category.id)}
              onSelect={handleCategorySelect}
              onNavigate={handleCategoryNavigate}
            />
          ))}
        </div>

        
      </div>
    </div>
  );
}