
import { useState } from "react";
import MobileHeader from "../components/MobileHeader";
import { useLocation } from "wouter";
import { signIn, supabase } from "../supabase/client";
import { User, Mail, Lock } from "lucide-react";

export default function SignIn() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Sign in with Supabase Auth
      await signIn(formData.email, formData.password);
      
      // Check if user has a profile
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', formData.email)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (!userProfile) {
        // No profile found, redirect to create profile
        setLocation('/create-profile');
      } else {
        // Profile exists, redirect to home
        setLocation('/');
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Error signing in:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.email && formData.password && isValidEmail(formData.email);

  return (
    <div className="bg-gray-50 min-h-screen">
      <MobileHeader title="Sign In" />

      <div className="px-6 py-16 space-y-8">
        {/* Logo/Icon Section */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <User size={32} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to continue</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  formData.email && !isValidEmail(formData.email)
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-200 focus:ring-blue-500'
                }`}
                placeholder="Enter your email"
              />
            </div>
            {formData.email && !isValidEmail(formData.email) && (
              <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Sign In Button */}
        <button
          onClick={handleSignIn}
          disabled={!isFormValid || isLoading}
          className={`w-full py-3 rounded-xl font-medium transition-colors ${
            isFormValid && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>

        {/* Create Account Link */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <button
              onClick={() => setLocation('/create-profile')}
              className="text-blue-600 font-medium hover:text-blue-700"
            >
              Create Profile
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
