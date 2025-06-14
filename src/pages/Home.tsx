import { useState } from 'react';

export default function Home() {
  const [showAddBridgePopup, setShowAddBridgePopup] = useState(false);

  const handleAddBridgeClick = () => {
    setShowAddBridgePopup(true);
  };

  const handleClosePopup = () => {
    setShowAddBridgePopup(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="bg-gray-100 p-4 shadow-md">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <input
            type="text"
            placeholder="Search for bridges..."
            className="p-2 border border-gray-300 rounded-md mb-2 sm:mb-0 sm:mr-2 w-full sm:w-auto flex-grow"
          />
          <button
            onClick={handleAddBridgeClick}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full sm:w-auto"
          >
            Add Bridge
          </button>
        </div>
      </div>

      {/* Map Area (Placeholder) */}
      <div className="flex-grow bg-gray-300 flex items-center justify-center">
        <p className="text-gray-500 text-2xl">Map Area Placeholder</p>
      </div>

      {/* Add Bridge Popup */}
      {showAddBridgePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Add New Bridge</h2>
            <p className="mb-4">
              This is where the form to add a new bridge will go.
              For now, it's just a placeholder.
            </p>
            {/* TODO: Implement the actual form for adding a bridge */}
            <button
              onClick={handleClosePopup}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
