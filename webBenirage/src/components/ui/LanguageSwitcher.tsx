import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Globe, ChevronDown, Check, Search, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'dropdown' | 'buttons' | 'compact';
  showSearch?: boolean;
  maxHeight?: string;
  placement?: 'bottom' | 'top' | 'auto';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'dropdown',
  showSearch = false,
  maxHeight = '300px',
  placement = 'bottom'
}) => {
  const { language, setLanguage, languages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Filter languages based on search term
  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset search and highlight when dropdown opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setHighlightedIndex(-1);
      // Focus search input if available
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredLanguages.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredLanguages.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && filteredLanguages[highlightedIndex]) {
          setLanguage(filteredLanguages[highlightedIndex].code);
          setIsOpen(false);
        }
        break;
    }
  }, [isOpen, filteredLanguages, highlightedIndex, setLanguage]);

  // Add keyboard event listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Auto-scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0) {
      const highlightedElement = document.getElementById(`lang-${highlightedIndex}`);
      highlightedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const currentLanguage = languages.find(l => l.code === language);

   // Get dropdown positioning classes based on placement prop
   const getDropdownPosition = () => {
     switch (placement) {
       case 'top':
         return 'bottom-full left-0 mb-2';
       case 'bottom':
         return 'top-full left-0 mt-2';
       case 'auto':
         return 'top-full left-0 mt-2'; // Default to bottom for auto
       default:
         return 'top-full left-0 mt-2';
     }
   };

   if (variant === 'buttons') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`group relative px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 min-h-[44px] touch-manipulation ${
              language === lang.code
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 hover:scale-105'
            }`}
            aria-label={`Switch to ${lang.name}`}
          >
            <span className="flex items-center space-x-2">
              <span className={`text-lg sm:text-base transition-transform duration-200 ${language === lang.code ? 'scale-110' : 'group-hover:scale-110'}`}>
                {lang.flag}
              </span>
              <span className="hidden xs:inline font-semibold">{lang.code.toUpperCase()}</span>
            </span>
            {language === lang.code && (
              <div className="absolute inset-0 rounded-lg bg-blue-600/20 animate-pulse" />
            )}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-200 min-h-[44px] touch-manipulation ${
            isOpen
              ? 'bg-blue-100 text-blue-600 shadow-lg scale-105'
              : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100'
          }`}
          aria-label={`Current language: ${currentLanguage?.name}. Click to change language`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="text-lg sm:text-xl">{currentLanguage?.flag}</span>
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div
              ref={dropdownRef}
              className={`absolute ${getDropdownPosition()} left-1/2 transform -translate-x-1/2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-20 animate-in slide-in-from-top-2 duration-200`}
              role="listbox"
              aria-label="Select language"
            >
              {languages.map((lang, index) => (
                <button
                  key={lang.code}
                  id={`lang-${index}`}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[48px] touch-manipulation ${
                    language === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                  role="option"
                  aria-selected={language === lang.code}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{lang.name}</div>
                    <div className="text-xs text-gray-500">{lang.nativeName}</div>
                  </div>
                  {language === lang.code && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center space-x-3 px-4 py-3 bg-white border-2 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 min-h-[48px] touch-manipulation ${
          isOpen
            ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-[1.02]'
            : 'border-gray-300 hover:border-blue-400 hover:shadow-md'
        }`}
        aria-label={`Current language: ${currentLanguage?.name}. Click to change language`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center space-x-3">
          <div className={`p-1 rounded-lg transition-all duration-200 ${isOpen ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-blue-50'}`}>
            <Globe className={`w-4 h-4 transition-colors duration-200 ${isOpen ? 'text-blue-600' : 'text-gray-600'}`} />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">{currentLanguage?.flag}</span>
            <div>
              <div className={`font-semibold text-sm transition-colors duration-200 ${isOpen ? 'text-blue-600' : 'text-gray-700'}`}>
                {currentLanguage?.name}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                {language}
              </div>
            </div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-all duration-200 ${isOpen ? 'rotate-180 text-blue-600' : 'group-hover:text-gray-700'}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div
            ref={dropdownRef}
            className={`absolute ${getDropdownPosition()} w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-20 animate-in slide-in-from-top-2 duration-200`}
            role="listbox"
            aria-label="Select language"
          >
            {showSearch && (
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search languages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div
              className="max-h-64 overflow-y-auto"
              style={{ maxHeight }}
            >
              {filteredLanguages.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Globe className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No languages found</p>
                </div>
              ) : (
                filteredLanguages.map((lang, index) => (
                  <button
                    key={lang.code}
                    id={`lang-${index}`}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[48px] touch-manipulation ${
                      language === lang.code ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' : 'text-gray-700'
                    } ${highlightedIndex === index ? 'bg-blue-50' : ''}`}
                    role="option"
                    aria-selected={language === lang.code}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{lang.name}</div>
                      <div className="text-xs text-gray-500">{lang.nativeName}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">
                        {lang.code}
                      </span>
                      {language === lang.code && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;