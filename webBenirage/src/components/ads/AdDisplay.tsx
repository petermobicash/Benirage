import React, { useEffect, useState, useCallback } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Ad, AdZone } from '../../types/ads';
import { AdManager } from '../../utils/adManager';

interface AdDisplayProps {
  zoneSlug: string;
  className?: string;
  onAdLoad?: (ad: Ad | null) => void;
  showCloseButton?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const AdDisplay: React.FC<AdDisplayProps> = ({
  zoneSlug,
  className = '',
  onAdLoad,
  showCloseButton = false,
  autoRefresh = false,
  refreshInterval = 30000
}) => {
  const [ad, setAd] = useState<Ad | null>(null);
  const [zone, setZone] = useState<AdZone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [impressionTracked, setImpressionTracked] = useState(false);

  const loadAd = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch zone information
      const zoneData = await AdManager.getZoneBySlug(zoneSlug);
      setZone(zoneData);

      // Use AdManager to get ads for this zone
      const ads = await AdManager.getAdsForZone(zoneSlug, 1);
      const selectedAd = ads.length > 0 ? ads[0] : null;

      setAd(selectedAd);

      if (onAdLoad) {
        onAdLoad(selectedAd);
      }
    } catch (err) {
      console.error('Error loading ad:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ad');
    } finally {
      setLoading(false);
    }
  }, [zoneSlug, onAdLoad]);

  const getDeviceType = (): 'desktop' | 'tablet' | 'mobile' => {
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  };

  const trackImpression = useCallback(async () => {
    if (!ad || !zone || impressionTracked) return;

    try {
      const deviceType = getDeviceType();
      await AdManager.trackImpression(
        ad.id,
        zone.id,
        '', // TODO: Get assignment_id from ad_zone_assignments
        {
          zone_slug: zoneSlug,
          referrer: document.referrer,
          device_type: deviceType,
          viewport: `${window.innerWidth}x${window.innerHeight}`
        }
      );

      setImpressionTracked(true);
    } catch (err) {
      console.error('Error tracking impression:', err);
    }
  }, [ad, zone, impressionTracked, zoneSlug]);

  useEffect(() => {
    loadAd();

    if (autoRefresh) {
      const interval = setInterval(loadAd, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadAd, autoRefresh, refreshInterval]);

  useEffect(() => {
    // Track impression when ad becomes visible
    if (ad && isVisible && !impressionTracked) {
      trackImpression();
    }
  }, [ad, isVisible, impressionTracked, trackImpression]);

  const handleAdClick = async (event: React.MouseEvent) => {
    event.preventDefault();

    if (!ad || !zone) return;

    try {
      const deviceType = getDeviceType();
      // Track click using AdManager
      await AdManager.trackClick(
        ad.id,
        zone.id,
        '', // TODO: Get assignment_id from ad_zone_assignments
        ad.target_url,
        {
          zone_slug: zoneSlug,
          device_type: deviceType,
          clickX: event.clientX,
          clickY: event.clientY
        }
      );

      // Open target URL
      window.open(ad.target_url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Error tracking click:', err);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const renderAdContent = () => {
    if (!ad || !zone) return null;

    switch (ad.ad_type) {
      case 'banner':
        return (
          <div className="relative group cursor-pointer" onClick={handleAdClick}>
            {ad.content_url && (
              <img
                src={ad.content_url}
                alt={ad.alt_text || ad.title}
                className="w-full h-auto rounded-lg"
                style={{
                  maxWidth: zone.dimensions ? zone.dimensions.split('x')[0] + 'px' : '100%',
                  maxHeight: zone.dimensions ? zone.dimensions.split('x')[1] + 'px' : 'auto'
                }}
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg"></div>
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              Ad • {ad.advertiser?.company_name || 'Advertiser'}
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="relative">
            <video
              src={ad.content_url}
              controls
              className="w-full rounded-lg"
              style={{
                maxWidth: zone.dimensions ? zone.dimensions.split('x')[0] + 'px' : '100%',
                maxHeight: zone.dimensions ? zone.dimensions.split('x')[1] + 'px' : 'auto'
              }}
            >
              Your browser does not support video playback.
            </video>
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              Ad • {ad.advertiser?.company_name || 'Advertiser'}
            </div>
          </div>
        );

      case 'native':
        return (
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={handleAdClick}>
            <div className="flex items-start space-x-3">
              {ad.content_url && (
                <img
                  src={ad.content_url}
                  alt={ad.alt_text || ad.title}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">{ad.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{ad.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Sponsored</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'popup':
        return (
          <div className="relative bg-white border border-gray-200 rounded-lg p-6 text-center">
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            {ad.content_url && (
              <img
                src={ad.content_url}
                alt={ad.alt_text || ad.title}
                className="w-full h-auto mb-4 rounded"
              />
            )}
            <h3 className="text-lg font-semibold text-blue-900 mb-2">{ad.title}</h3>
            <p className="text-gray-600 mb-4">{ad.description}</p>
            <button
              onClick={handleAdClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Learn More
            </button>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <p>Unsupported ad type: {ad.ad_type}</p>
          </div>
        );
    }
  };

  if (!isVisible) return null;

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-lg h-32"></div>
      </div>
    );
  }

  if (error || !ad) {
    return null; // Don't show anything if no ad available
  }

  return (
    <div className={`ad-display ${className}`}>
      {showCloseButton && (
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 text-gray-400 hover:text-gray-600 bg-white bg-opacity-80 rounded-full p-1"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {renderAdContent()}
    </div>
  );
};

export default AdDisplay;