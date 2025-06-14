
import MobileHeader from "../components/MobileHeader";
import { useLocation } from "wouter";
import { usePoints } from "../contexts/PointsContext";

export default function Points() {
  const [, setLocation] = useLocation();
  const { points, getTotalPoints, getCompletedCategories } = usePoints();

  const categories = [
    {
      key: 'lifestyle' as const,
      name: 'Lifestyle & Shopping',
      icon: '🛍️',
      color: 'bg-purple-100 border-purple-300',
      textColor: 'text-purple-900'
    },
    {
      key: 'digital' as const,
      name: 'Digital & Tech',
      icon: '💻',
      color: 'bg-blue-100 border-blue-300',
      textColor: 'text-blue-900'
    },
    {
      key: 'food' as const,
      name: 'Food & Dining',
      icon: '🍽️',
      color: 'bg-green-100 border-green-300',
      textColor: 'text-green-900'
    }
  ];

  const completedCategories = getCompletedCategories();
  const totalPoints = getTotalPoints();

  return (
    <div className="bg-white min-h-screen">
      <MobileHeader 
        title="My Points" 
        onBack={() => setLocation('/')}
      />
      
      <div className="p-6 space-y-6">
        {/* Total Score Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl text-center">
          <h2 className="text-2xl font-bold mb-2">Total Score</h2>
          <div className="text-4xl font-bold">{totalPoints}/30</div>
          <p className="text-indigo-100 mt-2">
            {completedCategories.length}/3 categories completed
          </p>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Category Breakdown</h3>
          
          {categories.map(category => (
            <div 
              key={category.key}
              className={`p-4 border-2 rounded-lg ${category.color}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h4 className={`font-medium ${category.textColor}`}>
                      {category.name}
                    </h4>
                    <p className={`text-sm ${category.textColor} opacity-75`}>
                      {points[category.key] > 0 ? 'Completed' : 'Not completed'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${category.textColor}`}>
                    {points[category.key]}/10
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-3 bg-white bg-opacity-50 rounded-full h-2">
                <div 
                  className="bg-current h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(points[category.key] / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Achievement Section */}
        {completedCategories.length > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">🏆 Achievements</h3>
            <div className="space-y-1">
              {completedCategories.map(category => (
                <p key={category} className="text-yellow-700 text-sm">
                  ✅ Completed {category} questionnaire
                </p>
              ))}
              {completedCategories.length === 3 && (
                <p className="text-yellow-700 text-sm font-semibold">
                  🌟 Survey Master - Completed all categories!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        {completedCategories.length < 3 && (
          <button
            onClick={() => setLocation('/quiz')}
            className="w-full bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Continue Taking Surveys
          </button>
        )}
      </div>
    </div>
  );
}
