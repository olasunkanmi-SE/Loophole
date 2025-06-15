
import { useState } from "react";
import { ArrowLeft, Send, Paperclip, Mic, MapPin, Sparkles, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";
import MobileContainer from "../components/MobileContainer";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function Chat() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Hello! I'm here to help you with any questions about your orders, points, or recommendations. How can I assist you today?",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <MobileContainer>
      <div className="bg-gray-900 min-h-screen text-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <button 
            onClick={() => setLocation('/')}
            className="text-gray-300 hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-blue-400" />
            <h1 className="text-xl font-bold">EcoWares AI</h1>
          </div>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
        </div>

        {/* Welcome Screen */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles size={32} className="text-blue-400" />
                <h2 className="text-3xl font-bold">EcoWares AI</h2>
              </div>
              <p className="text-gray-400 text-lg">Your sustainable lifestyle assistant</p>
            </div>

            <div className="grid grid-cols-1 gap-3 w-full max-w-sm mb-8">
              <button className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl p-4 text-left transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <span className="font-medium">Eco Tips</span>
                </div>
              </button>

              <button className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl p-4 text-left transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <MessageCircle size={16} />
                  </div>
                  <span className="font-medium">Order Help</span>
                </div>
              </button>

              <button className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl p-4 text-left transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <span className="font-medium">Points Guide</span>
                </div>
              </button>
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

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700">
          <div className="bg-gray-800 rounded-2xl border border-gray-600 flex items-center p-2">
            <button className="p-2 text-gray-400 hover:text-white">
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What do you want to know?"
              className="flex-1 bg-transparent text-white placeholder-gray-400 px-2 py-1 focus:outline-none"
            />
            <button className="p-2 text-gray-400 hover:text-white">
              <MapPin size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-white">
              <Mic size={20} />
            </button>
            <button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
          
          <div className="flex items-center justify-center mt-2">
            <span className="text-gray-500 text-xs">EcoWares AI • Powered by sustainability</span>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
