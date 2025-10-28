export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'promotion';
  position: 'top' | 'left' | 'right' | 'bottom';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isActive: boolean;
  startDate: string;
  endDate?: string;
  targetAudience?: 'all' | 'members' | 'visitors' | 'admins';
  dismissible: boolean;
  autoHide?: boolean;
  autoHideDelay?: number; // in seconds
  displayConditions?: {
    pages?: string[]; // specific page paths
    userTypes?: string[]; // user types that can see this
    devices?: ('desktop' | 'mobile' | 'tablet')[];
    minVisits?: number; // minimum number of visits to show
  };
  actions?: {
    primary?: {
      label: string;
      url?: string;
      onClick?: () => void;
    };
    secondary?: {
      label: string;
      url?: string;
      onClick?: () => void;
    };
  };
  styling?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    icon?: string;
  };
  analytics?: {
    impressions: number;
    clicks: number;
    dismissals: number;
  };
}

export interface AnnouncementStats {
  totalAnnouncements: number;
  activeAnnouncements: number;
  totalImpressions: number;
  totalClicks: number;
  topPerforming: Announcement[];
}

export type AnnouncementPosition = 'top' | 'left' | 'right' | 'bottom';
export type AnnouncementType = 'info' | 'warning' | 'success' | 'error' | 'promotion';
export type AnnouncementPriority = 'low' | 'medium' | 'high' | 'urgent';