import { useState, useEffect } from 'react';
import { RefreshCw, Download } from 'lucide-react';

const AppUpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [newWorker, setNewWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newServiceWorker = registration.installing;

          if (newServiceWorker) {
            newServiceWorker.addEventListener('statechange', () => {
              if (newServiceWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show update notification
                setShowUpdate(true);
                setNewWorker(newServiceWorker);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (newWorker) {
      newWorker.postMessage({ action: 'skipWaiting' });
      window.location.reload();
    } else {
      window.location.reload();
    }
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-fade-in-up">
      <div className="bg-green-600 text-white rounded-lg shadow-lg border border-green-500 p-4 mx-auto max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">App Updated</h3>
              <p className="text-xs opacity-90">New features available</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleUpdate}
            className="flex-1 bg-white text-green-600 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Update Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppUpdateNotification;