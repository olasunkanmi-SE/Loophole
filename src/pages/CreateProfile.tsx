
import { useState } from "react";
import MobileHeader from "../components/MobileHeader";
import { useLocation } from "wouter";
import { User, Camera, Lock } from "lucide-react";
import { supabase, signUp } from "../supabase/client";
import { useAuth } from "../contexts/AuthContext";

export default function CreateProfile() {
  const [, setLocation] = useLocation();
  const { user, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    bio: ""
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // If user is not authenticated, sign them up first
      if (!user) {
        await signUp(formData.email, formData.password);
      }

      // Save profile data to database
      const { data, error: supabaseError } = await supabase
        .from('user_profiles')
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            location: formData.location,
            bio: formData.bio,
            profile_image_url: profileImage
          }
        ])
        .select();

      if (supabaseError) {
        throw supabaseError;
      }

      console.log("Profile created successfully:", data);
      
      // Refresh the user profile in context
      await refreshProfile();
      
      // Navigate to home page after creation
      setLocation('/');
    } catch (err: any) {
      setError(err.message);
      console.error("Error creating profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email && isValidEmail(formData.email) && (!user ? formData.password : true);

  return (
    <div className="bg-gray-50 min-h-screen">
      <MobileHeader 
        title="Create Profile" 
        onBack={() => setLocation('/')}
      />

      <div className="px-6 py-8 space-y-8">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-gray-500" />
              )}
            </div>
            <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer">
              <Camera size={14} className="text-white" />
            </label>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">Tap to add photo</p>
        </div>

        {/* Form Fields */}
        <div className="bg-white rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                formData.email && !isValidEmail(formData.email)
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-200 focus:ring-blue-500'
              }`}
              placeholder="john.doe@example.com"
            />
            {formData.email && !isValidEmail(formData.email) && (
              <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
            )}
          </div>

          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Create a password"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+60 12-345 6789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Kuala Lumpur, Malaysia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Create Button */}
        <button
          onClick={handleCreateProfile}
          disabled={!isFormValid || isLoading}
          className={`w-full py-3 rounded-xl font-medium transition-colors ${
            isFormValid && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Creating Profile...' : 'Create Profile'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Fields marked with * are required
        </p>

        {!user && (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <button
                onClick={() => setLocation('/signin')}
                className="text-blue-600 font-medium hover:text-blue-700"
              >
                Sign In
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
