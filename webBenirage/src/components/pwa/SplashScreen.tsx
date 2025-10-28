import { useState, useEffect } from 'react';

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsVisible(false), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-blue-900 via-blue-800 to-yellow-600 flex flex-col items-center justify-center mobile-safe-screen">
      <div className="text-center max-w-sm mx-auto px-6">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
            <img
              src="/LOGO_CLEAR_stars.png"
              alt="BENIRAGE"
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">BENIRAGE</h1>
          <p className="text-yellow-400 text-sm font-medium">Grounded • Guided • Rooted</p>
        </div>

        {/* Loading Animation */}
        <div className="mb-8">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80 text-sm">Loading your experience...</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-1 mb-4">
          <div
            className="bg-white h-1 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Loading Text */}
        <div className="text-white/60 text-xs">
          {progress < 30 && "Initializing..."}
          {progress >= 30 && progress < 60 && "Connecting..."}
          {progress >= 60 && progress < 90 && "Preparing content..."}
          {progress >= 90 && "Almost ready..."}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;