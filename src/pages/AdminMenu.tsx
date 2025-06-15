
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Upload, Eye, EyeOff, Save, X } from 'lucide-react';
import MobileContainer from '../components/MobileContainer';
import MobileHeader from '../components/MobileHeader';
import { useLocation } from 'wouter';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

interface Category {
  id: string;
  name: string;
}

const defaultCategories: Category[] = [
  { id: "drink", name: "Drink" },
  { id: "meat", name: "Meat" },
  { id: "chicken", name: "Chicken" },
  { id: "seafood", name: "Seafood" },
];

const defaultMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Grilled Rack of Lamb",
    description: "rack of lamb, perfectly seasoned and marinated...",
    price: 20,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop",
    category: "meat",
    available: true
  },
  {
    id: "2", 
    name: "Maple Bourbon Glazed Salmon",
    description: "A classic combination of sweet and savory never...",
    price: 20,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop",
    category: "seafood",
    available: true
  },
  {
    id: "4",
    name: "Blood Orange Cocktail",
    description: "This blood orange cocktail is refreshing and...",
    price: 12,
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop",
    category: "drink",
    available: true
  },
  {
    id: "10",
    name: "Herb Roasted Chicken",
    description: "Free-range chicken with rosemary and thyme",
    price: 16,
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=400&fit=crop",
    category: "chicken",
    available: true
  }
];

export default function AdminMenu() {
  const [, setLocation] = useLocation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ id: '', name: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const [itemForm, setItemForm] = useState({
    id: '',
    name: '',
    description: '',
    price: 0,
    image: '',
    category: 'drink',
    available: true
  });

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = () => {
    setItemForm({
      id: '',
      name: '',
      description: '',
      price: 0,
      image: '',
      category: 'drink',
      available: true
    });
    setEditingItem(null);
    setShowItemForm(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setItemForm(item);
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleSaveItem = () => {
    if (!itemForm.name || !itemForm.description || itemForm.price <= 0) {
      alert('Please fill all required fields');
      return;
    }

    if (editingItem) {
      // Update existing item
      setMenuItems(prev => prev.map(item => 
        item.id === editingItem.id ? { ...itemForm } : item
      ));
    } else {
      // Add new item
      const newItem = {
        ...itemForm,
        id: Date.now().toString()
      };
      setMenuItems(prev => [...prev, newItem]);
    }

    setShowItemForm(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      setMenuItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const toggleItemAvailability = (id: string) => {
    setMenuItems(prev => prev.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
  };

  const handleAddCategory = () => {
    if (!newCategory.name) {
      alert('Please enter category name');
      return;
    }

    const categoryId = newCategory.name.toLowerCase().replace(/\s+/g, '_');
    const category = {
      id: categoryId,
      name: newCategory.name
    };

    setCategories(prev => [...prev, category]);
    setNewCategory({ id: '', name: '' });
    setShowCategoryForm(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('Are you sure? This will also remove all items in this category.')) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      setMenuItems(prev => prev.filter(item => item.category !== categoryId));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setItemForm(prev => ({ ...prev, image: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <MobileContainer>
      <div className="bg-gray-50 min-h-screen">
        <MobileHeader 
          title="Menu Management" 
          onBack={() => setLocation('/admin')}
        />

        <div className="p-4">
          {/* Search and Actions */}
          <div className="mb-4 space-y-3">
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            
            <div className="flex gap-2">
              <button
                onClick={handleAddItem}
                className="flex-1 bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Item
              </button>
              <button
                onClick={() => setShowCategoryForm(true)}
                className="flex-1 bg-green-600 text-white p-3 rounded-lg flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Category
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  selectedCategory === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 border'
                }`}
              >
                All ({menuItems.length})
              </button>
              {categories.map(category => {
                const count = menuItems.filter(item => item.category === category.id).length;
                return (
                  <div key={category.id} className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-full whitespace-nowrap ${
                        selectedCategory === category.id 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-600 border'
                      }`}
                    >
                      {category.name} ({count})
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border">
                <div className="relative">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => toggleItemAvailability(item.id)}
                      className={`p-1 rounded ${
                        item.available 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {item.available ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <span className="font-bold text-blue-600">RM {item.price}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No menu items found
            </div>
          )}
        </div>

        {/* Item Form Modal */}
        {showItemForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg h-20"
                    placeholder="Enter item description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Price (RM) *</label>
                  <input
                    type="number"
                    value={itemForm.price}
                    onChange={(e) => setItemForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  {itemForm.image && (
                    <img 
                      src={itemForm.image} 
                      alt="Preview" 
                      className="mt-2 w-full h-32 object-cover rounded"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={itemForm.available}
                    onChange={(e) => setItemForm(prev => ({ ...prev, available: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="available" className="text-sm font-medium">
                    Available for order
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowItemForm(false)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveItem}
                  className="flex-1 p-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Form Modal */}
        {showCategoryForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add New Category</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Enter category name"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCategoryForm(false)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="flex-1 p-3 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Add Category
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileContainer>
  );
}
