import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabase/client";
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

// Define the Bridge interface
interface Bridge {
  id: number;
  created_at: string;
  title: string;
  note?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
}

// Google Map types
interface LatLngLiteral {
  lat: number;
  lng: number;
}

const mapContainerStyle = {
  height: "100%",
  width: "100%",
};


// Default center (e.g., a central point in Malaysia or a global default)
const defaultCenter = { lat: 3.1390, lng: 101.6869 }; // Kuala Lumpur

export default function Home() {
  const [showAddBridgePopup, setShowAddBridgePopup] = useState(false);
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [loadingBridges, setLoadingBridges] = useState(true);
  const [errorBridges, setErrorBridges] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [userLocation, setUserLocation] = useState<LatLngLiteral | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [mapCenter, setMapCenter] = useState<LatLngLiteral>(defaultCenter);
  const [mapZoom, setMapZoom] = useState(7); // Initial zoom

  // For InfoWindow
  const [selectedBridge, setSelectedBridge] = useState<Bridge | null>(null);

  // Form state
  const [newBridgeTitle, setNewBridgeTitle] = useState("");
  const [newBridgeNote, setNewBridgeNote] = useState("");
  const [newBridgeLat, setNewBridgeLat] = useState("");
  const [newBridgeLng, setNewBridgeLng] = useState("");
  const [newBridgeImageUrl, setNewBridgeImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const fetchBridges = async () => {
      setLoadingBridges(true);
      setErrorBridges(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from("bridges")
          .select("*");
        if (supabaseError) throw supabaseError;
        setBridges(data || []);
      } catch (err: any) {
        setErrorBridges(err.message);
        console.error("Error fetching bridges:", err);
      } finally {
        setLoadingBridges(false);
      }
    };
    fetchBridges();
  }, []);

  const filteredBridges = bridges.filter(bridge =>
    bridge.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
      setMapZoom(13);
    } else if (filteredBridges.length > 0) {
      // Optionally, center on the first filtered bridge if no user location
      // For now, let's keep it simple and not auto-center on filtered bridges unless explicitly desired
    } else {
      setMapCenter(defaultCenter);
      setMapZoom(7);
    }
  }, [userLocation, filteredBridges.length]); // Removed filteredBridges from deps to avoid too many recenters

  const handleAddBridgeClick = () => setShowAddBridgePopup(true);

  const handleClosePopup = () => {
    setShowAddBridgePopup(false);
    setNewBridgeTitle("");
    setNewBridgeNote("");
    setNewBridgeLat("");
    setNewBridgeLng("");
    setNewBridgeImageUrl("");
  };

  const handleSaveBridge = async () => {
    if (!newBridgeTitle || !newBridgeLat || !newBridgeLng) {
      alert("Title, Latitude, and Longitude are required.");
      return;
    }
    const lat = parseFloat(newBridgeLat);
    const lng = parseFloat(newBridgeLng);
    if (isNaN(lat) || isNaN(lng)) {
      alert("Latitude and Longitude must be valid numbers.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("bridges")
        .insert([{
          title: newBridgeTitle,
          note: newBridgeNote,
          latitude: lat,
          longitude: lng,
          image_url: newBridgeImageUrl || null
        }])
        .select();
      if (error) throw error;
      if (data) setBridges(prevBridges => [...prevBridges, ...data]);
      handleClosePopup();
    } catch (error: any) {
      console.error("Error saving bridge:", error);
      alert("Failed to save bridge: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocatingUser(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocatingUser(false);
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}`);
        setLocatingUser(false);
      }
    );
  };
  
  const onMapLoad = useCallback((map: google.maps.Map) => {
    // You can save the map instance to a ref here if needed for more complex interactions
    // const mapRef = React.useRef<google.maps.Map | null>(null);
    // mapRef.current = map;
    console.log('Map loaded:', map);
  }, []);

  if (!googleMapsApiKey) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-xl p-4">
        Google Maps API Key is missing. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen antialiased text-gray-800">
      {/* Top Bar */}
      <div className="bg-white p-3 sm:p-4 shadow-lg border-b border-gray-200">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <input
            type="text"
            placeholder="Search bridges by title..."
            className="p-2.5 border border-gray-300 rounded-lg w-full sm:flex-grow focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleLocateUser}
              disabled={locatingUser || isSubmitting}
              className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg w-full sm:w-auto transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
              {locatingUser ? "Locating..." : "My Location"}
            </button>
            <button
              onClick={handleAddBridgeClick}
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg w-full sm:w-auto transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              Add Bridge
            </button>
          </div>
        </div>
        {locationError && <p className="text-red-600 text-sm text-center mt-2 bg-red-100 p-2 rounded-md">Error: {locationError}</p>}
      </div>

      {/* Map Area */}
      <div className="flex-grow relative">
        {loadingBridges && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-500 bg-opacity-20 z-10 backdrop-blur-sm">
            <div className="text-lg font-semibold text-gray-700">Loading Bridge Data...</div>
          </div>
        )}
        {errorBridges && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-700 z-10 p-4">
            <p className="font-semibold">Error loading bridges: {errorBridges}</p>
          </div>
        )}
        
        <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={['places']}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={mapZoom}
            onLoad={onMapLoad}
            onClick={() => setSelectedBridge(null)} // Close InfoWindow when map is clicked
          >
            {filteredBridges.map((bridge) => (
              <Marker
                key={bridge.id}
                position={{ lat: bridge.latitude, lng: bridge.longitude }}
                onClick={() => setSelectedBridge(bridge)}
              />
            ))}

            {selectedBridge && (
              <InfoWindow
                position={{ lat: selectedBridge.latitude, lng: selectedBridge.longitude }}
                onCloseClick={() => setSelectedBridge(null)}
              >
                <div className="text-sm font-sans p-1">
                  <b className="text-base sm:text-lg block mb-1 font-semibold text-gray-700">{selectedBridge.title}</b>
                  {selectedBridge.note && <p className="mb-1.5 text-gray-600 leading-relaxed">{selectedBridge.note}</p>}
                  <p className="text-xs text-gray-500 mb-2">Lat: {selectedBridge.latitude.toFixed(4)}, Lng: {selectedBridge.longitude.toFixed(4)}</p>
                  {selectedBridge.image_url && <img src={selectedBridge.image_url} alt={selectedBridge.title} className="max-w-[150px] w-full h-auto mt-1 rounded-md shadow" />}
                </div>
              </InfoWindow>
            )}

            {userLocation && (
              <Marker
                position={userLocation}
                icon={{ // Custom icon for user location (optional)
                  url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Add Bridge Popup */}
      {showAddBridgePopup && (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-30 backdrop-blur-sm">
          <div className="bg-white p-5 sm:p-7 rounded-xl shadow-2xl max-w-lg w-full transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">Add New Bridge</h2>
              <button onClick={handleClosePopup} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="bridgeTitle" className="block text-sm font-medium text-gray-700 mb-0.5">Title <span className="text-red-500">*</span></label>
                <input type="text" id="bridgeTitle" value={newBridgeTitle} onChange={(e) => setNewBridgeTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow" />
              </div>
              <div>
                <label htmlFor="bridgeNote" className="block text-sm font-medium text-gray-700 mb-0.5">Note</label>
                <textarea id="bridgeNote" value={newBridgeNote} onChange={(e) => setNewBridgeNote(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bridgeLat" className="block text-sm font-medium text-gray-700 mb-0.5">Latitude <span className="text-red-500">*</span></label>
                  <input type="text" id="bridgeLat" value={newBridgeLat} onChange={(e) => setNewBridgeLat(e.target.value)} placeholder="e.g., 3.1390" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow" />
                </div>
                <div>
                  <label htmlFor="bridgeLng" className="block text-sm font-medium text-gray-700 mb-0.5">Longitude <span className="text-red-500">*</span></label>
                  <input type="text" id="bridgeLng" value={newBridgeLng} onChange={(e) => setNewBridgeLng(e.target.value)} placeholder="e.g., 101.6869" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow" />
                </div>
              </div>
              <div>
                <label htmlFor="bridgeImageUrl" className="block text-sm font-medium text-gray-700 mb-0.5">Image URL (Optional)</label>
                <input type="text" id="bridgeImageUrl" value={newBridgeImageUrl} onChange={(e) => setNewBridgeImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow" />
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={handleClosePopup}
                disabled={isSubmitting}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg w-full sm:w-auto transition-colors disabled:opacity-70 disabled:cursor-not-allowed order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBridge}
                disabled={isSubmitting}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg w-full sm:w-auto transition-colors disabled:opacity-70 disabled:cursor-not-allowed order-1 sm:order-2 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : "Save Bridge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}