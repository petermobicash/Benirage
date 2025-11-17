/**
 * Responsive Design Utilities
 * Provides helper functions for responsive behavior and device detection
 */

import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../config/app.config';

/**
 * Check if the current viewport is mobile size
 * @param width - Current window width (defaults to window.innerWidth)
 * @returns boolean indicating if viewport is mobile
 */
export const isMobileViewport = (width: number = window.innerWidth): boolean => {
  return width < BREAKPOINTS.MOBILE;
};

/**
 * Check if the current viewport is tablet size
 * @param width - Current window width (defaults to window.innerWidth)
 * @returns boolean indicating if viewport is tablet
 */
export const isTabletViewport = (width: number = window.innerWidth): boolean => {
  return width >= BREAKPOINTS.MOBILE && width < BREAKPOINTS.TABLET;
};

/**
 * Check if the current viewport is desktop size
 * @param width - Current window width (defaults to window.innerWidth)
 * @returns boolean indicating if viewport is desktop
 */
export const isDesktopViewport = (width: number = window.innerWidth): boolean => {
  return width >= BREAKPOINTS.TABLET;
};

/**
 * Get the current viewport type
 * @param width - Current window width (defaults to window.innerWidth)
 * @returns 'mobile' | 'tablet' | 'desktop'
 */
export const getViewportType = (width: number = window.innerWidth): 'mobile' | 'tablet' | 'desktop' => {
  if (isMobileViewport(width)) return 'mobile';
  if (isTabletViewport(width)) return 'tablet';
  return 'desktop';
};

/**
 * Custom hook for responsive viewport detection
 * Returns current viewport state and updates on resize
 */
export const useResponsive = () => {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    isMobile: isMobileViewport(),
    isTablet: isTabletViewport(),
    isDesktop: isDesktopViewport(),
    type: getViewportType(),
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setViewport({
        width,
        isMobile: isMobileViewport(width),
        isTablet: isTabletViewport(width),
        isDesktop: isDesktopViewport(width),
        type: getViewportType(width),
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
};