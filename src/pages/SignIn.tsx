import { useState } from "react";
import Layout from "../components/Layout";
import MobileHeader from "../components/MobileHeader";
import { useLocation } from "wouter";
import { signIn, signUp, getProfile } from "../api/client";
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

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Sign in with Express backend
      await signIn(formData.email, formData.password);

      // Navigate to home and let ProtectedRoute handle profile check
      setLocation('/');
    } catch (err: any) {
      setError(err.message);
      console.error("Error signing in:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Sign up with Express backend
      await signUp(formData.email, formData.password);

      // Navigate to home and let ProtectedRoute handle profile check
      setLocation('/');
    } catch (err: any) {
      setError(err.message);
      console.error("Error signing up:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.email && formData.password;

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <MobileHeader 
          title="Sign In" 
          onBack={() => setLocation('/')}
        />

        <div className="max-w-md mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Sign In Form */}
          <div className="bg-white rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value.trim())}
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleSignIn}
              disabled={!isFormValid || isLoading}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="text-center mt-4">
              <button
                onClick={() => setLocation('/reset-password')}
                className="text-blue-500 text-sm hover:underline"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          {/* Create Account Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => setLocation('/create-profile')}
                className="text-blue-500 font-medium hover:underline"
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}