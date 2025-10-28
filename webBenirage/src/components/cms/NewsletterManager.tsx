import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Send, Users, BarChart3, Plus, Edit2, Trash2, Eye, Copy } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { supabase } from '../../lib/supabase';

interface NewsletterCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduled_at?: string;
  sent_at?: string;
  recipient_count: number;
  open_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  subscription_date: string;
  tags: string[];
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
}

const NewsletterManager = () => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'subscribers' | 'templates' | 'analytics'>('campaigns');
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    content: '',
    scheduled_at: '',
    template_id: ''
  });

  const [subscriberForm, setSubscriberForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    tags: ''
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'campaigns') {
        await loadCampaigns();
      } else if (activeTab === 'subscribers') {
        await loadSubscribers();
      } else if (activeTab === 'templates') {
        await loadTemplates();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadCampaigns = async () => {
    const { data, error } = await supabase
      .from('newsletter_campaigns')
      .select(`
        *,
        newsletter_campaign_stats(recipient_count, open_count, click_count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setCampaigns(data || []);
  };

  const loadSubscribers = async () => {
    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .order('subscription_date', { ascending: false });

    if (error) throw error;
    setSubscribers(data || []);
  };

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('newsletter_templates')
      .select('*')
      .order('name');

    if (error) throw error;
    setTemplates(data || []);
  };

  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId === 'new') {
        const { error } = await supabase
          .from('newsletter_campaigns')
          .insert([{
            name: campaignForm.name,
            subject: campaignForm.subject,
            content: campaignForm.content,
            scheduled_at: campaignForm.scheduled_at || null,
            status: campaignForm.scheduled_at ? 'scheduled' : 'draft'
          }]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('newsletter_campaigns')
          .update({
            name: campaignForm.name,
            subject: campaignForm.subject,
            content: campaignForm.content,
            scheduled_at: campaignForm.scheduled_at || null,
            status: campaignForm.scheduled_at ? 'scheduled' : 'draft'
          })
          .eq('id', editingId);

        if (error) throw error;
      }

      await loadCampaigns();
      resetCampaignForm();
    } catch (error) {
      console.error('Error saving campaign:', error);
    }
  };

  const handleSubscriberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{
          email: subscriberForm.email,
          first_name: subscriberForm.first_name || null,
          last_name: subscriberForm.last_name || null,
          tags: subscriberForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        }]);

      if (error) throw error;

      await loadSubscribers();
      resetSubscriberForm();
    } catch (error) {
      console.error('Error adding subscriber:', error);
    }
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId === 'new') {
        const { error } = await supabase
          .from('newsletter_templates')
          .insert([{
            name: templateForm.name,
            subject: templateForm.subject,
            content: templateForm.content,
            variables: extractVariables(templateForm.content)
          }]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('newsletter_templates')
          .update({
            name: templateForm.name,
            subject: templateForm.subject,
            content: templateForm.content,
            variables: extractVariables(templateForm.content)
          })
          .eq('id', editingId);

        if (error) throw error;
      }

      await loadTemplates();
      resetTemplateForm();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{(\w+)\}\}/g);
    return matches ? [...new Set(matches.map(match => match.replace(/[{}]/g, '')))] : [];
  };

  const resetCampaignForm = () => {
    setEditingId(null);
    setCampaignForm({
      name: '',
      subject: '',
      content: '',
      scheduled_at: '',
      template_id: ''
    });
  };

  const resetSubscriberForm = () => {
    setSubscriberForm({
      email: '',
      first_name: '',
      last_name: '',
      tags: ''
    });
  };

  const resetTemplateForm = () => {
    setEditingId(null);
    setTemplateForm({
      name: '',
      subject: '',
      content: ''
    });
  };

  const sendCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-newsletter', {
        body: { campaignId }
      });

      if (error) throw error;

      await loadCampaigns();
    } catch (error) {
      console.error('Error sending campaign:', error);
    }
  };

  const editCampaign = (campaign: NewsletterCampaign) => {
    setEditingId(campaign.id);
    setCampaignForm({
      name: campaign.name,
      subject: campaign.subject,
      content: campaign.content,
      scheduled_at: campaign.scheduled_at || '',
      template_id: ''
    });
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const { error } = await supabase
        .from('newsletter_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      await loadCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const tabs = [
    { id: 'campaigns', name: 'Campaigns', icon: Send },
    { id: 'subscribers', name: 'Subscribers', icon: Users },
    { id: 'templates', name: 'Templates', icon: Mail },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 }
  ];

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filterStatus === 'all') return true;
    return campaign.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Newsletter Manager</h2>
          <p className="text-gray-600">Create and manage email campaigns</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'campaigns' | 'subscribers' | 'templates' | 'analytics')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {/* Campaign Form */}
          {editingId && (
            <Card>
              <form onSubmit={handleCampaignSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Campaign Name"
                    value={campaignForm.name || ''}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter campaign name"
                    required
                    type="text"
                  />

                  <FormField
                    label="Subject Line"
                    value={campaignForm.subject || ''}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter email subject"
                    required
                    type="text"
                  />
                </div>

                <FormField
                  label="Email Content"
                  value={campaignForm.content || ''}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter email content (HTML allowed)"
                  type="textarea"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Schedule Date (Optional)"
                    value={campaignForm.scheduled_at || ''}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, scheduled_at: e.target.value }))}
                    type="text"
                    placeholder="YYYY-MM-DD HH:MM:SS"
                  />

                  <FormField
                    label="Template"
                    value={campaignForm.template_id || ''}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, template_id: e.target.value }))}
                    type="select"
                    options={templates.map(template => template.name)}
                  />
                </div>

                <div className="flex space-x-4">
                  <Button type="submit">
                    {editingId === 'new' ? 'Create Campaign' : 'Update Campaign'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetCampaignForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Filters */}
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Campaigns</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <Button onClick={() => setEditingId('new')} icon={Plus}>
                New Campaign
              </Button>
            </div>
          </Card>

          {/* Campaigns List */}
          <div className="grid gap-4">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        campaign.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">{campaign.subject}</p>

                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{campaign.recipient_count} recipients</span>
                      {campaign.open_count > 0 && <span>{campaign.open_count} opens</span>}
                      {campaign.click_count > 0 && <span>{campaign.click_count} clicks</span>}
                      <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {campaign.status === 'draft' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => sendCampaign(campaign.id)} icon={Send}>
                          Send Now
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => editCampaign(campaign)} icon={Edit2}>
                          Edit
                        </Button>
                      </>
                    )}

                    <Button size="sm" variant="outline" onClick={() => deleteCampaign(campaign.id)} icon={Trash2}>
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <div className="space-y-6">
          <Card>
            <form onSubmit={handleSubscriberSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Email"
                  value={subscriberForm.email || ''}
                  onChange={(e) => setSubscriberForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                  type="email"
                />

                <FormField
                  label="First Name"
                  value={subscriberForm.first_name || ''}
                  onChange={(e) => setSubscriberForm(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="Enter first name"
                  type="text"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Last Name"
                  value={subscriberForm.last_name || ''}
                  onChange={(e) => setSubscriberForm(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Enter last name"
                  type="text"
                />

                <FormField
                  label="Tags (comma-separated)"
                  value={subscriberForm.tags || ''}
                  onChange={(e) => setSubscriberForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="tag1, tag2, tag3"
                  type="text"
                />
              </div>

              <Button type="submit">Add Subscriber</Button>
            </form>
          </Card>

          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {subscriber.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {[subscriber.first_name, subscriber.last_name].filter(Boolean).join(' ') || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          subscriber.status === 'active' ? 'bg-green-100 text-green-800' :
                          subscriber.status === 'unsubscribed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {subscriber.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {subscriber.tags.join(', ') || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(subscriber.subscription_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <Card>
            <form onSubmit={handleTemplateSubmit} className="space-y-4">
              <FormField
                label="Template Name"
                value={templateForm.name || ''}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
                required
                type="text"
              />

              <FormField
                label="Subject Line"
                value={templateForm.subject || ''}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter email subject template"
                required
                type="text"
              />

              <FormField
                label="Email Content"
                value={templateForm.content || ''}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter email content template. Use {{variable}} for dynamic content."
                type="textarea"
                required
              />

              <Button type="submit">
                {editingId === 'new' ? 'Create Template' : 'Update Template'}
              </Button>
            </form>
          </Card>

          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                    {template.variables && template.variables.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Variables: {template.variables.join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" icon={Eye}>
                      Preview
                    </Button>
                    <Button size="sm" variant="outline" icon={Copy}>
                      Use
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center">
              <div className="text-2xl font-bold text-blue-600">{subscribers.length}</div>
              <div className="text-sm text-gray-600">Total Subscribers</div>
            </Card>

            <Card className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {subscribers.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active Subscribers</div>
            </Card>

            <Card className="text-center">
              <div className="text-2xl font-bold text-purple-600">{campaigns.length}</div>
              <div className="text-sm text-gray-600">Total Campaigns</div>
            </Card>

            <Card className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {campaigns.filter(c => c.status === 'sent').length}
              </div>
              <div className="text-sm text-gray-600">Sent Campaigns</div>
            </Card>
          </div>

          <Card>
            <h3 className="text-lg font-semibold mb-4">Recent Campaign Performance</h3>
            <div className="space-y-4">
              {campaigns.slice(0, 5).map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{campaign.name}</div>
                    <div className="text-sm text-gray-600">{campaign.subject}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{campaign.open_count} opens</div>
                    <div className="text-sm text-gray-600">{campaign.click_count} clicks</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NewsletterManager;