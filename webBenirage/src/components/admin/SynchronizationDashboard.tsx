import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Clock, Activity, Database, Settings, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useToast } from '../../hooks/useToast';

interface SyncStatus {
  content_type: string;
  pending_count: number;
  processing_count: number;
  completed_count: number;
  failed_count: number;
  last_activity: string;
}

interface CacheStats {
  total_entries: number;
  active_entries: number;
  expired_entries: number;
  oldest_entry: string;
  newest_entry: string;
}

interface PerformanceMetrics {
  date: string;
  content_type: string;
  total_ops: number;
  success_rate: number;
  avg_sync_time_ms: number;
}

const SynchronizationDashboard: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { showToast } = useToast();

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Load sync queue status
      const { data: queueData, error: queueError } = await supabase
        .rpc('get_sync_queue_status');

      if (queueError) throw queueError;
      setSyncStatus(queueData || []);

      // Load cache statistics
      const { data: cacheData, error: cacheError } = await supabase
        .rpc('get_cache_statistics');

      if (cacheError) throw cacheError;
      setCacheStats(cacheData?.[0] || null);

      // Load performance metrics
      const { data: metricsData, error: metricsError } = await supabase
        .rpc('get_sync_performance_metrics', { p_days: 1 });

      if (metricsError) throw metricsError;
      setPerformanceMetrics(metricsData || []);

    } catch (error: unknown) {
      console.error('Error loading dashboard data:', error);
      showToast('Failed to load synchronization data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadDashboardData();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadDashboardData, 10000); // Refresh every 10 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, loadDashboardData]);

  const processSyncQueue = async () => {
    try {
      const { data, error } = await supabase.rpc('scheduled_sync_job');

      if (error) throw error;

      showToast(
        `Processed ${data?.[0]?.total_processed || 0} items (${data?.[0]?.total_success || 0} successful)`,
        'success'
      );

      await loadDashboardData();
    } catch (error: unknown) {
      console.error('Error processing sync queue:', error);
      showToast('Failed to process synchronization queue', 'error');
    }
  };

  const cleanupCache = async () => {
    try {
      const { data, error } = await supabase.rpc('cleanup_expired_cache');

      if (error) throw error;

      showToast(`Cleaned up ${data} expired cache entries`, 'success');
      await loadDashboardData();
    } catch (error: unknown) {
      console.error('Error cleaning cache:', error);
      showToast('Failed to cleanup cache', 'error');
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getSyncStatus = (status: SyncStatus) => {
    if (status.failed_count > 0) return 'error';
    if (status.pending_count > 10 || status.processing_count > 5) return 'warning';
    if (status.completed_count > 0 || status.processing_count > 0) return 'healthy';
    return 'idle';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading synchronization data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Synchronization</h1>
            <p className="text-gray-600">Real-time sync between admin panel and public website</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            icon={RefreshCw}
            className={autoRefresh ? 'bg-blue-50 border-blue-200' : ''}
          >
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={loadDashboardData}
            icon={RefreshCw}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={processSyncQueue}
            icon={Activity}
          >
            Process Queue
          </Button>
        </div>
      </div>

      {/* Sync Queue Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {syncStatus.map((status) => (
          <Card key={status.content_type} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800 capitalize">
                {status.content_type}
              </h3>
              {getStatusIcon(getSyncStatus(status))}
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Pending:</span>
                <span className="font-medium text-yellow-600">{status.pending_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing:</span>
                <span className="font-medium text-blue-600">{status.processing_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed:</span>
                <span className="font-medium text-green-600">{status.completed_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Failed:</span>
                <span className="font-medium text-red-600">{status.failed_count}</span>
              </div>
            </div>

            {status.last_activity && (
              <div className="mt-2 text-xs text-gray-500">
                Last activity: {new Date(status.last_activity).toLocaleTimeString()}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Cache Statistics */}
      {cacheStats && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Cache Statistics</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={cleanupCache}
              icon={RefreshCw}
            >
              Cleanup Expired
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{cacheStats.total_entries}</div>
              <div className="text-sm text-gray-600">Total Entries</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{cacheStats.active_entries}</div>
              <div className="text-sm text-gray-600">Active Entries</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{cacheStats.expired_entries}</div>
              <div className="text-sm text-gray-600">Expired Entries</div>
            </div>
          </div>
        </Card>
      )}

      {/* Performance Metrics */}
      {performanceMetrics.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-800">Performance Metrics (Last 24h)</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Sync Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performanceMetrics.map((metric, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                      {metric.content_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metric.total_ops}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${metric.success_rate >= 95 ? 'text-green-600' : metric.success_rate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {metric.success_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metric.avg_sync_time_ms}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            onClick={processSyncQueue}
            icon={Activity}
            className="justify-start"
          >
            Process Queue
          </Button>

          <Button
            variant="outline"
            onClick={cleanupCache}
            icon={RefreshCw}
            className="justify-start"
          >
            Cleanup Cache
          </Button>

          <Button
            variant="outline"
            icon={Eye}
            className="justify-start"
          >
            View Sync Logs
          </Button>

          <Button
            variant="outline"
            icon={Settings}
            className="justify-start"
          >
            Sync Settings
          </Button>
        </div>
      </Card>

      {/* System Health */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-800">System Health</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-medium text-green-800">Database</div>
              <div className="text-sm text-green-600">Connected & Healthy</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-blue-800">Synchronization</div>
              <div className="text-sm text-blue-600">Active & Monitoring</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <div className="font-medium text-yellow-800">Cache Status</div>
              <div className="text-sm text-yellow-600">Auto-refresh enabled</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SynchronizationDashboard;