import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Globe, FileText, BarChart3, Plus, Edit2, Trash2, Zap, Target, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';

interface SeoPage {
  id: string;
  url: string;
  title: string;
  description: string;
  keywords: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
  noindex: boolean;
  nofollow: boolean;
  last_modified: string;
  priority: number;
  change_frequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

interface SeoSettings {
  id?: string;
  site_name: string;
  site_description: string;
  default_title: string;
  default_description: string;
  default_keywords: string[];
  og_default_image: string;
  twitter_handle?: string;
  google_analytics_id?: string;
  google_search_console?: string;
  robots_txt: string;
  sitemap_enabled: boolean;
}

const SeoManager = () => {
  const [activeTab, setActiveTab] = useState<'pages' | 'settings' | 'sitemap' | 'analytics'>('pages');
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [settings, setSettings] = useState<SeoSettings>({
    site_name: '',
    site_description: '',
    default_title: '',
    default_description: '',
    default_keywords: [],
    og_default_image: '',
    twitter_handle: '',
    google_analytics_id: '',
    google_search_console: '',
    robots_txt: '',
    sitemap_enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadPages = useCallback(async () => {
    const { data, error } = await supabase
      .from('seo_pages')
      .select('*')
      .order('url');

    if (error) throw error;
    setPages(data || []);
  }, []);

  const loadSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from('seo_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      setSettings(data);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'pages') {
        await loadPages();
      } else if (activeTab === 'settings') {
        await loadSettings();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, showToast, loadPages, loadSettings]);

  const [pageForm, setPageForm] = useState<{
    url: string;
    title: string;
    description: string;
    keywords: string;
    og_title: string;
    og_description: string;
    og_image: string;
    canonical_url: string;
    noindex: boolean;
    nofollow: boolean;
    priority: number;
    change_frequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  }>({
    url: '',
    title: '',
    description: '',
    keywords: '',
    og_title: '',
    og_description: '',
    og_image: '',
    canonical_url: '',
    noindex: false,
    nofollow: false,
    priority: 0.5,
    change_frequency: 'monthly'
  });

  useEffect(() => {
    loadData();
  }, [activeTab, loadData]);

  

  

  const handlePageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const pageData = {
        url: pageForm.url,
        title: pageForm.title,
        description: pageForm.description,
        keywords: pageForm.keywords.split(',').map(k => k.trim()).filter(Boolean),
        og_title: pageForm.og_title || pageForm.title,
        og_description: pageForm.og_description || pageForm.description,
        og_image: pageForm.og_image,
        canonical_url: pageForm.canonical_url,
        noindex: pageForm.noindex,
        nofollow: pageForm.nofollow,
        priority: pageForm.priority,
        change_frequency: pageForm.change_frequency as 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
        last_modified: new Date().toISOString()
      };

      if (editingId === 'new') {
        const { error } = await supabase
          .from('seo_pages')
          .insert([pageData]);

        if (error) throw error;
        showToast('Page added successfully!', 'success');
      } else {
        const { error } = await supabase
          .from('seo_pages')
          .update(pageData)
          .eq('id', editingId);

        if (error) throw error;
        showToast('Page updated successfully!', 'success');
      }

      await loadPages();
      resetPageForm();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save page';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('seo_settings')
        .upsert({
          id: settings.id || 'default',
          ...settings,
          default_keywords: settings.default_keywords
        });

      if (error) throw error;

      showToast('Settings saved successfully!', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetPageForm = () => {
    setEditingId(null);
    setPageForm({
      url: '',
      title: '',
      description: '',
      keywords: '',
      og_title: '',
      og_description: '',
      og_image: '',
      canonical_url: '',
      noindex: false,
      nofollow: false,
      priority: 0.5,
      change_frequency: 'monthly'
    });
  };

  const editPage = (page: SeoPage) => {
    setEditingId(page.id);
    setPageForm({
      url: page.url,
      title: page.title,
      description: page.description,
      keywords: page.keywords.join(', '),
      og_title: page.og_title || '',
      og_description: page.og_description || '',
      og_image: page.og_image || '',
      canonical_url: page.canonical_url || '',
      noindex: page.noindex,
      nofollow: page.nofollow,
      priority: page.priority,
      change_frequency: page.change_frequency
    });
  };

  const deletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) return;

    setDeleting(pageId);
    setError(null);

    try {
      const { error } = await supabase
        .from('seo_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      showToast('Page deleted successfully!', 'success');
      await loadPages();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete page';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setDeleting(null);
    }
  };

  const generateSitemap = async () => {
    setError(null);

    try {
      const { data, error } = await supabase
        .from('seo_pages')
        .select('*')
        .eq('noindex', false)
        .order('priority', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        showToast('No indexable pages found to include in sitemap', 'warning');
        return;
      }

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${data?.map(page => `  <url>
    <loc>${window.location.origin}${page.url}</loc>
    <lastmod>${page.last_modified}</lastmod>
    <changefreq>${page.change_frequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

      // Download sitemap
      const blob = new Blob([sitemap], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      a.click();
      URL.revokeObjectURL(url);

      showToast(`Sitemap generated successfully with ${data.length} pages!`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate sitemap';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    }
  };

  const generateRobotsTxt = () => {
    const robotsContent = `User-agent: *
Allow: /

${settings.robots_txt}

Sitemap: ${window.location.origin}/sitemap.xml`;

    const blob = new Blob([robotsContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'pages', name: 'Page SEO', icon: FileText },
    { id: 'settings', name: 'Settings', icon: Globe },
    { id: 'sitemap', name: 'Sitemap', icon: Search },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 }
  ];

  const filteredPages = useMemo(() =>
    pages.filter(page =>
      page.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.title.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [pages, searchTerm]
  );

  // Memoized analytics calculations for better performance
  const analyticsData = useMemo(() => ({
    totalPages: pages.length,
    indexablePages: pages.filter(p => !p.noindex).length,
    pagesWithOgImages: pages.filter(p => p.og_image).length,
    pagesWithKeywords: pages.filter(p => p.keywords.length > 0).length,
    metaTitlesPercentage: pages.length > 0 ? Math.round((pages.filter(p => p.title).length / pages.length) * 100) : 0,
    metaDescriptionsPercentage: pages.length > 0 ? Math.round((pages.filter(p => p.description).length / pages.length) * 100) : 0,
    ogTagsPercentage: pages.length > 0 ? Math.round((pages.filter(p => p.og_title || p.og_description).length / pages.length) * 100) : 0
  }), [pages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading SEO data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SEO Manager</h2>
          <p className="text-gray-600">Optimize your content for search engines</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" role="tablist" aria-label="SEO Management Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'pages' | 'settings' | 'sitemap' | 'analytics')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
            >
              <tab.icon className="w-5 h-5" aria-hidden="true" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Pages Tab */}
      {activeTab === 'pages' && (
        <div className="space-y-6" role="tabpanel" id="pages-panel" aria-labelledby="pages-tab">
          {/* Page Form */}
          {editingId && (
            <Card>
              <form onSubmit={handlePageSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="URL Path"
                    value={pageForm.url}
                    onChange={(value) => setPageForm(prev => ({ ...prev, url: value }))}
                    placeholder="/page-url"
                    required
                    type="text"
                  />

                  <FormField
                    label="Page Title"
                    value={pageForm.title}
                    onChange={(value) => setPageForm(prev => ({ ...prev, title: value }))}
                    placeholder="Enter page title"
                    required
                    type="text"
                  />
                </div>

                <FormField
                  label="Meta Description"
                  value={pageForm.description}
                  onChange={(value) => setPageForm(prev => ({ ...prev, description: value }))}
                  placeholder="Enter meta description"
                  type="textarea"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Keywords (comma-separated)"
                    value={pageForm.keywords}
                    onChange={(value) => setPageForm(prev => ({ ...prev, keywords: value }))}
                    placeholder="keyword1, keyword2, keyword3"
                    type="text"
                  />

                  <FormField
                    label="Priority (0.0 - 1.0)"
                    value={pageForm.priority}
                    onChange={(value) => setPageForm(prev => ({ ...prev, priority: parseFloat(String(value)) }))}
                    type="number"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Change Frequency"
                    value={pageForm.change_frequency}
                    onChange={(value) => setPageForm(prev => ({ ...prev, change_frequency: value as 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' }))}
                    type="select"
                    options={['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']}
                  />

                  <FormField
                    label="Canonical URL"
                    value={pageForm.canonical_url}
                    onChange={(value) => setPageForm(prev => ({ ...prev, canonical_url: value }))}
                    placeholder="https://example.com/canonical-url"
                    type="url"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Open Graph Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="OG Title"
                      value={pageForm.og_title}
                      onChange={(value) => setPageForm(prev => ({ ...prev, og_title: value }))}
                      placeholder="Open Graph title"
                      type="text"
                    />

                    <FormField
                      label="OG Image URL"
                      value={pageForm.og_image}
                      onChange={(value) => setPageForm(prev => ({ ...prev, og_image: value }))}
                      placeholder="https://example.com/image.jpg"
                      type="url"
                    />
                  </div>

                  <FormField
                    label="OG Description"
                    value={pageForm.og_description}
                    onChange={(value) => setPageForm(prev => ({ ...prev, og_description: value }))}
                    placeholder="Open Graph description"
                    type="textarea"
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pageForm.noindex}
                      onChange={(e) => setPageForm(prev => ({ ...prev, noindex: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm">No Index</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pageForm.nofollow}
                      onChange={(e) => setPageForm(prev => ({ ...prev, nofollow: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm">No Follow</span>
                  </label>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={saving} icon={saving ? undefined : undefined}>
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingId === 'new' ? 'Adding...' : 'Updating...'}
                      </>
                    ) : (
                      editingId === 'new' ? 'Add Page' : 'Update Page'
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetPageForm} disabled={saving}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Search and Add */}
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Search pages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Search SEO pages by URL or title"
                  />
                </div>
              </div>

              <Button onClick={() => setEditingId('new')} icon={Plus}>
                Add Page
              </Button>
            </div>
          </Card>

          {/* Pages List */}
          <div className="grid gap-4">
            {filteredPages.map((page) => (
              <Card key={page.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{page.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        page.noindex ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {page.noindex ? 'No Index' : 'Indexed'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">{page.url}</p>
                    <p className="text-sm text-gray-500 mt-1">{page.description}</p>

                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Priority: {page.priority}</span>
                      <span>Frequency: {page.change_frequency}</span>
                      <span>Keywords: {page.keywords.length}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editPage(page)}
                      icon={Edit2}
                      aria-label={`Edit SEO settings for ${page.title}`}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deletePage(page.id)}
                      icon={Trash2}
                      disabled={deleting === page.id}
                      aria-label={`Delete SEO settings for ${page.title}`}
                    >
                      {deleting === page.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-1"></div>
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div role="tabpanel" id="settings-panel" aria-labelledby="settings-tab">
          <Card>
          <form onSubmit={handleSettingsSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Site Name"
                value={settings.site_name}
                onChange={(value) => setSettings(prev => ({ ...prev, site_name: value }))}
                placeholder="Your Website Name"
                required
                type="text"
              />

              <FormField
                label="Default Page Title"
                value={settings.default_title}
                onChange={(value) => setSettings(prev => ({ ...prev, default_title: value }))}
                placeholder="Default page title template"
                type="text"
              />
            </div>

            <FormField
              label="Site Description"
              value={settings.site_description}
              onChange={(value) => setSettings(prev => ({ ...prev, site_description: value }))}
              placeholder="Brief description of your website"
              type="textarea"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Default Meta Description"
                value={settings.default_description}
                onChange={(value) => setSettings(prev => ({ ...prev, default_description: value }))}
                placeholder="Default meta description"
                type="textarea"
              />

              <FormField
                label="Default Keywords (comma-separated)"
                value={settings.default_keywords.join(', ')}
                onChange={(value) => setSettings(prev => ({
                  ...prev,
                  default_keywords: String(value).split(',').map((k: string) => k.trim()).filter(Boolean)
                }))}
                placeholder="default, keywords, here"
                type="text"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Default OG Image URL"
                value={settings.og_default_image}
                onChange={(value) => setSettings(prev => ({ ...prev, og_default_image: value }))}
                placeholder="https://example.com/default-og-image.jpg"
                type="url"
              />

              <FormField
                label="Twitter Handle"
                value={settings.twitter_handle || ''}
                onChange={(value) => setSettings(prev => ({ ...prev, twitter_handle: value }))}
                placeholder="@yourtwitterhandle"
                type="text"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Google Analytics ID"
                value={settings.google_analytics_id || ''}
                onChange={(value) => setSettings(prev => ({ ...prev, google_analytics_id: value }))}
                placeholder="GA-XXXXXXXXX"
                type="text"
              />

              <FormField
                label="Google Search Console"
                value={settings.google_search_console || ''}
                onChange={(value) => setSettings(prev => ({ ...prev, google_search_console: value }))}
                placeholder="https://search.google.com/search-console"
                type="url"
              />
            </div>

            <FormField
              label="Custom Robots.txt Rules"
              value={settings.robots_txt}
              onChange={(value) => setSettings(prev => ({ ...prev, robots_txt: value }))}
              placeholder="Additional robots.txt directives"
              type="textarea"
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="sitemap_enabled"
                checked={settings.sitemap_enabled}
                onChange={(e) => setSettings(prev => ({ ...prev, sitemap_enabled: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="sitemap_enabled" className="ml-2 text-sm">
                Enable XML Sitemap Generation
              </label>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                  Save Settings
                </>
              )}
            </Button>
          </form>
        </Card>
        </div>
      )}

      {/* Sitemap Tab */}
      {activeTab === 'sitemap' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">XML Sitemap Generator</h3>
                <p className="text-gray-600">Generate and download your XML sitemap</p>
              </div>
              <div className="flex space-x-3">
                <Button onClick={generateSitemap} icon={Search} variant="outline">
                  Generate Sitemap
                </Button>
                <Button onClick={generateRobotsTxt} icon={FileText} variant="outline">
                  Download robots.txt
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Sitemap Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-semibold">{pages.length}</div>
                  <div className="text-gray-600">Total Pages</div>
                </div>
                <div>
                  <div className="font-semibold">{pages.filter(p => !p.noindex).length}</div>
                  <div className="text-gray-600">Indexable</div>
                </div>
                <div>
                  <div className="font-semibold">{pages.filter(p => p.priority >= 0.8).length}</div>
                  <div className="text-gray-600">High Priority</div>
                </div>
                <div>
                  <div className="font-semibold">{pages.filter(p => p.change_frequency === 'daily' || p.change_frequency === 'weekly').length}</div>
                  <div className="text-gray-600">Frequently Updated</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" aria-hidden="true" />
              <div className="text-2xl font-bold text-gray-900" aria-label={`${analyticsData.totalPages} total pages`}>
                {analyticsData.totalPages}
              </div>
              <div className="text-sm text-gray-600">Total Pages</div>
            </Card>

            <Card className="text-center">
              <Target className="w-8 h-8 text-green-600 mx-auto mb-2" aria-hidden="true" />
              <div className="text-2xl font-bold text-gray-900" aria-label={`${analyticsData.indexablePages} SEO optimized pages`}>
                {analyticsData.indexablePages}
              </div>
              <div className="text-sm text-gray-600">SEO Optimized</div>
            </Card>

            <Card className="text-center">
              <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" aria-hidden="true" />
              <div className="text-2xl font-bold text-gray-900" aria-label={`${analyticsData.pagesWithOgImages} pages with Open Graph images`}>
                {analyticsData.pagesWithOgImages}
              </div>
              <div className="text-sm text-gray-600">With OG Images</div>
            </Card>

            <Card className="text-center">
              <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" aria-hidden="true" />
              <div className="text-2xl font-bold text-gray-900" aria-label={`${analyticsData.pagesWithKeywords} pages with keywords`}>
                {analyticsData.pagesWithKeywords}
              </div>
              <div className="text-sm text-gray-600">With Keywords</div>
            </Card>
          </div>

          <Card>
            <h3 className="text-lg font-semibold mb-4" id="seo-health-score">SEO Health Score</h3>
            <div className="space-y-4" role="region" aria-labelledby="seo-health-score">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span id="meta-titles-label">Meta Titles</span>
                  <span aria-labelledby="meta-titles-label">{analyticsData.metaTitlesPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={analyticsData.metaTitlesPercentage}>
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analyticsData.metaTitlesPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span id="meta-descriptions-label">Meta Descriptions</span>
                  <span aria-labelledby="meta-descriptions-label">{analyticsData.metaDescriptionsPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={analyticsData.metaDescriptionsPercentage}>
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analyticsData.metaDescriptionsPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span id="og-tags-label">Open Graph Tags</span>
                  <span aria-labelledby="og-tags-label">{analyticsData.ogTagsPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={analyticsData.ogTagsPercentage}>
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analyticsData.ogTagsPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SeoManager;