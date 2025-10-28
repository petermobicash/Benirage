import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Ad, Advertiser, AdZone, CreateAdForm, UseAdsReturn, CreateAdvertiserForm, CreateAdZoneForm, AdAnalytics, AdImpression, AdClick } from '../types/ads';

export const useAds = (): UseAdsReturn => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          advertiser:advertisers(*)
        `)
        .eq('status', 'active')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (err) {
      console.error('Error loading ads:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  const createAd = async (adData: CreateAdForm): Promise<Ad> => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .insert([{
          ...adData,
          status: 'draft',
          current_impressions: 0,
          current_clicks: 0,
          spent_amount: 0,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      await loadAds(); // Refresh the list
      return data;
    } catch (err) {
      console.error('Error creating ad:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to create ad');
    }
  };

  const updateAd = async (id: string, updates: Partial<Ad>): Promise<Ad> => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await loadAds(); // Refresh the list
      return data;
    } catch (err) {
      console.error('Error updating ad:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update ad');
    }
  };

  const deleteAd = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadAds(); // Refresh the list
    } catch (err) {
      console.error('Error deleting ad:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to delete ad');
    }
  };

  const getAdById = async (id: string): Promise<Ad | null> => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          advertiser:advertisers(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching ad:', err);
      return null;
    }
  };

  const getAdsByAdvertiser = async (advertiserId: string): Promise<Ad[]> => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          advertiser:advertisers(*)
        `)
        .eq('advertiser_id', advertiserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching ads by advertiser:', err);
      return [];
    }
  };

  return {
    ads,
    loading,
    error,
    createAd,
    updateAd,
    deleteAd,
    getAdById,
    getAdsByAdvertiser
  };
};

export const useAdvertisers = () => {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdvertisers();
  }, []);

  const loadAdvertisers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('advertisers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdvertisers(data || []);
    } catch (err) {
      console.error('Error loading advertisers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load advertisers');
    } finally {
      setLoading(false);
    }
  };

  const createAdvertiser = async (advertiserData: CreateAdvertiserForm): Promise<Advertiser> => {
    try {
      const { data, error } = await supabase
        .from('advertisers')
        .insert([{
          ...advertiserData,
          status: 'active',
          payment_status: 'current',
          spent_budget: 0,
          remaining_budget: advertiserData.total_budget || 0,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      await loadAdvertisers(); // Refresh the list
      return data;
    } catch (err) {
      console.error('Error creating advertiser:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to create advertiser');
    }
  };

  const updateAdvertiser = async (id: string, updates: Partial<Advertiser>): Promise<Advertiser> => {
    try {
      const { data, error } = await supabase
        .from('advertisers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await loadAdvertisers(); // Refresh the list
      return data;
    } catch (err) {
      console.error('Error updating advertiser:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update advertiser');
    }
  };

  const deleteAdvertiser = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('advertisers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadAdvertisers(); // Refresh the list
    } catch (err) {
      console.error('Error deleting advertiser:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to delete advertiser');
    }
  };

  const getAdvertiserById = async (id: string): Promise<Advertiser | null> => {
    try {
      const { data, error } = await supabase
        .from('advertisers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching advertiser:', err);
      return null;
    }
  };

  return {
    advertisers,
    loading,
    error,
    createAdvertiser,
    updateAdvertiser,
    deleteAdvertiser,
    getAdvertiserById
  };
};

export const useAdZones = () => {
  const [zones, setZones] = useState<AdZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('ad_zones')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setZones(data || []);
    } catch (err) {
      console.error('Error loading ad zones:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ad zones');
    } finally {
      setLoading(false);
    }
  };

  const createZone = async (zoneData: CreateAdZoneForm): Promise<AdZone> => {
    try {
      const { data, error } = await supabase
        .from('ad_zones')
        .insert([{
          ...zoneData,
          is_active: true,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      await loadZones(); // Refresh the list
      return data;
    } catch (err) {
      console.error('Error creating zone:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to create zone');
    }
  };

  const updateZone = async (id: string, updates: Partial<AdZone>): Promise<AdZone> => {
    try {
      const { data, error } = await supabase
        .from('ad_zones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await loadZones(); // Refresh the list
      return data;
    } catch (err) {
      console.error('Error updating zone:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update zone');
    }
  };

  const deleteZone = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('ad_zones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadZones(); // Refresh the list
    } catch (err) {
      console.error('Error deleting zone:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to delete zone');
    }
  };

  const getZoneById = async (id: string): Promise<AdZone | null> => {
    try {
      const { data, error } = await supabase
        .from('ad_zones')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching zone:', err);
      return null;
    }
  };

  const getZonesByType = async (type: string): Promise<AdZone[]> => {
    try {
      const { data, error } = await supabase
        .from('ad_zones')
        .select('*')
        .eq('zone_type', type)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching zones by type:', err);
      return [];
    }
  };

  return {
    zones,
    loading,
    error,
    createZone,
    updateZone,
    deleteZone,
    getZoneById,
    getZonesByType
  };
};

export const useAdAnalytics = () => {
  const [analytics, setAnalytics] = useState<AdAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAdAnalytics = async (adId: string, startDate: string, endDate: string) => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Implement analytics calculation
      // This would aggregate data from ad_impressions and ad_clicks tables

      const mockAnalytics: AdAnalytics = {
        ad_id: adId,
        total_impressions: 0,
        total_clicks: 0,
        unique_impressions: 0,
        unique_clicks: 0,
        ctr: 0,
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

      setAnalytics(mockAnalytics);
      return mockAnalytics;
    } catch (err) {
      console.error('Error fetching ad analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const trackImpression = async (impression: Omit<AdImpression, 'id' | 'timestamp'>) => {
    try {
      const { error } = await supabase
        .from('ad_impressions')
        .insert([{
          ...impression,
          timestamp: new Date().toISOString()
        }]);

      if (error) throw error;
    } catch (err) {
      console.error('Error tracking impression:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to track impression');
    }
  };

  const trackClick = async (click: Omit<AdClick, 'id' | 'timestamp'>) => {
    try {
      const { error } = await supabase
        .from('ad_clicks')
        .insert([{
          ...click,
          timestamp: new Date().toISOString()
        }]);

      if (error) throw error;
    } catch (err) {
      console.error('Error tracking click:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to track click');
    }
  };

  return {
    analytics,
    loading,
    error,
    getAdAnalytics,
    trackImpression,
    trackClick
  };
};