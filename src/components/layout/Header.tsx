import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, MessageCircle, X as XIcon, Search, Bell, User } from 'lucide-react';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { tNav } from '../../utils/i18n';
import GeneralChat from '../chat/GeneralChat';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLearnDropdownOpen, setIsLearnDropdownOpen] = useState(false);
  const [isGeneralChatOpen, setIsGeneralChatOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const learnDropdownRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect with direction detection
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setIsScrolled(currentScrollY > 20);
      
      // Detect scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setIsLearnDropdownOpen(false);
        setIsGeneralChatOpen(false);
      }
    };

    if (isMenuOpen || isLearnDropdownOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen, isLearnDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (learnDropdownRef.current && !learnDropdownRef.current.contains(event.target as Node)) {
        setIsLearnDropdownOpen(false);
      }
    };

    if (isLearnDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLearnDropdownOpen]);

  const mainNavigation = [
    { name: tNav('nav.home'), href: '/', icon: '🏠' },
    { name: 'Stories', href: '/stories', icon: '📖' },
    { name: tNav('nav.news'), href: '/news', icon: '📰' },
    { name: tNav('nav.contact'), href: '/contact', icon: '📞' }
  ];

  const learnMenu = {
    name: 'Learn',
    icon: '🎓',
    items: [
      { name: tNav('nav.spiritual'), href: '/spiritual', description: 'Spiritual guidance and growth' },
      { name: tNav('nav.philosophy'), href: '/philosophy', description: 'Philosophical insights and wisdom' },
      { name: tNav('nav.culture'), href: '/culture', description: 'Cultural heritage and traditions' },
      { name: tNav('nav.resources'), href: '/resources', description: 'Educational resources and materials' }
    ]
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-large border-b border-white/20'
          : 'bg-[#05294B]/95 backdrop-blur-xl shadow-large border-b border-white/10'
      } ${scrollDirection === 'down' && isScrolled ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="container-modern">
          <div className="flex items-center h-20">
            {/* Enhanced Logo */}
            <div className="flex items-center flex-shrink-0 group">
              <a href="/" className="flex items-center space-x-4 group">
                <div className="relative">
                  <img
                    src="/LOGO_CLEAR_stars.png"
                    alt="BENIRAGE"
                    className="h-12 w-12 object-contain transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                </div>
                <div className="flex-shrink-0">
                  <div className={`text-xl font-bold leading-tight transition-all duration-300 ${
                    isScrolled 
                      ? 'text-transparent bg-gradient-to-r from-brand-accent to-brand-accent-400 bg-clip-text'
                      : 'text-white'
                  }`}>
                    BENIRAGE
                  </div>
                  <div className={`text-xs font-medium hidden sm:block transition-colors duration-300 ${
                    isScrolled ? 'text-gray-600' : 'text-blue-200'
                  }`}>
                    Grounded • Guided • Rooted
                  </div>
                </div>
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center justify-center flex-1 mx-12">
              <div className="flex items-center space-x-1">
                {/* Main Navigation Items */}
                {mainNavigation.map((item, index) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`group relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover-lift-3d ${
                      isScrolled
                        ? 'text-gray-700 hover:text-[#05294B] hover:bg-[#05294B]/5'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-base opacity-80 group-hover:opacity-100 transition-opacity">
                        {item.icon}
                      </span>
                      <span className="relative">
                        {item.name}
                        <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-accent to-brand-accent-400 group-hover:w-full transition-all duration-300"></div>
                      </span>
                    </div>
                  </a>
                ))}

                {/* Enhanced Learn Dropdown Menu */}
                <div className="relative" ref={learnDropdownRef}>
                  <button
                    onClick={() => setIsLearnDropdownOpen(!isLearnDropdownOpen)}
                    className={`group relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover-lift-3d flex items-center space-x-2 ${
                      isScrolled
                        ? 'text-gray-700 hover:text-[#05294B] hover:bg-[#05294B]/5'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="text-base opacity-80 group-hover:opacity-100 transition-opacity">
                      🎓
                    </span>
                    <span className="relative">
                      {learnMenu.name}
                      <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-brand-accent to-brand-accent-400 group-hover:w-full transition-all duration-300"></div>
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                      isLearnDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Enhanced Dropdown Content */}
                  <div className={`absolute top-full left-0 mt-3 glass-intense rounded-2xl shadow-2xl border border-white/20 py-4 min-w-[300px] transition-all duration-300 ${
                    isLearnDropdownOpen
                      ? 'opacity-100 visible translate-y-0 scale-100'
                      : 'opacity-0 invisible translate-y-4 scale-95'
                  }`}>
                    <div className="px-4 py-2 border-b border-gray-100/50 mb-2">
                      <h4 className="text-sm font-semibold text-gray-800">Learning Resources</h4>
                      <p className="text-xs text-gray-600">Explore our educational content</p>
                    </div>
                    {learnMenu.items.map((item, index) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="group block px-4 py-3 mx-2 rounded-xl text-sm text-gray-700 hover:text-[#05294B] hover:bg-[#05294B]/5 transition-all duration-200"
                        onClick={() => setIsLearnDropdownOpen(false)}
                        style={{
                          animationDelay: `${index * 50}ms`
                        }}
                      >
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500 mt-1 group-hover:text-[#05294B]">
                          {item.description}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </nav>

            {/* Enhanced Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Search Button */}
              <button
                className={`p-3 rounded-xl transition-all duration-300 hover-lift-3d min-w-[44px] min-h-[44px] flex items-center justify-center group ${
                  isScrolled
                    ? 'text-gray-600 hover:text-[#05294B] hover:bg-[#05294B]/5'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
                aria-label="Search"
              >
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>

              {/* Notifications */}
              <button
                className={`p-3 rounded-xl transition-all duration-300 hover-lift-3d min-w-[44px] min-h-[44px] flex items-center justify-center group relative ${
                  isScrolled
                    ? 'text-gray-600 hover:text-[#05294B] hover:bg-[#05294B]/5'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </button>

              {/* Chat Button */}
              <button
                onClick={() => setIsGeneralChatOpen(!isGeneralChatOpen)}
                className={`p-3 rounded-xl transition-all duration-300 hover-lift-3d min-w-[44px] min-h-[44px] flex items-center justify-center group ${
                  isScrolled
                    ? 'text-gray-600 hover:text-[#05294B] hover:bg-[#05294B]/5'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                } ${isGeneralChatOpen ? 'text-brand-accent bg-brand-accent-50' : ''}`}
                aria-label={isGeneralChatOpen ? "Close Chat" : "Open Chat"}
              >
                {isGeneralChatOpen ? (
                  <XIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                ) : (
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                )}
              </button>

              {/* User Profile */}
              <button
                className={`p-3 rounded-xl transition-all duration-300 hover-lift-3d min-w-[44px] min-h-[44px] flex items-center justify-center group ${
                  isScrolled
                    ? 'text-gray-600 hover:text-[#05294B] hover:bg-[#05294B]/5'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
                aria-label="User Profile"
              >
                <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>

              {/* Language Switcher */}
              <div className="ml-2">
                <LanguageSwitcher />
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden ml-auto">
              <button
                ref={buttonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-3 rounded-xl transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center hover-lift-3d ${
                  isScrolled
                    ? 'text-gray-700 hover:text-[#05294B] hover:bg-[#05294B]/5'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 animate-rotate-in" />
                ) : (
                  <Menu className="w-6 h-6 animate-rotate-in" />
                )}
              </button>
            </div>
          </div>

          {/* Enhanced Mobile/Tablet Navigation */}
          <div className={`lg:hidden transition-all duration-500 ease-out overflow-hidden ${
            isMenuOpen ? 'max-h-[800px] opacity-100 pb-6' : 'max-h-0 opacity-0 pb-0'
          }`}>
            <div ref={menuRef} className="px-2 pt-6 space-y-1 bg-white/95 backdrop-blur-xl rounded-b-3xl shadow-2xl border-t border-white/20">
              {/* Search Bar */}
              <div className="px-4 py-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Main Navigation Items */}
              {mainNavigation.map((item, index) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="group flex items-center space-x-4 px-4 py-4 rounded-2xl text-base font-medium text-gray-700 hover:text-[#05294B] hover:bg-[#05294B]/5 transition-all duration-300 min-h-[56px] animate-fade-in-up"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <span className="text-2xl opacity-80 group-hover:opacity-100 transition-opacity">
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.name}</span>
                </a>
              ))}

              {/* Enhanced Learn Menu Section */}
              <div className="border-t border-gray-200/50 pt-4 mt-4">
                <div className="px-4 py-3 mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎓</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Learn</h3>
                      <p className="text-sm text-gray-600">Educational resources</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  {learnMenu.items.map((item, index) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="group block px-6 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-[#05294B] hover:bg-[#05294B]/5 transition-all duration-300 min-h-[52px] animate-fade-in-up"
                      onClick={() => setIsMenuOpen(false)}
                      style={{
                        animationDelay: `${(mainNavigation.length + index) * 100}ms`,
                        animationFillMode: 'forwards'
                      }}
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500 group-hover:text-blue-500">
                        {item.description}
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Enhanced Actions */}
              <div className="border-t border-gray-200/50 pt-4 mt-4 space-y-3">
                {/* Profile Section */}
                <div className="px-4 py-3">
                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-10 h-10 bg-gradient-to-r from-brand-accent to-brand-accent-400 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">Welcome</div>
                      <div className="text-xs text-gray-600">Sign in for personalized experience</div>
                    </div>
                  </div>
                </div>

                {/* Chat Toggle Button */}
                <button
                  onClick={() => {
                    setIsGeneralChatOpen(!isGeneralChatOpen);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-4 px-4 py-4 rounded-2xl text-base font-medium text-gray-700 hover:text-brand-accent hover:bg-gradient-to-r hover:from-brand-accent-50 hover:to-brand-accent-100 transition-all duration-300 min-h-[56px]"
                >
                  {isGeneralChatOpen ? (
                    <XIcon className="w-6 h-6" />
                  ) : (
                    <MessageCircle className="w-6 h-6" />
                  )}
                  <span className="font-medium">{isGeneralChatOpen ? 'Close Chat' : 'Open Chat'}</span>
                </button>

                {/* Notifications */}
                <button className="w-full flex items-center space-x-4 px-4 py-4 rounded-2xl text-base font-medium text-gray-700 hover:text-brand-accent hover:bg-gradient-to-r hover:from-brand-accent-50 hover:to-brand-accent-100 transition-all duration-300 min-h-[56px]">
                  <Bell className="w-6 h-6" />
                  <span className="font-medium">Notifications</span>
                  <div className="ml-auto w-2 h-2 bg-red-500 rounded-full"></div>
                </button>

                {/* Language Section */}
                <div className="px-4 py-3">
                  <div className="mb-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Language
                  </div>
                  <LanguageSwitcher variant="buttons" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced General Chat Overlay */}
      {isGeneralChatOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pointer-events-none">
          <div className="pointer-events-auto">
            {/* Enhanced backdrop */}
            <div
              className="fixed inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/30 backdrop-blur-sm -z-10 animate-fade-in"
              onClick={() => setIsGeneralChatOpen(false)}
            />

            {/* Enhanced Chat Panel */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200/50 w-[400px] h-[700px] flex flex-col animate-scale-in backdrop-blur-xl">
              <GeneralChat onClose={() => setIsGeneralChatOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="skip-link glass-intense border-2 border-white/20 text-white"
      >
        Skip to main content
      </a>
    </>
  );
};

export default Header;