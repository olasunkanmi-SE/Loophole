
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import MobileContainer from '../components/MobileContainer';
import MobileHeader from '../components/MobileHeader';
import { 
  Bell, 
  FileText, 
  Megaphone, 
  Home, 
  Edit2, 
  Trash2, 
  Plus, 
  Save, 
  X,
  Eye,
  EyeOff,
  Calendar,
  MapPin
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  active: boolean;
  createdAt: string;
  expiresAt?: string;
}

interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  active: boolean;
  priority: number;
  startDate: string;
  endDate?: string;
}

interface HousingListing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  amenities: string[];
  type: string;
  available: boolean;
  contactInfo: {
    name: string;
    phone: string;
    email: string;
  };
}

interface TermsAndConditions {
  id: string;
  version: string;
  content: string;
  lastUpdated: string;
  updatedBy: string;
  active: boolean;
}

export default function AdminContent() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'notifications' | 'terms' | 'banners' | 'housing'>('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [housingListings, setHousingListings] = useState<HousingListing[]>([]);
  const [termsAndConditions, setTermsAndConditions] = useState<TermsAndConditions | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    expiresAt: ''
  });

  const [bannerForm, setBannerForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    ctaText: '',
    ctaLink: '',
    priority: 1,
    startDate: '',
    endDate: ''
  });

  const [housingForm, setHousingForm] = useState({
    title: '',
    description: '',
    price: 0,
    location: '',
    images: [''],
    amenities: [''],
    type: '',
    contactInfo: {
      name: '',
      phone: '',
      email: ''
    }
  });

  const [termsForm, setTermsForm] = useState({
    content: '',
    version: ''
  });

  useEffect(() => {
    fetchContentData();
  }, []);

  const fetchContentData = async () => {
    try {
      // Mock data - in production, fetch from API
      setNotifications([
        {
          id: '1',
          title: 'Welcome to EarnEats!',
          message: 'Complete surveys to earn points and order delicious food.',
          type: 'info',
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Maintenance Notice',
          message: 'The app will be under maintenance from 2-4 AM tomorrow.',
          type: 'warning',
          active: false,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString()
        }
      ]);

      setBanners([
        {
          id: '1',
          title: 'Summer Special Offer',
          description: 'Get 20% off on all orders above RM 50',
          imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=400&fit=crop',
          ctaText: 'Order Now',
          ctaLink: '/food-menu',
          active: true,
          priority: 1,
          startDate: new Date().toISOString()
        }
      ]);

      setHousingListings([
        {
          id: '1',
          title: 'Cozy Studio Apartment',
          description: 'Modern studio apartment near university campus',
          price: 35,
          location: 'Petaling Jaya, Selangor',
          images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop'],
          amenities: ['WiFi', 'Air Conditioning', 'Kitchen'],
          type: 'Studio',
          available: true,
          contactInfo: {
            name: 'John Doe',
            phone: '+60123456789',
            email: 'john@example.com'
          }
        }
      ]);

      setTermsAndConditions({
        id: '1',
        version: '1.0',
        content: `# Terms and Conditions

## 1. Acceptance of Terms
By using EarnEats, you agree to these terms and conditions.

## 2. User Accounts
Users must provide accurate information when creating accounts.

## 3. Points System
Points earned through surveys can be redeemed for food orders.

## 4. Privacy Policy
We protect user data according to our privacy policy.`,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'admin',
        active: true
      });

    } catch (error) {
      console.error('Error fetching content data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNotification = () => {
    if (!notificationForm.title || !notificationForm.message) {
      alert('Please fill all required fields');
      return;
    }

    const newNotification: Notification = {
      id: Date.now().toString(),
      ...notificationForm,
      active: true,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [newNotification, ...prev]);
    setNotificationForm({ title: '', message: '', type: 'info', expiresAt: '' });
    setShowForm(false);
  };

  const handleAddBanner = () => {
    if (!bannerForm.title || !bannerForm.description) {
      alert('Please fill all required fields');
      return;
    }

    const newBanner: Banner = {
      id: Date.now().toString(),
      ...bannerForm,
      active: true
    };

    setBanners(prev => [newBanner, ...prev]);
    setBannerForm({
      title: '',
      description: '',
      imageUrl: '',
      ctaText: '',
      ctaLink: '',
      priority: 1,
      startDate: '',
      endDate: ''
    });
    setShowForm(false);
  };

  const handleAddHousing = () => {
    if (!housingForm.title || !housingForm.description || housingForm.price <= 0) {
      alert('Please fill all required fields');
      return;
    }

    const newHousing: HousingListing = {
      id: Date.now().toString(),
      ...housingForm,
      available: true
    };

    setHousingListings(prev => [newHousing, ...prev]);
    setHousingForm({
      title: '',
      description: '',
      price: 0,
      location: '',
      images: [''],
      amenities: [''],
      type: '',
      contactInfo: { name: '', phone: '', email: '' }
    });
    setShowForm(false);
  };

  const handleUpdateTerms = () => {
    if (!termsForm.content || !termsForm.version) {
      alert('Please fill all required fields');
      return;
    }

    const updatedTerms: TermsAndConditions = {
      id: termsAndConditions?.id || '1',
      version: termsForm.version,
      content: termsForm.content,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin',
      active: true
    };

    setTermsAndConditions(updatedTerms);
    setShowForm(false);
  };

  const toggleItemStatus = (id: string, type: string) => {
    switch (type) {
      case 'notification':
        setNotifications(prev => prev.map(item => 
          item.id === id ? { ...item, active: !item.active } : item
        ));
        break;
      case 'banner':
        setBanners(prev => prev.map(item => 
          item.id === id ? { ...item, active: !item.active } : item
        ));
        break;
      case 'housing':
        setHousingListings(prev => prev.map(item => 
          item.id === id ? { ...item, available: !item.available } : item
        ));
        break;
    }
  };

  const deleteItem = (id: string, type: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    switch (type) {
      case 'notification':
        setNotifications(prev => prev.filter(item => item.id !== id));
        break;
      case 'banner':
        setBanners(prev => prev.filter(item => item.id !== id));
        break;
      case 'housing':
        setHousingListings(prev => prev.filter(item => item.id !== id));
        break;
    }
  };

  if (loading) {
    return (
      <MobileContainer>
        <div className="bg-white min-h-screen">
          <MobileHeader title="Content Management" onBack={() => setLocation('/admin/dashboard')} />
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </MobileContainer>
    );
  }

  const renderNotifications = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">App Notifications</h3>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingItem(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} />
          Add Notification
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map(notification => (
          <div key={notification.id} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{notification.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    notification.type === 'info' ? 'bg-blue-100 text-blue-800' :
                    notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    notification.type === 'success' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {notification.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    notification.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {notification.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleItemStatus(notification.id, 'notification')}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  {notification.active ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => deleteItem(notification.id, 'notification')}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBanners = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Promotional Banners</h3>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingItem(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} />
          Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {banners.map(banner => (
          <div key={banner.id} className="bg-white border rounded-lg overflow-hidden">
            {banner.imageUrl && (
              <img src={banner.imageUrl} alt={banner.title} className="w-full h-32 object-cover" />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{banner.title}</h4>
                  <p className="text-gray-600 text-sm mt-1">{banner.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      banner.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Priority: {banner.priority}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleItemStatus(banner.id, 'banner')}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    {banner.active ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => deleteItem(banner.id, 'banner')}
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
    </div>
  );

  const renderHousing = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Housing Listings</h3>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingItem(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} />
          Add Listing
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {housingListings.map(listing => (
          <div key={listing.id} className="bg-white border rounded-lg overflow-hidden">
            {listing.images[0] && (
              <img src={listing.images[0]} alt={listing.title} className="w-full h-32 object-cover" />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{listing.title}</h4>
                  <p className="text-gray-600 text-sm mt-1">{listing.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <MapPin size={14} />
                    {listing.location}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-semibold text-green-600">RM {listing.price}/night</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      listing.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {listing.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleItemStatus(listing.id, 'housing')}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    {listing.available ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => deleteItem(listing.id, 'housing')}
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
    </div>
  );

  const renderTerms = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Terms and Conditions</h3>
        <button
          onClick={() => {
            setShowForm(true);
            setTermsForm({
              content: termsAndConditions?.content || '',
              version: termsAndConditions?.version || ''
            });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Edit2 size={16} />
          Edit Terms
        </button>
      </div>

      {termsAndConditions && (
        <div className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-medium text-gray-900">Version {termsAndConditions.version}</h4>
              <p className="text-gray-600 text-sm">
                Last updated: {new Date(termsAndConditions.lastUpdated).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs ${
              termsAndConditions.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {termsAndConditions.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="bg-gray-50 p-3 rounded max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {termsAndConditions.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <MobileContainer>
      <div className="bg-gray-50 min-h-screen">
        <MobileHeader 
          title="Content Management" 
          onBack={() => setLocation('/admin/dashboard')}
        />

        <div className="p-4">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[
              { key: 'notifications', label: 'Notifications', icon: Bell },
              { key: 'banners', label: 'Banners', icon: Megaphone },
              { key: 'housing', label: 'Housing', icon: Home },
              { key: 'terms', label: 'Terms', icon: FileText }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                  activeTab === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-gray-50 rounded-lg p-4">
            {activeTab === 'notifications' && renderNotifications()}
            {activeTab === 'banners' && renderBanners()}
            {activeTab === 'housing' && renderHousing()}
            {activeTab === 'terms' && renderTerms()}
          </div>
        </div>

        {/* Forms Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {activeTab === 'notifications' && 'Add Notification'}
                {activeTab === 'banners' && 'Add Banner'}
                {activeTab === 'housing' && 'Add Housing Listing'}
                {activeTab === 'terms' && 'Edit Terms and Conditions'}
              </h2>

              {/* Notification Form */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <input
                      type="text"
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Message *</label>
                    <textarea
                      value={notificationForm.message}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg h-20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      value={notificationForm.type}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="success">Success</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expires At (Optional)</label>
                    <input
                      type="datetime-local"
                      value={notificationForm.expiresAt}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Banner Form */}
              {activeTab === 'banners' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <input
                      type="text"
                      value={bannerForm.title}
                      onChange={(e) => setBannerForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description *</label>
                    <textarea
                      value={bannerForm.description}
                      onChange={(e) => setBannerForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg h-20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Image URL</label>
                    <input
                      type="url"
                      value={bannerForm.imageUrl}
                      onChange={(e) => setBannerForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">CTA Text</label>
                      <input
                        type="text"
                        value={bannerForm.ctaText}
                        onChange={(e) => setBannerForm(prev => ({ ...prev, ctaText: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Priority</label>
                      <input
                        type="number"
                        min="1"
                        value={bannerForm.priority}
                        onChange={(e) => setBannerForm(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Terms Form */}
              {activeTab === 'terms' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Version *</label>
                    <input
                      type="text"
                      value={termsForm.version}
                      onChange={(e) => setTermsForm(prev => ({ ...prev, version: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="e.g., 1.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Content *</label>
                    <textarea
                      value={termsForm.content}
                      onChange={(e) => setTermsForm(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg h-40"
                      placeholder="Enter terms and conditions..."
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (activeTab === 'notifications') handleAddNotification();
                    else if (activeTab === 'banners') handleAddBanner();
                    else if (activeTab === 'housing') handleAddHousing();
                    else if (activeTab === 'terms') handleUpdateTerms();
                  }}
                  className="flex-1 p-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileContainer>
  );
}
