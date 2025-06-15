import { useState } from "react";
import MobileHeader from "../components/MobileHeader";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { usePoints } from "../contexts/PointsContext";

interface CategoryCard {
  id: string;
  title: string;
  icon: string;
  description: string;
  estimatedTime: string;
  points: string;
}

const categories: CategoryCard[] = [
  {
    id: "lifestyle",
    title: "Lifestyle & Shopping",
    icon: "🛍️",
    description: "Fashion, home decor, and smart shopping",
    estimatedTime: "2-3 min",
    points: "2-10 points"
  },
  {
    id: "digital",
    title: "Digital & Tech",
    icon: "💻",
    description: "Technology, apps, and digital innovations",
    estimatedTime: "2-3 min",
    points: "2-10 points"
  },
  {
    id: "food",
    title: "Food & Dining",
    icon: "🍽️",
    description: "Cuisine, cooking, and dining experiences",
    estimatedTime: "2-3 min",
    points: "2-10 points"
  }
];

const categoryRoutes: Record<string, string> = {
  lifestyle: "/lifestyle",
  digital: "/digital",
  food: "/food"
};

interface CategoryCardProps {
  category: CategoryCard;
  isSelected: boolean;
  onSelect: (categoryId: string) => void;
  onNavigate: (categoryId: string) => void;
}

function CategoryCardComponent({ category, isSelected, onSelect, onNavigate }: CategoryCardProps) {
  const { completedCategories } = usePoints();
  const isCompleted = completedCategories.includes(category.id);

  const handleClick = () => {
    onNavigate(category.id);
  };

  return (
    <div 
      className={`w-full cursor-pointer transition-all duration-200 hover:transform hover:scale-[1.01]`}
      onClick={handleClick}
    >
      <div className={`relative w-full rounded-lg border p-6 ${
        isCompleted
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}>
        {isCompleted && (
          <div className="absolute top-3 right-3">
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              ✓ Completed
            </span>
          </div>
        )}

        <div className="flex items-start space-x-4">
          <div className="text-3xl flex-shrink-0">
            {category.icon}
          </div>

          <div className="flex-1 text-left">
            <h3 className="text-lg font-medium mb-1 text-gray-900">
              {category.title}
            </h3>

            <p className="text-sm text-gray-600 mb-3">
              {category.description}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>⏱️ {category.estimatedTime}</span>
              <span>💰 {category.points}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button className={`w-full py-2 px-4 rounded-lg font-medium text-sm ${
            isCompleted
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}>
            {isCompleted ? 'Take Again' : 'Start Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Quiz() {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [, setLocation] = useLocation();
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const { totalPoints, availableRM, completedCategories } = usePoints();

  useEffect(() => {
    if (showCompletionModal) {
      const timer = setTimeout(() => {
        setLocation('/points');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCompletionModal, setLocation]);

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
    <div className="bg-gray-50 min-h-screen">
      <MobileHeader 
        title="Available Quizzes" 
      />

      <div className="p-6">
        {/* Stats Header */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Your Progress</p>
              <p className="text-lg font-semibold text-gray-900">
                {completedCategories.length}/3 Completed
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Available Money</p>
              <p className="text-lg font-semibold text-green-600">
                RM {availableRM}
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Complete Surveys & Earn Money
          </h2>
          <p className="text-gray-600 text-sm">
            Each quiz takes 2-3 minutes and earns you real money for food!
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

        {/* Bottom Info */}
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-800 mb-1">
            💡 <strong>Pro Tip:</strong> Complete all quizzes to maximize your earnings!
          </p>
          <p className="text-xs text-blue-600">
            10 points = RM 1.00 • Use your money to order food
          </p>
        </div>
      </div>
    </div>
  );
}