import { useState, useEffect, useCallback } from 'react';
import { History, GitBranch, RotateCcw, Eye, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useToast } from '../../hooks/useToast';

interface ContentRevision {
  id: string;
  content_id: string;
  version_number: number;
  title: string;
  content: string;
  excerpt?: string;
  change_summary?: string;
  author_name: string;
  created_at: string;
  is_current: boolean;
  diff_data?: unknown;
  word_count: number;
  reading_time: number;
  author_id?: string;
}

interface ContentVersioningProps {
  contentId: string;
  currentContent: string;
  onRestoreVersion: (content: string) => void;
}

const ContentVersioning: React.FC<ContentVersioningProps> = ({
  contentId,
  currentContent,
  onRestoreVersion
}) => {
  const [revisions, setRevisions] = useState<ContentRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadRevisions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('content_revisions')
        .select('*')
        .eq('content_id', contentId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setRevisions(data || []);
    } catch (error) {
      console.error('Error loading revisions:', error);
      showToast('Failed to load content revisions', 'error');
    } finally {
      setLoading(false);
    }
  }, [contentId, showToast]);

  useEffect(() => {
    loadRevisions();
  }, [loadRevisions]);

  const createRevision = async (changesSummary: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const versionNumber = Math.max(...revisions.map(r => r.version_number), 0) + 1;

      const { error } = await supabase
        .from('content_revisions')
        .insert([{
          content_id: contentId,
          version_number: versionNumber,
          title: 'Current Version',
          content: currentContent,
          change_summary: changesSummary,
          author_name: user.email?.split('@')[0] || 'User',
          author_id: user.id,
          word_count: currentContent.split(' ').length,
          reading_time: Math.ceil(currentContent.split(' ').length / 200),
          is_current: true
        }]);

      if (error) throw error;

      // Mark previous revisions as not current
      await supabase
        .from('content_revisions')
        .update({ is_current: false })
        .eq('content_id', contentId)
        .neq('version_number', versionNumber);

      showToast('Revision created successfully', 'success');
      loadRevisions();
    } catch (error) {
      console.error('Error creating revision:', error);
      showToast('Failed to create revision', 'error');
    }
  };

  const restoreRevision = async (revision: ContentRevision) => {
    if (!confirm(`Restore to version ${revision.version_number}? This will replace the current content.`)) {
      return;
    }

    try {
      onRestoreVersion(revision.content);
      await createRevision(`Restored to version ${revision.version_number}`);
      showToast('Content restored successfully', 'success');
    } catch (error) {
      console.error('Error restoring revision:', error);
      showToast('Failed to restore revision', 'error');
    }
  };

  const exportRevision = (revision: ContentRevision) => {
    const exportData = {
      version_number: revision.version_number,
      title: revision.title,
      content: revision.content,
      author_name: revision.author_name,
      created_at: revision.created_at,
      change_summary: revision.change_summary
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `content_version_${revision.version_number}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const calculateDiff = (oldContent: string, newContent: string) => {
    // Simple diff calculation
    const oldWords = oldContent.split(' ');
    const newWords = newContent.split(' ');
    
    const added = newWords.length - oldWords.length;
    const changed = Math.abs(added);
    
    return {
      added: Math.max(added, 0),
      removed: Math.max(-added, 0),
      changed
    };
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} day${Math.floor(diffInHours / 24) !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="flex items-center justify-center py-8">
        <div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <History className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-blue-900">
            Content Versions ({revisions.length})
          </h3>
        </div>
        <Button
          onClick={() => {
            const summary = prompt('Describe the changes made:');
            if (summary) createRevision(summary);
          }}
          icon={GitBranch}
        >
          Create Revision
        </Button>
      </div>

      {/* Revisions List */}
      <div className="space-y-4">
        {revisions.length > 0 ? (
          revisions.map((revision, index) => {
            const previousRevision = revisions[index + 1];
            const diff = previousRevision ? calculateDiff(previousRevision.content, revision.content) : null;

            return (
              <Card key={revision.id} className={`hover:shadow-lg transition-shadow ${
                revision.is_current ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      revision.is_current ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className="font-bold">v{revision.version_number}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-blue-900">
                          Version {revision.version_number}
                          {revision.is_current && (
                            <span className="ml-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                              Current
                            </span>
                          )}
                        </h4>
                        <span className="text-sm text-gray-500">
                          by {revision.author_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(revision.created_at)}
                        </span>
                      </div>
                      
                      {revision.change_summary && (
                        <p className="text-gray-600 text-sm mb-2">{revision.change_summary}</p>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{revision.word_count} words</span>
                        <span>{revision.reading_time} min read</span>
                        {diff && (
                          <>
                            {diff.added > 0 && <span className="text-green-600">+{diff.added} words</span>}
                            {diff.removed > 0 && <span className="text-red-600">-{diff.removed} words</span>}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Show content preview
                        alert(`Preview of version ${revision.version_number}:\n\n${revision.content.substring(0, 200)}...`);
                      }}
                      icon={Eye}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportRevision(revision)}
                      icon={Download}
                    >
                      Export
                    </Button>
                    {!revision.is_current && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreRevision(revision)}
                        icon={RotateCcw}
                      >
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="text-center py-12">
            <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Revisions Yet</h3>
            <p className="text-gray-500">Create your first revision to track content changes</p>
          </Card>
        )}
      </div>

      {/* Revision Analytics */}
      <Card>
        <h4 className="font-semibold text-blue-900 mb-4">Revision Analytics</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{revisions.length}</div>
            <div className="text-sm text-gray-600">Total Revisions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {new Set(revisions.map(r => r.author_name)).size}
            </div>
            <div className="text-sm text-gray-600">Contributors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {revisions.length > 0 ? Math.round(revisions.reduce((sum, r) => sum + r.word_count, 0) / revisions.length) : 0}
            </div>
            <div className="text-sm text-gray-600">Avg Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {revisions.length > 1 ? Math.round((revisions.length - 1) / ((new Date().getTime() - new Date(revisions[revisions.length - 1]?.created_at || 0).getTime()) / (1000 * 60 * 60 * 24))) : 0}
            </div>
            <div className="text-sm text-gray-600">Revisions/Day</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContentVersioning;