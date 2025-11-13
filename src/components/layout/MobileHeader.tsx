import { useState, useEffect } from 'react';
import { Menu as MenuIcon, X as XIcon, Bell, Search, User, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import LanguageSwitcher from '../ui/LanguageSwitcher';

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const MobileHeader = ({ 
  title = 'BENIRAGE', 
  showBackButton = false, 
  onBackClick 
}: MobileHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu when location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const menuItems = [
    { name: 'Home', href: '/', icon: '🏠', description: 'Welcome to our community' },
    { name: 'About', href: '/about', icon: '🏛️', description: 'Learn about our mission' },
    { name: 'Stories', href: '/stories', icon: '📚', description: 'Community stories' },
    { name: 'News', href: '/news', icon: '📰', description: 'Latest updates' },
    { name: 'Contact', href: '/contact', icon: '📞', description: 'Get in touch' },
  ];

  const learnItems = [
    { name: 'Spiritual', href: '/spiritual', icon: '🙏', description: 'Spiritual growth and guidance' },
    { name: 'Philosophy', href: '/philosophy', icon: '🧠', description: 'Philosophical insights' },
    { name: 'Culture', href: '/culture', icon: '🏺', description: 'Cultural heritage' },
    { name: 'Resources', href: '/resources', icon: '📖', description: 'Educational materials' },
  ];

  const actionItems = [
    { name: 'Programs', href: '/programs', icon: '🎓', description: 'Our programs' },
    { name: 'Get Involved', href: '/get-involved', icon: '🤝', description: 'Join our community' },
    { name: 'Membership', href: '/membership', icon: '👥', description: 'Become a member' },
    { name: 'Volunteer', href: '/volunteer', icon: '💪', description: 'Volunteer opportunities' },
    { name: 'Donate', href: '/donate', icon: '💝', description: 'Support our cause' },
    { name: 'Partnership', href: '/partnership', icon: '🤝', description: 'Partner with us' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left: Back Button or Logo */}
          <div className="flex items-center">
            {showBackButton ? (
              <button
                onClick={onBackClick || (() => window.history.back())}
                className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="text-gray-700" size={20} />
              </button>
            ) : (
              <Link to="/" className="flex items-center space-x-2">
                <img
                  src="/LOGO_CLEAR_stars.png"
                  alt="BENIRAGE"
                  className="h-8 w-8 object-contain"
                />
                <span className="font-bold text-[#05294B] text-lg">BENIRAGE</span>
              </Link>
            )}
          </div>

          {/* Center: Title */}
          {title !== 'BENIRAGE' && !showBackButton && (
            <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
          )}

          {/* Right: Actions */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors" aria-label="Search">
              <Search className="text-gray-600" size={20} />
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative" aria-label="Notifications">
              <Bell className="text-gray-600" size={20} />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </button>

            {/* Menu Toggle */}
            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <XIcon className="text-gray-700" size={20} />
              ) : (
                <MenuIcon className="text-gray-700" size={20} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggleMenu}
        />
      )}

      {/* Slide-out Menu */}
      <div className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#05294B] to-brand-accent text-white">
            <div className="flex items-center space-x-3">
              <img
                src="/LOGO_CLEAR_stars.png"
                alt="BENIRAGE"
                className="h-10 w-10 object-contain"
              />
              <div>
                <h2 className="text-xl font-bold">BENIRAGE</h2>
                <p className="text-sm opacity-90">Grounded • Guided • Rooted</p>
              </div>
            </div>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <XIcon size={20} />
            </button>
          </div>

          {/* User Section */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#05294B] to-brand-accent rounded-full flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Welcome</h3>
                <p className="text-sm text-gray-600">Sign in for personalized experience</p>
              </div>
            </div>
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Quick Actions */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 transition-colors">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">📞</span>
                  </div>
                  <span className="text-sm font-medium text-red-800">Emergency</span>
                </button>
                <button className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-colors">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">💬</span>
                  </div>
                  <span className="text-sm font-medium text-blue-800">Chat</span>
                </button>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Main</h4>
              <nav className="space-y-2">
                {menuItems.map((item, index) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={toggleMenu}
                    className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 group-hover:text-[#05294B]">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500 group-hover:text-gray-700">
                        {item.description}
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-[#05294B] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Learn Section */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Learn</h4>
              <nav className="space-y-2">
                {learnItems.map((item, index) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={toggleMenu}
                    className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 animate-fade-in-up"
                    style={{ animationDelay: `${(menuItems.length + index) * 100}ms` }}
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 group-hover:text-[#05294B]">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500 group-hover:text-gray-700">
                        {item.description}
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-[#05294B] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Actions Section */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Get Involved</h4>
              <nav className="space-y-2">
                {actionItems.map((item, index) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={toggleMenu}
                    className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 animate-fade-in-up"
                    style={{ animationDelay: `${(menuItems.length + learnItems.length + index) * 100}ms` }}
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 group-hover:text-[#05294B]">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500 group-hover:text-gray-700">
                        {item.description}
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-[#05294B] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Menu Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-semibold text-gray-600 mb-3">Language</h5>
                <LanguageSwitcher variant="buttons" />
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  © 2025 BENIRAGE. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileHeader;