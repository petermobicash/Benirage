import React from 'react';
import AdDisplay from './AdDisplay';

interface AdZoneProps {
  zoneSlug: string;
  className?: string;
  fallback?: React.ReactNode;
  showCloseButton?: boolean;
  autoRefresh?: boolean;
}

const AdZone: React.FC<AdZoneProps> = ({
  zoneSlug,
  className = '',
  fallback = null,
  showCloseButton = false,
  autoRefresh = false
}) => {
  return (
    <div className={`ad-zone ad-zone-${zoneSlug} ${className}`}>
      <AdDisplay
        zoneSlug={zoneSlug}
        showCloseButton={showCloseButton}
        autoRefresh={autoRefresh}
      />
      {fallback}
    </div>
  );
};

export default AdZone;