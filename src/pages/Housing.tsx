import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { MapPin, Star, Heart, Users, Bed, Bath, Filter, X, CheckCircle } from 'lucide-react';
import MobileContainer from '../components/MobileContainer';
import MobileHeader from '../components/MobileHeader';
import { usePoints } from '../contexts/PointsContext';

interface Accommodation {
  id: string;
  title: string;
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
    avatar: string;
    superhost: boolean;
  };
  description: string;
  available: boolean;
}

const accommodations: Accommodation[] = [
  {
    id: '1',
    title: 'Cozy Studio in City Center',
    type: 'Entire apartment',
    location: 'Kuala Lumpur, Malaysia',
    price: 45.00,
    rating: 4.8,
    reviews: 127,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'],
    amenities: ['WiFi', 'Kitchen', 'Air conditioning', 'TV'],
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    host: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      superhost: true
    },
    description: 'Modern studio apartment in the heart of KL with easy access to public transport.',
    available: true
  },
  {
    id: '2',
    title: 'Budget Hostel Dorm Bed',
    type: 'Shared room',
    location: 'Petaling Jaya, Malaysia',
    price: 15.00,
    rating: 4.2,
    reviews: 89,
    images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop'],
    amenities: ['WiFi', 'Shared kitchen', 'Lockers', 'Common area'],
    guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    host: {
      name: 'Backpackers Inn',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      superhost: false
    },
    description: 'Clean and safe hostel dorm perfect for budget travelers and students.',
    available: true
  },
  {
    id: '3',
    title: 'Private Room with Breakfast',
    type: 'Private room',
    location: 'Subang Jaya, Malaysia',
    price: 35.00,
    rating: 4.6,
    reviews: 156,
    images: ['https://images.unsplash.com/photo-1540518614846-7eded1004032?w=400&h=300&fit=crop'],
    amenities: ['WiFi', 'Breakfast included', 'Private bathroom', 'Parking'],
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    host: {
      name: 'Ahmad Rahman',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      superhost: true
    },
    description: 'Comfortable private room in family home with delicious local breakfast included.',
    available: true
  },
  {
    id: '4',
    title: 'Luxury Condo with Pool',
    type: 'Entire apartment',
    location: 'KLCC, Kuala Lumpur',
    price: 85.00,
    rating: 4.9,
    reviews: 203,
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop'],
    amenities: ['WiFi', 'Pool', 'Gym', 'Concierge', 'City view'],
    guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    host: {
      name: 'Elite Properties',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face',
      superhost: true
    },
    description: 'Stunning luxury apartment with panoramic city views and premium amenities.',
    available: true
  },
  {
    id: '5',
    title: 'Student Housing Single Room',
    type: 'Private room',
    location: 'USJ, Selangor',
    price: 25.00,
    rating: 4.3,
    reviews: 67,
    images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop'],
    amenities: ['WiFi', 'Study desk', 'Shared kitchen', 'Laundry'],
    guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    host: {
      name: 'Student Living Co.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      superhost: false
    },
    description: 'Perfect for students with study-friendly environment and affordable rates.',
    available: true
  },
  {
    id: '6',
    title: 'Capsule Pod Experience',
    type: 'Unique space',
    location: 'Bukit Bintang, KL',
    price: 20.00,
    rating: 4.1,
    reviews: 45,
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'],
    amenities: ['WiFi', 'Climate control', 'Charging ports', 'Security'],
    guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    host: {
      name: 'Pod Hotels',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      superhost: false
    },
    description: 'Futuristic capsule hotel experience in the heart of entertainment district.',
    available: true
  }
];

export default function Housing() {
  const [, setLocation] = useLocation();
  const { getTotalPoints, getFormattedRM } = usePoints();
  const [selectedListing, setSelectedListing] = useState<Accommodation | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<number>(100);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false); // new state for detail modal

  const availableRM = parseFloat(getFormattedRM().replace('RM ', ''));

  const filteredAccommodations = accommodations.filter(acc => 
    acc.price <= priceFilter && acc.available
  );

  const affordableAccommodations = accommodations.filter(acc => 
    acc.price <= availableRM && acc.available
  );

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const handleBooking = (accommodation: Accommodation) => {
    if (accommodation.price <= availableRM) {
      setSelectedListing(accommodation);
      setShowBookingModal(true);
    }
  };

  const confirmBooking = () => {
    // Here you would integrate with the points system to deduct the cost
    setShowBookingModal(false);
    setSelectedListing(null);
    // For now, just show success
    alert('Booking confirmed! Points will be deducted from your balance.');
  };

  return (
    <MobileContainer>
      <>
        <div className="bg-gray-50 min-h-screen">
          <MobileHeader 
            title="Housing" 
            onBack={() => setLocation('/')}
          />

        {/* Budget Summary */}
        <div className="px-4 py-3 bg-white border-b">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Available Budget</p>
              <p className="text-lg font-bold text-green-600">{getFormattedRM()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Affordable Options</p>
              <p className="text-lg font-bold text-blue-600">{affordableAccommodations.length} places</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 bg-white border-b">
          <div className="flex items-center gap-3">
            <Filter size={16} className="text-gray-500" />
            <div className="flex-1">
              <label className="text-sm text-gray-600">Max Price: RM {priceFilter}</label>
              <input
                type="range"
                min="10"
                max="100"
                value={priceFilter}
                onChange={(e) => setPriceFilter(Number(e.target.value))}
                className="w-full mt-1"
              />
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="px-4 py-4 space-y-4">
          {filteredAccommodations.map((accommodation) => (
            <div key={accommodation.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div 
                  className="relative cursor-pointer"
                  onClick={() => {
                    setSelectedListing(accommodation);
                    setShowDetailModal(true);
                  }}
                >
              {/* Image */}
              <div className="relative">
                <img 
                  src={accommodation.images[0]} 
                  alt={accommodation.title}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => toggleFavorite(accommodation.id)}
                  className="absolute top-3 right-3 p-2 bg-white/80 rounded-full"
                >
                  <Heart 
                    size={16} 
                    className={favorites.includes(accommodation.id) ? 'text-red-500 fill-current' : 'text-gray-600'}
                  />
                </button>
                {accommodation.host.superhost && (
                  <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full">
                    <span className="text-xs font-medium text-gray-900">Superhost</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{accommodation.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">{accommodation.type}</p>
                    <div className="flex items-center gap-1 mb-2">
                      <MapPin size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-500">{accommodation.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star size={12} className="text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{accommodation.rating}</span>
                      <span className="text-xs text-gray-500">({accommodation.reviews})</span>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users size={12} />
                    <span>{accommodation.guests} guests</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bed size={12} />
                    <span>{accommodation.bedrooms} bed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath size={12} />
                    <span>{accommodation.bathrooms} bath</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {accommodation.amenities.slice(0, 3).map((amenity, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {amenity}
                    </span>
                  ))}
                  {accommodation.amenities.length > 3 && (
                    <span className="text-xs text-gray-500">+{accommodation.amenities.length - 3} more</span>
                  )}
                </div>

                {/* Price and Booking */}
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-bold text-gray-900">RM {accommodation.price.toFixed(2)}</span>
                    <span className="text-sm text-gray-600"> / night</span>
                  </div>
                  <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBooking(accommodation);
                  }}
                  disabled={accommodation.price > availableRM}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    accommodation.price <= availableRM
                      ? 'bg-pink-600 text-white hover:bg-pink-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {accommodation.price <= availableRM ? 'Book Now' : 'Insufficient Budget'}
                  </button>
                </div>

                {accommodation.price <= availableRM && (
                  <div className="mt-2 text-xs text-green-600 font-medium">
                    ✓ Within your budget
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredAccommodations.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">🏠</div>
              <p className="text-gray-600">No accommodations found within your price range.</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or complete more surveys to earn more points!</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedListing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
            <div className="bg-white rounded-t-2xl w-full max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-bold">{selectedListing.title}</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Image */}
                <img 
                  src={selectedListing.images[0]} 
                  alt={selectedListing.title}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />

                {/* Basic Info */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-gray-600 text-sm">{selectedListing.type}</p>
                      <p className="text-gray-800 font-medium">{selectedListing.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-500 fill-current" />
                        <span className="font-medium">{selectedListing.rating}</span>
                        <span className="text-gray-500 text-sm">({selectedListing.reviews})</span>
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{selectedListing.guests} guests</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bed size={16} />
                      <span>{selectedListing.bedrooms} bedroom{selectedListing.bedrooms > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath size={16} />
                      <span>{selectedListing.bathrooms} bath{selectedListing.bathrooms > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <h3 className="font-medium mb-2">About this place</h3>
                  <p className="text-gray-700 text-sm">{selectedListing.description}</p>
                </div>

                {/* Amenities */}
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Amenities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedListing.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle size={16} className="text-green-500" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Host */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Hosted by</h3>
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedListing.host.avatar} 
                      alt={selectedListing.host.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{selectedListing.host.name}</p>
                      {selectedListing.host.superhost && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Superhost
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price and Book */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold">RM {selectedListing.price.toFixed(2)}</span>
                      <span className="text-gray-600"> / night</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Your Budget: {getFormattedRM()}</p>
                      {selectedListing.price <= availableRM ? (
                        <p className="text-sm text-green-600">✓ Affordable</p>
                      ) : (
                        <p className="text-sm text-red-600">× Over budget</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleBooking(selectedListing);
                    }}
                    disabled={selectedListing.price > availableRM}
                    className={`w-full py-3 px-4 rounded-lg font-medium ${
                      selectedListing.price <= availableRM
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {selectedListing.price <= availableRM ? 'Reserve Now' : 'Insufficient Budget'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Confirmation Modal */}
        {showBookingModal && selectedListing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="font-bold text-lg mb-4">Confirm Booking</h3>
              <div className="space-y-3 mb-6">
                <div>
                  <p className="font-medium">{selectedListing.title}</p>
                  <p className="text-sm text-gray-600">{selectedListing.location}</p>
                </div>
                <div className="flex justify-between">
                  <span>Price per night:</span>
                  <span className="font-medium">RM {selectedListing.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Your balance:</span>
                  <span className="font-medium">{getFormattedRM()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>After booking:</span>
                  <span className="font-medium">RM {(availableRM - selectedListing.price).toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    </MobileContainer>
  );
}