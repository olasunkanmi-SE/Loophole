
import { WifiOff, Wifi, Upload } from "lucide-react";
import { useOffline } from "../contexts/OfflineContext";

export default function OfflineIndicator() {
  const { isOnline, pendingSurveys, syncPendingSurveys } = useOffline();

  if (isOnline && pendingSurveys.length === 0) {
    return null;
  }

  return (
    <div className={`fixed top-16 left-4 right-4 z-50 ${
      isOnline ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'
    } border rounded-lg p-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="text-blue-600" size={16} />
          ) : (
            <WifiOff className="text-yellow-600" size={16} />
          )}
          <span className={`text-sm font-medium ${
            isOnline ? 'text-blue-900' : 'text-yellow-900'
          }`}>
            {isOnline 
              ? `${pendingSurveys.length} surveys ready to sync`
              : 'Offline mode - surveys will sync when connected'
            }
          </span>
        </div>
        
        {isOnline && pendingSurveys.length > 0 && (
          <button
            onClick={syncPendingSurveys}
            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs flex items-center space-x-1"
          >
            <Upload size={12} />
            <span>Sync</span>
          </button>
        )}
      </div>
    </div>
  );
}
