import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, MessageCircle, X as XIcon } from 'lucide-react';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { tNav } from '../../utils/i18n';
import GeneralChat from '../chat/GeneralChat';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLearnDropdownOpen, setIsLearnDropdownOpen] = useState(false);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [isGeneralChatOpen, setIsGeneralChatOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const learnDropdownRef = useRef<HTMLDivElement>(null);

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
        setIsChatPanelOpen(false);
        setIsGeneralChatOpen(false);
      }
    };

    if (isMenuOpen || isLearnDropdownOpen || isChatPanelOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen, isLearnDropdownOpen, isChatPanelOpen]);

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

  // Close chat panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const chatPanel = document.querySelector('[data-chat-panel]');
      if (chatPanel && !chatPanel.contains(event.target as Node)) {
        setIsChatPanelOpen(false);
      }
    };

    if (isChatPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChatPanelOpen]);

  const mainNavigation = [
    { name: tNav('nav.home'), href: '/' },
    { name: tNav('nav.programs'), href: '/programs' },
    { name: 'Get Involved', href: '/get-involved' },
    { name: 'Stories', href: '/stories' },
    { name: tNav('nav.news'), href: '/news' },
    { name: tNav('nav.contact'), href: '/contact' }
  ];

  const learnMenu = {
    name: 'Learn',
    items: [
      { name: tNav('nav.spiritual'), href: '/spiritual' },
      { name: tNav('nav.philosophy'), href: '/philosophy' },
      { name: tNav('nav.culture'), href: '/culture' },
      { name: tNav('nav.resources'), href: '/resources' }
    ]
  };

  return (
    <header className="bg-blue-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center min-h-[4rem] py-3 sm:py-4">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <a href="/" className="flex items-center space-x-2 sm:space-x-3">
              <img
                src="/LOGO_CLEAR_stars.png"
                alt="BENIRAGE"
                className="h-21 w-21 xs:h-24 xs:w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-36 lg:w-36 object-contain flex-shrink-0"
              />
              <div className="flex-shrink-0">
                <div className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-white leading-tight">BENIRAGE</div>
                <div className="text-xs text-yellow-400 font-medium hidden sm:block">Grounded • Guided • Rooted</div>
              </div>
            </a>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-8">
            <div className="flex items-center space-x-4 xl:space-x-6">
              {/* Main Navigation Items */}
              {mainNavigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-white/90 hover:text-yellow-400 px-2 xl:px-3 py-2 rounded-md text-sm lg:text-sm xl:text-base font-medium transition-all duration-200 whitespace-nowrap hover:bg-white/5"
                >
                  {item.name}
                </a>
              ))}

              {/* Learn Dropdown Menu */}
              <div className="relative" ref={learnDropdownRef}>
                <button
                  onClick={() => setIsLearnDropdownOpen(!isLearnDropdownOpen)}
                  className="text-white/90 hover:text-yellow-400 px-2 xl:px-3 py-2 rounded-md text-sm lg:text-sm xl:text-base font-medium transition-all duration-200 whitespace-nowrap hover:bg-white/5 flex items-center space-x-1"
                >
                  <span>{learnMenu.name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isLearnDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Content */}
                <div className={`absolute top-full left-0 mt-1 bg-blue-800/95 backdrop-blur-sm border border-blue-700/50 rounded-lg shadow-lg py-2 min-w-[200px] transition-all duration-200 ${isLearnDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                  {learnMenu.items.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-white/90 hover:text-yellow-400 hover:bg-blue-700/50 transition-all duration-200"
                      onClick={() => setIsLearnDropdownOpen(false)}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* Chat Icon Button */}
              <div className="ml-2 xl:ml-3">
                <button
                  onClick={() => setIsGeneralChatOpen(!isGeneralChatOpen)}
                  className={`p-2 rounded-lg transition-all duration-200 hover:bg-white/10 active:bg-white/20 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation group ${isGeneralChatOpen ? 'text-yellow-400 bg-white/10' : 'text-white/90 hover:text-yellow-400'}`}
                  aria-label={isGeneralChatOpen ? "Close Chat" : "Open Chat"}
                >
                  {isGeneralChatOpen ? (
                    <XIcon className="w-5 h-5 transition-transform duration-200" />
                  ) : (
                    <MessageCircle className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  )}
                </button>
              </div>

              {/* Language Switcher */}
              <div className="ml-3 xl:ml-4">
                <LanguageSwitcher />
              </div>
            </div>
          </nav>

          {/* Spacer for centering */}
          <div className="hidden lg:flex flex-1"></div>

          {/* Mobile/Tablet menu button */}
          <div className="lg:hidden">
            <button
              ref={buttonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-yellow-400 focus:outline-none focus:text-yellow-400 p-2 sm:p-3 rounded-lg transition-all duration-200 hover:bg-white/10 active:bg-white/20 min-w-[48px] min-h-[48px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center touch-manipulation"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 sm:w-5 sm:h-5 transition-transform duration-200 rotate-90" />
              ) : (
                <Menu className="w-6 h-6 sm:w-5 sm:h-5 transition-transform duration-200" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Navigation */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-[600px] opacity-100 pb-4' : 'max-h-0 opacity-0 pb-0'} overflow-hidden`}>
          <div ref={menuRef} className="px-3 sm:px-4 pt-3 space-y-1 bg-blue-800/95 backdrop-blur-sm border-t border-blue-700/50">
            {/* Main Navigation Items */}
            {mainNavigation.map((item, index) => (
              <a
                key={item.name}
                href={item.href}
                className="text-white/90 hover:text-yellow-400 hover:bg-blue-700/50 active:bg-blue-600/50 block px-4 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium transition-all duration-200 min-h-[48px] flex items-center touch-manipulation animate-fade-in-up"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'forwards'
                }}
              >
                {item.name}
              </a>
            ))}

            {/* Learn Menu Section */}
            <div className="border-t border-blue-700/50 pt-3 mt-3">
              <div className="px-4 py-2 text-white/70 text-sm font-medium uppercase tracking-wide">
                Learn
              </div>
              {learnMenu.items.map((item, index) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-white/90 hover:text-yellow-400 hover:bg-blue-700/50 active:bg-blue-600/50 block px-6 py-3 rounded-lg text-base font-medium transition-all duration-200 min-h-[48px] flex items-center touch-manipulation animate-fade-in-up"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    animationDelay: `${(mainNavigation.length + index) * 50}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Chat Toggle Button */}
            <div className="px-4 py-3 border-t border-blue-700/50 mt-3">
              <button
                onClick={() => {
                  setIsGeneralChatOpen(!isGeneralChatOpen);
                  setIsMenuOpen(false);
                }}
                className={`text-white/90 hover:text-yellow-400 hover:bg-blue-700/50 active:bg-blue-600/50 block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 min-h-[48px] w-full flex items-center space-x-3 touch-manipulation ${isGeneralChatOpen ? 'text-yellow-400 bg-blue-700/50' : ''}`}
              >
                {isGeneralChatOpen ? (
                  <XIcon className="w-5 h-5" />
                ) : (
                  <MessageCircle className="w-5 h-5" />
                )}
                <span>{isGeneralChatOpen ? 'Close Chat' : 'Open Chat'}</span>
              </button>
            </div>

            {/* Language Section */}
            <div className="px-4 py-3 sm:py-4 border-t border-blue-700/50 mt-3 sm:mt-4">
              <div className="mb-3">
                <span className="text-white/70 text-sm sm:text-base font-medium">Language:</span>
              </div>
              <LanguageSwitcher variant="buttons" />
            </div>
          </div>
        </div>
      </div>

      {/* General Chat Overlay */}
      {isGeneralChatOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pointer-events-none">
          <div className="pointer-events-auto">
            {/* Close button backdrop */}
            <div
              className="fixed inset-0 bg-black/20 -z-10"
              onClick={() => setIsGeneralChatOpen(false)}
            />

            {/* General Chat Panel */}
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-96 h-[600px] flex flex-col">
              <GeneralChat onClose={() => setIsGeneralChatOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;