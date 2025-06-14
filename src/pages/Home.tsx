import { useEffect, useState, useCallback } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow, type LoadScriptProps } from '@react-google-maps/api';

// Static libraries for Google Maps API
const mapLibraries: LoadScriptProps['libraries'] = ['places'];

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
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [loadingBridges, setLoadingBridges] = useState(true);
  const [errorBridges, setErrorBridges] = useState<string | null>(null);
  
  const [userLocation, setUserLocation] = useState<LatLngLiteral | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [mapCenter, setMapCenter] = useState<LatLngLiteral>(defaultCenter);
  const [mapZoom, setMapZoom] = useState(7); // Initial zoom

  // For InfoWindow
  const [selectedBridge, setSelectedBridge] = useState<Bridge | null>(null);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    // Automatically fetch user location on page load
    handleLocateUser();
  }, []);

  // Fetch nearby places once user location is set
  useEffect(() => {
    if (!userLocation) return;
    (async () => {
      setLoadingBridges(true);
      setErrorBridges(null);
      try {
        // Import Places Library and perform a text search for bridges
        //@ts-ignore
        const { Place } = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;
        const request = {
          textQuery: 'bridge',
          fields: ['displayName', 'location', 'businessStatus'],
          locationBias: { lat: userLocation.lat, lng: userLocation.lng },
          maxResultCount: 10,
        };
        //@ts-ignore
        const { places } = await Place.searchByText(request);
        // Map Place results to Bridge interface
        const nearbyBridges = places.map((p, idx) => ({
          id: idx,
          created_at: new Date().toISOString(),
          title: p.displayName || 'Bridge',
          latitude: (p.location as google.maps.LatLng).lat(),
          longitude: (p.location as google.maps.LatLng).lng(),
          note: p.businessStatus?.toString(),
        }));
        setBridges(nearbyBridges as Bridge[]);
      } catch (err: any) {
        setErrorBridges(err.message);
        console.error('Error fetching nearby places:', err);
      } finally {
        setLoadingBridges(false);
      }
    })();
  }, [userLocation]);

  const filteredBridges = bridges;

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
        <div className="container mx-auto flex justify-end items-center gap-3">
          <button
            onClick={handleLocateUser}
            disabled={locatingUser}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
            {locatingUser ? "Locating..." : "My Location"}
          </button>
        </div>
        {locationError && <p className="text-red-600 text-sm text-center mt-2 bg-red-100 p-2 rounded-md">Error: {locationError}</p>}
      </div>

      {/* Content Area */}
      <div className="flex flex-grow overflow-hidden">
        {/* Bridges List Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-auto p-4">
          <h2 className="text-lg font-semibold mb-2">Bridges</h2>
          {loadingBridges ? (
            <p className="text-gray-500">Loading bridges...</p>
          ) : errorBridges ? (
            <p className="text-red-600">Error: {errorBridges}</p>
          ) : bridges.length === 0 ? (
            <p className="text-gray-500">No bridges found.</p>
          ) : (
            <ul className="space-y-2">
              {bridges.map((bridge) => (
                <li
                  key={bridge.id}
                  onClick={() => {
                    setMapCenter({ lat: bridge.latitude, lng: bridge.longitude });
                    setMapZoom(13);
                    setSelectedBridge(bridge);
                  }}
                  className="p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-100"
                >
                  <div className="font-semibold">{bridge.title}</div>
                  {bridge.note && <div className="text-sm text-gray-600">{bridge.note}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Map Area */}
        <div className="flex-1 relative">
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
          <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={mapLibraries}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={mapZoom}
              onLoad={onMapLoad}
              onClick={() => setSelectedBridge(null)} // Close InfoWindow when map is clicked
            >
              {bridges.map((bridge) => (
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
                    <p className="text-xs text-gray-500 mb-2">
                      Lat: {selectedBridge.latitude.toFixed(4)}, Lng: {selectedBridge.longitude.toFixed(4)}
                    </p>
                  </div>
                </InfoWindow>
              )}
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
                />
              )}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>
      {/* End Content Area */}
    </div>
  );
}