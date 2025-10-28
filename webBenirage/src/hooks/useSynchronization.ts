import { useState, useEffect, useCallback } from 'react';
import { synchronizationService, SyncStatus, CacheStats, PerformanceMetrics } from '../services/synchronizationService';
import { useToast } from './useToast';

interface SyncActivity {
  id: string;
  type: string;
  content_type: string;
  content_id: string;
  operation: string;
  status: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

interface SyncLog {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  content_type?: string;
  content_id?: string;
  user_id?: string;
  metadata: Record<string, unknown>;
}

export interface UseSynchronizationReturn {
  // Status data
  syncStatus: SyncStatus[];
  cacheStats: CacheStats | null;
  performanceMetrics: PerformanceMetrics[];
  recentActivity: SyncActivity[];

  // Loading states
  loading: boolean;
  processing: boolean;

  // Actions
  processSyncQueue: () => Promise<void>;
  cleanupCache: () => Promise<void>;
  retryFailedItems: (contentType?: string) => Promise<void>;
  refreshCache: (contentType: string, contentId: string) => Promise<void>;
  rollbackContent: (contentType: string, contentId: string, version: number) => Promise<void>;

  // Utilities
  queueContentSync: (contentType: string, contentId: string, operation: 'create' | 'update' | 'delete', payload: Record<string, unknown>) => Promise<void>;
  getSyncLogs: (filters?: Record<string, unknown>) => Promise<SyncLog[]>;
  exportSyncData: (startDate: string, endDate: string) => Promise<SyncLog[]>;
}

export const useSynchronization = (): UseSynchronizationReturn => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  const [recentActivity, setRecentActivity] = useState<SyncActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const overview = await synchronizationService.getSyncOverview();

      setSyncStatus(overview.queueStatus);
      setCacheStats(overview.cacheStats);
      setRecentActivity(overview.recentActivity);
    } catch (error) {
      console.error('Error loading synchronization data:', error);
      showToast('Failed to load synchronization data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Load performance metrics separately
  const loadPerformanceMetrics = useCallback(async () => {
    try {
      const metrics = await synchronizationService.getPerformanceMetrics(7);
      setPerformanceMetrics(metrics);
    } catch (error) {
      console.error('Error loading performance metrics:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadPerformanceMetrics();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadData();
      loadPerformanceMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadData, loadPerformanceMetrics]);

  // Process synchronization queue
  const processSyncQueue = async () => {
    try {
      setProcessing(true);
      const result = await synchronizationService.processSyncQueue();

      showToast(
        `Processed ${result.total_processed} items (${result.total_success} successful, ${result.total_failures} failed)`,
        result.total_failures > 0 ? 'warning' : 'success'
      );

      // Refresh data after processing
      await loadData();
    } catch (error: unknown) {
      console.error('Error processing sync queue:', error);
      showToast('Failed to process synchronization queue', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Cleanup expired cache
  const cleanupCache = async () => {
    try {
      setProcessing(true);
      const cleanedCount = await synchronizationService.cleanupExpiredCache();

      showToast(`Cleaned up ${cleanedCount} expired cache entries`, 'success');
      await loadData();
    } catch (error: unknown) {
      console.error('Error cleaning cache:', error);
      showToast('Failed to cleanup cache', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Retry failed sync items
  const retryFailedItems = async (contentType?: string) => {
    try {
      setProcessing(true);
      const retriedCount = await synchronizationService.retryFailedSyncItems(contentType);

      showToast(`Retried ${retriedCount} failed synchronization items`, 'success');
      await loadData();
    } catch (error: unknown) {
      console.error('Error retrying failed items:', error);
      showToast('Failed to retry synchronization items', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Refresh specific content cache
  const refreshCache = async (contentType: string, contentId: string) => {
    try {
      await synchronizationService.refreshContentCache(contentType, contentId);
      showToast('Content cache refresh queued', 'success');
    } catch (error: unknown) {
      console.error('Error refreshing cache:', error);
      showToast('Failed to refresh content cache', 'error');
    }
  };

  // Rollback content to previous version
  const rollbackContent = async (contentType: string, contentId: string, version: number) => {
    try {
      setProcessing(true);
      const success = await synchronizationService.rollbackContent(
        contentType,
        contentId,
        version
      );

      if (success) {
        showToast('Content rolled back successfully', 'success');
        await loadData();
      } else {
        showToast('Failed to rollback content', 'error');
      }
    } catch (error: unknown) {
      console.error('Error rolling back content:', error);
      showToast('Failed to rollback content', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Queue content for synchronization
  const queueContentSync = async (
    contentType: string,
    contentId: string,
    operation: 'create' | 'update' | 'delete',
    payload: Record<string, unknown>
  ) => {
    try {
      await synchronizationService.queueContentSync(contentType, contentId, operation, payload);
      showToast('Content queued for synchronization', 'success');
      await loadData();
    } catch (error: unknown) {
      console.error('Error queueing content sync:', error);
      showToast('Failed to queue content for synchronization', 'error');
    }
  };

  // Get synchronization logs
  const getSyncLogs = async (filters?: Record<string, unknown>) => {
    try {
      return await synchronizationService.getSyncLogs(filters);
    } catch (error: unknown) {
      console.error('Error getting sync logs:', error);
      showToast('Failed to load synchronization logs', 'error');
      return [];
    }
  };

  // Export synchronization data
  const exportSyncData = async (startDate: string, endDate: string) => {
    try {
      return await synchronizationService.exportSyncLogs(startDate, endDate);
    } catch (error: unknown) {
      console.error('Error exporting sync data:', error);
      showToast('Failed to export synchronization data', 'error');
      return [];
    }
  };

  return {
    // Status data
    syncStatus,
    cacheStats,
    performanceMetrics,
    recentActivity,

    // Loading states
    loading,
    processing,

    // Actions
    processSyncQueue,
    cleanupCache,
    retryFailedItems,
    refreshCache,
    rollbackContent,

    // Utilities
    queueContentSync,
    getSyncLogs,
    exportSyncData
  };
};