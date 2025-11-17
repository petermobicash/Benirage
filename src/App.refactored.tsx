/**
 * Main Application Component
 * Handles routing, layout, and global state management
 * Refactored for better maintainability and separation of concerns
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileAppShell from './components/layout/MobileAppShell';
import SplashScreen from './components/pwa/SplashScreen';

// UI Components
import ErrorBoundary from './components/ui/ErrorBoundary';
import Toast from './components/ui/Toast';

// Hooks
import { useToast } from './hooks/useToast';

// Configuration
import { BREAKPOINTS, TIMING } from './config/app.config';
import { publicRoutes, cmsRoute, LoadingFallback } from './config/routes.config';

/**
 * Main App Component
 */
function App() {
  // State management
  const [isMobile, setIsMobile] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const { toasts, removeToast } = useToast();

  /**
   * Handle responsive viewport detection
   * Updates isMobile state based on window width
   */
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.MOBILE);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  /**
   * Handle splash screen display
   * Hides splash screen after configured duration
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, TIMING.SPLASH_SCREEN_DURATION);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Render public routes with consistent Suspense wrapper
   */
  const PublicRoutes = () => (
    <Routes>
      {publicRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
          index={route.index}
        />
      ))}
    </Routes>
  );

  /**
   * Render desktop layout with header and footer
   */
  const DesktopLayout = () => (
    <>
      <Header />
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-1">
          {/* Main Content Area */}
          <main className="flex-1 bg-[#05294B]/95 relative min-h-screen">
            <div className="h-full">
              <div className="max-w-full xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                  <PublicRoutes />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );

  /**
   * Render tablet layout with header and footer
   */
  const TabletLayout = () => (
    <>
      <Header />
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-1">
          {/* Main Content Area */}
          <main className="flex-1 bg-[#05294B]/95 relative min-h-screen">
            <div className="h-full">
              <div className="max-w-full lg:max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                  <PublicRoutes />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );

  /**
   * Render mobile layout with app shell
   */
  const MobileLayout = () => (
    <MobileAppShell>
      <PublicRoutes />
    </MobileAppShell>
  );

  /**
   * Determine which layout to render based on viewport
   */
  const renderLayout = () => {
    if (isMobile) {
      return <Route path="/*" element={<MobileLayout />} />;
    } else if (window.innerWidth < BREAKPOINTS.TABLET) {
      return <Route path="/*" element={<TabletLayout />} />;
    } else {
      return <Route path="/*" element={<DesktopLayout />} />;
    }
  };

  return (
    <ErrorBoundary>
      {/* Splash Screen */}
      {showSplash && <SplashScreen />}

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Main Router */}
      <Router>
        <div className={`${isMobile ? 'mobile-app' : 'min-h-screen bg-[#05294B]/95'}`}>
          <Routes>
            {/* CMS routes without header and footer */}
            <Route
              path={cmsRoute.path}
              element={
                <div className="flex items-center justify-center p-8">
                  <LoadingFallback />
                  {cmsRoute.element}
                </div>
              }
            />

            {/* Public routes with appropriate layout */}
            {renderLayout()}
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;