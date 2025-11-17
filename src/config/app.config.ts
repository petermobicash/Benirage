/**
 * Application Configuration Constants
 * Centralizes all magic numbers, strings, and configuration values
 * for better maintainability and consistency across the application.
 */

/**
 * Breakpoint constants for responsive design
 */
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
} as const;

/**
 * Timing constants for animations and delays
 */
export const TIMING = {
  SPLASH_SCREEN_DURATION: 2500,
  TOAST_DEFAULT_DURATION: 3000,
  ANIMATION_DURATION: 300,
} as const;

/**
 * Layout constants
 */
export const LAYOUT = {
  MAX_CONTENT_WIDTH: 1200,
  MAX_CONTENT_WIDTH_XL: 1400,
  MOBILE_BOTTOM_NAV_HEIGHT: 80,
  HEADER_HEIGHT: 64,
} as const;

/**
 * Route paths configuration
 */
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  SPIRITUAL: '/spiritual',
  PHILOSOPHY: '/philosophy',
  CULTURE: '/culture',
  PROGRAMS: '/programs',
  GET_INVOLVED: '/get-involved',
  MEMBERSHIP: '/membership',
  VOLUNTEER: '/volunteer',
  DONATE: '/donate',
  PARTNERSHIP: '/partnership',
  RESOURCES: '/resources',
  NEWS: '/news',
  CONTACT: '/contact',
  ADMIN: '/admin',
  ADMIN_LOGIN: '/admin/login',
  CMS: '/cms/*',
  DYNAMIC_PAGE: '/pages/:slug',
  SYSTEM_TEST: '/system-test',
  CONTENT_GUIDE: '/content-guide',
  DEPLOYMENT_GUIDE: '/deployment-guide',
  CHAT_DEMO: '/chat-demo',
  WHATSAPP_CHAT_DEMO: '/whatsapp-chat-demo',
  CHAT: '/chat',
  ADVANCED_FEATURES: '/advanced-features',
  STORIES: '/stories',
  USER_MANAGEMENT: '/user-management',
  PRIVACY: '/privacy',
} as const;

/**
 * Theme colors
 */
export const COLORS = {
  PRIMARY: '#05294B',
  BACKGROUND: '#F8F9FA',
  TEXT_PRIMARY: '#334155',
  TEXT_SECONDARY: '#64748b',
} as const;

/**
 * Z-index layers for consistent stacking
 */
export const Z_INDEX = {
  DROPDOWN: 10,
  STICKY: 20,
  MODAL_BACKDROP: 40,
  MODAL: 50,
  TOAST: 100,
  TOOLTIP: 200,
} as const;