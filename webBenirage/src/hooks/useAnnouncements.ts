import { useState, useEffect, useCallback } from 'react';
import { Announcement } from '../types/announcements';
import { getActiveAnnouncements } from '../data/announcements';

interface UseAnnouncementsOptions {
  currentPath?: string;
  userType?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  visitCount?: number;
}

interface UseAnnouncementsReturn {
  announcements: Announcement[];
  topAnnouncements: Announcement[];
  leftAnnouncements: Announcement[];
  dismissAnnouncement: (id: string) => void;
  isLoading: boolean;
  error: string | null;
}

export const useAnnouncements = (options: UseAnnouncementsOptions = {}): UseAnnouncementsReturn => {
  const {
    currentPath = '/',
    userType = 'visitor',
    deviceType = 'desktop',
    visitCount = 1
  } = options;

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dismissed announcements from localStorage on mount
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('dismissed-announcements');
      if (dismissed) {
        setDismissedAnnouncements(new Set(JSON.parse(dismissed)));
      }
    } catch (err) {
      console.warn('Failed to load dismissed announcements from localStorage:', err);
    }
  }, []);

  // Save dismissed announcements to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('dismissed-announcements', JSON.stringify([...dismissedAnnouncements]));
    } catch (err) {
      console.warn('Failed to save dismissed announcements to localStorage:', err);
    }
  }, [dismissedAnnouncements]);

  // Load active announcements
  const loadAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay for realistic behavior
      await new Promise(resolve => setTimeout(resolve, 100));

      const activeAnnouncements = getActiveAnnouncements(currentPath, userType, deviceType, visitCount);

      // Filter out dismissed announcements
      const visibleAnnouncements = activeAnnouncements.filter(
        announcement => !dismissedAnnouncements.has(announcement.id)
      );

      setAnnouncements(visibleAnnouncements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load announcements');
      console.error('Error loading announcements:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPath, userType, deviceType, visitCount, dismissedAnnouncements]);

  // Load announcements when dependencies change
  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  // Dismiss announcement handler
  const dismissAnnouncement = useCallback((id: string) => {
    setDismissedAnnouncements(prev => new Set([...prev, id]));
  }, []);

  // Separate announcements by position
  const topAnnouncements = announcements.filter(ann => ann.position === 'top');
  const leftAnnouncements = announcements.filter(ann => ann.position === 'left');

  return {
    announcements,
    topAnnouncements,
    leftAnnouncements,
    dismissAnnouncement,
    isLoading,
    error
  };
};