
import { useState } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileContainer from "../components/MobileContainer";
import { useLocation } from "wouter";
import { useGamification } from "../contexts/GamificationContext";
import { useSocial } from "../contexts/SocialContext";
import { Trophy, Star, Target, Flame, Share2, Lock } from "lucide-react";

export default function Achievements() {
  const [, setLocation] = useLocation();
  const { achievements, level, experience, experienceToNext, streaks } = useGamification();
  const { shareAchievement } = useSocial();
  const [activeTab, setActiveTab] = useState<'unlocked' | 'available'>('unlocked');

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const availableAchievements = achievements.filter(a => !a.unlockedAt);

  const handleShare = (achievement: any) => {
    shareAchievement(achievement.title);
  };

  const getProgressPercentage = (current: number, requirement: number) => {
    return Math.min((current / requirement) * 100, 100);
  };

  return (
    <MobileContainer>
      <div className="bg-gray-50 min-h-screen">
        <MobileHeader 
          title="Achievements" 
          onBack={() => setLocation('/profile')}
        />

        <div className="p-4 space-y-4">
          {/* User Stats */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Level {level}</h3>
                <p className="text-sm text-gray-600">{experience} XP</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Next Level</p>
                <p className="text-sm font-medium text-blue-600">{experienceToNext} XP to go</p>
              </div>
            </div>
            
            {/* Experience Bar */}
            <div className="bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((100 - experienceToNext) / 100) * 100}%` }}
              />
            </div>

            {/* Streaks */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Flame className="text-orange-500" size={16} />
                  <span className="text-lg font-bold text-gray-900">
                    {streaks.survey?.current || 0}
                  </span>
                </div>
                <p className="text-xs text-gray-600">Survey Streak</p>
                <p className="text-xs text-gray-500">Best: {streaks.survey?.best || 0}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Trophy className="text-yellow-500" size={16} />
                  <span className="text-lg font-bold text-gray-900">
                    {unlockedAchievements.length}
                  </span>
                </div>
                <p className="text-xs text-gray-600">Achievements</p>
                <p className="text-xs text-gray-500">of {achievements.length}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg p-1">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setActiveTab('unlocked')}
                className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'unlocked'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Unlocked ({unlockedAchievements.length})
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'available'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Available ({availableAchievements.length})
              </button>
            </div>
          </div>

          {/* Achievements List */}
          <div className="space-y-3">
            {activeTab === 'unlocked' && (
              <>
                {unlockedAchievements.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 text-center">
                    <Lock className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500 mb-2">No achievements yet</p>
                    <p className="text-sm text-gray-400">Complete surveys and explore the app to unlock achievements!</p>
                  </div>
                ) : (
                  unlockedAchievements.map((achievement) => (
                    <div key={achievement.id} className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                              <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                              <p className="text-xs text-green-600">
                                Unlocked {new Date(achievement.unlockedAt!).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleShare(achievement)}
                              className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Share2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'available' && (
              <>
                {availableAchievements.map((achievement) => (
                  <div key={achievement.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl opacity-50">{achievement.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-700">{achievement.title}</h4>
                        <p className="text-sm text-gray-500 mb-3">{achievement.description}</p>
                        
                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Progress</span>
                            <span className="text-gray-600">
                              {achievement.currentProgress}/{achievement.requirement}
                            </span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${getProgressPercentage(achievement.currentProgress, achievement.requirement)}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
