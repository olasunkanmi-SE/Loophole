
import { useState } from 'react';
import { useLocation } from 'wouter';
import { MessageCircle, Send, Sparkles, DollarSign, UtensilsCrossed, Home, Award, ArrowUp } from 'lucide-react';
import MobileContainer from '../components/MobileContainer';
import { usePoints } from '../contexts/PointsContext';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

export default function Chat() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const { getTotalPoints, getFormattedRM, getCompletedCategories } = usePoints();

  const totalPoints = getTotalPoints();
  const availableRM = getFormattedRM();
  const completedSurveys = getCompletedCategories().length;

  const quickActions: QuickAction[] = [
    {
      id: 'earn-money',
      title: 'Start Earning',
      description: 'Complete surveys to earn money for food & accommodation',
      icon: <DollarSign size={16} className="text-green-500" />,
      action: () => setLocation('/')
    },
    {
      id: 'food-order',
      title: 'Order Food',
      description: `Use your ${availableRM} to order delicious meals`,
      icon: <UtensilsCrossed size={16} className="text-orange-500" />,
      action: () => setLocation('/menu')
    },
    {
      id: 'points-status',
      title: 'My Earnings',
      description: `${totalPoints} points • ${completedSurveys}/3 surveys done`,
      icon: <Award size={16} className="text-blue-500" />,
      action: () => setLocation('/points')
    }
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputValue.trim();
    setInputValue('');

    try {
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCZ2i4mYhfTC59fZSQoAIUsIJJmMqvQ5fE');
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      // Create context about the app
      const context = `You are an AI assistant for EarnQuiz, an app that helps people earn money by completing surveys. Here's the user's current status:
      - Total points: ${totalPoints}
      - Available money: ${availableRM} (10 points = RM 1.00)
      - Completed surveys: ${completedSurveys}/3
      - Available surveys: Lifestyle & Shopping, Digital & Tech, Food & Dining
      
      Your role is to:
      1. Encourage users to complete more surveys to earn money
      2. Help them understand how points convert to money (10 points = RM 1.00)
      3. Guide them on using their earned money for food orders
      4. Be motivational and friendly
      5. Keep responses concise and helpful
      
      User question: ${query}`;

      const result = await model.generateContent(context);
      const response = result.response.text();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Gemini AI error:', error);
      
      // Fallback response
      const fallbackResponse = `Hi! I'm here to help you earn money through quick surveys. You currently have ${totalPoints} points (${availableRM}). Complete our 3 survey categories to earn more money for food orders! Each survey takes just 2-3 minutes.`;
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: fallbackResponse,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    }
  };

  return (
    <MobileContainer>
      <div className="bg-gray-900 min-h-screen text-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <button 
            onClick={() => setLocation('/')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowUp size={20} className="rotate-180" />
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle size={20} />
            <span className="font-medium">Earnings Assistant</span>
          </div>
          <div className="w-8" />
        </div>

        {/* Earnings Status Bar */}
        <div className="p-4 bg-gradient-to-r from-green-600 to-blue-600 border-b border-gray-800">
          <div className="text-center">
            <div className="text-2xl font-bold">{availableRM}</div>
            <div className="text-sm opacity-90">Available for food orders</div>
            <div className="text-xs opacity-75 mt-1">
              {totalPoints} points • {completedSurveys}/3 surveys completed
            </div>
          </div>
        </div>

        {/* Welcome Message & Quick Actions */}
        {messages.length === 0 && (
          <div className="flex-1 p-4 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                <DollarSign size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Earn Money for Food & Living</h2>
                <p className="text-gray-400 text-sm">
                  Complete quick 2-3 minute surveys to earn points that convert to real money. Use your earnings to order food!
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles size={18} />
                Quick Actions
              </h3>
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl p-4 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-gray-400">{action.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Earning Potential */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Award size={16} className="text-yellow-500" />
                Earning Potential
              </h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Each survey:</span>
                  <span className="text-green-400">RM 0.10 - RM 1.00</span>
                </div>
                <div className="flex justify-between">
                  <span>All 3 surveys:</span>
                  <span className="text-green-400">Up to RM 3.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Time per survey:</span>
                  <span className="text-blue-400">2-3 minutes</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-100 border border-gray-700'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 bg-gray-800 rounded-2xl p-3 border border-gray-700">
            <input
              type="text"
              placeholder="Ask about earning money or food orders..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className={`p-2 rounded-xl transition-colors ${
                inputValue.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send size={16} />
            </button>
          </div>
          
          {/* Quick suggestion buttons */}
          <div className="flex gap-2 mt-3 overflow-x-auto">
            <button
              onClick={() => setInputValue('How can I earn money?')}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs whitespace-nowrap hover:bg-gray-600 transition-colors"
            >
              How to earn money?
            </button>
            <button
              onClick={() => setInputValue('Show me available surveys')}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs whitespace-nowrap hover:bg-gray-600 transition-colors"
            >
              Available surveys
            </button>
            <button
              onClick={() => setInputValue('Order food with my points')}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs whitespace-nowrap hover:bg-gray-600 transition-colors"
            >
              Order food
            </button>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
