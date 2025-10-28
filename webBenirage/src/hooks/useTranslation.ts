import { useState, useEffect, useCallback } from 'react';
import { Language, getCurrentLanguage, setLanguage as setGlobalLanguage, t, languages } from '../utils/i18n';

export const useTranslation = () => {
  const [language, setCurrentLanguage] = useState<Language>(getCurrentLanguage());
  
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent<Language>) => {
      setCurrentLanguage(event.detail);
    };
    
    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);
  
  const translate = useCallback((key: string) => t(key, language), [language]);
  
  const changeLanguage = useCallback((newLang: Language) => {
    setGlobalLanguage(newLang);
    setCurrentLanguage(newLang);
  }, []);
  
  return {
    t: translate,
    language,
    setLanguage: changeLanguage,
    languages
  };
};