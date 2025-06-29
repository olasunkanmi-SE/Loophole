
import { useState, useEffect } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileContainer from "../components/MobileContainer";
import { useLocation } from "wouter";
import { usePoints } from "../contexts/PointsContext";
import { useGamification } from "../contexts/GamificationContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useOffline } from "../contexts/OfflineContext";
import { useSurvey } from "../contexts/SurveyContext";

interface Question {
  id: string;
  type: 'single' | 'multi';
  question: string;
  answers: string[];
}

const questions: Question[] = [
  {
    id: "q1",
    type: "single",
    question: "How often do you currently purchase or use reusable storage containers (e.g., Tupperware, glass containers, silicone bags) for food in your home?",
    answers: ["Daily", "A few times a week", "Once a week", "A few times a month", "Rarely or never"]
  },
  {
    id: "q2",
    type: "multi",
    question: "Which of the following features are most important to you when choosing reusable kitchen storage containers? (Select all that apply)",
    answers: ["Airtight seal", "Microwave safe", "Dishwasher safe", "Stackable design", "Made from sustainable materials", "Transparent/See-through", "Durable/Long-lasting", "Affordable price"]
  },
  {
    id: "q3",
    type: "single",
    question: "What is the primary reason you use (or would consider using) reusable storage containers?",
    answers: ["To save money in the long run", "To reduce plastic waste and be more eco-friendly", "They keep food fresher for longer", "They are more aesthetically pleasing", "Convenience for meal prepping"]
  },
  {
    id: "q4",
    type: "single",
    question: "How likely are you to consider purchasing a new set of eco-friendly, reusable kitchen containers from a brand like EcoWares Malaysia in the next 6 months?",
    answers: ["Extremely likely", "Very likely", "Moderately likely", "Slightly likely", "Not at all likely"]
  },
  {
    id: "q5",
    type: "multi",
    question: "If EcoWares Malaysia offered a recycling program for old plastic containers when you purchase new sustainable ones, which of these benefits would appeal most to you? (Select all that apply)",
    answers: ["Feeling good about contributing to sustainability", "Convenience of disposing old containers responsibly", "Potential discounts on new purchases", "Clearing out clutter at home", "No appeal, I'm not interested in such a program"]
  }
];

export default function LifestyleQuestionnaire() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[] | string>>({});
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [, setLocation] = useLocation();
  const { addPoints } = usePoints();
  const { unlockAchievement, updateStreak, addExperience } = useGamification();
  const { addNotification } = useNotifications();
  const { isOnline, cacheSurvey, completeCachedSurvey } = useOffline();
  const { 
    surveyProgress, 
    startSurvey, 
    saveSurveyProgress, 
    completeSurvey, 
    getEstimatedPoints, 
    currentMultiplier 
  } = useSurvey();

  const currentQ = questions[currentQuestion];
  const progress = (currentQuestion / questions.length) * 100;
  const surveyId = 'lifestyle';

  // Initialize survey and load saved progress
  useEffect(() => {
    const existingProgress = surveyProgress[surveyId];
    if (existingProgress) {
      setAnswers(existingProgress.answers);
      setCurrentQuestion(existingProgress.currentQuestion);
      addNotification({
        type: 'survey',
        title: 'Welcome Back! 👋',
        message: 'Your previous progress has been restored.',
      });
    } else {
      startSurvey(surveyId);
    }
    setIsLoaded(true);
  }, []);

  // Auto-save progress every 30 seconds or when answers change
  useEffect(() => {
    if (!isLoaded) return;
    
    const saveProgress = () => {
      saveSurveyProgress(surveyId, answers, currentQuestion);
    };

    const timer = setTimeout(saveProgress, 2000); // Save 2 seconds after last change
    return () => clearTimeout(timer);
  }, [answers, currentQuestion, isLoaded]);

  const handleAnswer = (answer: string) => {
    if (currentQ.type === 'single') {
      setAnswers(prev => ({ ...prev, [currentQ.id]: answer }));
    } else {
      const currentAnswers = (answers[currentQ.id] as string[]) || [];
      const newAnswers = currentAnswers.includes(answer)
        ? currentAnswers.filter(a => a !== answer)
        : [...currentAnswers, answer];
      setAnswers(prev => ({ ...prev, [currentQ.id]: newAnswers }));
    }
  };

  const calculatePoints = () => {
    let points = 0;
    
    // Award points based on answers
    Object.values(answers).forEach(answer => {
      if (Array.isArray(answer)) {
        points += answer.length * 0.5; // Multi-select: 0.5 points per selection
      } else {
        points += 2; // Single select: 2 points per answer
      }
    });
    
    // Ensure points are between 1-10
    return Math.min(Math.max(Math.round(points), 1), 10);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Questionnaire completed - use enhanced survey system
      const earnedPoints = completeSurvey(surveyId, answers);
      addPoints('lifestyle', earnedPoints);
      
      // Add experience points
      addExperience(earnedPoints * 2);
      
      // Update survey streak
      updateStreak('survey');
      
      // Check for achievements
      unlockAchievement('first_survey');
      
      // Send notification with bonus info
      const bonusMessage = currentMultiplier > 1 
        ? ` (${currentMultiplier}x weekend bonus!)` 
        : '';
      
      addNotification({
        type: 'survey',
        title: 'Survey Completed! 🎉',
        message: `You earned ${earnedPoints} points from the Lifestyle & Shopping survey!${bonusMessage}`,
      });
      
      // Cache survey if offline
      if (!isOnline) {
        const cachedSurveyId = cacheSurvey({
          category: 'lifestyle',
          questions: questions,
          answers: answers,
        });
        completeCachedSurvey(cachedSurveyId);
      }
      
      setShowCompletionModal(true);
    }
  };

  useEffect(() => {
    if (showCompletionModal) {
      const timer = setTimeout(() => {
        setLocation('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCompletionModal, setLocation]);

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const isAnswered = () => {
    const answer = answers[currentQ.id];
    if (currentQ.type === 'single') {
      return !!answer;
    } else {
      return answer && (answer as string[]).length > 0;
    }
  };

  return (
    <MobileContainer>
      <div className="bg-white min-h-screen relative">
        <MobileHeader 
          title="Lifestyle & Shopping" 
          onBack={() => setLocation('/')}
        />

      {/* Progress Bar */}
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Question {currentQuestion + 1} of {questions.length}</span>
          <div className="flex items-center space-x-2">
            {currentMultiplier > 1 && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                {currentMultiplier}x bonus
              </span>
            )}
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
        {isLoaded && (
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-green-600">✓ Progress auto-saved</span>
            <span className="text-xs text-gray-500">
              Estimated points: {getEstimatedPoints(surveyId)}
            </span>
          </div>
        )}
      </div>

      <div className="px-6 py-4">
        {/* Question */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {currentQ.question}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {currentQ.type === 'multi' ? 'Select all that apply' : 'Select one answer'}
          </p>
        </div>

        {/* Answers */}
        <div className="space-y-3 mb-8">
          {currentQ.answers.map((answer, index) => {
            const isSelected = currentQ.type === 'single' 
              ? answers[currentQ.id] === answer
              : (answers[currentQ.id] as string[] || []).includes(answer);

            return (
              <button
                key={index}
                onClick={() => handleAnswer(answer)}
                className={`w-full p-4 text-left border rounded-lg transition-colors ${
                  isSelected 
                    ? 'bg-blue-50 border-blue-300 text-blue-900' 
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {answer}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`px-6 py-3 rounded-lg font-medium ${
              currentQuestion === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!isAnswered()}
            className={`px-6 py-3 rounded-lg font-medium ${
              isAnswered()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 mx-6 text-center animate-bounce max-w-sm">
            <div className="text-4xl mb-3 animate-pulse">🎉</div>
            <h2 className="text-xl font-bold text-green-600 mb-2">Yay! Completed!</h2>
            <p className="text-gray-600 text-sm mb-2">You've successfully completed the Lifestyle & Shopping questionnaire!</p>
            <p className="text-blue-600 text-sm font-medium mb-4">💰 Points earned can be converted to money for food orders!</p>
            <div className="flex justify-center items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      )}
      </div>
    </MobileContainer>
  );
}
