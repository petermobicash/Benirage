// Ad Management System Types

export interface Advertiser {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  industry?: string;
  logo_url?: string;
  description?: string;
  status: 'active' | 'inactive' | 'suspended';
  payment_status: 'current' | 'overdue' | 'suspended';
  total_budget: number;
  spent_budget: number;
  remaining_budget: number;
  contract_start_date?: string;
  contract_end_date?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AdZone {
  id: string;
  name: string;
  slug: string;
  description?: string;
  zone_type: 'banner' | 'sidebar' | 'content' | 'popup' | 'video' | 'native';
  dimensions?: string;
  position: 'top' | 'bottom' | 'sidebar' | 'in-content' | 'overlay' | 'exit-intent';
  page_targeting: string[];
  device_targeting: string[];
  is_active: boolean;
  rotation_type: 'sequential' | 'random' | 'weighted';
  max_ads_per_rotation: number;
  refresh_interval: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Ad {
  id: string;
  advertiser_id: string;
  name: string;
  title: string;
  description?: string;
  ad_type: 'banner' | 'video' | 'native' | 'popup' | 'text' | 'rich_media';
  content_url?: string;
  target_url: string;
  alt_text?: string;
  dimensions?: string;
  file_size?: number;
  mime_type?: string;
  status: 'draft' | 'active' | 'paused' | 'expired' | 'rejected';
  priority: number;
  weight: number;
  start_date?: string;
  end_date?: string;
  max_impressions?: number;
  max_clicks?: number;
  current_impressions: number;
  current_clicks: number;
  budget: number;
  spent_amount: number;
  cpm?: number;
  cpc?: number;
  targeting_criteria: Record<string, string | number | boolean | null | undefined>;
  creative_content: Record<string, string | number | boolean | null | undefined>;
  tags?: string[];
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_reason?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  advertiser?: Advertiser;
}

export interface AdZoneAssignment {
  id: string;
  ad_id: string;
  zone_id: string;
  position_order: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  max_impressions?: number;
  max_clicks?: number;
  current_impressions: number;
  current_clicks: number;
  created_at: string;
  updated_at: string;
  ad?: Ad;
  zone?: AdZone;
}

export interface AdImpression {
  id: string;
  ad_id: string;
  zone_id: string;
  assignment_id: string;
  user_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  page_url: string;
  device_type: 'desktop' | 'tablet' | 'mobile';
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  timestamp: string;
  metadata: Record<string, string | number | boolean | null | undefined>;
}

export interface AdClick {
  id: string;
  impression_id: string;
  ad_id: string;
  zone_id: string;
  assignment_id: string;
  user_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  page_url: string;
  target_url: string;
  device_type: 'desktop' | 'tablet' | 'mobile';
  timestamp: string;
  metadata: Record<string, string | number | boolean | null | undefined>;
}

export interface AdCampaign {
  id: string;
  advertiser_id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  campaign_type: 'cpm' | 'cpc' | 'cpa' | 'fixed';
  total_budget: number;
  spent_budget: number;
  start_date: string;
  end_date: string;
  target_impressions?: number;
  target_clicks?: number;
  target_conversions?: number;
  current_impressions: number;
  current_clicks: number;
  current_conversions: number;
  targeting_criteria: Record<string, string | number | boolean | null | undefined>;
  created_by?: string;
  created_at: string;
  updated_at: string;
  advertiser?: Advertiser;
  ads?: Ad[];
}

export interface CampaignAd {
  id: string;
  campaign_id: string;
  ad_id: string;
  budget_allocation: number;
  created_at: string;
  campaign?: AdCampaign;
  ad?: Ad;
}

// Analytics and Reporting Types
export interface AdAnalytics {
  ad_id: string;
  zone_id?: string;
  total_impressions: number;
  total_clicks: number;
  unique_impressions: number;
  unique_clicks: number;
  ctr: number; // Click-through rate
  cpm?: number; // Cost per mille
  cpc?: number; // Cost per click
  total_spent: number;
  date_range: {
    start: string;
    end: string;
  };
  daily_stats: Array<{
    date: string;
    impressions: number;
    clicks: number;
    ctr: number;
    spent: number;
  }>;
  device_breakdown: {
    desktop: { impressions: number; clicks: number; ctr: number };
    tablet: { impressions: number; clicks: number; ctr: number };
    mobile: { impressions: number; clicks: number; ctr: number };
  };
  geographic_breakdown: Array<{
    country?: string;
    city?: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
}

export interface AdPerformanceReport {
  advertiser_id?: string;
  campaign_id?: string;
  zone_id?: string;
  start_date: string;
  end_date: string;
  summary: {
    total_impressions: number;
    total_clicks: number;
    total_spent: number;
    average_ctr: number;
    average_cpm: number;
    average_cpc: number;
  };
  top_performing_ads: Array<{
    ad_id: string;
    ad_name: string;
    impressions: number;
    clicks: number;
    ctr: number;
    spent: number;
  }>;
  zone_performance: Array<{
    zone_id: string;
    zone_name: string;
    impressions: number;
    clicks: number;
    ctr: number;
    revenue: number;
  }>;
}

// Form Types for Creating/Editing
export interface CreateAdvertiserForm {
  company_name: string;
  contact_person: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  industry?: string;
  logo_url?: string;
  description?: string;
  total_budget: number;
  contract_start_date?: string;
  contract_end_date?: string;
  notes?: string;
}

export interface CreateAdForm {
  advertiser_id: string;
  name: string;
  title: string;
  description?: string;
  ad_type: 'banner' | 'video' | 'native' | 'popup' | 'text' | 'rich_media';
  content_url?: string;
  target_url: string;
  alt_text?: string;
  dimensions?: string;
  priority: number;
  weight: number;
  start_date?: string;
  end_date?: string;
  max_impressions?: number;
  max_clicks?: number;
  budget: number;
  cpm?: number;
  cpc?: number;
  targeting_criteria: Record<string, string | number | boolean | null | undefined>;
  tags?: string[];
  notes?: string;
}

export interface CreateAdZoneForm {
  name: string;
  slug: string;
  description?: string;
  zone_type: 'banner' | 'sidebar' | 'content' | 'popup' | 'video' | 'native';
  dimensions?: string;
  position: 'top' | 'bottom' | 'sidebar' | 'in-content' | 'overlay' | 'exit-intent';
  page_targeting: string[];
  device_targeting: string[];
  rotation_type: 'sequential' | 'random' | 'weighted';
  max_ads_per_rotation: number;
  refresh_interval: number;
}

// Hook return types
export interface UseAdsReturn {
  ads: Ad[];
  loading: boolean;
  error: string | null;
  createAd: (ad: CreateAdForm) => Promise<Ad>;
  updateAd: (id: string, updates: Partial<Ad>) => Promise<Ad>;
  deleteAd: (id: string) => Promise<void>;
  getAdById: (id: string) => Promise<Ad | null>;
  getAdsByAdvertiser: (advertiserId: string) => Promise<Ad[]>;
}

export interface UseAdvertisersReturn {
  advertisers: Advertiser[];
  loading: boolean;
  error: string | null;
  createAdvertiser: (advertiser: CreateAdvertiserForm) => Promise<Advertiser>;
  updateAdvertiser: (id: string, updates: Partial<Advertiser>) => Promise<Advertiser>;
  deleteAdvertiser: (id: string) => Promise<void>;
  getAdvertiserById: (id: string) => Promise<Advertiser | null>;
}

export interface UseAdZonesReturn {
  zones: AdZone[];
  loading: boolean;
  error: string | null;
  createZone: (zone: CreateAdZoneForm) => Promise<AdZone>;
  updateZone: (id: string, updates: Partial<AdZone>) => Promise<AdZone>;
  deleteZone: (id: string) => Promise<void>;
  getZoneById: (id: string) => Promise<AdZone | null>;
  getZonesByType: (type: string) => Promise<AdZone[]>;
}

export interface UseAdAnalyticsReturn {
  analytics: AdAnalytics | null;
  loading: boolean;
  error: string | null;
  getAdAnalytics: (adId: string, startDate: string, endDate: string) => Promise<AdAnalytics>;
  getZoneAnalytics: (zoneId: string, startDate: string, endDate: string) => Promise<AdAnalytics>;
  getCampaignAnalytics: (campaignId: string, startDate: string, endDate: string) => Promise<AdAnalytics>;
  trackImpression: (impression: Omit<AdImpression, 'id' | 'timestamp'>) => Promise<void>;
  trackClick: (click: Omit<AdClick, 'id' | 'timestamp'>) => Promise<void>;
}