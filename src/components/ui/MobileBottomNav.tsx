import { useState, useEffect } from 'react';
import { Home, Heart, BookOpen, Settings, Menu as MenuIcon, X as XIcon, Bell, Search, User, Phone, Mail } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const MobileBottomNav = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('/');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);

  const mainNavItems = [
    { icon: Home, label: 'Home', path: '/', color: 'from-blue-500 to-blue-600' },
    { icon: Heart, label: 'Spiritual', path: '/spiritual', color: 'from-pink-500 to-pink-600' },
    { icon: BookOpen, label: 'Philosophy', path: '/philosophy', color: 'from-purple-500 to-purple-600' },
    { icon: Settings, label: 'Resources', path: '/resources', color: 'from-green-500 to-green-600' },
  ];

  const menuItems = [
    { label: 'About Us', path: '/about', icon: '🏛️' },
    { label: 'Culture', path: '/culture', icon: '🏺' },
    { label: 'Programs', path: '/programs', icon: '🎓' },
    { label: 'Get Involved', path: '/get-involved', icon: '🤝' },
    { label: 'Membership', path: '/membership', icon: '👥' },
    { label: 'Volunteer', path: '/volunteer', icon: '💪' },
    { label: 'Donate', path: '/donate', icon: '💝' },
    { label: 'Partnership', path: '/partnership', icon: '🤝' },
    { label: 'News', path: '/news', icon: '📰' },
    { label: 'Contact', path: '/contact', icon: '📞' },
    { label: 'Stories', path: '/stories', icon: '📚' },
    { label: 'Chat', path: '/chat', icon: '💬' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Main Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <div className="mobile-bottom-nav-container">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              >
                <div className={`mobile-nav-icon ${isActive ? 'bg-gradient-to-r ' + item.color : ''}`}>
                  <Icon className={isActive ? 'text-white' : 'text-gray-500'} size={20} />
                </div>
                <span className={`mobile-nav-label ${isActive ? 'text-[#05294B] font-semibold' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* Menu Button */}
          <button
            onClick={toggleMenu}
            className={`mobile-nav-item ${isMenuOpen ? 'bg-[#05294B]/10' : ''}`}
            aria-label="Toggle Menu"
          >
            <div className={`mobile-nav-icon ${isMenuOpen ? 'bg-[#05294B]' : 'bg-gray-400'}`}>
              {isMenuOpen ? <XIcon className="text-white" size={20} /> : <MenuIcon className="text-white" size={20} />}
            </div>
            <span className={`mobile-nav-label ${isMenuOpen ? 'text-[#05294B] font-semibold' : 'text-gray-500'}`}>
              Menu
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={handleMenuItemClick}
          />
          
          {/* Menu Panel */}
          <div className="fixed inset-x-0 bottom-20 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[70vh] overflow-hidden animate-slide-up">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#05294B] to-brand-accent rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">BENIRAGE</h3>
                  <p className="text-sm text-gray-600">Mobile Menu</p>
                </div>
              </div>
              <button
                onClick={handleMenuItemClick}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <XIcon className="text-gray-500" size={24} />
              </button>
            </div>

            {/* Menu Content */}
            <div className="overflow-y-auto max-h-96 p-4">
              {/* Quick Actions */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 transition-colors">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                      <Phone className="text-white" size={16} />
                    </div>
                    <span className="text-sm font-medium text-red-800">Emergency</span>
                  </button>
                  <button className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-colors">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Mail className="text-white" size={16} />
                    </div>
                    <span className="text-sm font-medium text-blue-800">Contact</span>
                  </button>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Navigation</h4>
                <div className="space-y-2">
                  {menuItems.map((item, index) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleMenuItemClick}
                      className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="text-xl group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-[#05294B]">
                        {item.label}
                      </span>
                      <div className="ml-auto w-2 h-2 bg-[#05294B] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* User Actions */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-3 gap-3">
                  <button className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Search className="text-gray-600" size={16} />
                    </div>
                    <span className="text-xs text-gray-600">Search</span>
                  </button>
                  <button className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center relative">
                      <Bell className="text-gray-600" size={16} />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                    <span className="text-xs text-gray-600">Alerts</span>
                  </button>
                  <button className="flex flex-col items-center space-y-2 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="text-gray-600" size={16} />
                    </div>
                    <span className="text-xs text-gray-600">Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileBottomNav;