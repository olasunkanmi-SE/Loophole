
import MobileContainer from "../components/MobileContainer";
import MobileHeader from "../components/MobileHeader";
import { useLocation } from "wouter";
import { usePoints } from "../contexts/PointsContext";
import { useSurvey } from "../contexts/SurveyContext";

export default function Questionnaire() {
  const [, setLocation] = useLocation();
  const { getQuizStatus } = usePoints();
  const { getAvailableSurveys, getPersonalizedSurveys, getEstimatedPoints, getBonusMultiplier, currentMultiplier } = useSurvey();

  const questionnaires = [
    {
      id: 'lifestyle',
      title: 'Lifestyle & Shopping',
      description: 'Questions about your shopping habits and lifestyle preferences',
      icon: '🛍️',
      path: '/questionnaire/lifestyle',
      estimatedTime: '3-5 min',
      points: '5-8 points'
    },
    {
      id: 'digital',
      title: 'Digital & Tech',
      description: 'Your digital habits and technology preferences',
      icon: '💻',
      path: '/questionnaire/digital',
      estimatedTime: '3-5 min',
      points: '5-8 points'
    },
    {
      id: 'food',
      title: 'Food & Dining',
      description: 'Food preferences and dining experiences',
      icon: '🍽️',
      path: '/questionnaire/food',
      estimatedTime: '3-5 min',
      points: '5-8 points'
    }
  ];

  return (
    <MobileContainer>
      <div className="bg-white min-h-screen">
        <MobileHeader 
          title="Questionnaires" 
          onBack={() => setLocation('/')}
        />
        
        <div className="px-6 py-4">
          {/* Bonus Multiplier Banner */}
          {currentMultiplier > 1 && (
            <div className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-white">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎉</span>
                <div>
                  <h3 className="font-bold">Bonus Weekend!</h3>
                  <p className="text-sm opacity-90">{currentMultiplier}x points on all surveys!</p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Available Surveys
            </h1>
            <p className="text-gray-600 text-sm">
              Complete surveys to earn points that can be converted to money for food orders!
            </p>
          </div>

          {/* Personalized Surveys */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Recommended for You</h2>
            <div className="space-y-4">
              {getPersonalizedSurveys().slice(0, 2).map((survey) => {
                const status = getQuizStatus(survey.id as 'lifestyle' | 'digital' | 'food');
                const estimatedPoints = getEstimatedPoints(survey.id);
                
                return (
                  <div
                    key={survey.id}
                    className={`border rounded-lg p-4 ${
                      status.completed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:border-blue-300 cursor-pointer'
                    }`}
                    onClick={() => !status.completed && setLocation(`/questionnaire/${survey.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-2xl">
                          {survey.category === 'Consumer Behavior' ? '🛍️' : 
                           survey.category === 'Quick Survey' ? '⚡' : '💻'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {survey.title}
                            </h3>
                            {currentMultiplier > 1 && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                {currentMultiplier}x
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {survey.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>⏱️ {survey.estimatedTime}</span>
                            <span className="font-medium text-green-600">
                              💰 {estimatedPoints} points
                            </span>
                            {survey.schedule && (
                              <span className="bg-gray-100 px-2 py-1 rounded">
                                {survey.schedule.type}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {status.completed ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600 text-sm font-medium">
                              +{status.points} pts
                            </span>
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-blue-300 rounded-full flex items-center justify-center">
                            <span className="text-blue-400 text-xs">→</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All Available Surveys */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">All Surveys</h2>
            <div className="space-y-4">
              {questionnaires.map((quiz) => {
                const status = getQuizStatus(quiz.id as 'lifestyle' | 'digital' | 'food');
                const estimatedPoints = getEstimatedPoints(quiz.id);
                
                return (
                  <div
                    key={quiz.id}
                    className={`border rounded-lg p-4 ${
                      status.completed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-gray-200 hover:border-blue-300 cursor-pointer'
                    }`}
                    onClick={() => !status.completed && setLocation(quiz.path)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-2xl">{quiz.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {quiz.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {quiz.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>⏱️ {quiz.estimatedTime}</span>
                            <span className="font-medium text-green-600">
                              💰 {estimatedPoints} points
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {status.completed ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600 text-sm font-medium">
                              +{status.points} pts
                            </span>
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-400 text-xs">→</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              💡 How it works
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Complete questionnaires to earn points</li>
              <li>• 10 points = RM 1.00</li>
              <li>• Use your earnings to order food</li>
              <li>• Each survey takes just 3-5 minutes</li>
            </ul>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
