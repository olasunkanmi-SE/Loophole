interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

export default function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const handleCategoryClick = (categoryId: string) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  const getButtonClasses = (categoryId: string) => {
    return `px-6 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
      activeCategory === categoryId
        ? "bg-orange-500 text-white"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`;
  };

  return (
    <div className="px-4 py-2">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={getButtonClasses(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
