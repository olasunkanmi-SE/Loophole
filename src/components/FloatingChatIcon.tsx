
import { MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function FloatingChatIcon() {
  const [, setLocation] = useLocation();

  return (
    <button
      onClick={() => setLocation('/chat')}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
    >
      <MessageCircle size={24} />
    </button>
  );
}
