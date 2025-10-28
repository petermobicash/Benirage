/**
 * Page Section Editor Component
 * Allows editors to select pages and edit specific sections they have permission to edit
 */

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Edit, Save, X, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { usePermission } from '../../hooks/usePermissions';
import { CONTENT_PERMISSIONS } from '../../types/permissions';

interface PageSection {
  id: string;
  page_id: string;
  section_name: string;
  section_slug: string;
  section_type: string;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
  css_classes?: string;
  is_active: boolean;
  order_index: number;
  created_by?: string;
  updated_by?: string;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  status: string;
  sections?: PageSection[];
}

interface PageSectionEditorProps {
  currentUser?: { id: string; [key: string]: unknown };
  onSave?: () => void;
}

const PageSectionEditor: React.FC<PageSectionEditorProps> = ({ currentUser, onSave }) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<PageSection | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [sectionFormData, setSectionFormData] = useState<Partial<PageSection>>({});

  // Check permissions
  const { hasPermission: canEditContent } = usePermission(CONTENT_PERMISSIONS.CONTENT_EDIT_ALL);
  const { hasPermission: canEditOwn } = usePermission(CONTENT_PERMISSIONS.CONTENT_EDIT_OWN);

  const loadPages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('status', 'published')
        .order('title');

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPageSections = useCallback(async (pageId: string) => {
    try {
      const { error } = await supabase.rpc('create_default_page_sections', {
        page_id: pageId,
        created_by: currentUser?.id
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating default page sections:', error);
    }
  }, [currentUser]);

  const loadPageSections = useCallback(async (pageId: string) => {
    try {
      const { data, error } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', pageId)
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;

      if (data && data.length === 0) {
        // Create default sections if none exist
        await createDefaultPageSections(pageId);
        // Reload sections
        const { data: newData, error: newError } = await supabase
          .from('page_sections')
          .select('*')
          .eq('page_id', pageId)
          .eq('is_active', true)
          .order('order_index');

        if (newError) throw newError;
        setSections(newData || []);
      } else {
        setSections(data || []);
      }
    } catch (error) {
      console.error('Error loading page sections:', error);
    }
  }, [createDefaultPageSections]);

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      loadPageSections(selectedPage.id);
    }
  }, [selectedPage, loadPageSections]);


  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const selectSection = (section: PageSection) => {
    setSelectedSection(section);
    setSectionFormData({
      section_name: section.section_name,
      content: section.content,
      settings: section.settings,
      css_classes: section.css_classes || ''
    });
  };

  const handleSectionInputChange = (field: string, value: unknown) => {
    setSectionFormData((prev: Partial<PageSection>) => ({
      ...prev,
      [field]: value
    }));
  };

  const saveSection = async () => {
    if (!selectedSection) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('page_sections')
        .update({
          section_name: sectionFormData.section_name,
          content: sectionFormData.content,
          settings: sectionFormData.settings,
          css_classes: sectionFormData.css_classes,
          updated_by: currentUser?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSection.id);

      if (error) throw error;

      // Update local state
      setSections(prev => prev.map(s =>
        s.id === selectedSection.id
          ? { ...s, ...sectionFormData, updated_by: currentUser?.id }
          : s
      ));

      alert('Section saved successfully!');
      onSave?.();
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Error saving section');
    } finally {
      setSaving(false);
    }
  };

  const canEditSection = () => {
    // Check if user has general edit permissions
    return canEditContent || canEditOwn;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading pages...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Page Section Editor</h2>
        <p className="text-gray-600">Select a page and edit specific sections you have permission to modify</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Selection */}
        <Card>
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Select Page</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {pages.map((page) => (
              <div
                key={page.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedPage?.id === page.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPage(page)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{page.title}</h4>
                    <p className="text-sm text-gray-500">/{page.slug}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    page.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {page.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Section Editor */}
        <Card>
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            {selectedPage ? `Edit Sections - ${selectedPage.title}` : 'Select a page to edit sections'}
          </h3>

          {selectedPage && (
            <div className="space-y-4">
              {/* Section List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sections.map((section) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg">
                    <div
                      className="p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {expandedSections.has(section.id) ?
                            <ChevronDown className="w-4 h-4" /> :
                            <ChevronRight className="w-4 h-4" />
                          }
                          <span className="font-medium">{section.section_name}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {section.section_type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {canEditSection() && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => selectSection(section)}
                              icon={Edit}
                            >
                              Edit
                            </Button>
                          )}
                          <div className="w-8 h-8 flex items-center justify-center">
                            {expandedSections.has(section.id) ?
                              <ChevronDown className="w-4 h-4" /> :
                              <ChevronRight className="w-4 h-4" />
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Section Content */}
                    {expandedSections.has(section.id) && (
                      <div className="px-3 pb-3 border-t border-gray-100">
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                          <p><strong>Type:</strong> {section.section_type}</p>
                          <p><strong>Order:</strong> {section.order_index}</p>
                          <p><strong>Status:</strong> {section.is_active ? 'Active' : 'Inactive'}</p>
                          {section.css_classes && (
                            <p><strong>CSS Classes:</strong> {section.css_classes}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Section Form */}
              {selectedSection && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-blue-900 mb-3">
                    Editing: {selectedSection.section_name}
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        Section Name
                      </label>
                      <input
                        type="text"
                        value={sectionFormData.section_name || ''}
                        onChange={(e) => handleSectionInputChange('section_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        CSS Classes
                      </label>
                      <input
                        type="text"
                        value={sectionFormData.css_classes || ''}
                        onChange={(e) => handleSectionInputChange('css_classes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., mb-4 text-center"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        Content (JSON)
                      </label>
                      <textarea
                        value={JSON.stringify(sectionFormData.content || {}, null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            handleSectionInputChange('content', parsed);
                          } catch (error) {
                            console.warn('Invalid JSON in content field:', error);
                          }
                        }}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder='{"title": "Section Title", "body": "Content here..."}'
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        Settings (JSON)
                      </label>
                      <textarea
                        value={JSON.stringify(sectionFormData.settings || {}, null, 2)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            handleSectionInputChange('settings', parsed);
                          } catch (error) {
                            console.warn('Invalid JSON in settings field:', error);
                          }
                        }}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder='{"backgroundColor": "#ffffff", "padding": "20px"}'
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={saveSection}
                        disabled={saving}
                        icon={Save}
                      >
                        {saving ? 'Saving...' : 'Save Section'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedSection(null)}
                        icon={X}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Permission Info */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Editing Permissions</h4>
            <p className="text-sm text-blue-700">
              You can only edit sections of pages where you have been granted specific permissions.
              Contact your administrator if you need access to additional sections.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PageSectionEditor;