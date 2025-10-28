import React from 'react';

// Multi-language support for BENIRAGE
// Languages: English, Kinyarwanda

export type Language = 'en' | 'rw';

export interface Translation {
  [key: string]: string | Translation;
}

export const translations: Record<Language, Translation> = {
  en: {
    // Navigation
    nav: {
      home: 'Home',
      about: 'About',
      spiritual: 'Spiritual',
      philosophy: 'Philosophy',
      culture: 'Culture',
      programs: 'Programs',
      getInvolved: 'Get Involved',
      resources: 'Resources',
      news: 'News',
      contact: 'Contact',
      admin: 'Admin'
    },
    // Common
    common: {
      welcome: 'Welcome',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      submit: 'Submit',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      settings: 'Settings',
      help: 'Help',
      close: 'Close',
      yes: 'Yes',
      no: 'No',
      required: 'Required',
      optional: 'Optional'
    },
    // Home page
    home: {
      title: 'BENIRAGE',
      tagline: 'Grounded in Spirit, Guided by Wisdom, Rooted in Culture',
      description: 'A transformative spiritual and cultural movement dedicated to nurturing the inner spirit, awakening human wisdom, and preserving the sacred beauty of human culture.',
      exploreMission: 'Explore Our Mission',
      joinMovement: 'Join Our Movement',
      threePillars: 'Three Sacred Pillars',
      pillarsDescription: 'Discover the transformative foundation of our movement',
      spiritualGrounding: 'Spiritual Grounding',
      spiritualDescription: 'Nurture the divine spark within through sacred practices of forgiveness, compassion, and transcendent connection.',
      humanPhilosophy: 'Human Philosophy',
      philosophyDescription: 'Embrace philosophy as your compass for authentic living through dignity, justice, and unwavering truth.',
      humanCulture: 'Human Culture',
      cultureDescription: 'Honor culture as humanity\'s sacred memory through storytelling, artistic expression, and heritage preservation.',
      discoverMore: 'Discover More',
      aboutBenirage: 'About BENIRAGE',
      aboutDescription: 'BENIRAGE is a non-governmental organization founded in May 2024, officially registered under legal personality 000070|RGB|NGO|LP|01|2025 by the Rwanda Governance Board.',
      missionDescription: 'We promote the well-being of the population based on Rwandan heritage and culture through the preservation of cultural values, support for education and research, knowledge enhancement, and protection of historical sites.',
      learnMore: 'Learn More About Us',
      joinTitle: 'Join the BENIRAGE Movement',
      joinDescription: 'Be part of a transformative community dedicated to spiritual growth, wisdom, and cultural preservation',
      becomeMember: 'Become a Member',
      startVolunteering: 'Start Volunteering'
    },
    // Forms
    forms: {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      phone: 'Phone Number',
      message: 'Message',
      subject: 'Subject',
      organization: 'Organization',
      submit: 'Submit',
      submitting: 'Submitting...',
      success: 'Thank you! Your submission has been received.',
      error: 'There was an error submitting your form. Please try again.',
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid phone number',
      membership: 'Membership',
      volunteer: 'Volunteer',
      partnership: 'Partnership',
      donate: 'Donate'
    },
    // Footer
    footer: {
      description: 'A transformative spiritual and cultural movement dedicated to nurturing the inner spirit, awakening human wisdom, and preserving the sacred beauty of human culture.',
      socialNetworks: 'Follow Us',
      contact: 'Contact',
      copyright: 'All rights reserved. Legal Personality: 000070|RGB|NGO|LP|01|2025'
    }
  },
  rw: {
    // Navigation
    nav: {
      home: 'Ahabanza',
      about: 'Ibibazo',
      spiritual: 'Umwuka',
      philosophy: 'Filozofiya',
      culture: 'Umuco',
      programs: 'Gahunda',
      getInvolved: 'Witabire',
      resources: 'Ibikoresho',
      news: 'Amakuru',
      contact: 'Twandikire',
      admin: 'Ubuyobozi'
    },
    // Common
    common: {
      welcome: 'Murakaza neza',
      loading: 'Biratangura...',
      save: 'Bika',
      cancel: 'Hagarika',
      submit: 'Ohereza',
      edit: 'Hindura',
      delete: 'Siba',
      view: 'Reba',
      back: 'Subira',
      next: 'Ikurikira',
      previous: 'Ibanjirije',
      search: 'Shakisha',
      filter: 'Shyungura',
      export: 'Sohora',
      import: 'Injiza',
      settings: 'Igenamiterere',
      help: 'Ubufasha',
      close: 'Funga',
      yes: 'Yego',
      no: 'Oya',
      required: 'Bikenewe',
      optional: 'Ntibikenewe'
    },
    // Home page
    home: {
      title: 'BENIRAGE',
      tagline: 'Dushingiye ku Mwuka, Duyobowe n\'Ubwenge, Dufite Imizi mu Muco',
      description: 'Urugendo rw\'umwuka n\'umuco ruhindura rushishikariye guteza imbere umwuka w\'imbere, gukangura ubwenge bw\'ikiremwamuntu, no kubungabunga ubwiza bwera bw\'umuco w\'ikiremwamuntu.',
      exploreMission: 'Shakisha Intego Zacu',
      joinMovement: 'Witabire Urugendo Rwacu',
      threePillars: 'Inkingi Eshatu Zera',
      pillarsDescription: 'Menya urufatiro ruhindura rw\'urugendo rwacu',
      spiritualGrounding: 'Ishingiro ry\'Umwuka',
      spiritualDescription: 'Rera urumuri rw\'Imana ruri muri wewe binyuze mu myitozo yera y\'imbabazi, impuhwe, n\'isano irenga.',
      humanPhilosophy: 'Filozofiya y\'Ikiremwamuntu',
      philosophyDescription: 'Kwakira filozofiya nk\'ikiyobora cyawe mu buzima nyabwo binyuze mu cyubahiro, ubutabera, n\'ukuri kudahinduka.',
      humanCulture: 'Umuco w\'Ikiremwamuntu',
      cultureDescription: 'Kubaha umuco nk\'ububiko bwera bw\'ikiremwamuntu binyuze mu nkuru, imvugo y\'ubuhanzi, no kubungabunga umurage.',
      discoverMore: 'Menya Byinshi',
      aboutBenirage: 'Ibibazo kuri BENIRAGE',
      aboutDescription: 'BENIRAGE ni umuryango udaharanira inyungu washingwaga muri Gicurasi 2024, wanditswe ku buryo bwemewe munsi y\'umuntu w\'amategeko 000070|RGB|NGO|LP|01|2025 n\'Inama y\'Ubuyobozi y\'u Rwanda.',
      missionDescription: 'Duteza imbere ubuzima bw\'abaturage bushingiye ku murage n\'umuco w\'u Rwanda binyuze mu kubungabunga indangagaciro z\'umuco, gushyigikira uburezi n\'ubushakashatsi, guteza imbere ubumenyi, no kurinda ahantu h\'amateka.',
      learnMore: 'Wige Byinshi Kuri Twe',
      joinTitle: 'Witabire Urugendo rwa BENIRAGE',
      joinDescription: 'Kuba umwe mu muryango uhindura wiyemeje guteza imbere umwuka, ubwenge, no kubungabunga umuco',
      becomeMember: 'Kuba Umunyamuryango',
      startVolunteering: 'Tangira Ubwitange'
    },
    // Forms
    forms: {
      firstName: 'Izina ry\'Ibanza',
      lastName: 'Izina ry\'Umuryango',
      email: 'Aderesi ya Imeyili',
      phone: 'Nimero ya Telefoni',
      message: 'Ubutumwa',
      subject: 'Ingingo',
      organization: 'Ikigo',
      submit: 'Ohereza',
      submitting: 'Biroherezwa...',
      success: 'Murakoze! Icyifuzo cyanyu cyakiriwe.',
      error: 'Habaye ikosa mu kohereza ifishi. Nyamuneka mugerageze nanone.',
      required: 'Iki gice gikenewe',
      invalidEmail: 'Nyamuneka mwandike aderesi y\'imeyili nyayo',
      invalidPhone: 'Nyamuneka mwandike nimero y\'telefoni nyayo',
      membership: 'Ubuyobozi',
      volunteer: 'Ubwitange',
      partnership: 'Ubufatanye',
      donate: 'Gutanga'
    },
    // Footer
    footer: {
      description: 'Urugendo rw\'umwuka n\'umuco ruhindura rushishikariye guteza imbere umwuka w\'imbere, gukangura ubwenge bw\'ikiremwamuntu, no kubungabunga ubwiza bwera bw\'umuco w\'ikiremwamuntu.',
      socialNetworks: 'Dukurikire',
      contact: 'Twandikire',
      copyright: 'Uburenganzira bwose burarinzwe. Umuntu w\'Amategeko: 000070|RGB|NGO|LP|01|2025'
    }
  }
};

// Language context and hooks
let currentLanguage: Language = 'en';

export const getCurrentLanguage = (): Language => currentLanguage;

export const setLanguage = (lang: Language): void => {
  currentLanguage = lang;
  localStorage.setItem('benirage_language', lang);

  // Update document language
  document.documentElement.lang = lang;

  // Trigger custom event for components to re-render
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
};

export const initializeLanguage = (): Language => {
  // Check localStorage first
  const savedLang = localStorage.getItem('benirage_language') as Language;
  if (savedLang && ['en', 'rw'].includes(savedLang)) {
    currentLanguage = savedLang;
    document.documentElement.lang = savedLang;
    return savedLang;
  }

  // Check browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('rw')) {
    currentLanguage = 'rw';
  } else {
    currentLanguage = 'en';
  }

  document.documentElement.lang = currentLanguage;
  localStorage.setItem('benirage_language', currentLanguage);
  return currentLanguage;
};

// Translation function
export const t = (key: string, lang?: Language): string => {
  const language = lang || currentLanguage;
  const keys = key.split('.');
  let value: unknown = translations[language];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[k];
    } else {
      // Fallback to English if translation not found
      value = translations.en;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in (value as Record<string, unknown>)) {
          value = (value as Record<string, unknown>)[fallbackKey];
        } else {
          return key; // Return key if no translation found
        }
      }
      break;
    }
  }

  return typeof value === 'string' ? value : key;
};

// Helper function to display navigation items without nav. prefix
export const tNav = (key: string, lang?: Language): string => {
  // If it's a nav.* key, return just the translated value
  if (key.startsWith('nav.')) {
    return t(key, lang);
  }
  // Otherwise return the normal translation
  return t(key, lang);
};

// Language metadata
export const languages: Array<{
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}> = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false
  },
  {
    code: 'rw',
    name: 'Kinyarwanda',
    nativeName: 'Ikinyarwanda',
    flag: '🇷🇼',
    rtl: false
  }
];

// React hook for translations
export const useTranslation = () => {
  const [language, setCurrentLanguage] = React.useState<Language>(getCurrentLanguage());

  React.useEffect(() => {
    const handleLanguageChange = (event: CustomEvent<Language>) => {
      setCurrentLanguage(event.detail);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  const translate = React.useCallback((key: string) => t(key, language), [language]);

  return {
    t: translate,
    language,
    setLanguage,
    languages
  };
};

// Format numbers and dates according to locale
export const formatNumber = (num: number, lang?: Language): string => {
  const language = lang || currentLanguage;
  const locales = {
    en: 'en-US',
    rw: 'rw-RW'
  };

  return new Intl.NumberFormat(locales[language] || 'en-US').format(num);
};

export const formatDate = (date: Date | string, lang?: Language): string => {
  const language = lang || currentLanguage;
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const locales = {
    en: 'en-US',
    rw: 'rw-RW'
  };

  return new Intl.DateTimeFormat(locales[language] || 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
};

export const formatCurrency = (amount: number, currency: string = 'USD', lang?: Language): string => {
  const language = lang || currentLanguage;
  const locales = {
    en: 'en-US',
    rw: 'rw-RW'
  };

  return new Intl.NumberFormat(locales[language] || 'en-US', {
    style: 'currency',
    currency
  }).format(amount);
};