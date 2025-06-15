
import { useState } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileContainer from "../components/MobileContainer";
import { useLocation } from "wouter";
import { useNotifications } from "../contexts/NotificationContext";
import { Bell, BellOff, Settings, Trash2 } from "lucide-react";

export default function Notifications() {
  const [, setLocation] = useLocation();
  const { notifications, markAsRead, markAllAsRead, requestPermission, isSupported } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(notif => 
    filter === 'all' || !notif.read
  );

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      alert('Notifications enabled! You\'ll now receive updates about orders, surveys, and achievements.');
    } else {
      alert('Please enable notifications in your browser settings to receive updates.');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return '🍽️';
      case 'survey': return '📝';
      case 'achievement': return '🏆';
      case 'referral': return '👥';
      default: return '📱';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <MobileContainer>
      <div className="bg-gray-50 min-h-screen">
        <MobileHeader 
          title="Notifications" 
          onBack={() => setLocation('/profile')}
        />

        <div className="p-4 space-y-4">
          {/* Enable Notifications Banner */}
          {isSupported && Notification.permission !== 'granted' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Enable Push Notifications</p>
                    <p className="text-xs text-blue-700">Get real-time updates on orders and achievements</p>
                  </div>
                </div>
                <button
                  onClick={handleEnableNotifications}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs"
                >
                  Enable
                </button>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    filter === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    filter === 'unread' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Unread ({notifications.filter(n => !n.read).length})
                </button>
              </div>
              
              {notifications.some(n => !n.read) && (
                <button
                  onClick={markAllAsRead}
                  className="text-blue-600 text-sm"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-2">
            {filteredNotifications.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <BellOff className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 mb-2">No notifications</p>
                <p className="text-sm text-gray-400">
                  {filter === 'unread' ? 'All caught up!' : 'Complete surveys and place orders to get updates'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  className={`bg-white rounded-lg p-4 border cursor-pointer transition-colors ${
                    notification.read 
                      ? 'border-gray-200' 
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            notification.read ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </p>
                          <p className={`text-sm mt-1 ${
                            notification.read ? 'text-gray-500' : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          <span className="text-xs text-gray-400">
                            {formatTime(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
