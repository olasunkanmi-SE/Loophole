
import { Bell } from "lucide-react";
import { useNotifications } from "../contexts/NotificationContext";
import { useLocation } from "wouter";

export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [, setLocation] = useLocation();

  return (
    <button
      onClick={() => setLocation('/notifications')}
      className="relative p-2 text-gray-600 hover:text-gray-900"
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
