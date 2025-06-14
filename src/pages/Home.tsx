import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Define the Bridge interface (if not already imported from a shared types file)
interface Bridge {
  id: number;
  created_at: string;
  title: string;
  note?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
}

// Fix for default icon issue with Webpack/React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component to adjust map view when filteredBridges changes
const ChangeView = ({ center, zoom }: { center: L.LatLngExpression; zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};



export default function Home() {
  const [showAddBridgePopup, setShowAddBridgePopup] = useState(false);
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [loadingBridges, setLoadingBridges] = useState(true);
  const [errorBridges, setErrorBridges] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state for adding a new bridge
  const [newBridgeTitle, setNewBridgeTitle] = useState("");
  const [newBridgeNote, setNewBridgeNote] = useState("");
  const [newBridgeLat, setNewBridgeLat] = useState("");
  const [newBridgeLng, setNewBridgeLng] = useState("");
  // For image_url, you'd typically handle file uploads separately
  // For simplicity, we'll assume it's a text input for now or handle it later

  useEffect(() => {
    const fetchBridges = async () => {
      setLoadingBridges(true);
      setErrorBridges(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from("bridges")
          .select("*");

        if (supabaseError) {
          throw supabaseError;
        }
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

  const mapCenter: L.LatLngExpression =
    filteredBridges.length > 0
      ? [filteredBridges[0].latitude, filteredBridges[0].longitude]
      : [51.505, -0.09]; // Default center

  const defaultZoom = filteredBridges.length > 0 ? 10 : 5;

  const handleAddBridgeClick = () => {
    setShowAddBridgePopup(true);
  };

  const handleClosePopup = () => {
    setShowAddBridgePopup(false);
    // Reset form fields
    setNewBridgeTitle("");
    setNewBridgeNote("");
    setNewBridgeLat("");
    setNewBridgeLng("");
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

    try {
      const { data, error } = await supabase
        .from("bridges")
        .insert([{ 
          title: newBridgeTitle, 
          note: newBridgeNote, 
          latitude: lat, 
          longitude: lng 
          // image_url would be handled by file upload logic
        }])
        .select();

      if (error) throw error;

      if (data) {
        setBridges([...bridges, ...data]); // Add new bridge to local state
      }
      handleClosePopup();
    } catch (error: any) {
      console.error("Error saving bridge:", error);
      alert("Failed to save bridge: " + error.message);
    }
  };


  return (
    <div className="flex flex-col h-screen">
      {/* Top Bar */}
      <div className="bg-gray-100 p-4 shadow-md">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <input
            type="text"
            placeholder="Search bridges..."
            className="p-2 border border-gray-300 rounded-md w-full sm:flex-grow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={handleAddBridgeClick}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md w-full sm:w-auto"
          >
            Add Bridge
          </button>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-grow relative">
        {loadingBridges && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            Loading map data...
          </div>
        )}
        {errorBridges && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-700 z-10">
            Error loading bridges: {errorBridges}
          </div>
        )}
        {!loadingBridges && !errorBridges && (
          <MapContainer center={mapCenter} zoom={defaultZoom} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
            <ChangeView center={mapCenter} zoom={defaultZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredBridges.map((bridge) => (
              <Marker key={bridge.id} position={[bridge.latitude, bridge.longitude]}>
                <Popup>
                  <div className="text-sm">
                    <b className="text-base block mb-1">{bridge.title}</b>
                    {bridge.note && <p className="mb-1">{bridge.note}</p>}
                    <p className="text-xs text-gray-600">Lat: {bridge.latitude.toFixed(4)}, Lng: {bridge.longitude.toFixed(4)}</p>
                    {bridge.image_url && <img src={bridge.image_url} alt={bridge.title} className="max-w-[100px] mt-2 rounded" />}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Add Bridge Popup */}
      {showAddBridgePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Add New Bridge</h2>
            <div className="space-y-3">
              <div>
                <label htmlFor="bridgeTitle" className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
                <input type="text" id="bridgeTitle" value={newBridgeTitle} onChange={(e) => setNewBridgeTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="bridgeNote" className="block text-sm font-medium text-gray-700">Note</label>
                <textarea id="bridgeNote" value={newBridgeNote} onChange={(e) => setNewBridgeNote(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="bridgeLat" className="block text-sm font-medium text-gray-700">Latitude <span className="text-red-500">*</span></label>
                  <input type="text" id="bridgeLat" value={newBridgeLat} onChange={(e) => setNewBridgeLat(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="bridgeLng" className="block text-sm font-medium text-gray-700">Longitude <span className="text-red-500">*</span></label>
                  <input type="text" id="bridgeLng" value={newBridgeLng} onChange={(e) => setNewBridgeLng(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
              </div>
              {/* Placeholder for image upload - this would require more complex handling */}
              <div className="text-sm text-gray-500">Image upload will be implemented later.</div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleClosePopup}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBridge}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
              >
                Save Bridge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}