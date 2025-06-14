import { useState } from "react";
import MobileHeader from "../components/MobileHeader";

interface CategoryCard {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  borderColor: string;
}

const categories: CategoryCard[] = [
  {
    id: "lifestyle",
    title: "Lifestyle & Shopping",
    icon: "🛍️",
    description: "Discover trends in fashion, home decor, and smart shopping habits",
    color: "bg-pink-100",
    borderColor: "border-pink-300"
  },
  {
    id: "digital",
    title: "Digital & Tech",
    icon: "💻",
    description: "Explore the latest in technology, apps, and digital innovations",
    color: "bg-blue-100",
    borderColor: "border-blue-300"
  },
  {
    id: "food",
    title: "Food & Dining",
    icon: "🍽️",
    description: "Learn about cuisine, cooking techniques, and dining experiences",
    color: "bg-green-100",
    borderColor: "border-green-300"
  }
];

interface CategoryCardProps {
  category: CategoryCard;
  isSelected: boolean;
  onSelect: (categoryId: string) => void;
}

function CategoryCardComponent({ category, isSelected, onSelect }: CategoryCardProps) {
  return (
    <div 
      className={`w-full h-48 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        isSelected ? 'scale-105 shadow-xl' : 'shadow-lg'
      }`}
      onClick={() => onSelect(category.id)}
    >
      <div className={`relative w-full h-full rounded-xl border-2 ${category.color} ${category.borderColor} p-6 flex flex-col justify-center items-center text-center ${
        isSelected ? 'ring-4 ring-blue-300' : ''
      }`}>
        {isSelected && (
          <div className="absolute top-3 right-3 text-green-500 text-xl">
            ✅
          </div>
        )}

        <div className="text-5xl mb-4">
          {category.icon}
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-3">
          {category.title}
        </h3>

        <p className="text-sm text-gray-600 leading-relaxed">
          {category.description}
        </p>

        {!isSelected && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-white bg-opacity-80 text-gray-700 text-xs px-3 py-1 rounded-full">
              Tap to select
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Quiz() {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

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

  const resetSelection = () => {
    setSelectedCategories(new Set());
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <MobileHeader 
        title="Interest Categories" 
        onBack={() => window.history.back()}
      />

      <div className="p-4">
        {/* Header */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Choose Your Interests
          </h2>
          <p className="text-gray-600 text-sm">
            Select the categories that match your interests
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600">Selected</span>
            <span className="text-sm text-gray-600">
              {selectedCategories.size}/{categories.length} categories
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(selectedCategories.size / categories.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Category Cards */}
        <div className="space-y-6">
          {categories.map((category) => (
            <CategoryCardComponent
              key={category.id}
              category={category}
              isSelected={selectedCategories.has(category.id)}
              onSelect={handleCategorySelect}
            />
          ))}
        </div>

        {/* Action Buttons */}
        {selectedCategories.size > 0 && (
          <div className="bg-white rounded-lg p-4 mt-6 shadow-sm">
            <div className="flex gap-3">
              <button
                onClick={resetSelection}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Clear All
              </button>
              <button
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Continue ({selectedCategories.size})
              </button>
            </div>
          </div>
        )}

        {/* Completion Message */}
        {selectedCategories.size === categories.length && (
          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-6 mt-4 text-center border-2 border-green-200">
            <div className="text-3xl mb-2">🎉</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              All Categories Selected!
            </h3>
            <p className="text-gray-600 text-sm">
              You've selected all interest categories. Great choice!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}