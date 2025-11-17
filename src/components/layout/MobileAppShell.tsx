import { ReactNode } from 'react';
import MobileBottomNav from '../ui/MobileBottomNav';
import MobileHeader from './MobileHeader';
import PWAInstallPrompt from '../pwa/PWAInstallPrompt';
import AppUpdateNotification from '../pwa/AppUpdateNotification';

interface MobileAppShellProps {
  children: ReactNode;
  showBottomNav?: boolean;
  showHeader?: boolean;
  className?: string;
  pageTitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const MobileAppShell = ({
  children,
  showBottomNav = true,
  showHeader = true,
  className = '',
  pageTitle = 'BENIRAGE',
  showBackButton = false,
  onBackClick
}: MobileAppShellProps) => {
  return (
    <div className={`mobile-app-container mobile-safe-screen ${className}`}>
      <AppUpdateNotification />

      {/* Mobile Header */}
      {showHeader && (
        <MobileHeader 
          title={pageTitle}
          showBackButton={showBackButton}
          onBackClick={onBackClick}
        />
      )}

      {/* Mobile Layout */}
      <div className="mobile-layout mt-16">
        {/* Main Content - Optimized for Mobile */}
        <div className="mobile-content min-h-screen">
          <div className="max-w-none px-4 py-6 pb-24">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Footer Content Area */}
      <div className="bg-white border-t border-gray-200 py-4 px-4 fixed bottom-20 left-0 right-0 z-30 lg:hidden">
        {/* Quick Contact Footer */}
        <div className="flex items-center justify-center space-x-4 text-sm">
          <a href="tel:+250788310932" className="flex items-center space-x-2 text-gray-600 hover:text-[#05294B] transition-colors">
            <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xs">📞</span>
            </span>
            <span className="font-medium">Call</span>
          </a>
          <div className="w-px h-6 bg-gray-300"></div>
          <a href="mailto:info@benirage.org" className="flex items-center space-x-2 text-gray-600 hover:text-[#05294B] transition-colors">
            <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xs">✉️</span>
            </span>
            <span className="font-medium">Email</span>
          </a>
          <div className="w-px h-6 bg-gray-300"></div>
          <a href="/donate" className="flex items-center space-x-2 text-gray-600 hover:text-[#05294B] transition-colors">
            <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-xs">💝</span>
            </span>
            <span className="font-medium">Donate</span>
          </a>
        </div>
      </div>

      {/* Enhanced Bottom Navigation */}
      {showBottomNav && <MobileBottomNav />}
      
      <PWAInstallPrompt />
    </div>
  );
};

export default MobileAppShell;