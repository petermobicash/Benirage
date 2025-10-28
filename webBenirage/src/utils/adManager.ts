import { supabase } from '../lib/supabase';
import { Ad, AdZone, AdAnalytics, AdImpression, AdClick } from '../types/ads';

type AdAssignment = {
  ad: Ad;
  position_order: number;
  [key: string]: unknown;
};

export class AdManager {
  /**
   * Get ads for a specific zone with rotation logic
   */
  static async getAdsForZone(zoneSlug: string, limit: number = 1): Promise<Ad[]> {
    try {
      // Get zone info
      const { data: zone, error: zoneError } = await supabase
        .from('ad_zones')
        .select('*')
        .eq('slug', zoneSlug)
        .eq('is_active', true)
        .single();

      if (zoneError || !zone) {
        console.error('Zone not found:', zoneSlug);
        return this.getDemoAdsForZone(zoneSlug, limit);
      }

      // Get active ads for this zone
      const { data: assignments, error: assignmentsError } = await supabase
        .from('ad_zone_assignments')
        .select(`
          *,
          ad:ads!inner(*)
        `)
        .eq('zone_id', zone.id)
        .eq('is_active', true)
        .gte('ad.status', 'active')
        .lte('ad.start_date', new Date().toISOString())
        .gte('ad.end_date', new Date().toISOString());

      if (assignmentsError) {
        console.error('Error fetching ad assignments:', assignmentsError);
        return this.getDemoAdsForZone(zoneSlug, limit);
      }

      if (!assignments || assignments.length === 0) {
        // Return demo ads if no real ads are available
        return this.getDemoAdsForZone(zoneSlug, limit);
      }

      // Apply rotation logic
      const rotatedAds = this.applyRotationLogic(assignments, zone.rotation_type, limit);

      return rotatedAds.map(assignment => assignment.ad);
    } catch (error) {
      console.error('Error getting ads for zone:', error);
      return this.getDemoAdsForZone(zoneSlug, limit);
    }
  }

  /**
   * Apply rotation logic to ad assignments
   */
  private static applyRotationLogic(
    assignments: AdAssignment[],
    rotationType: string,
    limit: number
  ): AdAssignment[] {
    switch (rotationType) {
      case 'random': {
        // Shuffle array and return first 'limit' items
        const shuffled = [...assignments].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, limit);
      }

      case 'weighted': {
        // Sort by weight (priority) and return top 'limit' items
        const weighted = assignments.sort((a, b) => (b.ad?.weight || 0) - (a.ad?.weight || 0));
        return weighted.slice(0, limit);
      }

      case 'sequential':
      default: {
        // Sort by position_order and return first 'limit' items
        const sequential = assignments.sort((a, b) => (a.position_order || 0) - (b.position_order || 0));
        return sequential.slice(0, limit);
      }
    }
  }

  /**
   * Track ad impression
   */
  static async trackImpression(
    adId: string,
    zoneId: string,
    assignmentId: string,
    metadata: Record<string, string | number | boolean | null | undefined> = {}
  ): Promise<void> {
    try {
      const impressionData = {
        ad_id: adId,
        zone_id: zoneId,
        assignment_id: assignmentId,
        page_url: window.location.href,
        device_type: this.getDeviceType(),
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        metadata: {
          ...metadata,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          timestamp: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('ad_impressions')
        .insert([impressionData]);

      if (error) {
        console.error('Error tracking impression:', error);
      }
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  }

  /**
   * Track ad click
   */
  static async trackClick(
    adId: string,
    zoneId: string,
    assignmentId: string,
    targetUrl: string,
    metadata: Record<string, string | number | boolean | null | undefined> = {}
  ): Promise<void> {
    try {
      // First, get the latest impression for this ad/zone combination
      const { data: impressions, error: impressionError } = await supabase
        .from('ad_impressions')
        .select('id')
        .eq('ad_id', adId)
        .eq('zone_id', zoneId)
        .order('timestamp', { ascending: false })
        .limit(1);

      if (impressionError) {
        console.error('Error fetching impression for click tracking:', impressionError);
        return;
      }

      const clickData = {
        impression_id: impressions?.[0]?.id || null,
        ad_id: adId,
        zone_id: zoneId,
        assignment_id: assignmentId,
        page_url: window.location.href,
        target_url: targetUrl,
        device_type: this.getDeviceType(),
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        metadata: {
          ...metadata,
          click_x: metadata.clickX || 0,
          click_y: metadata.clickY || 0,
          timestamp: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('ad_clicks')
        .insert([clickData]);

      if (error) {
        console.error('Error tracking click:', error);
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  }

  /**
   * Get device type based on screen width
   */
  private static getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Get available ad zones
   */
  static async getAvailableZones(): Promise<AdZone[]> {
    try {
      const { data, error } = await supabase
        .from('ad_zones')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching ad zones:', error);
      return [];
    }
  }

  /**
   * Get ad analytics for a specific ad
   */
  static async getAdAnalytics(
    adId: string,
    startDate: string,
    endDate: string
  ): Promise<AdAnalytics | null> {
    try {
      // Get impressions
      const { data: impressions, error: impressionsError } = await supabase
        .from('ad_impressions')
        .select('*')
        .eq('ad_id', adId)
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);

      if (impressionsError) throw impressionsError;

      const typedImpressions: AdImpression[] = impressions || [];

      // Get clicks
      const { data: clicks, error: clicksError } = await supabase
        .from('ad_clicks')
        .select('*')
        .eq('ad_id', adId)
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);

      if (clicksError) throw clicksError;

      const typedClicks: AdClick[] = clicks || [];

      const totalImpressions = typedImpressions.length;
      const totalClicks = typedClicks.length;
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      return {
        ad_id: adId,
        total_impressions: totalImpressions,
        total_clicks: totalClicks,
        ctr: ctr,
        unique_impressions: new Set(typedImpressions.map(i => i.user_id || i.session_id)).size,
        unique_clicks: new Set(typedClicks.map(c => c.user_id || c.session_id)).size,
        total_spent: 0,
        date_range: { start: startDate, end: endDate },
        daily_stats: [],
        device_breakdown: {
          desktop: { impressions: 0, clicks: 0, ctr: 0 },
          tablet: { impressions: 0, clicks: 0, ctr: 0 },
          mobile: { impressions: 0, clicks: 0, ctr: 0 }
        },
        geographic_breakdown: []
      };
    } catch (error) {
      console.error('Error fetching ad analytics:', error);
      return null;
    }
  }

  /**
   * Check if user can see ads (based on authentication, preferences, etc.)
   */
  static canShowAds(): boolean {
    // Check if user has ad blocker
    if (typeof window !== 'undefined') {
      // Simple check for common ad blocker indicators
      const adBlockIndicators = ['adblock', 'ublock', 'adguard'];
      const userAgent = navigator.userAgent.toLowerCase();

      for (const indicator of adBlockIndicators) {
        if (userAgent.includes(indicator)) {
          return false;
        }
      }
    }

    // TODO: Check user preferences for ad visibility
    // TODO: Check subscription status for ad-free experience

    return true;
  }

  /**
   * Get ad zone by slug
   */
  static async getZoneBySlug(slug: string): Promise<AdZone | null> {
    try {
      const { data, error } = await supabase
        .from('ad_zones')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching zone by slug:', error);
      return null;
    }
  }

  /**
   * Get demo ads for presentation purposes when no real ads are available
   */
  private static getDemoAdsForZone(zoneSlug: string, limit: number): Ad[] {
    const demoAds: Ad[] = [
      {
        id: `demo-${zoneSlug}-1`,
        advertiser_id: 'demo-advertiser-1',
        name: 'BENIRAGE Philosophy Program',
        title: 'Discover African Wisdom',
        description: 'Join our philosophy cafes and explore traditional African wisdom and modern thought leadership.',
        ad_type: 'banner',
        content_url: '/imuhira.jpeg',
        target_url: '/philosophy',
        alt_text: 'BENIRAGE Philosophy Program Banner',
        status: 'active',
        priority: 10,
        weight: 1,
        current_impressions: 1250,
        current_clicks: 89,
        budget: 500,
        spent_amount: 125.50,
        cpm: 2.50,
        cpc: 1.41,
        targeting_criteria: {},
        creative_content: {},
        tags: ['education', 'philosophy', 'african-wisdom'],
        created_by: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        advertiser: {
          id: 'demo-advertiser-1',
          company_name: 'BENIRAGE Foundation',
          contact_person: 'Demo Contact',
          email: 'demo@benirage.org',
          status: 'active',
          payment_status: 'current',
          total_budget: 1000,
          spent_budget: 125.50,
          remaining_budget: 874.50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      },
      {
        id: `demo-${zoneSlug}-2`,
        advertiser_id: 'demo-advertiser-2',
        name: 'Cultural Heritage Festival',
        title: 'Experience Rwandan Culture',
        description: 'Three-day celebration of Rwandan music, dance, art, and traditional crafts.',
        ad_type: 'native',
        content_url: '/intore-dancer-in-ibwiwachu-village-rwanda-CY472B.jpg',
        target_url: '/culture',
        alt_text: 'Cultural Heritage Festival',
        status: 'active',
        priority: 8,
        weight: 1,
        current_impressions: 890,
        current_clicks: 67,
        budget: 300,
        spent_amount: 89.25,
        cpm: 2.25,
        cpc: 1.33,
        targeting_criteria: {},
        creative_content: {},
        tags: ['culture', 'festival', 'heritage'],
        created_by: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        advertiser: {
          id: 'demo-advertiser-2',
          company_name: 'Rwanda Cultural Heritage',
          contact_person: 'Demo Contact',
          email: 'demo@rwandaculture.org',
          status: 'active',
          payment_status: 'current',
          total_budget: 500,
          spent_budget: 89.25,
          remaining_budget: 410.75,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      },
      {
        id: `demo-${zoneSlug}-3`,
        advertiser_id: 'demo-advertiser-3',
        name: 'Spiritual Retreat Promo',
        title: 'Find Your Inner Peace',
        description: 'Weekend spiritual retreats combining traditional practices with modern mindfulness.',
        ad_type: 'video',
        content_url: '/LOGO_CLEAR_stars.png',
        target_url: '/spiritual',
        alt_text: 'Spiritual Retreat Experience',
        status: 'active',
        priority: 7,
        weight: 1,
        current_impressions: 654,
        current_clicks: 43,
        budget: 200,
        spent_amount: 65.40,
        cpm: 2.00,
        cpc: 1.52,
        targeting_criteria: {},
        creative_content: {},
        tags: ['spiritual', 'retreat', 'mindfulness'],
        created_by: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        advertiser: {
          id: 'demo-advertiser-3',
          company_name: 'BENIRAGE Spiritual Center',
          contact_person: 'Demo Contact',
          email: 'demo@spiritual.benirage.org',
          status: 'active',
          payment_status: 'current',
          total_budget: 300,
          spent_budget: 65.40,
          remaining_budget: 234.60,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    ];

    // Return ads based on zone type
    const zoneAds = demoAds.filter(ad => {
      switch (zoneSlug) {
        case 'header-banner':
        case 'content-banner':
        case 'footer-banner':
          return ad.ad_type === 'banner';
        case 'sidebar-rectangle':
          return ad.ad_type === 'banner';
        case 'mobile-banner':
          return ad.ad_type === 'banner';
        case 'video-preroll':
          return ad.ad_type === 'video';
        case 'native-content':
          return ad.ad_type === 'native';
        case 'exit-intent-popup':
          return ad.ad_type === 'popup';
        default:
          return true;
      }
    });

    return zoneAds.slice(0, limit);
  }
}