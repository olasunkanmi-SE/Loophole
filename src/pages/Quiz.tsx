
import { useState } from "react";
import MobileHeader from "../components/MobileHeader";

interface QuizCard {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

const quizData: QuizCard[] = [
  // Lifestyle & Shopping
  {
    id: "1",
    category: "Lifestyle & Shopping",
    question: "What is the most sustainable shopping practice?",
    options: [
      "Buying the cheapest items available",
      "Shopping only online",
      "Buying quality items that last longer",
      "Shopping every day"
    ],
    correctAnswer: 2,
    explanation: "Quality items that last longer reduce waste and provide better value over time."
  },
  {
    id: "2",
    category: "Lifestyle & Shopping",
    question: "Which payment method is most secure for online shopping?",
    options: [
      "Debit card",
      "Credit card with fraud protection",
      "Bank transfer",
      "Cash on delivery only"
    ],
    correctAnswer: 1,
    explanation: "Credit cards typically offer better fraud protection and dispute resolution."
  },
  // Digital & Tech
  {
    id: "3",
    category: "Digital & Tech",
    question: "What does 'AI' stand for in technology?",
    options: [
      "Automated Intelligence",
      "Artificial Intelligence",
      "Advanced Integration",
      "Algorithmic Interface"
    ],
    correctAnswer: 1,
    explanation: "AI stands for Artificial Intelligence, which simulates human intelligence in machines."
  },
  {
    id: "4",
    category: "Digital & Tech",
    question: "Which is the most secure way to protect your data?",
    options: [
      "Using the same password everywhere",
      "Two-factor authentication",
      "Sharing passwords with friends",
      "Never updating software"
    ],
    correctAnswer: 1,
    explanation: "Two-factor authentication adds an extra layer of security beyond just passwords."
  },
  // Food & Dining
  {
    id: "5",
    category: "Food & Dining",
    question: "Which cooking method retains the most nutrients?",
    options: [
      "Deep frying",
      "Boiling for long periods",
      "Steaming",
      "Microwaving with lots of water"
    ],
    correctAnswer: 2,
    explanation: "Steaming preserves most nutrients as food doesn't come in direct contact with water."
  },
  {
    id: "6",
    category: "Food & Dining",
    question: "What is considered proper dining etiquette?",
    options: [
      "Talking loudly during meals",
      "Using your phone constantly",
      "Chewing with your mouth closed",
      "Starting to eat before everyone is served"
    ],
    correctAnswer: 2,
    explanation: "Chewing with your mouth closed is a basic courtesy in most dining cultures."
  }
];

interface FlipCardProps {
  card: QuizCard;
  onAnswer: (cardId: string, selectedAnswer: number) => void;
  userAnswer?: number;
  showResult: boolean;
}

function FlipCard({ card, onAnswer, userAnswer, showResult }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    onAnswer(card.id, answerIndex);
    setIsFlipped(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Lifestyle & Shopping":
        return "bg-pink-100 border-pink-300";
      case "Digital & Tech":
        return "bg-blue-100 border-blue-300";
      case "Food & Dining":
        return "bg-green-100 border-green-300";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Lifestyle & Shopping":
        return "🛍️";
      case "Digital & Tech":
        return "💻";
      case "Food & Dining":
        return "🍽️";
      default:
        return "❓";
    }
  };

  return (
    <div className="w-full h-80 perspective-1000 mb-6">
      <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front of card - Question */}
        <div className={`absolute inset-0 w-full h-full backface-hidden rounded-xl shadow-lg border-2 ${getCategoryColor(card.category)} p-6 flex flex-col`}>
          <div className="text-center mb-4">
            <span className="text-3xl mb-2 block">{getCategoryIcon(card.category)}</span>
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {card.category}
            </span>
          </div>
          
          <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">
            {card.question}
          </h3>
          
          <div className="space-y-3 flex-grow">
            {card.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className="w-full p-3 text-left rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm"
                disabled={showResult}
              >
                <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Back of card - Result */}
        <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl shadow-lg border-2 ${getCategoryColor(card.category)} p-6 flex flex-col`}>
          <div className="text-center mb-4">
            <span className="text-3xl mb-2 block">
              {userAnswer === card.correctAnswer ? "✅" : "❌"}
            </span>
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {card.category}
            </span>
          </div>
          
          <div className="text-center mb-4">
            <h4 className="text-lg font-bold mb-2">
              {userAnswer === card.correctAnswer ? "Correct!" : "Incorrect!"}
            </h4>
            <p className="text-sm text-gray-700 mb-2">
              Correct answer: <span className="font-semibold">
                {String.fromCharCode(65 + card.correctAnswer)}. {card.options[card.correctAnswer]}
              </span>
            </p>
          </div>
          
          {card.explanation && (
            <div className="bg-white bg-opacity-50 rounded-lg p-3 flex-grow">
              <p className="text-sm text-gray-700 italic">
                💡 {card.explanation}
              </p>
            </div>
          )}
          
          <button
            onClick={() => setIsFlipped(false)}
            className="mt-4 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-all duration-200"
          >
            See Question Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Quiz() {
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (cardId: string, selectedAnswer: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [cardId]: selectedAnswer
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    quizData.forEach(card => {
      if (userAnswers[card.id] === card.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const totalAnswered = Object.keys(userAnswers).length;
  const score = calculateScore();

  return (
    <div className="bg-gray-50 min-h-screen">
      <MobileHeader 
        title="Interest Categories Quiz" 
        onBack={() => window.history.back()}
      />

      <div className="p-4">
        {/* Progress Header */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600">Progress</span>
            <span className="text-sm text-gray-600">
              {totalAnswered}/{quizData.length} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(totalAnswered / quizData.length) * 100}%` }}
            ></div>
          </div>
          {totalAnswered === quizData.length && (
            <div className="mt-3 text-center">
              <p className={`text-lg font-bold ${getScoreColor(score, quizData.length)}`}>
                Score: {score}/{quizData.length} ({Math.round((score / quizData.length) * 100)}%)
              </p>
            </div>
          )}
        </div>

        {/* Quiz Cards */}
        <div className="space-y-6">
          {quizData.map((card) => (
            <FlipCard
              key={card.id}
              card={card}
              onAnswer={handleAnswer}
              userAnswer={userAnswers[card.id]}
              showResult={userAnswers[card.id] !== undefined}
            />
          ))}
        </div>

        {/* Completion Message */}
        {totalAnswered === quizData.length && (
          <div className="bg-white rounded-lg p-6 mt-6 text-center shadow-sm">
            <h3 className="text-xl font-bold mb-2">Quiz Complete! 🎉</h3>
            <p className="text-gray-600 mb-4">
              You've answered all questions across the three interest categories.
            </p>
            <button
              onClick={() => {
                setUserAnswers({});
                setShowResults(false);
                window.scrollTo(0, 0);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Retake Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
