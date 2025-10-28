import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Eye, Clock, User, AlertTriangle, RefreshCw } from 'lucide-react';
import { synchronizationService } from '../../services/synchronizationService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useToast } from '../../hooks/useToast';

interface ContentVersion {
  id: string;
  content_type: string;
  content_id: string;
  version_number: number;
  content_data: Record<string, unknown>;
  change_summary?: string;
  change_type: string;
  created_by?: string;
  created_at: string;
}

interface ContentVersionManagerProps {
  contentType: string;
  contentId: string;
  currentVersion?: number;
  onRollback?: (version: number) => void;
}

const ContentVersionManager: React.FC<ContentVersionManagerProps> = ({
  contentType,
  contentId,
  currentVersion,
  onRollback
}) => {
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollbackInProgress, setRollbackInProgress] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<ContentVersion | null>(null);
  const { showToast } = useToast();

  const loadVersions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await synchronizationService.getContentVersions(contentType, contentId, 20);
      setVersions(data as ContentVersion[]);
    } catch (error: unknown) {
      console.error('Error loading versions:', error);
      showToast('Failed to load version history', 'error');
    } finally {
      setLoading(false);
    }
  }, [contentType, contentId, showToast]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const handleRollback = async (targetVersion: number) => {
    try {
      setRollbackInProgress(true);
      const success = await synchronizationService.rollbackContent(
        contentType,
        contentId,
        targetVersion
      );

      if (success) {
        showToast(`Content rolled back to version ${targetVersion}`, 'success');
        onRollback?.(targetVersion);
        await loadVersions();
      } else {
        showToast('Failed to rollback content', 'error');
      }
    } catch (error: unknown) {
      console.error('Error rolling back content:', error);
      showToast('Failed to rollback content', 'error');
    } finally {
      setRollbackInProgress(false);
    }
  };

  const handlePreviewVersion = (version: ContentVersion) => {
    setPreviewVersion(version);
  };

  const formatVersionData = (data: unknown) => {
    if (!data) return 'No data';
    if (typeof data === 'string') return data.substring(0, 100) + '...';
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2).substring(0, 200) + '...';
    }
    return String(data);
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'create': return 'text-green-600 bg-green-50';
      case 'update': return 'text-blue-600 bg-blue-50';
      case 'delete': return 'text-red-600 bg-red-50';
      case 'publish': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading version history...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Version History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Version History</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadVersions}
            icon={RefreshCw}
          >
            Refresh
          </Button>
        </div>

        {versions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No version history available</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {versions.map((version) => (
              <div
                key={version.id}
                className={`border rounded-lg p-4 ${
                  version.version_number === currentVersion
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-semibold text-gray-800">
                        Version {version.version_number}
                      </span>
                      {version.version_number === currentVersion && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Current
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${getChangeTypeColor(version.change_type)}`}>
                        {version.change_type}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      {version.change_summary || `Content ${version.change_type}d`}
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(version.created_at).toLocaleString()}</span>
                      </div>
                      {version.created_by && (
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{version.created_by}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewVersion(version)}
                      icon={Eye}
                    >
                      Preview
                    </Button>

                    {version.version_number !== currentVersion && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRollback(version.version_number)}
                        disabled={rollbackInProgress}
                        icon={RotateCcw}
                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        Rollback
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Version Preview Modal */}
      {previewVersion && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Version {previewVersion.version_number} Preview
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewVersion(null)}
            >
              Close
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Change Type:</strong> {previewVersion.change_type}
              </div>
              <div>
                <strong>Created:</strong> {new Date(previewVersion.created_at).toLocaleString()}
              </div>
              {previewVersion.change_summary && (
                <div className="col-span-2">
                  <strong>Summary:</strong> {previewVersion.change_summary}
                </div>
              )}
            </div>

            <div>
              <strong>Content Data:</strong>
              <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto max-h-48">
                {formatVersionData(previewVersion.content_data)}
              </pre>
            </div>
          </div>
        </Card>
      )}

      {/* Rollback Warning */}
      <Card className="p-4 bg-orange-50 border-orange-200">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
          <div className="text-sm text-orange-800">
            <div className="font-medium">Rollback Warning</div>
            <div className="mt-1">
              Rolling back content will create a new version with the current state before applying the rollback.
              This action cannot be undone without rolling back again.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContentVersionManager;