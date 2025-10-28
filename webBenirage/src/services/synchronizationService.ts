/**
 * Content Synchronization Service
 *
 * Handles real-time synchronization between admin panel and public website
 * Provides APIs for content validation, caching, and performance monitoring
 */

import { supabase } from '../lib/supabase';

export interface SyncQueueItem {
  id: string;
  content_type: string;
  content_id: string;
  operation: 'create' | 'update' | 'delete';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retry';
  priority: number;
  payload: Record<string, unknown>;
  created_at: string;
  processed_at?: string;
  completed_at?: string;
  error_message?: string;
}

export interface SyncStatus {
  content_type: string;
  pending_count: number;
  processing_count: number;
  completed_count: number;
  failed_count: number;
  last_activity: string;
}

export interface CacheStats {
  total_entries: number;
  active_entries: number;
  expired_entries: number;
  oldest_entry: string;
  newest_entry: string;
}

export interface PerformanceMetrics {
  date: string;
  content_type: string;
  total_ops: number;
  success_rate: number;
  avg_sync_time_ms: number;
}

export class SynchronizationService {
  private static instance: SynchronizationService;
  private syncInProgress: boolean = false;

  static getInstance(): SynchronizationService {
    if (!SynchronizationService.instance) {
      SynchronizationService.instance = new SynchronizationService();
    }
    return SynchronizationService.instance;
  }

  /**
   * Get current synchronization queue status
   */
  async getSyncQueueStatus(): Promise<SyncStatus[]> {
    try {
      const { data, error } = await supabase.rpc('get_sync_queue_status');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting sync queue status:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStatistics(): Promise<CacheStats | null> {
    try {
      const { data, error } = await supabase.rpc('get_cache_statistics');

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error getting cache statistics:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(days: number = 7): Promise<PerformanceMetrics[]> {
    try {
      const { data, error } = await supabase.rpc('get_sync_performance_metrics', {
        p_days: days
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw error;
    }
  }

  /**
   * Process synchronization queue
   */
  async processSyncQueue(): Promise<{
    total_processed: number;
    total_success: number;
    total_failures: number;
  }> {
    if (this.syncInProgress) {
      throw new Error('Synchronization already in progress');
    }

    this.syncInProgress = true;

    try {
      const { data, error } = await supabase.rpc('scheduled_sync_job');

      if (error) throw error;

      return {
        total_processed: data?.[0]?.total_processed || 0,
        total_success: data?.[0]?.total_success || 0,
        total_failures: data?.[0]?.total_failures || 0
      };
    } catch (error) {
      console.error('Error processing sync queue:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Cleanup expired cache entries
   */
  async cleanupExpiredCache(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_expired_cache');

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error cleaning expired cache:', error);
      throw error;
    }
  }

  /**
   * Get recent synchronization activity
   */
  async getRecentSyncActivity(limit: number = 20): Promise<unknown[]> {
    try {
      const { data, error } = await supabase.rpc('get_recent_sync_activity', {
        p_limit: limit
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting recent sync activity:', error);
      throw error;
    }
  }

  /**
   * Check synchronization health
   */
  async checkSyncHealth(): Promise<unknown[]> {
    try {
      const { data, error } = await supabase.rpc('check_sync_health');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error checking sync health:', error);
      throw error;
    }
  }

  /**
   * Queue content for synchronization
   */
  async queueContentSync(
    contentType: string,
    contentId: string,
    operation: 'create' | 'update' | 'delete',
    payload: Record<string, unknown>,
    priority: number = 5
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('queue_content_sync', {
        p_content_type: contentType,
        p_content_id: contentId,
        p_operation: operation,
        p_payload: payload,
        p_priority: priority
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error queueing content sync:', error);
      throw error;
    }
  }

  /**
   * Validate content before synchronization
   */
  async validateContent(contentType: string, contentData: Record<string, unknown>): Promise<unknown> {
    try {
      const { data, error } = await supabase.rpc('validate_content_for_sync', {
        p_content_type: contentType,
        p_content_data: contentData
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error validating content:', error);
      throw error;
    }
  }

  /**
   * Update content cache
   */
  async updateContentCache(
    contentType: string,
    contentId: string,
    cacheData: Record<string, unknown>,
    cacheKey?: string,
    expiresInHours: number = 24
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_content_cache', {
        p_content_type: contentType,
        p_content_id: contentId,
        p_cache_data: cacheData,
        p_cache_key: cacheKey,
        p_expires_in: `${expiresInHours} hours`
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating content cache:', error);
      throw error;
    }
  }

  /**
   * Rollback content to previous version
   */
  async rollbackContent(
    contentType: string,
    contentId: string,
    targetVersion: number,
    rollbackBy?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('rollback_content', {
        p_content_type: contentType,
        p_content_id: contentId,
        p_target_version: targetVersion,
        p_rollback_by: rollbackBy
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error rolling back content:', error);
      throw error;
    }
  }

  /**
   * Get content versions for rollback
   */
  async getContentVersions(
    contentType: string,
    contentId: string,
    limit: number = 10
  ): Promise<unknown[]> {
    try {
      const { data, error } = await supabase
        .from('content_versions')
        .select('*')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .order('version_number', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting content versions:', error);
      throw error;
    }
  }

  /**
   * Get synchronization dashboard data
   */
  async getSynchronizationDashboard(): Promise<unknown> {
    try {
      const { data, error } = await supabase
        .from('synchronization_dashboard')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting synchronization dashboard:', error);
      throw error;
    }
  }

  /**
   * Force refresh cache for specific content
   */
  async refreshContentCache(contentType: string, contentId: string): Promise<void> {
    try {
      // Invalidate existing cache
      await supabase
        .from('content_cache')
        .delete()
        .eq('content_type', contentType)
        .eq('content_id', contentId);

      // Queue for re-caching
      await this.queueContentSync(
        contentType,
        contentId,
        'update',
        { refresh_cache: true },
        8 // High priority for cache refresh
      );
    } catch (error) {
      console.error('Error refreshing content cache:', error);
      throw error;
    }
  }

  /**
   * Get sync settings
   */
  async getSyncSettings(): Promise<unknown[]> {
    try {
      const { data, error } = await supabase
        .from('sync_settings')
        .select('*')
        .eq('is_active', true)
        .order('setting_key');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting sync settings:', error);
      throw error;
    }
  }

  /**
   * Update sync setting
   */
  async updateSyncSetting(settingKey: string, settingValue: unknown): Promise<void> {
    try {
      const { error } = await supabase
        .from('sync_settings')
        .upsert({
          setting_key: settingKey,
          setting_value: settingValue,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating sync setting:', error);
      throw error;
    }
  }

  /**
   * Get failed sync items for manual review
   */
  async getFailedSyncItems(limit: number = 50): Promise<SyncQueueItem[]> {
    try {
      const { data, error } = await supabase
        .from('content_sync_queue')
        .select('*')
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting failed sync items:', error);
      throw error;
    }
  }

  /**
   * Retry failed sync item
   */
  async retrySyncItem(syncId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('content_sync_queue')
        .update({
          status: 'pending',
          retry_count: 0,
          error_message: null,
          scheduled_for: new Date().toISOString()
        })
        .eq('id', syncId);

      if (error) throw error;
    } catch (error) {
      console.error('Error retrying sync item:', error);
      throw error;
    }
  }

  /**
   * Bulk retry failed sync items
   */
  async retryFailedSyncItems(contentType?: string): Promise<number> {
    try {
      let query = supabase
        .from('content_sync_queue')
        .update({
          status: 'pending',
          retry_count: 0,
          error_message: null,
          scheduled_for: new Date().toISOString()
        })
        .eq('status', 'failed');

      if (contentType) {
        query = query.eq('content_type', contentType);
      }

      const { data, error } = await query.select('id');

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error bulk retrying sync items:', error);
      throw error;
    }
  }

  /**
   * Get sync logs with filtering
   */
  async getSyncLogs(
    filters: {
      contentType?: string;
      status?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<unknown[]> {
    try {
      let query = supabase
        .from('content_sync_logs')
        .select(`
          *,
          content_sync_queue:content_sync_queue_id(
            content_type,
            operation,
            content_id
          )
        `)
        .order('created_at', { ascending: false });

      if (filters.contentType) {
        query = query.eq('content_sync_queue.content_type', filters.contentType);
      }

      if (filters.status) {
        query = query.eq('success', filters.status === 'success');
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting sync logs:', error);
      throw error;
    }
  }

  /**
   * Clear sync queue (admin only)
   */
  async clearSyncQueue(status?: string): Promise<number> {
    try {
      let query = supabase
        .from('content_sync_queue')
        .delete();

      if (status) {
        query = query.eq('status', status);
      } else {
        // Clear only completed and failed items older than 24 hours
        query = query.in('status', ['completed', 'failed'])
              .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      }

      const { data, error } = await query.select('id');

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error clearing sync queue:', error);
      throw error;
    }
  }

  /**
   * Get sync queue items with filtering
   */
  async getSyncQueueItems(
    filters: {
      status?: string;
      contentType?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<SyncQueueItem[]> {
    try {
      let query = supabase
        .from('content_sync_queue')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.contentType) {
        query = query.eq('content_type', filters.contentType);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting sync queue items:', error);
      throw error;
    }
  }

  /**
   * Manual content synchronization trigger
   */
  async triggerContentSync(
    contentType: string,
    contentId: string,
    operation: 'create' | 'update' | 'delete' = 'update'
  ): Promise<string> {
    try {
      // Get current content data
      const { data: contentData, error: fetchError } = await supabase
        .from(contentType)
        .select('*')
        .eq('id', contentId)
        .single();

      if (fetchError) throw fetchError;

      // Queue for synchronization
      return await this.queueContentSync(
        contentType,
        contentId,
        operation,
        contentData,
        8 // High priority for manual triggers
      );
    } catch (error) {
      console.error('Error triggering content sync:', error);
      throw error;
    }
  }

  /**
   * Get synchronization overview for admin dashboard
   */
  async getSyncOverview(): Promise<{
    queueStatus: SyncStatus[];
    cacheStats: CacheStats | null;
    recentActivity: unknown[];
    healthStatus: unknown[];
  }> {
    try {
      const [queueStatus, cacheStats, recentActivity, healthStatus] = await Promise.all([
        this.getSyncQueueStatus(),
        this.getCacheStatistics(),
        this.getRecentSyncActivity(10),
        this.checkSyncHealth()
      ]);

      return {
        queueStatus,
        cacheStats,
        recentActivity,
        healthStatus
      };
    } catch (error) {
      console.error('Error getting sync overview:', error);
      throw error;
    }
  }

  /**
   * Export sync logs for analysis
   */
  async exportSyncLogs(
    startDate: string,
    endDate: string,
    contentType?: string
  ): Promise<unknown[]> {
    try {
      let query = supabase
        .from('content_sync_logs')
        .select(`
          *,
          content_sync_queue:content_sync_queue_id(
            content_type,
            operation,
            content_id,
            priority
          )
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (contentType) {
        query = query.eq('content_sync_queue.content_type', contentType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error exporting sync logs:', error);
      throw error;
    }
  }

  /**
   * Get sync analytics summary
   */
  async getSyncAnalyticsSummary(days: number = 30): Promise<{
    totalOperations: number;
    successRate: number;
    averageProcessingTime: number;
    topFailingContentTypes: unknown[];
    dailyTrends: unknown[];
  }> {
    try {
      const metrics = await this.getPerformanceMetrics(days);

      const totalOperations = metrics.reduce((sum, m) => sum + m.total_ops, 0);
      const totalSuccess = metrics.reduce((sum, m) => sum + (m.total_ops * m.success_rate / 100), 0);
      const successRate = totalOperations > 0 ? (totalSuccess / totalOperations) * 100 : 0;

      const averageProcessingTime = metrics.length > 0
        ? metrics.reduce((sum, m) => sum + m.avg_sync_time_ms, 0) / metrics.length
        : 0;

      // Group by content type for failure analysis
      const contentTypeGroups = metrics.reduce((acc, metric) => {
        if (!acc[metric.content_type]) {
          acc[metric.content_type] = { total_ops: 0, success_rate: 0 };
        }
        acc[metric.content_type].total_ops += metric.total_ops;
        acc[metric.content_type].success_rate = metric.success_rate;
        return acc;
      }, {} as Record<string, { total_ops: number; success_rate: number }>);

      const topFailingContentTypes = Object.entries(contentTypeGroups)
        .map(([contentType, data]) => ({
          content_type: contentType,
          ...data,
          failure_rate: 100 - data.success_rate
        }))
        .sort((a, b) => b.failure_rate - a.failure_rate)
        .slice(0, 5);

      return {
        totalOperations,
        successRate,
        averageProcessingTime,
        topFailingContentTypes,
        dailyTrends: metrics
      };
    } catch (error) {
      console.error('Error getting sync analytics summary:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const synchronizationService = SynchronizationService.getInstance();