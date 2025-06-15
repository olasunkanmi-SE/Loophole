
import { useState, useEffect } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileContainer from "../components/MobileContainer";
import { useLocation } from "wouter";
import { usePoints } from "../contexts/PointsContext";

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
    question: "How often do you exercise or engage in physical activities?",
    answers: ["Daily", "3-4 times a week", "1-2 times a week", "Occasionally", "Rarely or never"]
  },
  {
    id: "q2",
    type: "multi",
    question: "What types of physical activities do you enjoy? (Select all that apply)",
    answers: ["Walking/Jogging", "Gym workouts", "Swimming", "Cycling", "Yoga/Pilates", "Team sports", "Dance", "Hiking"]
  },
  {
    id: "q3",
    type: "single",
    question: "How would you rate your current overall health?",
    answers: ["Excellent", "Very good", "Good", "Fair", "Poor"]
  },
  {
    id: "q4",
    type: "single",
    question: "How many hours of sleep do you typically get per night?",
    answers: ["Less than 5 hours", "5-6 hours", "6-7 hours", "7-8 hours", "More than 8 hours"]
  },
  {
    id: "q5",
    type: "multi",
    question: "What health and wellness products do you use regularly? (Select all that apply)",
    answers: ["Vitamins/Supplements", "Protein powder", "Fitness tracker", "Meditation apps", "Healthy meal delivery", "Organic foods", "Herbal teas", "None of the above"]
  }
];

export default function HealthQuestionnaire() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[] | string>>({});
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [, setLocation] = useLocation();
  const { addPoints } = usePoints();

  const currentQ = questions[currentQuestion];
  const progress = (currentQuestion / questions.length) * 100;

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
    
    Object.values(answers).forEach(answer => {
      if (Array.isArray(answer)) {
        points += answer.length * 0.5;
      } else {
        points += 2;
      }
    });
    
    return Math.min(Math.max(Math.round(points), 1), 10);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      const earnedPoints = calculatePoints();
      addPoints('health', earnedPoints);
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
          title="Health & Wellness" 
          onBack={() => setLocation('/')}
        />

        <div className="px-6 py-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Question {currentQuestion + 1} of {questions.length}</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {currentQ.question}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {currentQ.type === 'multi' ? 'Select all that apply' : 'Select one answer'}
            </p>
          </div>

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

        {showCompletionModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 mx-6 text-center animate-bounce max-w-sm">
              <div className="text-4xl mb-3 animate-pulse">🎉</div>
              <h2 className="text-xl font-bold text-green-600 mb-2">Yay! Completed!</h2>
              <p className="text-gray-600 text-sm mb-2">You've successfully completed the Health & Wellness questionnaire!</p>
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
