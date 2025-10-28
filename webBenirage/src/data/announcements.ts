import { Announcement } from '../types/announcements';

export const sampleAnnouncements: Announcement[] = [
  {
    id: 'welcome-banner',
    title: 'Welcome to BENIRAGE',
    message: 'Discover our spiritual, philosophical, and cultural programs. Join our community today!',
    type: 'info',
    position: 'top',
    priority: 'medium',
    isActive: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    targetAudience: 'visitors',
    dismissible: true,
    autoHide: false,
    displayConditions: {
      pages: ['/'],
      devices: ['desktop', 'mobile', 'tablet']
    },
    actions: {
      primary: {
        label: 'Learn More',
        url: '/about'
      },
      secondary: {
        label: 'Get Involved',
        url: '/get-involved'
      }
    },
    styling: {
      backgroundColor: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      textColor: '#ffffff',
      icon: 'Heart'
    }
  },
  {
    id: 'philosophy-cafe',
    title: 'Philosophy Café',
    message: 'Join our weekly Philosophy Café every Saturday at 3 PM. Open discussion on life\'s big questions.',
    type: 'promotion',
    position: 'left',
    priority: 'high',
    isActive: true,
    startDate: new Date().toISOString(),
    targetAudience: 'all',
    dismissible: true,
    autoHide: false,
    displayConditions: {
      pages: ['/', '/philosophy', '/programs'],
      devices: ['desktop']
    },
    actions: {
      primary: {
        label: 'Register Now',
        url: '/philosophy-cafe-join'
      }
    },
    styling: {
      backgroundColor: '#f59e0b',
      textColor: '#ffffff',
      icon: 'Coffee'
    }
  },
  {
    id: 'membership-drive',
    title: 'Membership Drive 2024',
    message: 'Become a member and get exclusive access to our programs, events, and community resources.',
    type: 'success',
    position: 'top',
    priority: 'high',
    isActive: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    targetAudience: 'visitors',
    dismissible: true,
    autoHide: false,
    displayConditions: {
      pages: ['/', '/membership', '/get-involved'],
      devices: ['desktop', 'mobile', 'tablet']
    },
    actions: {
      primary: {
        label: 'Apply Now',
        url: '/membership'
      },
      secondary: {
        label: 'Learn More',
        url: '/about'
      }
    },
    styling: {
      backgroundColor: '#10b981',
      textColor: '#ffffff',
      icon: 'Users'
    }
  },
  {
    id: 'mobile-app',
    title: 'Get Our Mobile App',
    message: 'Download our PWA for the best mobile experience with offline access and push notifications.',
    type: 'info',
    position: 'top',
    priority: 'medium',
    isActive: true,
    startDate: new Date().toISOString(),
    targetAudience: 'all',
    dismissible: true,
    autoHide: true,
    autoHideDelay: 10,
    displayConditions: {
      devices: ['mobile', 'tablet'],
      minVisits: 2
    },
    actions: {
      primary: {
        label: 'Install App',
        url: '#'
      }
    },
    styling: {
      backgroundColor: '#8b5cf6',
      textColor: '#ffffff',
      icon: 'Smartphone'
    }
  },
  {
    id: 'urgent-notice',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on Sunday 2-4 AM EST. Some services may be temporarily unavailable.',
    type: 'warning',
    position: 'top',
    priority: 'urgent',
    isActive: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
    targetAudience: 'all',
    dismissible: true,
    autoHide: false,
    displayConditions: {
      devices: ['desktop', 'mobile', 'tablet']
    },
    styling: {
      backgroundColor: '#f59e0b',
      textColor: '#ffffff',
      icon: 'AlertTriangle'
    }
  },
  {
    id: 'volunteer-opportunity',
    title: 'Volunteer With Us',
    message: 'Join our volunteer team and make a difference in your community. Multiple opportunities available including event support, content creation, and community outreach.',
    type: 'promotion',
    position: 'left',
    priority: 'medium',
    isActive: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
    targetAudience: 'all',
    dismissible: true,
    autoHide: false,
    displayConditions: {
      pages: ['/', '/volunteer', '/get-involved'],
      devices: ['desktop']
    },
    actions: {
      primary: {
        label: 'Learn More',
        url: '/volunteer'
      },
      secondary: {
        label: 'Get Involved',
        url: '/get-involved'
      }
    },
    styling: {
      backgroundColor: '#059669',
      textColor: '#ffffff',
      icon: 'Users'
    }
  },
  {
    id: 'cultural-workshop',
    title: 'Traditional Arts Workshop',
    message: 'Experience Rwandan culture through our hands-on traditional arts workshop. Learn about Imigongo art, Intore dance, and more. Limited spots available!',
    type: 'promotion',
    position: 'top',
    priority: 'high',
    isActive: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days
    targetAudience: 'all',
    dismissible: true,
    autoHide: false,
    displayConditions: {
      pages: ['/', '/culture', '/programs'],
      devices: ['desktop', 'mobile', 'tablet']
    },
    actions: {
      primary: {
        label: 'Register Now',
        url: '/culture'
      },
      secondary: {
        label: 'View Programs',
        url: '/programs'
      }
    },
    styling: {
      backgroundColor: '#dc2626',
      textColor: '#ffffff',
      icon: 'Sparkles'
    }
  }
];

export const getActiveAnnouncements = (
  currentPath: string = '/',
  userType: string = 'visitor',
  deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop',
  visitCount: number = 1
): Announcement[] => {
  const now = new Date();

  return sampleAnnouncements.filter(announcement => {
    // Check if announcement is active
    if (!announcement.isActive) return false;

    // Check date range
    const startDate = new Date(announcement.startDate);
    if (now < startDate) return false;

    if (announcement.endDate) {
      const endDate = new Date(announcement.endDate);
      if (now > endDate) return false;
    }

    // Check target audience
    if (announcement.targetAudience && announcement.targetAudience !== 'all' && announcement.targetAudience !== userType) {
      return false;
    }

    // Check display conditions
    if (announcement.displayConditions) {
      const conditions = announcement.displayConditions;

      // Check pages
      if (conditions.pages && !conditions.pages.some(page => currentPath.startsWith(page))) {
        return false;
      }

      // Check devices
      if (conditions.devices && !conditions.devices.includes(deviceType)) {
        return false;
      }

      // Check minimum visits
      if (conditions.minVisits && visitCount < conditions.minVisits) {
        return false;
      }
    }

    return true;
  });
};

export const getAnnouncementsByPosition = (position: 'top' | 'left' | 'right' | 'bottom'): Announcement[] => {
  return sampleAnnouncements.filter(announcement => announcement.position === position);
};