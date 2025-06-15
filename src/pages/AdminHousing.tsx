
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import MobileContainer from '../components/MobileContainer';
import MobileHeader from '../components/MobileHeader';
import { 
  Home, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  MapPin, 
  Users, 
  Star,
  Save,
  X,
  Bed,
  Bath,
  Wifi,
  Car,
  Camera
} from 'lucide-react';

interface HousingListing {
  id: string;
  title: string;
  description: string;
  type: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  images: string[];
  amenities: string[];
  guests: number;
  bedrooms: number;
  bathrooms: number;
  host: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
    superhost: boolean;
  };
  available: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminHousing() {
  const [, setLocation] = useLocation();
  const [listings, setListings] = useState<HousingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingListing, setEditingListing] = useState<HousingListing | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'Entire apartment',
    location: '',
    price: 0,
    images: [''],
    amenities: [''],
    guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    host: {
      name: '',
      email: '',
      phone: '',
      avatar: '',
      superhost: false
    }
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      // Mock data - in production, fetch from API
      const mockListings: HousingListing[] = [
        {
          id: '1',
          title: 'Cozy Studio in City Center',
          description: 'Modern studio apartment in the heart of KL with easy access to public transport.',
          type: 'Entire apartment',
          location: 'Kuala Lumpur, Malaysia',
          price: 45.0,
          rating: 4.8,
          reviews: 127,
          images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'],
          amenities: ['WiFi', 'Kitchen', 'Air conditioning', 'TV'],
          guests: 2,
          bedrooms: 1,
          bathrooms: 1,
          host: {
            name: 'Sarah Chen',
            email: 'sarah@example.com',
            phone: '+60123456789',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
            superhost: true
          },
          available: true,
          featured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Budget Hostel Dorm Bed',
          description: 'Clean and safe hostel dorm perfect for budget travelers and students.',
          type: 'Shared room',
          location: 'Petaling Jaya, Malaysia',
          price: 15.0,
          rating: 4.2,
          reviews: 89,
          images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop'],
          amenities: ['WiFi', 'Shared kitchen', 'Lockers', 'Common area'],
          guests: 1,
          bedrooms: 1,
          bathrooms: 1,
          host: {
            name: 'Backpackers Inn',
            email: 'info@backpackersinn.com',
            phone: '+60198765432',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
            superhost: false
          },
          available: true,
          featured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setListings(mockListings);
    } catch (error) {
      console.error('Error fetching housing listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!form.title || !form.description || !form.location || form.price <= 0) {
      alert('Please fill all required fields');
      return;
    }

    const newListing: HousingListing = {
      id: editingListing?.id || Date.now().toString(),
      ...form,
      rating: editingListing?.rating || 0,
      reviews: editingListing?.reviews || 0,
      available: true,
      featured: false,
      createdAt: editingListing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingListing) {
      setListings(prev => prev.map(listing => 
        listing.id === editingListing.id ? newListing : listing
      ));
    } else {
      setListings(prev => [newListing, ...prev]);
    }

    resetForm();
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      type: 'Entire apartment',
      location: '',
      price: 0,
      images: [''],
      amenities: [''],
      guests: 1,
      bedrooms: 1,
      bathrooms: 1,
      host: {
        name: '',
        email: '',
        phone: '',
        avatar: '',
        superhost: false
      }
    });
    setEditingListing(null);
    setShowForm(false);
  };

  const handleEdit = (listing: HousingListing) => {
    setForm({
      title: listing.title,
      description: listing.description,
      type: listing.type,
      location: listing.location,
      price: listing.price,
      images: listing.images,
      amenities: listing.amenities,
      guests: listing.guests,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      host: listing.host
    });
    setEditingListing(listing);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      setListings(prev => prev.filter(listing => listing.id !== id));
    }
  };

  const toggleAvailability = (id: string) => {
    setListings(prev => prev.map(listing => 
      listing.id === id ? { ...listing, available: !listing.available } : listing
    ));
  };

  const toggleFeatured = (id: string) => {
    setListings(prev => prev.map(listing => 
      listing.id === id ? { ...listing, featured: !listing.featured } : listing
    ));
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || listing.type === filterType;
    return matchesSearch && matchesType;
  });

  const addImageField = () => {
    setForm(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index: number) => {
    setForm(prev => ({ 
      ...prev, 
      images: prev.images.filter((_, i) => i !== index) 
    }));
  };

  const updateImageField = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };

  const addAmenityField = () => {
    setForm(prev => ({ ...prev, amenities: [...prev.amenities, ''] }));
  };

  const removeAmenityField = (index: number) => {
    setForm(prev => ({ 
      ...prev, 
      amenities: prev.amenities.filter((_, i) => i !== index) 
    }));
  };

  const updateAmenityField = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.map((amenity, i) => i === index ? value : amenity)
    }));
  };

  if (loading) {
    return (
      <MobileContainer>
        <div className="bg-white min-h-screen">
          <MobileHeader title="Housing Management" onBack={() => setLocation('/admin/dashboard')} />
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="bg-gray-50 min-h-screen">
        <MobileHeader 
          title="Housing Management" 
          onBack={() => setLocation('/admin/dashboard')}
        />

        <div className="p-4">
          {/* Header Actions */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Housing Listings</h2>
              <p className="text-sm text-gray-600">{listings.length} total listings</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={16} />
              Add Listing
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="all">All Types</option>
                <option value="Entire apartment">Entire Apartment</option>
                <option value="Private room">Private Room</option>
                <option value="Shared room">Shared Room</option>
                <option value="Unique space">Unique Space</option>
              </select>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="space-y-4">
            {filteredListings.map(listing => (
              <div key={listing.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="flex">
                  {/* Image */}
                  <img
                    src={listing.images[0] || 'https://via.placeholder.com/120x120'}
                    alt={listing.title}
                    className="w-24 h-24 object-cover"
                  />
                  
                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                        <p className="text-sm text-gray-600">{listing.type}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-500">{listing.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">RM {listing.price}</p>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-500 fill-current" />
                          <span className="text-xs">{listing.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users size={12} />
                        <span>{listing.guests}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed size={12} />
                        <span>{listing.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath size={12} />
                        <span>{listing.bathrooms}</span>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex gap-2 mb-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        listing.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {listing.available ? 'Available' : 'Unavailable'}
                      </span>
                      {listing.featured && (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      )}
                      {listing.host.superhost && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          Superhost
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(listing)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => toggleAvailability(listing.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                      >
                        {listing.available ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => toggleFeatured(listing.id)}
                        className={`p-2 rounded ${
                          listing.featured ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Star size={16} className={listing.featured ? 'fill-current' : ''} />
                      </button>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredListings.length === 0 && (
              <div className="text-center py-8">
                <Home size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No housing listings found</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-2 text-blue-600 hover:underline"
                >
                  Add your first listing
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {editingListing ? 'Edit Listing' : 'Add New Listing'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Enter listing title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg h-20"
                    placeholder="Describe the accommodation"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="Entire apartment">Entire Apartment</option>
                      <option value="Private room">Private Room</option>
                      <option value="Shared room">Shared Room</option>
                      <option value="Unique space">Unique Space</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price (RM) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Location *</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="City, State, Country"
                  />
                </div>

                {/* Property Details */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Guests</label>
                    <input
                      type="number"
                      min="1"
                      value={form.guests}
                      onChange={(e) => setForm(prev => ({ ...prev, guests: parseInt(e.target.value) || 1 }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bedrooms</label>
                    <input
                      type="number"
                      min="1"
                      value={form.bedrooms}
                      onChange={(e) => setForm(prev => ({ ...prev, bedrooms: parseInt(e.target.value) || 1 }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bathrooms</label>
                    <input
                      type="number"
                      min="1"
                      value={form.bathrooms}
                      onChange={(e) => setForm(prev => ({ ...prev, bathrooms: parseInt(e.target.value) || 1 }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Images */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Images</label>
                    <button
                      type="button"
                      onClick={addImageField}
                      className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add Image
                    </button>
                  </div>
                  {form.images.map((image, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => updateImageField(index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded"
                        placeholder="Image URL"
                      />
                      {form.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Amenities */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Amenities</label>
                    <button
                      type="button"
                      onClick={addAmenityField}
                      className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add Amenity
                    </button>
                  </div>
                  {form.amenities.map((amenity, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={amenity}
                        onChange={(e) => updateAmenityField(index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded"
                        placeholder="e.g., WiFi, Kitchen, Pool"
                      />
                      {form.amenities.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAmenityField(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Host Info */}
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Host Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Host Name</label>
                      <input
                        type="text"
                        value={form.host.name}
                        onChange={(e) => setForm(prev => ({ 
                          ...prev, 
                          host: { ...prev.host, name: e.target.value }
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="Host name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                          type="email"
                          value={form.host.email}
                          onChange={(e) => setForm(prev => ({ 
                            ...prev, 
                            host: { ...prev.host, email: e.target.value }
                          }))}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          placeholder="host@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input
                          type="tel"
                          value={form.host.phone}
                          onChange={(e) => setForm(prev => ({ 
                            ...prev, 
                            host: { ...prev.host, phone: e.target.value }
                          }))}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          placeholder="+60123456789"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Avatar URL</label>
                      <input
                        type="url"
                        value={form.host.avatar}
                        onChange={(e) => setForm(prev => ({ 
                          ...prev, 
                          host: { ...prev.host, avatar: e.target.value }
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="Host avatar image URL"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="superhost"
                        checked={form.host.superhost}
                        onChange={(e) => setForm(prev => ({ 
                          ...prev, 
                          host: { ...prev.host, superhost: e.target.checked }
                        }))}
                        className="mr-2"
                      />
                      <label htmlFor="superhost" className="text-sm">Superhost</label>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={resetForm}
                    className="flex-1 p-3 border border-gray-300 rounded-lg text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 p-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    {editingListing ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileContainer>
  );
}
