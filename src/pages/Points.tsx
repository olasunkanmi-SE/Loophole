import MobileHeader from "../components/MobileHeader";
import { useLocation } from "wouter";
import { usePoints } from "../contexts/PointsContext";

export default function Points() {
  const [, setLocation] = useLocation();
  const { points, getTotalPoints, getCompletedCategories, getFormattedRM } = usePoints();

  const categories = [
    {
      key: 'lifestyle' as const,
      name: 'Lifestyle & Shopping',
      icon: '🛍️',
    },
    {
      key: 'digital' as const,
      name: 'Digital & Tech',
      icon: '💻',
    },
    {
      key: 'food' as const,
      name: 'Food & Dining',
      icon: '🍽️',
    }
  ];

  const completedCategories = getCompletedCategories();
  const totalPoints = getTotalPoints();

  return (
    <div className="bg-gray-50 min-h-screen">
      <MobileHeader 
        title="Points" 
        onBack={() => setLocation('/')}
      />

      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Total Score Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Score</p>
          <div className="text-3xl font-light text-gray-900 mb-1">{totalPoints}</div>
          <p className="text-sm font-medium text-green-600 mb-1">{getFormattedRM()}</p>
          <p className="text-xs text-gray-400">
            {completedCategories.length}/3 completed • 10 points = RM 1.00
          </p>
        </div>

        {/* Category Cards */}
        <div className="space-y-3">
          {categories.map(category => (
            <div 
              key={category.key}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{category.icon}</span>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {category.name}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {points[category.key] > 0 ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-light text-gray-900">
                    {points[category.key]}<span className="text-gray-400">/10</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-100 rounded-full h-1.5">
                <div 
                  className="bg-gray-900 h-1.5 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${(points[category.key] / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Achievement Badge */}
        {completedCategories.length === 3 && (
          <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
            <div className="text-2xl mb-2">🏆</div>
            <p className="text-sm font-medium text-gray-900">All Complete</p>
            <p className="text-xs text-gray-500">You've finished all surveys</p>
          </div>
        )}

        {/* Action Button */}
        {completedCategories.length < 3 && (
          <button
            onClick={() => setLocation('/')}
            className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors text-sm"
          >
            Continue Surveys
          </button>
        )}
      </div>
    </div>
  );
}