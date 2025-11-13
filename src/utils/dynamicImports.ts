// Dynamic import utilities for better code splitting
import { lazy, LazyExoticComponent } from 'react';

export type LazyComponent = LazyExoticComponent<React.ComponentType<any>>;

// Base lazy import function
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): LazyExoticComponent<T> => {
  return lazy(importFn);
};

// Pre-configured lazy components for heavy features
export const lazyComponents = {
  // Advanced components
  ContentAnalytics: createLazyComponent(
    () => import('../components/advanced/ContentAnalytics')
  ),
  
  ContentVersioning: createLazyComponent(
    () => import('../components/advanced/ContentVersioning')
  ),
  
  SecurityAudit: createLazyComponent(
    () => import('../components/advanced/SecurityAudit')
  ),
  
  // Chat and collaboration components
  AdvancedUserManagement: createLazyComponent(
    () => import('../components/advanced/AdvancedUserManagement')
  ),
  
  RealTimeCollaboration: createLazyComponent(
    () => import('../components/advanced/RealTimeCollaboration')
  ),
  
  // Heavy UI components
  MediaOptimization: createLazyComponent(
    () => import('../components/advanced/MediaOptimization')
  ),
  
  PerformanceMonitor: createLazyComponent(
    () => import('../components/advanced/PerformanceMonitor')
  ),
  
  SmartSearch: createLazyComponent(
    () => import('../components/advanced/SmartSearch')
  ),
  
  WorkflowAutomation: createLazyComponent(
    () => import('../components/advanced/WorkflowAutomation')
  ),
  
  // AI and notifications
  AIContentSuggestions: createLazyComponent(
    () => import('../components/advanced/AIContentSuggestions')
  ),
  
  AdvancedNotifications: createLazyComponent(
    () => import('../components/advanced/AdvancedNotifications')
  )
};

// Bundle size monitoring
export const logBundleSize = () => {
  if (typeof window !== 'undefined' && window.performance) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource');
    
    const totalSize = resources.reduce((total, resource) => {
      const size = (resource as PerformanceResourceTiming).transferSize || 0;
      return total + size;
    }, 0);
    
    console.log(`📦 Bundle size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`⚡ Load time: ${navigation.loadEventEnd - navigation.loadEventStart}ms`);
  }
};

// Route-based dynamic imports for pages
export const lazyPages = {
  Home: lazy(() => import('../pages/Home')),
  About: lazy(() => import('../pages/About')),
  Spiritual: lazy(() => import('../pages/Spiritual')),
  Philosophy: lazy(() => import('../pages/Philosophy')),
  Culture: lazy(() => import('../pages/Culture')),
  Programs: lazy(() => import('../pages/Programs')),
  GetInvolved: lazy(() => import('../pages/GetInvolved')),
  Volunteer: lazy(() => import('../pages/Volunteer')),
  Donate: lazy(() => import('../pages/Donate')),
  Resources: lazy(() => import('../pages/Resources')),
  News: lazy(() => import('../pages/News')),
  Contact: lazy(() => import('../pages/Contact')),
  Admin: lazy(() => import('../pages/Admin')),
  SystemTest: lazy(() => import('../pages/SystemTest')),
  ContentGuide: lazy(() => import('../pages/ContentGuide')),
  ChatDemo: lazy(() => import('../pages/ChatDemo')),
  PublicChat: lazy(() => import('../pages/PublicChat')),
  Stories: lazy(() => import('../pages/Stories')),
  UserManagement: lazy(() => import('../pages/UserManagement')),
  Privacy: lazy(() => import('../pages/Privacy'))
};