import { ReactNode } from 'react';
import MobileBottomNav from '../ui/MobileBottomNav';
import PWAInstallPrompt from '../pwa/PWAInstallPrompt';
import AppUpdateNotification from '../pwa/AppUpdateNotification';
import TopBanner from '../announcements/TopBanner';
import { Announcement } from '../../types/announcements';

interface MobileAppShellProps {
  children: ReactNode;
  showBottomNav?: boolean;
  className?: string;
  topAnnouncements?: Announcement[];
  onDismissAnnouncement?: (id: string) => void;
}

const MobileAppShell = ({
   children,
   showBottomNav = true,
   className = '',
   topAnnouncements = [],
   onDismissAnnouncement
 }: MobileAppShellProps) => {
   return (
     <div className={`mobile-app-container mobile-safe-screen ${className}`}>
       <AppUpdateNotification />

       {/* Essential Mobile Top Banner Ad - Clean and minimal */}
       <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4">
         <div className="flex items-center justify-center space-x-2 text-center">
           <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
             <span className="text-xs">📱</span>
           </div>
           <div className="flex-1">
             <div className="text-sm font-semibold">Advertisement</div>
             <div className="text-xs opacity-90">320×50 Mobile Banner</div>
           </div>
         </div>
       </div>

       <div className="mobile-layout">
         {/* Top banner for mobile */}
         {topAnnouncements.length > 0 && onDismissAnnouncement && (
           <TopBanner
             announcements={topAnnouncements}
             onDismiss={onDismissAnnouncement}
             deviceType="mobile"
           />
         )}

         {/* Main Content - Maximized for Mobile Reading */}
         <div className="mobile-content min-h-screen">
           <div className="max-w-none px-4 py-6">
             {children}
           </div>
         </div>
       </div>

       {/* Essential Mobile Footer Ad - Clean placement above navigation */}
       <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-t border-orange-200 py-2 px-4">
         <div className="bg-white rounded-lg border border-orange-200 p-3 text-center">
           <div className="flex items-center justify-center space-x-2">
             <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
               <span className="text-orange-600 text-sm">🔥</span>
             </div>
             <div>
               <div className="text-sm font-semibold text-orange-800">Premium Mobile Ad</div>
               <div className="text-xs text-orange-600">Footer Placement</div>
             </div>
           </div>
         </div>
       </div>

       {showBottomNav && <MobileBottomNav />}
       <PWAInstallPrompt />
     </div>
   );
 };

export default MobileAppShell;