import { X, Home, MapPin, Utensils, HelpCircle, Trophy, User, Settings, UserPlus, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";

interface SlideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SlideMenu({ isOpen, onClose }: SlideMenuProps) {
  const [, setLocation] = useLocation();
  const { signOut } = useAuth();

  const handleNavigation = (path: string) => {
    setLocation(path);
    onClose();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
      setLocation('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
            <button onClick={() => handleNavigation('/')} className="block w-full text-left py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
              Home
            </button>
            <button onClick={() => handleNavigation('/location')} className="block w-full text-left py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
              Location
            </button>
            <button onClick={() => handleNavigation('#')} className="block w-full text-left py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
              Questionnaires
            </button>
            <button onClick={() => handleNavigation('/quiz')} className="block w-full text-left py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
              Quizzes
            </button>
            <button onClick={() => handleNavigation('/points')} className="block w-full text-left py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
              Points
            </button>
            <button onClick={() => handleNavigation('/profile')} className="block w-full text-left py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
              Profile
            </button>
            <button onClick={() => handleNavigation('/create-profile')} className="block w-full text-left py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
              Create Profile
            </button>
            <button onClick={() => handleNavigation('/settings')} className="block w-full text-left py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
              Settings
            </button>
            <button onClick={handleSignOut} className="block w-full text-left py-2 px-4 text-gray-700 hover:bg-gray-100 rounded">
              Sign Out
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}