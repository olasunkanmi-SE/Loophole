import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { DollarSign, Award, Clock, TrendingUp, Star, ArrowRight, CheckCircle, Sparkles, UtensilsCrossed, Home } from 'lucide-react';
import MobileContainer from '../components/MobileContainer';
import MobileHeader from '../components/MobileHeader';
import { usePoints } from '../contexts/PointsContext';

export default function NewHome() {
  const [, setLocation] = useLocation();
  const { getTotalPoints, getFormattedRM, getCompletedCategories } = usePoints();
  const [animateCounter, setAnimateCounter] = useState(false);

  const totalPoints = isNaN(getTotalPoints()) ? 0 : getTotalPoints();
  const availableRM = getFormattedRM();
  const completedSurveys = getCompletedCategories().length;
  const totalSurveys = 8; // Updated total survey count
  const potentialEarnings = (totalSurveys - completedSurveys) * 1.0; // Up to RM 1.00 per survey

  useEffect(() => {
    setAnimateCounter(true);
  }, []);

  const surveyCategories = [
    {
      id: 'lifestyle',
      title: 'Lifestyle & Shopping',
      description: 'Share your shopping habits and earn money',
      icon: <Home size={20} className="text-purple-500" />,
      completed: getCompletedCategories().includes('lifestyle'),
      route: '/questionnaire/lifestyle',
      estimatedTime: '2-3 min',
      points: '2-10 points'
    },
    {
      id: 'digital',
      title: 'Digital & Tech',
      description: 'Tell us about your tech preferences',
      icon: <Sparkles size={20} className="text-blue-500" />,
      completed: getCompletedCategories().includes('digital'),
      route: '/questionnaire/digital',
      estimatedTime: '2-3 min',
      points: '2-10 points'
    },
    {
      id: 'food',
      title: 'Food & Dining',
      description: 'Share your food preferences and habits',
      icon: <UtensilsCrossed size={20} className="text-orange-500" />,
      completed: getCompletedCategories().includes('food'),
      route: '/questionnaire/food',
      estimatedTime: '2-3 min',
      points: '2-10 points'
    },
    {
      id: 'entertainment',
      title: 'Entertainment & Media',
      description: 'Tell us about your entertainment preferences',
      icon: <Star size={20} className="text-pink-500" />,
      completed: getCompletedCategories().includes('entertainment'),
      route: '/questionnaire/entertainment',
      estimatedTime: '2-3 min',
      points: '2-10 points'
    },
    {
      id: 'travel',
      title: 'Travel & Transport',
      description: 'Share your travel habits and experiences',
      icon: <TrendingUp size={20} className="text-green-500" />,
      completed: getCompletedCategories().includes('travel'),
      route: '/questionnaire/travel',
      estimatedTime: '2-3 min',
      points: '2-10 points'
    },
    {
      id: 'health',
      title: 'Health & Wellness',
      description: 'Share your health and fitness routines',
      icon: <CheckCircle size={20} className="text-red-500" />,
      completed: getCompletedCategories().includes('health'),
      route: '/questionnaire/health',
      estimatedTime: '2-3 min',
      points: '2-10 points'
    },
    {
      id: 'education',
      title: 'Education & Learning',
      description: 'Tell us about your learning preferences',
      icon: <Award size={20} className="text-indigo-500" />,
      completed: getCompletedCategories().includes('education'),
      route: '/questionnaire/education',
      estimatedTime: '2-3 min',
      points: '2-10 points'
    },
    {
      id: 'finance',
      title: 'Finance & Money',
      description: 'Share your financial habits and goals',
      icon: <DollarSign size={20} className="text-yellow-500" />,
      completed: getCompletedCategories().includes('finance'),
      route: '/questionnaire/finance',
      estimatedTime: '2-3 min',
      points: '2-10 points'
    }
  ];

  return (
    <MobileContainer>
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 min-h-screen">
        <MobileHeader title="AyamBroke" showBack={false} />

        {/* Hero Section */}
        <div className="px-6 py-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <DollarSign size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Turn Your Opinions Into Money
            </h1>
            <p className="text-gray-600 text-lg">
              Complete quick surveys, earn real money for food & accommodation
            </p>
          </div>

          {/* Earnings Display */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/50 shadow-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold text-green-600 mb-1 ${animateCounter ? 'animate-bounce' : ''}`}>
                  {availableRM}
                </div>
                <div className="text-sm text-gray-600">Available Balance</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold text-blue-600 mb-1 ${animateCounter ? 'animate-bounce' : ''}`}>
                  {totalPoints}
                </div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
            </div>

            {potentialEarnings > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">Potential earnings remaining:</div>
                <div className="text-lg font-semibold text-purple-600">
                  Up to RM {potentialEarnings.toFixed(2)}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => setLocation('/food-menu')}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-3">
                  <UtensilsCrossed size={24} className="text-white" />
                </div>
                <span className="font-semibold text-gray-900">Order Food</span>
                <span className="text-xs text-gray-600 mt-1">Use your points</span>
              </div>
            </button>

            <button 
              onClick={() => setLocation('/housing')}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center mb-3">
                  <Home size={24} className="text-white" />
                </div>
                <span className="font-semibold text-gray-900">Housing</span>
                <span className="text-xs text-gray-600 mt-1">Book stays</span>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => setLocation('/points')}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3">
                  <Award size={24} className="text-white" />
                </div>
                <span className="font-semibold text-gray-900">My Points</span>
                <span className="text-xs text-gray-600 mt-1">Track earnings</span>
              </div>
            </button>

            <button 
              onClick={() => setLocation('/chat')}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-3">
                  <Sparkles size={24} className="text-white" />
                </div>
                <span className="font-semibold text-gray-900">AI Chat</span>
                <span className="text-xs text-gray-600 mt-1">Get recommendations</span>
              </div>
            </button>
          </div>
        </div>

        {/* Survey Categories */}
        <div className="px-6 pb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star size={20} className="text-yellow-500" />
            Available Surveys
          </h2>

          <div className="space-y-4">
            {surveyCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                    if (!category.completed) {
                      // Store the survey category for chat context
                      localStorage.setItem('selectedSurveyCategory', category.id);
                      setLocation(category.route);
                    }
                  }}
                  className={`w-full p-4 rounded-2xl border transition-all duration-200 ${
                    category.completed
                    ? 'bg-green-50 border-green-200 opacity-75'
                    : 'bg-white/80 backdrop-blur-sm border-white/50 hover:bg-white/90 hover:scale-[1.02] shadow-lg'
                }`}
                disabled={category.completed}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      category.completed ? 'bg-green-100' : 'bg-gray-50'
                    }`}>
                      {category.completed ? (
                        <CheckCircle size={20} className="text-green-600" />
                      ) : (
                        category.icon
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{category.title}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-blue-600 font-medium">{category.estimatedTime}</span>
                        <span className="text-xs text-green-600 font-medium">{category.points}</span>
                      </div>
                    </div>
                  </div>
                  {!category.completed && (
                    <ArrowRight size={20} className="text-gray-400" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-8 space-y-3">
          {completedSurveys > 0 && (
            <button
              onClick={() => setLocation('/menu')}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <UtensilsCrossed size={20} />
              Order Food with {availableRM}
            </button>
          )}

          <button
            onClick={() => setLocation('/points')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Award size={20} />
            View My Earnings
          </button>
        </div>

        {/* Motivational Footer */}
        <div className="px-6 pb-8">
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-4 text-center border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-2">💡 Did You Know?</h3>
            <p className="text-sm text-gray-700">
              Each survey takes just 2-3 minutes and can earn you up to RM 1.00! 
              Complete all {totalSurveys} surveys to maximize your earnings for food and accommodation.
            </p>
            {potentialEarnings > 0 && (
              <div className="mt-3 text-sm font-medium text-purple-700">
                🚀 You can still earn RM {potentialEarnings.toFixed(2)} more!
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}