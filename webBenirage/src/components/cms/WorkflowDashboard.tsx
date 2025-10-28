import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Clock, CheckCircle, XCircle, Eye, Edit } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface WorkflowItem {
  id: string;
  title: string;
  type: string;
  status: string;
  author: string;
  initiated_by?: string;
  initiated_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  published_by?: string;
  published_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
  review_notes?: string;
  updated_at: string;
  workflow_stage: string;
}

const WorkflowDashboard = () => {
  const [workflowItems, setWorkflowItems] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchWorkflowItems();
  }, []);

  const fetchWorkflowItems = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_dashboard')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setWorkflowItems(data || []);
    } catch (error) {
      console.error('Error fetching workflow items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4 text-gray-500" />;
      case 'pending_review': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'reviewed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'published': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredItems = workflowItems.filter(item => {
    switch (activeTab) {
      case 'pending': return ['draft', 'pending_review'].includes(item.status);
      case 'reviewed': return item.status === 'reviewed';
      case 'published': return item.status === 'published';
      case 'rejected': return item.status === 'rejected';
      default: return true;
    }
  });

  const tabs = [
    { id: 'pending', name: 'Pending Review', count: workflowItems.filter(i => ['draft', 'pending_review'].includes(i.status)).length },
    { id: 'reviewed', name: 'Reviewed', count: workflowItems.filter(i => i.status === 'reviewed').length },
    { id: 'published', name: 'Published', count: workflowItems.filter(i => i.status === 'published').length },
    { id: 'rejected', name: 'Rejected', count: workflowItems.filter(i => i.status === 'rejected').length }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Content Workflow Dashboard</h2>
        <p className="text-gray-600">Track content through the three-level approval process</p>
      </div>

      {/* Workflow Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {tabs.map((tab) => (
          <Card key={tab.id} className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab(tab.id)}>
            <div className="text-3xl font-bold text-blue-600 mb-2">{tab.count}</div>
            <div className="text-gray-600">{tab.name}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-gray-600 hover:text-blue-900'
            }`}
          >
            <span>{tab.name}</span>
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Workflow Items */}
      <div className="space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    {getStatusIcon(item.status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">{item.title}</h3>
                    <p className="text-gray-600 text-sm">Type: {item.type} • Author: {item.author}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                      {item.initiated_at && <span>Initiated: {new Date(item.initiated_at).toLocaleDateString()}</span>}
                      {item.reviewed_at && <span>Reviewed: {new Date(item.reviewed_at).toLocaleDateString()}</span>}
                      {item.published_at && <span>Published: {new Date(item.published_at).toLocaleDateString()}</span>}
                    </div>
                    {item.rejection_reason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Rejection Reason:</strong> {item.rejection_reason}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <Button variant="outline" size="sm" icon={Eye}>
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Items Found</h3>
            <p className="text-gray-500">
              {activeTab === 'pending' ? 'No content pending review' :
               activeTab === 'reviewed' ? 'No content awaiting publication' :
               activeTab === 'published' ? 'No published content' :
               'No rejected content'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WorkflowDashboard;