
import { useState } from "react";
import MobileHeader from "../components/MobileHeader";
import { useLocation } from "wouter";
import { useNotifications } from "../contexts/NotificationContext";
import { 
  Bell, 
  Moon, 
  Globe, 
  Shield, 
  HelpCircle, 
  MessageSquare, 
  Trash2,
  ChevronRight 
} from "lucide-react";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { addNotification } = useNotifications();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');

  const handleClearData = () => {
    // Show confirmation notification
    addNotification({
      type: 'warning',
      title: 'Clear All Data? ⚠️',
      message: 'This action cannot be undone. All your data will be permanently deleted.',
    });
    
    // For now, we'll just show the warning. In a real app, you'd implement a confirmation modal
    // or use a more sophisticated confirmation system
    setTimeout(() => {
      if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        localStorage.clear();
        addNotification({
          type: 'info',
          title: 'Data Cleared 🗑️',
          message: 'All local data has been cleared successfully',
        });
      }
    }, 1000);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <MobileHeader 
        title="Settings" 
        onBack={() => setLocation('/profile')}
      />

      <div className="px-6 py-8 space-y-6">
        {/* Preferences Section */}
        <div className="bg-white rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Preferences</h2>
          
          {/* Notifications Toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-gray-500" />
              <span className="text-gray-900">Notifications</span>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Moon size={20} className="text-gray-500" />
              <span className="text-gray-900">Dark Mode</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Language Selection */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-gray-500" />
              <span className="text-gray-900">Language</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">{language}</span>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-white rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Account</h2>
          
          <button className="w-full flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-gray-500" />
              <span className="text-gray-900">Privacy & Security</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <MessageSquare size={20} className="text-gray-500" />
              <span className="text-gray-900">Data & Storage</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Support</h2>
          
          <button className="w-full flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <HelpCircle size={20} className="text-gray-500" />
              <span className="text-gray-900">Help Center</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <MessageSquare size={20} className="text-gray-500" />
              <span className="text-gray-900">Contact Support</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Data</h2>
          
          <button
            onClick={handleClearData}
            className="w-full flex items-center gap-3 py-3 text-red-600"
          >
            <Trash2 size={20} />
            <span className="font-medium">Clear All Data</span>
          </button>
        </div>

        {/* App Version */}
        <div className="text-center pt-4">
          <p className="text-sm text-gray-400">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
