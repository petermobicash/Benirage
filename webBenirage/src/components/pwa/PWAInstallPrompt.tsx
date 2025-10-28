import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const Android = /Android/.test(navigator.userAgent);

    setIsIOS(iOS);

    // Show prompt after a delay for better UX
    const timer = setTimeout(() => {
      if (!isInstalled && (iOS || Android)) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after user interaction
      setTimeout(() => {
        if (!isInstalled) {
          setShowPrompt(true);
        }
      }, 5000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // For iOS, show manual installation instructions
      if (isIOS) {
        showIOSInstructions();
      }
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const showIOSInstructions = () => {
    // You could show a modal with iOS installation instructions
    alert('To install BENIRAGE on iOS:\n1. Tap the Share button\n2. Select "Add to Home Screen"\n3. Tap "Add" to confirm');
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-fade-in-up">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mx-auto max-w-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-yellow-500 rounded-lg flex items-center justify-center mr-3">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Install BENIRAGE</h3>
              <p className="text-xs text-gray-600">Get the full app experience</p>
            </div>
          </div>
          <button
            onClick={dismissPrompt}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            {isIOS ? 'Install on iOS' : 'Install App'}
          </button>
        </div>

        {isIOS && (
          <p className="text-xs text-gray-500 mt-2">
            On iOS: Tap Share → Add to Home Screen
          </p>
        )}
      </div>
    </div>
  );
};

export default PWAInstallPrompt;