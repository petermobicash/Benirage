import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useState, useEffect, useMemo } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileAppShell from './components/layout/MobileAppShell';
import SplashScreen from './components/pwa/SplashScreen';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Toast from './components/ui/Toast';
import TopBanner from './components/announcements/TopBanner';
import LeftSidebar from './components/announcements/LeftSidebar';
import RightSidebar from './components/announcements/RightSidebar';
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

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    leftAnnouncements,
    dismissAnnouncement
  } = useAnnouncements({
    currentPath,
    deviceType,
    userType: 'visitor'
  });

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const renderPublicRoutes = () => (
    <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/spiritual" element={<Spiritual />} />
        <Route path="/philosophy" element={<Philosophy />} />
        <Route path="/culture" element={<Culture />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/get-involved" element={<GetInvolved />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/partnership" element={<Partnership />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/news" element={<News />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login" element={<Admin />} />
        <Route path="/system-test" element={<SystemTest />} />
        <Route path="/content-guide" element={<ContentGuide />} />
        <Route path="/deployment-guide" element={<DeploymentGuide />} />
        <Route path="/chat-demo" element={<ChatDemo />} />
        <Route path="/whatsapp-chat-demo" element={<WhatsAppChatDemo />} />
        <Route path="/chat" element={<PublicChat />} />
        <Route path="/advanced-features" element={<AdvancedFeatures />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/admin-ads" element={<AdminAds />} />
        <Route path="/ad-demo" element={<AdDemo />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </Suspense>
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
        <div className={`${isMobile ? 'mobile-app' : 'min-h-screen bg-gray-50'}`}>
          <Routes>
            {/* Public routes - mobile vs desktop */}
            <Route path="/*" element={
              isMobile ? (
                <MobileAppShell
                  topAnnouncements={topAnnouncements}
                  onDismissAnnouncement={dismissAnnouncement}
                >
                  {renderPublicRoutes()}
                </MobileAppShell>
              ) : (
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
                     <div className="w-full bg-gray-50 border-b border-gray-200">
                       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                         <div className="py-3 flex justify-center">
                           <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg shadow-lg text-center min-h-[60px] flex items-center">
                             <div className="flex items-center space-x-3">
                               <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                 <span className="text-sm">📢</span>
                               </div>
                               <div>
                                 <div className="font-semibold text-sm">Premium Advertisement</div>
                                 <div className="text-xs opacity-90">728×90 Leaderboard Banner</div>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>

                     <div className="flex flex-1">
                       {/* Left Sidebar - Fixed width, announcements only */}
                       <div className="hidden lg:block w-[240px] bg-white border-r border-gray-200 shadow-sm flex-shrink-0">
                         <div className="h-full">
                           <LeftSidebar
                             announcements={leftAnnouncements}
                             onDismiss={dismissAnnouncement}
                             isCollapsed={sidebarCollapsed}
                             onToggleCollapse={handleSidebarToggle}
                           />
                         </div>
                       </div>

                       {/* Main Content Area - flex-1 to fill remaining space */}
                       <main className="flex-1 bg-white relative min-h-screen">
                         <div className="h-full">
                           <div className="w-[75%] max-w-[1400px] mx-auto p-8">
                             {/* Main Content - Optimal reading width */}
                             <div className="prose prose-lg max-w-none">
                               {renderPublicRoutes()}
                             </div>
                           </div>
                         </div>
                       </main>

                       {/* Right Sidebar - Collapsible/Overlay for medium screens, fixed for large */}
                       <div className="hidden lg:block xl:w-[240px] lg:w-[60px] bg-white border-l border-gray-200 shadow-sm flex-shrink-0 relative group">
                         <div className="h-full flex flex-col">
                           {/* Collapsible Quick Access Section */}
                           <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:w-[60px]' : 'lg:w-[240px]'}`}>
                             <RightSidebar />
                           </div>

                           {/* Essential Right Sidebar Ad - Industry standard placement */}
                           <div className={`p-4 border-t border-gray-100 bg-gray-50/50 transition-all duration-300 ${sidebarCollapsed ? 'lg:opacity-50 lg:pointer-events-none' : ''}`}>
                             <div className="bg-white rounded-lg border border-gray-200 p-4 text-center min-h-[250px] flex items-center justify-center">
                               <div>
                                 <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                   <span className="text-orange-600">🔥</span>
                                 </div>
                                 <div className="font-semibold text-gray-800 mb-1">Advertisement</div>
                                 <div className="text-sm text-gray-600 mb-2">Premium Placement</div>
                                 <div className="text-xs text-gray-500">300×250 Medium Rectangle</div>
                               </div>
                             </div>
                           </div>
                         </div>

                         {/* Expand/Collapse Button for medium screens */}
                         <button
                           onClick={handleSidebarToggle}
                           className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-12 bg-white border border-gray-300 rounded-l-lg shadow-md flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors lg:flex xl:hidden"
                           aria-label="Toggle right sidebar"
                         >
                           {sidebarCollapsed ? '→' : '←'}
                         </button>
                       </div>
                     </div>
                   </div>
                  <Footer />
                </>
              )
            } />

            {/* CMS routes without header and footer */}
            <Route path="/cms" element={
              <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}>
                <CMS />
              </Suspense>
            } />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
