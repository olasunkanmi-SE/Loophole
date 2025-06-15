import { useState, useEffect } from "react";
import MobileHeader from "../components/MobileHeader";
import { useLocation } from "wouter";
import { User, Mail, MapPin, Star, ShoppingBag, Settings, ChevronRight, Trophy, Users, Bell, Edit3, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { updateProfile } from "../api/client";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, userProfile, signOut, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    location: "",
    bio: ""
  });

  // Update form data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || "",
        last_name: userProfile.last_name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        location: userProfile.location || "",
        bio: userProfile.bio || ""
      });
    } else if (user) {
      // If no profile but user exists, use user email
      setFormData(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [userProfile, user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      // Update profile data
      await updateProfile(user.email, formData);

      // Refresh profile to get updated data
      await refreshProfile();

      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setLocation('/signin');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Show loading if user is not loaded yet
  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <MobileHeader 
          title="Profile" 
          onBack={() => setLocation('/')}
        />
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  const displayName = userProfile 
    ? `${userProfile.first_name} ${userProfile.last_name}`.trim() || "User"
    : "User";

  return (
    <div className="bg-gray-50 min-h-screen">
      <MobileHeader 
        title="Profile" 
        onBack={() => setLocation('/')}
      />

      <div className="px-6 py-8 space-y-8">
        {/* Profile Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4 overflow-hidden">
            {userProfile?.profile_image_url ? (
              <img 
                src={userProfile.profile_image_url} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <User size={40} className="text-gray-500" />
            )}
          </div>
          <h1 className="text-xl font-medium text-gray-900">{displayName}</h1>
          <p className="text-sm text-gray-500">{formData.email}</p>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <Edit3 size={18} />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your first name"
                />
              ) : (
                <p className="text-gray-900">{formData.first_name || "Not set"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your last name"
                />
              ) : (
                <p className="text-gray-900">{formData.last_name || "Not set"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{formData.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-gray-900">{formData.phone || "Not set"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your location"
                />
              ) : (
                <p className="text-gray-900">{formData.location || "Not set"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-900">{formData.bio || "Not set"}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setError("");
                  // Reset form data to original values
                  if (userProfile) {
                    setFormData({
                      first_name: userProfile.first_name || "",
                      last_name: userProfile.last_name || "",
                      email: userProfile.email || "",
                      phone: userProfile.phone || "",
                      location: userProfile.location || "",
                      bio: userProfile.bio || ""
                    });
                  }
                }}
                disabled={loading}
                className="flex-1 py-2 px-4 border border-gray-200 rounded-lg text-gray-700 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => setLocation('/notifications')}
            className="w-full bg-white p-4 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-gray-500" />
              <span className="font-medium text-gray-900">Notifications</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          <button
            onClick={() => setLocation('/achievements')}
            className="w-full bg-white p-4 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Trophy size={20} className="text-gray-500" />
              <span className="font-medium text-gray-900">Achievements</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          <button
            onClick={() => setLocation('/social')}
            className="w-full bg-white p-4 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Users size={20} className="text-gray-500" />
              <span className="font-medium text-gray-900">Social</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          <button
            onClick={() => setLocation('/settings')}
            className="w-full bg-white p-4 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Settings size={20} className="text-gray-500" />
              <span className="font-medium text-gray-900">Settings</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-white p-4 rounded-xl flex items-center gap-3 text-red-600"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}