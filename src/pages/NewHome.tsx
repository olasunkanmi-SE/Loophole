
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { DollarSign, Award, Clock, TrendingUp, Star, ArrowRight, CheckCircle } from 'lucide-react';
import MobileContainer from '../components/MobileContainer';
import MobileHeader from '../components/MobileHeader';
import { usePoints } from '../contexts/PointsContext';

interface SurveyCategory {
  id: string;
  title: string;
  description: string;
  timeEstimate: string;
  pointRange: string;
  icon: React.ReactNode;
  route: string;
  completed: boolean;
}

export default function NewHome() {
  const [, setLocation] = useLocation();
  const { getTotalPoints, getFormattedRM, getCompletedCategories, points } = usePoints();
  
  const totalPoints = getTotalPoints();
  const availableRM = getFormattedRM();
  const completedCategories = getCompletedCategories();
  
  const surveyCategories: SurveyCategory[] = [
    {
      id: 'lifestyle',
      title: 'Lifestyle & Shopping',
      description: 'Share your shopping habits and lifestyle preferences',
      timeEstimate: '2-3 min',
      pointRange: '1-10 pts',
      icon: <Star className="text-purple-500" size={20} />,
      route: '/lifestyle',
      completed: points.lifestyle > 0
    },
    {
      id: 'digital',
      title: 'Digital & Tech',
      description: 'Tell us about your digital content consumption',
      timeEstimate: '2-3 min',
      pointRange: '1-10 pts',
      icon: <TrendingUp className="text-blue-500" size={20} />,
      route: '/digital',
      completed: points.digital > 0
    },
    {
      id: 'food',
      title: 'Food & Dining',
      description: 'Share your food preferences and dining habits',
      timeEstimate: '2-3 min',
      pointRange: '1-10 pts',
      icon: <Award className="text-orange-500" size={20} />,
      route: '/food',
      completed: points.food > 0
    }
  ];

  const completedCount = completedCategories.length;
  const totalEarningPotential = "RM 3.00";
  const averageTimePerSurvey = "2-3 minutes";

  return (
    <MobileContainer>
      <div className="bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
        <MobileHeader title="Earn Money" />
        
        <div className="p-6 space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <DollarSign size={40} className="text-white" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Earn Real Money in Minutes
              </h1>
              <p className="text-gray-600 text-sm">
                Complete quick surveys to earn points that convert to real money for food & accommodation
              </p>
            </div>
            
            {/* Current Earnings Display */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{availableRM}</div>
                  <div className="text-xs text-gray-500">Available Money</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
                  <div className="text-xs text-gray-500">Total Points</div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Your Progress</h3>
              <span className="text-sm text-gray-500">{completedCount}/3 Complete</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${(completedCount / 3) * 100}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>Start earning</span>
              <span className="font-medium">Complete all surveys</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-100">
              <div className="text-lg font-bold text-green-600">{totalEarningPotential}</div>
              <div className="text-xs text-gray-500">Max Earning</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-100">
              <div className="text-lg font-bold text-blue-600">{averageTimePerSurvey}</div>
              <div className="text-xs text-gray-500">Per Survey</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-100">
              <div className="text-lg font-bold text-purple-600">10:1</div>
              <div className="text-xs text-gray-500">Points to RM</div>
            </div>
          </div>

          {/* Survey Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Award size={18} className="text-yellow-500" />
              Available Surveys
            </h3>
            
            {surveyCategories.map((survey) => (
              <button
                key={survey.id}
                onClick={() => setLocation(survey.route)}
                disabled={survey.completed}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  survey.completed
                    ? 'bg-gray-50 border-gray-200 opacity-75'
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md active:scale-95'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {survey.completed ? (
                        <CheckCircle size={20} className="text-green-500" />
                      ) : (
                        survey.icon
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {survey.title}
                        {survey.completed && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{survey.description}</div>
                      
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock size={12} />
                          {survey.timeEstimate}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <DollarSign size={12} />
                          {survey.pointRange}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!survey.completed && (
                    <ArrowRight size={18} className="text-gray-400" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Call to Action */}
          {completedCount < 3 && (
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-4 text-white text-center">
              <h4 className="font-semibold mb-2">Start Earning Today!</h4>
              <p className="text-sm opacity-90 mb-3">
                Complete {3 - completedCount} more survey{3 - completedCount !== 1 ? 's' : ''} to maximize your earnings
              </p>
              <div className="text-xs opacity-75">
                💰 Every 10 points = RM 1.00 for food orders
              </div>
            </div>
          )}

          {/* Achievement Badge */}
          {completedCount === 3 && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 text-white text-center">
              <div className="text-3xl mb-2">🏆</div>
              <h4 className="font-semibold mb-2">All Surveys Complete!</h4>
              <p className="text-sm opacity-90 mb-3">
                Congratulations! You've earned the maximum points available.
              </p>
              <button
                onClick={() => setLocation('/menu')}
                className="bg-white text-orange-600 font-medium py-2 px-4 rounded-lg text-sm hover:bg-gray-100 transition-colors"
              >
                Order Food Now
              </button>
            </div>
          )}

          {/* How It Works */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-3">How It Works</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</div>
                <span className="text-sm text-gray-600">Complete 2-3 minute surveys</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                <span className="text-sm text-gray-600">Earn 1-10 points per survey</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">3</div>
                <span className="text-sm text-gray-600">Convert points to money (10 pts = RM 1.00)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">4</div>
                <span className="text-sm text-gray-600">Use money to order food & accommodation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
