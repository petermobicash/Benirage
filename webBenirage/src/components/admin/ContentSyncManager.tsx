import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle, Database, Settings, Eye, Activity } from 'lucide-react';
import { useSynchronization } from '../../hooks/useSynchronization';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useToast } from '../../hooks/useToast';

interface ContentSyncManagerProps {
  contentType?: string;
  contentId?: string;
  onSyncComplete?: () => void;
  autoSync?: boolean;
}

const ContentSyncManager: React.FC<ContentSyncManagerProps> = ({
  contentType,
  contentId,
  onSyncComplete,
  autoSync = true
}) => {
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncHistory, setSyncHistory] = useState<Array<{
    id?: string;
    success: boolean;
    action: string;
    created_at: string;
  }>>([]);

  const {
    syncStatus,
    processing,
    processSyncQueue,
    cleanupCache,
    retryFailedItems,
    refreshCache,
    queueContentSync,
    getSyncLogs
  } = useSynchronization();

  const { showToast } = useToast();

  const loadSyncHistory = useCallback(async () => {
    if (!contentType || !contentId) return;

    try {
      const logs = await getSyncLogs({
        contentType,
        limit: 10
      });
      setSyncHistory(logs as unknown as Array<{
        id?: string;
        success: boolean;
        action: string;
        created_at: string;
      }>);
    } catch (error) {
      console.error('Error loading sync history:', error);
    }
  }, [contentType, contentId, getSyncLogs]);

   const handleContentSync = useCallback(async () => {
     if (!contentType || !contentId) return;

     try {
       setSyncInProgress(true);
       await queueContentSync(contentType, contentId, 'update', {
         manual_sync: true,
         timestamp: new Date().toISOString()
       });

       setLastSyncTime(new Date());
       showToast('Content synchronization initiated', 'success');
       onSyncComplete?.();
     } catch (error: unknown) {
       console.error('Error syncing content:', error);
       showToast('Failed to synchronize content', 'error');
     } finally {
       setSyncInProgress(false);
     }
   }, [contentType, contentId, queueContentSync, showToast, onSyncComplete]);

   // Auto-sync effect
   useEffect(() => {
     if (autoSync && contentType && contentId) {
       const syncTimer = setInterval(() => {
         handleContentSync();
       }, 30000); // Sync every 30 seconds

       return () => clearInterval(syncTimer);
     }
   }, [autoSync, contentType, contentId, handleContentSync]);

   // Load sync history for specific content
   useEffect(() => {
     if (contentType && contentId) {
       loadSyncHistory();
     }
   }, [contentType, contentId, loadSyncHistory]);

   const handleForceSync = async () => {
    if (!contentType || !contentId) return;

    try {
      setSyncInProgress(true);
      await refreshCache(contentType, contentId);
      setLastSyncTime(new Date());
      showToast('Content force synchronized', 'success');
      await loadSyncHistory();
    } catch (error: unknown) {
      console.error('Error force syncing content:', error);
      showToast('Failed to force synchronize content', 'error');
    } finally {
      setSyncInProgress(false);
    }
  };

  const handleRetryFailedItems = async () => {
    try {
      setSyncInProgress(true);
      await retryFailedItems(contentType);
      showToast('Failed items retry initiated', 'success');
      await loadSyncHistory();
    } catch (error: unknown) {
      console.error('Error retrying failed items:', error);
      showToast('Failed to retry failed items', 'error');
    } finally {
      setSyncInProgress(false);
    }
  };

  const handleProcessSyncQueue = async () => {
    try {
      await processSyncQueue();
      await loadSyncHistory();
    } catch (error: unknown) {
      console.error('Error processing sync queue:', error);
      showToast('Failed to process sync queue', 'error');
    }
  };

  const getSyncStatusForContentType = () => {
    if (!contentType) return null;
    return syncStatus.find(status => status?.content_type === contentType);
  };

  const contentTypeStatus = getSyncStatusForContentType();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Content Synchronization
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {syncInProgress && (
            <div className="flex items-center space-x-2 text-blue-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Syncing...</span>
            </div>
          )}

          {lastSyncTime && !syncInProgress && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">
                Last sync: {lastSyncTime.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content Type Status */}
      {contentType && contentTypeStatus && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700 capitalize">
              {contentType} Status:
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-yellow-600">Pending: {contentTypeStatus.pending_count}</span>
              <span className="text-blue-600">Processing: {contentTypeStatus.processing_count}</span>
              <span className="text-green-600">Completed: {contentTypeStatus.completed_count}</span>
              <span className="text-red-600">Failed: {contentTypeStatus.failed_count}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleContentSync}
          disabled={syncInProgress || !contentType || !contentId}
          icon={RefreshCw}
          className="justify-start"
        >
          Sync Now
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleForceSync}
          disabled={syncInProgress || !contentType || !contentId}
          icon={Activity}
          className="justify-start"
        >
          Force Sync
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleProcessSyncQueue}
          disabled={processing}
          icon={Database}
          className="justify-start"
        >
          Process Queue
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRetryFailedItems}
          disabled={syncInProgress || !contentType}
          icon={RefreshCw}
          className="justify-start"
        >
          Retry Failed
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={cleanupCache}
          disabled={processing}
          icon={Settings}
          className="justify-start"
        >
          Cleanup Cache
        </Button>
      </div>

      {/* Sync History */}
      {syncHistory.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-800 mb-3">Recent Sync Activity</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {syncHistory.slice(0, 5).map((log, index) => (
              <div key={log.id || `${log.created_at}-${index}`} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  {log.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="capitalize">{log.action}</span>
                </div>
                <span className="text-gray-500">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync Information */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Eye className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <div className="font-medium">Real-Time Synchronization Active</div>
            <div className="text-blue-600">
              Changes are automatically synchronized to the public website within seconds.
              {contentType && contentId && (
                <> Current content: <strong>{contentType}</strong> (ID: {contentId.slice(0, 8)}...)</>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {contentTypeStatus?.completed_count || 0}
          </div>
          <div className="text-xs text-gray-600">Successful</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-600">
            {contentTypeStatus?.failed_count || 0}
          </div>
          <div className="text-xs text-gray-600">Failed</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">
            {contentTypeStatus?.pending_count || 0}
          </div>
          <div className="text-xs text-gray-600">Pending</div>
        </div>
      </div>
    </Card>
  );
};

export default ContentSyncManager;