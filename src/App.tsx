import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useState, useEffect, useMemo } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileAppShell from './components/layout/MobileAppShell';
import SplashScreen from './components/pwa/SplashScreen';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Toast from './components/ui/Toast';
import TopBanner from './components/announcements/TopBanner';
import { useAnnouncements } from './hooks/useAnnouncements';
import { useToast } from './hooks/useToast';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Spiritual = lazy(() => import('./pages/Spiritual'));
const Philosophy = lazy(() => import('./pages/Philosophy'));
const Culture = lazy(() => import('./pages/Culture'));
const Programs = lazy(() => import('./pages/Programs'));
const GetInvolved = lazy(() => import('./pages/GetInvolved'));
const Membership = lazy(() => import('./pages/Membership'));
const Volunteer = lazy(() => import('./pages/Volunteer'));
const Donate = lazy(() => import('./pages/Donate'));
const Partnership = lazy(() => import('./pages/Partnership'));
const Resources = lazy(() => import('./pages/Resources'));
const News = lazy(() => import('./pages/News'));
const Contact = lazy(() => import('./pages/Contact'));
const Admin = lazy(() => import('./pages/Admin'));
const CMS = lazy(() => import('./pages/CMS'));
const SystemTest = lazy(() => import('./pages/SystemTest'));
const ContentGuide = lazy(() => import('./pages/ContentGuide'));
const DeploymentGuide = lazy(() => import('./pages/DeploymentGuide'));
const ChatDemo = lazy(() => import('./pages/ChatDemo'));
const WhatsAppChatDemo = lazy(() => import('./pages/WhatsAppChatDemo'));
const AdvancedFeatures = lazy(() => import('./pages/AdvancedFeatures'));
const PublicChat = lazy(() => import('./pages/PublicChat'));
const Stories = lazy(() => import('./pages/Stories'));
const AdminAds = lazy(() => import('./pages/AdminAds'));
const AdDemo = lazy(() => import('./pages/AdDemo'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const Privacy = lazy(() => import('./pages/Privacy'));
const DynamicPage = lazy(() => import('./pages/DynamicPage'));

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Hide splash screen after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Memoize device type for announcements
  const deviceType = useMemo((): 'desktop' | 'mobile' | 'tablet' => {
    if (isMobile) return 'mobile';
    if (window.innerWidth >= 1024) return 'desktop';
    return 'tablet';
  }, [isMobile]);

  // Update current path when location changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Announcements hook
  const {
    topAnnouncements,
    dismissAnnouncement
  } = useAnnouncements({
    currentPath,
    deviceType,
    userType: 'visitor'
  });

  const LoadingFallback = () => (
    <div className="flex items-center justify-center p-8">
      <div className="w-6 h-6 rounded-full animate-spin"></div>
      <span className="ml-2 text-gray-600">Loading...</span>
    </div>
  );

  const PublicRoutes = () => (
    <Routes>
      <Route index element={<Suspense fallback={<LoadingFallback />}><Home /></Suspense>} />
      <Route path="about" element={<Suspense fallback={<LoadingFallback />}><About /></Suspense>} />
      <Route path="spiritual" element={<Suspense fallback={<LoadingFallback />}><Spiritual /></Suspense>} />
      <Route path="philosophy" element={<Suspense fallback={<LoadingFallback />}><Philosophy /></Suspense>} />
      <Route path="culture" element={<Suspense fallback={<LoadingFallback />}><Culture /></Suspense>} />
      <Route path="programs" element={<Suspense fallback={<LoadingFallback />}><Programs /></Suspense>} />
      <Route path="get-involved" element={<Suspense fallback={<LoadingFallback />}><GetInvolved /></Suspense>} />
      <Route path="membership" element={<Suspense fallback={<LoadingFallback />}><Membership /></Suspense>} />
      <Route path="volunteer" element={<Suspense fallback={<LoadingFallback />}><Volunteer /></Suspense>} />
      <Route path="donate" element={<Suspense fallback={<LoadingFallback />}><Donate /></Suspense>} />
      <Route path="partnership" element={<Suspense fallback={<LoadingFallback />}><Partnership /></Suspense>} />
      <Route path="resources" element={<Suspense fallback={<LoadingFallback />}><Resources /></Suspense>} />
      <Route path="news" element={<Suspense fallback={<LoadingFallback />}><News /></Suspense>} />
      <Route path="contact" element={<Suspense fallback={<LoadingFallback />}><Contact /></Suspense>} />
      <Route path="admin" element={<Suspense fallback={<LoadingFallback />}><Admin /></Suspense>} />
      <Route path="admin/login" element={<Suspense fallback={<LoadingFallback />}><Admin /></Suspense>} />
      {/* Dynamic page routing for published content */}
      <Route path="pages/:slug" element={<Suspense fallback={<LoadingFallback />}><DynamicPage /></Suspense>} />
      <Route path="system-test" element={<Suspense fallback={<LoadingFallback />}><SystemTest /></Suspense>} />
      <Route path="content-guide" element={<Suspense fallback={<LoadingFallback />}><ContentGuide /></Suspense>} />
      <Route path="deployment-guide" element={<Suspense fallback={<LoadingFallback />}><DeploymentGuide /></Suspense>} />
      <Route path="chat-demo" element={<Suspense fallback={<LoadingFallback />}><ChatDemo /></Suspense>} />
      <Route path="whatsapp-chat-demo" element={<Suspense fallback={<LoadingFallback />}><WhatsAppChatDemo /></Suspense>} />
      <Route path="chat" element={<Suspense fallback={<LoadingFallback />}><PublicChat /></Suspense>} />
      <Route path="advanced-features" element={<Suspense fallback={<LoadingFallback />}><AdvancedFeatures /></Suspense>} />
      <Route path="stories" element={<Suspense fallback={<LoadingFallback />}><Stories /></Suspense>} />
      <Route path="admin-ads" element={<Suspense fallback={<LoadingFallback />}><AdminAds /></Suspense>} />
      <Route path="ad-demo" element={<Suspense fallback={<LoadingFallback />}><AdDemo /></Suspense>} />
      <Route path="user-management" element={<Suspense fallback={<LoadingFallback />}><UserManagement /></Suspense>} />
      <Route path="privacy" element={<Suspense fallback={<LoadingFallback />}><Privacy /></Suspense>} />
    </Routes>
  );

  return (
    <ErrorBoundary>
      {showSplash && <SplashScreen />}
      {/* Toast notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      <Router>
        <div className={`${isMobile ? 'mobile-app' : 'min-h-screen bg-[#05294B]/95'}`}>
          <Routes>
            {/* CMS routes without header and footer */}
            <Route path="/cms/*" element={
              <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}>
                <CMS />
              </Suspense>
            } />
            
            {/* Public routes - mobile vs desktop */}
            {deviceType === 'mobile' ? (
              <Route path="/*" element={
                <MobileAppShell
                  topAnnouncements={topAnnouncements}
                  onDismissAnnouncement={dismissAnnouncement}
                >
                  <PublicRoutes />
                </MobileAppShell>
              } />
            ) : deviceType === 'tablet' ? (
              <Route path="/*" element={
                <>
                  <Header />
                  {/* Top banner for tablet */}
                  <TopBanner
                    announcements={topAnnouncements}
                    onDismiss={dismissAnnouncement}
                    deviceType="tablet"
                  />
                  <div className="flex flex-col min-h-screen">
                    

                    <div className="flex flex-1">
                      {/* Main Content Area - flex-1 for tablet */}
                      <main className="flex-1 bg-[#05294B]/95 relative min-h-screen">
                        <div className="h-full">
                          <div className="max-w-full lg:max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                            {/* Main Content - Responsive reading width */}
                            <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                              <PublicRoutes />
                            </div>
                          </div>
                        </div>
                      </main>

                      {/* Right Sidebar - Collapsible for tablet */}
                     
                    </div>
                  </div>
                  <Footer />
                </>
              } />
            ) : (
              <Route path="/*" element={
                <>
                  <Header />
                  {/* Top banner for desktop */}
                  <TopBanner
                    announcements={topAnnouncements}
                    onDismiss={dismissAnnouncement}
                    deviceType="desktop"
                  />
                  <div className="flex flex-col min-h-screen">
                    {/* Top Banner Ad - Essential placement */}
                    <div className="w-full bg-[#05294B]/95">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="py-3 flex justify-center">
                          <div className="bg-gradient-to-r from-brand-accent to-brand-accent-400 text-brand-main px-6 py-2 rounded-lg shadow-lg text-center min-h-[60px] flex items-center">
                           
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-1">
                      {/* Main Content Area - flex-1 to fill remaining space */}
                      <main className="flex-1 bg-[#05294B]/95 relative min-h-screen">
                        <div className="h-full">
                          <div className="max-w-full xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                            {/* Main Content - Responsive reading width */}
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
              } />
            )}
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;


