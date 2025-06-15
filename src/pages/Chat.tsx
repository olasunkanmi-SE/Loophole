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
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load chat history from localStorage on initialization
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (error) {
        console.error('Error parsing saved chat history:', error);
      }
    }
    return [];
  });
  const [inputValue, setInputValue] = useState('');
  const { getTotalPoints, getFormattedRM, getCompletedCategories } = usePoints();

  const totalPoints = getTotalPoints();
  const availableRM = getFormattedRM();
  const completedSurveys = getCompletedCategories().length;

  // Function to save chat history to localStorage (keep last 5 conversations)
  const saveChatHistory = (newMessages: Message[]) => {
    try {
      // Limit to last 10 messages (approximately 5 conversations assuming user + assistant pairs)
      const limitedMessages = newMessages.slice(-10);
      localStorage.setItem('chatHistory', JSON.stringify(limitedMessages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

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
      id: 'housing',
      title: 'Find Housing',
      description: `Book accommodation with your ${availableRM}`,
      icon: <Home size={16} className="text-purple-500" />,
      action: () => setLocation('/housing')
    },
    {
      id: 'points-status',
      title: 'My Earnings',
      description: `${totalPoints} points • ${completedSurveys}/8 surveys done`,
      icon: <Award size={16} className="text-blue-500" />,
      action: () => setLocation('/points')
    }
  ];

  // Helper function to extract menu items from AI response
  const extractMenuItems = (content: string) => {
    const menuItems = [
      // Drinks
      { id: "4", name: "Blood Orange Cocktail", price: 12, category: "drink" },
      { id: "14", name: "Classic Mojito", price: 10, category: "drink" },
      { id: "15", name: "Espresso Martini", price: 14, category: "drink" },
      { id: "16", name: "Tropical Paradise", price: 11, category: "drink" },
      // Chicken
      { id: "10", name: "Herb Roasted Chicken", price: 16, category: "chicken" },
      { id: "11", name: "Chicken Tikka Masala", price: 14, category: "chicken" },
      { id: "12", name: "Buffalo Chicken Wings", price: 12, category: "chicken" },
      { id: "13", name: "Chicken Cordon Bleu", price: 18, category: "chicken" },
      // Seafood
      { id: "2", name: "Maple Bourbon Glazed Salmon", price: 20, category: "seafood" },
      { id: "8", name: "Garlic Butter Clams", price: 15, category: "seafood" },
      { id: "9", name: "Grilled Lobster Tail", price: 32, category: "seafood" },
      { id: "17", name: "Pan-Seared Scallops", price: 24, category: "seafood" },
      // Meat
      { id: "1", name: "Grilled Rack of Lamb", price: 20, category: "meat" },
      { id: "5", name: "Wagyu Beef Steak", price: 35, category: "meat" },
      { id: "6", name: "BBQ Pork Ribs", price: 18, category: "meat" },
      { id: "7", name: "Venison Medallions", price: 28, category: "meat" }
    ];

    const foundItems = menuItems.filter(item => 
      content.toLowerCase().includes(item.name.toLowerCase()) ||
      content.toLowerCase().includes(item.name.split(' ')[0].toLowerCase())
    );

    return foundItems;
  };

  // Helper function to format AI response with better styling
  const formatAIResponse = (content: string) => {
    // Extract menu items mentioned in the response
    const mentionedMenuItems = extractMenuItems(content);
    
    // Split content into paragraphs and format
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      // Check if it's a list
      if (paragraph.includes('•') || paragraph.includes('-')) {
        const items = paragraph.split('\n').filter(item => item.trim());
        return (
          <div key={index} className="mb-4">
            {items.map((item, itemIndex) => {
              if (item.includes('•') || item.includes('-')) {
                return (
                  <div key={itemIndex} className="flex items-start gap-2 mb-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-200 text-sm">{item.replace(/[•-]/, '').trim()}</span>
                  </div>
                );
              }
              return (
                <p key={itemIndex} className="text-gray-100 text-sm mb-2">
                  {item}
                </p>
              );
            })}
          </div>
        );
      }
      
      // Check if it's a food recommendation with prices - show clickable cards
      if (paragraph.includes('RM') && (paragraph.includes('recommend') || paragraph.includes('food') || mentionedMenuItems.length > 0)) {
        return (
          <div key={index} className="mb-4">
            <div className="bg-gray-700 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <UtensilsCrossed size={16} className="text-orange-400" />
                <span className="text-orange-400 font-medium text-sm">Food Recommendations</span>
              </div>
              <p className="text-gray-200 text-sm mb-3">{paragraph}</p>
            </div>
            
            {/* Clickable Menu Item Cards */}
            {mentionedMenuItems.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-gray-400 mb-2">Click to view details:</div>
                <div className="grid grid-cols-1 gap-2">
                  {mentionedMenuItems.map((item, itemIdx) => (
                    <button
                      key={itemIdx}
                      onClick={() => setLocation(`/menu/${item.id}`)}
                      className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg p-3 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                            <UtensilsCrossed size={16} className="text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-white text-sm">{item.name}</div>
                            <div className="text-xs text-gray-400 capitalize">{item.category}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold">RM {item.price}</div>
                          <div className="text-xs text-gray-400">View Details →</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
      
      // Check if it's about earning/surveys
      if (paragraph.includes('survey') || paragraph.includes('earn') || paragraph.includes('points')) {
        return (
          <div key={index} className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg p-3 mb-4 border border-green-700/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-green-400" />
              <span className="text-green-400 font-medium text-sm">Earning Opportunity</span>
            </div>
            <p className="text-gray-200 text-sm">{paragraph}</p>
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="text-gray-100 text-sm mb-3 leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  // Helper function to extract actionable buttons from AI response
  const extractActionButtons = (content: string) => {
    const actions = [];
    
    // Check for food ordering mentions
    if (content.toLowerCase().includes('order food') || content.toLowerCase().includes('menu')) {
      actions.push({
        text: 'View Food Menu',
        icon: <UtensilsCrossed size={16} />,
        onClick: () => setLocation('/menu')
      });
    }
    
    // Check for housing/accommodation mentions
    if (content.toLowerCase().includes('housing') || content.toLowerCase().includes('accommodation') || 
        content.toLowerCase().includes('hostel') || content.toLowerCase().includes('hotel') ||
        content.toLowerCase().includes('stay') || content.toLowerCase().includes('lodging')) {
      actions.push({
        text: 'View Housing Options',
        icon: <Home size={16} />,
        onClick: () => setLocation('/housing')
      });
    }
    
    // Check for survey mentions
    if (content.toLowerCase().includes('survey') || content.toLowerCase().includes('earn more')) {
      actions.push({
        text: 'Complete Surveys',
        icon: <DollarSign size={16} />,
        onClick: () => setLocation('/')
      });
    }
    
    // Check for points/earnings mentions
    if (content.toLowerCase().includes('points') || content.toLowerCase().includes('earnings')) {
      actions.push({
        text: 'View My Earnings',
        icon: <Award size={16} />,
        onClick: () => setLocation('/points')
      });
    }
    
    return actions;
  };

  // Comprehensive app context for the LLM
  const getComprehensivePrompt = (userQuery: string, categoryHint?: string) => {
    const foodMenu = {
      drinks: [
        { name: "Blood Orange Cocktail", price: 12, description: "Refreshing citrus cocktail" },
        { name: "Classic Mojito", price: 10, description: "Fresh mint, lime, and white rum" },
        { name: "Espresso Martini", price: 14, description: "Coffee cocktail with vodka" },
        { name: "Tropical Paradise", price: 11, description: "Pineapple, coconut, and passion fruit" }
      ],
      meat: [
        { name: "Grilled Rack of Lamb", price: 20, description: "Perfectly seasoned rack of lamb" },
        { name: "Wagyu Beef Steak", price: 35, description: "Premium wagyu beef, grilled to perfection" },
        { name: "BBQ Pork Ribs", price: 18, description: "Slow-cooked pork ribs with smoky BBQ sauce" },
        { name: "Venison Medallions", price: 28, description: "Tender venison with juniper berry sauce" }
      ],
      chicken: [
        { name: "Herb Roasted Chicken", price: 16, description: "Free-range chicken with rosemary and thyme" },
        { name: "Chicken Tikka Masala", price: 14, description: "Creamy tomato curry with tender chicken" },
        { name: "Buffalo Chicken Wings", price: 12, description: "Crispy wings tossed in spicy buffalo sauce" },
        { name: "Chicken Cordon Bleu", price: 18, description: "Stuffed chicken breast with ham and swiss cheese" }
      ],
      seafood: [
        { name: "Maple Bourbon Glazed Salmon", price: 20, description: "Sweet and savory salmon" },
        { name: "Garlic Butter Clams", price: 15, description: "Fresh clams in garlic butter sauce" },
        { name: "Grilled Lobster Tail", price: 32, description: "Fresh lobster tail with lemon butter" },
        { name: "Pan-Seared Scallops", price: 24, description: "Perfectly seared scallops with cauliflower puree" }
      ]
    };

    const accommodations = {
      budget: [
        { name: "Budget Hostel Dorm Bed", price: 15, location: "Petaling Jaya", type: "Shared room", description: "Clean and safe hostel dorm perfect for budget travelers" },
        { name: "Capsule Pod Experience", price: 20, location: "Bukit Bintang, KL", type: "Unique space", description: "Futuristic capsule hotel experience" },
        { name: "Student Housing Single Room", price: 25, location: "USJ, Selangor", type: "Private room", description: "Perfect for students with study-friendly environment" }
      ],
      midRange: [
        { name: "Private Room with Breakfast", price: 35, location: "Subang Jaya", type: "Private room", description: "Comfortable private room with breakfast included" },
        { name: "Cozy Studio in City Center", price: 45, location: "Kuala Lumpur", type: "Entire apartment", description: "Modern studio apartment in the heart of KL" }
      ],
      luxury: [
        { name: "Luxury Condo with Pool", price: 85, location: "KLCC, Kuala Lumpur", type: "Entire apartment", description: "Stunning luxury apartment with city views" }
      ]
    };

    let baseContext = `You are a comprehensive AI assistant for EarnQuiz, a Malaysian app where people earn money by completing surveys and use that money to order food.

CURRENT USER STATUS:
- Total Points: ${totalPoints} points
- Available Money: ${availableRM}
- Completed Surveys: ${completedSurveys}/3
- Conversion Rate: 1 point = RM 1.00

AVAILABLE SURVEYS:
1. Lifestyle & Shopping (2-10 points, 2-3 minutes) - About shopping habits, sustainable living, consumer behavior
2. Digital & Tech (2-10 points, 2-3 minutes) - About technology usage, streaming habits, digital preferences
3. Food & Dining (2-10 points, 2-3 minutes) - About food preferences, dining habits, cultural food choices

FOOD MENU WITH PRICES:
Drinks (RM 10-14): ${foodMenu.drinks.map(item => `${item.name} (RM ${item.price})`).join(', ')}
Chicken (RM 12-18): ${foodMenu.chicken.map(item => `${item.name} (RM ${item.price})`).join(', ')}
Seafood (RM 15-32): ${foodMenu.seafood.map(item => `${item.name} (RM ${item.price})`).join(', ')}
Meat (RM 18-35): ${foodMenu.meat.map(item => `${item.name} (RM ${item.price})`).join(', ')}

HOUSING & ACCOMMODATION OPTIONS:
Budget (RM 15-25): ${accommodations.budget.map(item => `${item.name} (RM ${item.price}) in ${item.location}`).join(', ')}
Mid-Range (RM 35-45): ${accommodations.midRange.map(item => `${item.name} (RM ${item.price}) in ${item.location}`).join(', ')}
Luxury (RM 85+): ${accommodations.luxury.map(item => `${item.name} (RM ${item.price}) in ${item.location}`).join(', ')}

INTELLIGENT CAPABILITIES:
- Provide personalized food recommendations based on user's budget
- Suggest housing/accommodation options within user's budget range
- Recommend survey combinations to reach specific spending goals for food OR accommodation
- Help users understand earning potential vs. food AND housing costs
- Guide users through the app's features and navigation
- Answer questions about Malaysian food culture, housing options, and preferences
- Compare costs between food vs accommodation spending strategies

RECOMMENDATION LOGIC:
Food Recommendations:
- If user has RM 0-5: Recommend drinks and completing more surveys
- If user has RM 5-15: Recommend chicken dishes and some seafood
- If user has RM 15-25: Recommend most menu items except premium options
- If user has RM 25+: Recommend any menu items including premium meat and seafood

Housing Recommendations:
- If user has RM 0-15: Suggest completing more surveys, focus on budget hostels (RM 15-25)
- If user has RM 15-25: Recommend budget hostels and dorm beds
- If user has RM 25-45: Recommend private rooms and studio apartments
- If user has RM 45+: Recommend luxury options and private apartments

Combined Strategy:
- Help users balance between food and accommodation spending
- Suggest earning goals for multi-day trips (food + accommodation)
- Recommend cost-effective combinations (e.g., hostel + good meals vs luxury stay + simple food)

CONVERSATION STYLE:
- Be friendly, knowledgeable, and helpful
- Provide specific recommendations with prices
- Encourage earning when appropriate but don't be pushy
- Use Malaysian context when relevant
- Be conversational and natural
- Always respond to the user's specific question`;

    // Add category-specific context if provided
    if (categoryHint) {
      const categoryContexts = {
        lifestyle: `\n\nCURRENT FOCUS: User is interested in the Lifestyle & Shopping survey about sustainable products, shopping habits, and consumer preferences. Highlight how this helps Malaysian businesses understand eco-friendly consumer trends.`,
        digital: `\n\nCURRENT FOCUS: User is interested in the Digital & Tech survey about technology usage, streaming preferences, and digital habits. Emphasize how this helps tech companies improve services for Malaysian users.`,
        food: `\n\nCURRENT FOCUS: User is interested in the Food & Dining survey about food preferences, dining habits, and cultural food choices. Connect this to how it helps the food industry serve Malaysian tastes better.`
      };
      
      baseContext += categoryContexts[categoryHint] || '';
    }

    return `${baseContext}

User query: ${userQuery}`;
  };

  const handleSendMessage = async (categoryHint?: string) => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);
    const query = inputValue.trim();
    setInputValue('');

    try {
      // Get API key
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCZ2i4mYhfTC59fZSQoAIUsIJJmMqvQ5fE';
      console.log('Using API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');

      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-1219" });

      // Use comprehensive prompt with category hint if provided
      const systemPrompt = getComprehensivePrompt(query, categoryHint);
      console.log('Sending prompt to Gemini:', systemPrompt.substring(0, 200) + '...');

      const result = await model.generateContent(systemPrompt);
      console.log('Gemini response received:', result);
      
      const response = result.response.text();
      console.log('Response text:', response);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'assistant',
        timestamp: new Date()
      };

      const finalMessages = [...messages, userMessage, assistantMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } catch (error) {
      console.error('Gemini AI error details:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);

      // More specific error handling
      let fallbackResponse = '';
      
      if (error?.message?.includes('API_KEY')) {
        fallbackResponse = `There's an issue with the API configuration. Let me help you with what I know! You have ${totalPoints} points (${availableRM}). What would you like to know about earning money or ordering food?`;
      } else if (error?.message?.includes('quota') || error?.message?.includes('limit')) {
        fallbackResponse = `The AI service is temporarily busy. I can still help! You have ${totalPoints} points (${availableRM}). Ask me about surveys, food recommendations, or how to use your points!`;
      } else {
        fallbackResponse = `I'm having technical difficulties right now, but I'm here to help! You have ${totalPoints} points (${availableRM}). What would you like to know about the app?`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: fallbackResponse,
        sender: 'assistant',
        timestamp: new Date()
      };

      const finalMessages = [...messages, userMessage, assistantMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
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
          {messages.length > 0 && (
            <button
              onClick={() => {
                setMessages([]);
                localStorage.removeItem('chatHistory');
              }}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-xs text-gray-400 hover:text-white"
              title="Clear chat history"
            >
              Clear
            </button>
          )}
          {messages.length === 0 && <div className="w-8" />}
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
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <DollarSign size={36} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles size={12} className="text-yellow-800" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Your AI Earnings Assistant
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Complete quick surveys, earn real money, and order delicious food. 
                  I'm here to help you maximize your earnings! 🚀
                </p>
              </div>
            </div>

            {/* Quick Actions with Enhanced Design */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 rounded"></div>
                <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
              </div>
              
              {quickActions.map((action, index) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="w-full bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 border border-gray-600 rounded-xl p-4 text-left transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center shadow-lg">
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{action.title}</div>
                      <div className="text-sm text-gray-300">{action.description}</div>
                    </div>
                    <div className="text-gray-500">
                      <ArrowUp size={16} className="rotate-45" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Enhanced Earning Potential Card */}
            <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-xl p-5 border border-gray-600 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Award size={16} className="text-white" />
                </div>
                <h4 className="font-semibold text-white">💰 Earning Potential</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-600">
                  <div className="text-lg font-bold text-green-400">RM 0.10-1.00</div>
                  <div className="text-xs text-gray-400">Per Survey</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-600">
                  <div className="text-lg font-bold text-blue-400">2-3 min</div>
                  <div className="text-xs text-gray-400">Time Required</div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-green-900/20 rounded-lg border border-green-700/30">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">Up to RM 3.00</div>
                  <div className="text-xs text-green-300">Complete all 3 surveys</div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">
                  🎯 Start earning now and order your favorite food!
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-3">
                💬 Ask me anything about earning money or ordering food!
              </p>
              <div className="flex justify-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
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
                {message.sender === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <Sparkles size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-2xl p-3'
                      : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-2xl overflow-hidden'
                  }`}
                >
                  {message.sender === 'user' ? (
                    <>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </>
                  ) : (
                    <div className="space-y-3">
                      {/* AI Header */}
                      <div className="bg-gradient-to-r from-green-600 to-blue-600 px-4 py-2 -m-3 mb-3">
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-white" />
                          <span className="text-sm font-medium text-white">EarnQuiz Assistant</span>
                        </div>
                      </div>

                      {/* AI Response Content */}
                      <div className="px-3 pb-3">
                        <div className="prose prose-sm prose-invert max-w-none">
                          {formatAIResponse(message.content)}
                        </div>
                        
                        {/* Quick Action Buttons from AI response */}
                        {extractActionButtons(message.content).length > 0 && (
                          <div className="mt-4 space-y-2">
                            {extractActionButtons(message.content).map((action, index) => (
                              <button
                                key={index}
                                onClick={action.onClick}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                              >
                                {action.icon}
                                {action.text}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Timestamp */}
                        <p className="text-xs opacity-50 mt-3">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )}
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
              onClick={() => setInputValue('Recommend food within my budget')}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs whitespace-nowrap hover:bg-gray-600 transition-colors"
            >
              Food recommendations
            </button>
            <button
              onClick={() => setInputValue('Show me affordable housing options')}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs whitespace-nowrap hover:bg-gray-600 transition-colors"
            >
              Housing options
            </button>
            <button
              onClick={() => setInputValue('How to earn more money?')}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs whitespace-nowrap hover:bg-gray-600 transition-colors"
            >
              Earn more money
            </button>
            <button
              onClick={() => setInputValue('What can I afford with my current balance?')}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs whitespace-nowrap hover:bg-gray-600 transition-colors"
            >
              What can I afford?
            </button>
            <button
              onClick={() => setInputValue('Plan my food and accommodation budget')}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs whitespace-nowrap hover:bg-gray-600 transition-colors"
            >
              Budget planning
            </button>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}