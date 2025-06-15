
import MobileContainer from "../components/MobileContainer";
import MobileHeader from "../components/MobileHeader";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <MobileContainer>
      <div className="bg-white min-h-screen">
        <MobileHeader 
          title="Page Not Found" 
          onBack={() => setLocation('/')}
        />
        
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="text-6xl mb-6">🤔</div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>
          
          <p className="text-gray-600 mb-8 max-w-sm">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track!
          </p>
          
          <div className="space-y-3 w-full max-w-xs">
            <button
              onClick={() => setLocation('/')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Home
            </button>
            
            <button
              onClick={() => setLocation('/quiz')}
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Take Quizzes
            </button>
            
            <button
              onClick={() => setLocation('/menu')}
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Food Menu
            </button>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            Need help? 
            <button
              onClick={() => setLocation('/chat')}
              className="text-blue-600 hover:underline ml-1"
            >
              Chat with us
            </button>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
