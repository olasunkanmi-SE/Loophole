
import { X, Menu } from "lucide-react";
import { useState } from "react";

interface SlideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

function SlideMenu({ isOpen, onClose }: SlideMenuProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Slide Menu */}
      <div className={`absolute top-0 right-0 h-full w-4/5 max-w-xs bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Menu</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="space-y-4">
            <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
              Questionnaires
            </a>
            <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
              Quizzes
            </a>
            <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
              Points
            </a>
            <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
              Profile
            </a>
            <a href="#" className="block py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
              Settings
            </a>
          </nav>
        </div>
      </div>
    </>
  );
}

export default SlideMenu;
