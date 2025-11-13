import React, { useState } from 'react';
import {
  Plus, ArrowRight, ArrowLeft, Upload, Target, Palette,
  Check, DollarSign, Settings, Save, Play, Type, X
} from 'lucide-react';
import { Ad, CreateAdForm } from '../../types/ads';
import { useAds } from '../../hooks/useAds';

interface AdCreationWizardProps {
  onComplete?: (ad: Ad) => void;
  onCancel?: () => void;
  editAd?: Ad;
  className?: string;
}

const AdCreationWizard: React.FC<AdCreationWizardProps> = ({
  onComplete,
  onCancel,
  editAd,
  className = ''
}) => {
  const { createAd } = useAds();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CreateAdForm & { template?: string; content?: string }>>({
    name: editAd?.name || '',
    title: editAd?.title || '',
    description: editAd?.description || '',
    ad_type: editAd?.ad_type || 'banner',
    content_url: editAd?.content_url || '',
    target_url: editAd?.target_url || '',
    alt_text: editAd?.alt_text || '',
    dimensions: editAd?.dimensions || '',
    priority: editAd?.priority || 1,
    weight: editAd?.weight || 1,
    start_date: editAd?.start_date || '',
    end_date: editAd?.end_date || '',
    max_impressions: editAd?.max_impressions || undefined,
    max_clicks: editAd?.max_clicks || undefined,
    budget: editAd?.budget || 0,
    cpm: editAd?.cpm || undefined,
    cpc: editAd?.cpc || undefined,
    targeting_criteria: editAd?.targeting_criteria || {},
    tags: editAd?.tags || [],
    notes: editAd?.notes || '',
    template: '',
    content: '',
  });

  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [abTestConfig, setAbTestConfig] = useState({
    enabled: false,
    variants: [
      { id: 'variant_a', name: 'Variant A', description: '', ad_data: {} },
      { id: 'variant_b', name: 'Variant B', description: '', ad_data: {} }
    ],
    traffic_split: { variant_a: 50, variant_b: 50 },
    test_duration: 7, // days
    success_metric: 'ctr'
  });

  const adTypes: Array<{
    id: 'banner' | 'video' | 'native' | 'popup' | 'text' | 'rich_media';
    name: string;
    icon: React.ComponentType<any>;
    description: string;
  }> = [
    { id: 'banner', name: 'Banner', icon: Target, description: 'Static image banner' },
    { id: 'video', name: 'Video', icon: Play, description: 'Video advertisement' },
    { id: 'native', name: 'Native', icon: Palette, description: 'Native content ad' },
    { id: 'popup', name: 'Popup', icon: Settings, description: 'Popup advertisement' },
    { id: 'text', name: 'Text', icon: Type, description: 'Text-based ad' },
  ];

  const templates = [
    {
      id: 'modern_hero',
      name: 'Modern Hero',
      preview: 'gradient-bg',
      description: 'Modern gradient background with overlay text'
    },
    {
      id: 'minimalist_card',
      name: 'Minimalist Card',
      preview: 'white-card',
      description: 'Clean white card with subtle shadow'
    },
    {
      id: 'video_responsive',
      name: 'Video Responsive',
      preview: 'video-bg',
      description: 'Video background with responsive design'
    },
    {
      id: 'social_style',
      name: 'Social Style',
      preview: 'social-card',
      description: 'Social media style card layout'
    },
    {
      id: 'full_width_banner',
      name: 'Full Width Banner',
      preview: 'banner',
      description: 'Full width horizontal banner'
    },
    {
      id: 'minimalist_text',
      name: 'Minimalist Text',
      preview: 'text-card',
      description: 'Text-only minimal design'
    }
  ];

  const steps = [
    { id: 1, name: 'Basic Info', icon: Plus },
    { id: 2, name: 'Content', icon: Upload },
    { id: 3, name: 'Targeting', icon: Target },
    { id: 4, name: 'Budget', icon: DollarSign },
    { id: 5, name: 'Review', icon: Check },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!formData.name?.trim()) newErrors.name = 'Ad name is required';
        if (!formData.title?.trim()) newErrors.title = 'Title is required';
        if (!formData.ad_type) newErrors.ad_type = 'Ad type is required';
        break;
      case 2:
        if (!formData.content_url && formData.ad_type !== 'text') {
          newErrors.content_url = 'Content is required for this ad type';
        }
        if (!formData.target_url?.trim()) newErrors.target_url = 'Target URL is required';
        // Validate URL format
        if (formData.target_url && !isValidUrl(formData.target_url)) {
          newErrors.target_url = 'Please enter a valid URL';
        }
        break;
      case 3:
        if (!formData.start_date) newErrors.start_date = 'Start date is required';
        if (formData.end_date && formData.start_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
          newErrors.end_date = 'End date must be after start date';
        }
        break;
      case 4:
        if (!formData.budget || formData.budget <= 0) newErrors.budget = 'Budget must be greater than 0';
        // Validate CPM/CPC if set
        if (formData.cpm && formData.cpm <= 0) newErrors.cpm = 'CPM must be greater than 0';
        if (formData.cpc && formData.cpc <= 0) newErrors.cpc = 'CPC must be greater than 0';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsCreating(true);
    try {
      // Create main ad
      const adData: CreateAdForm = formData as CreateAdForm;
      const newAd = await createAd(adData);
      
      // Create A/B test variants if enabled
      if (abTestConfig.enabled) {
        // Implementation for A/B test creation would go here
        console.info('Creating A/B test variants...', abTestConfig);
      }
      
      onComplete?.(newAd);
    } catch (error) {
      console.error('Error creating ad:', error);
      setErrors({ general: 'Failed to create ad. Please try again.' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      // Reset form or navigate away if no onCancel provided
      setCurrentStep(1);
      setFormData({
        name: editAd?.name || '',
        title: editAd?.title || '',
        description: editAd?.description || '',
        ad_type: editAd?.ad_type || 'banner',
        content_url: editAd?.content_url || '',
        target_url: editAd?.target_url || '',
        alt_text: editAd?.alt_text || '',
        dimensions: editAd?.dimensions || '',
        priority: editAd?.priority || 1,
        weight: editAd?.weight || 1,
        start_date: editAd?.start_date || '',
        end_date: editAd?.end_date || '',
        max_impressions: editAd?.max_impressions || undefined,
        max_clicks: editAd?.max_clicks || undefined,
        budget: editAd?.budget || 0,
        cpm: editAd?.cpm || undefined,
        cpc: editAd?.cpc || undefined,
        targeting_criteria: editAd?.targeting_criteria || {},
        tags: editAd?.tags || [],
        notes: editAd?.notes || '',
        template: '',
        content: '',
      });
      setErrors({});
      setAbTestConfig({
        enabled: false,
        variants: [
          { id: 'variant_a', name: 'Variant A', description: '', ad_data: {} },
          { id: 'variant_b', name: 'Variant B', description: '', ad_data: {} }
        ],
        traffic_split: { variant_a: 50, variant_b: 50 },
        test_duration: 7,
        success_metric: 'ctr'
      });
    }
  };

  const handleTrafficSplitChange = (variant: 'variant_a' | 'variant_b', value: number) => {
    // Ensure the value is between 0 and 100
    const clampedValue = Math.max(0, Math.min(100, value));
    const otherValue = 100 - clampedValue;
    
    setAbTestConfig(prev => ({
      ...prev,
      traffic_split: {
        variant_a: variant === 'variant_a' ? clampedValue : otherValue,
        variant_b: variant === 'variant_b' ? clampedValue : otherValue
      }
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
              <p className="text-gray-600">Let's start with the basics of your advertisement</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a descriptive name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ad headline"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your advertisement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Ad Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {adTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setFormData({ ...formData, ad_type: type.id })}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.ad_type === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-6 h-6 mb-2" />
                      <h3 className="font-medium">{type.name}</h3>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </button>
                  );
                })}
              </div>
              {errors.ad_type && <p className="text-red-500 text-sm mt-1">{errors.ad_type}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Content & Media</h2>
              <p className="text-gray-600">Upload your creative content and set target URL</p>
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Choose a Template
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="relative group cursor-pointer"
                    onClick={() => setFormData({ ...formData, template: template.id })}
                  >
                    <div className="border-2 border-gray-200 rounded-lg p-4 h-24 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                      <div className={`w-12 h-12 rounded ${getTemplatePreviewStyle(template.preview)}`}></div>
                    </div>
                    <p className="text-sm font-medium mt-2 text-center">{template.name}</p>
                    <p className="text-xs text-gray-500 text-center">{template.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.ad_type === 'text' ? 'Text Content' : 'Media Upload'}
                </label>
                {formData.ad_type === 'text' ? (
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your text content"
                  />
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Drag and drop your file here, or click to browse</p>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept={formData.ad_type === 'video' ? 'video/*' : 'image/*'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Handle file upload
                          const url = URL.createObjectURL(file);
                          setFormData({ ...formData, content_url: url });
                        }
                      }}
                    />
                  </div>
                )}
                {errors.content_url && <p className="text-red-500 text-sm mt-1">{errors.content_url}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target URL *
                </label>
                <input
                  type="url"
                  value={formData.target_url}
                  onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
                {errors.target_url && <p className="text-red-500 text-sm mt-1">{errors.target_url}</p>}

                <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={formData.alt_text}
                  onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description for accessibility"
                />
              </div>
            </div>

            {formData.ad_type !== 'text' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 728x90"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>Low</option>
                    <option value={2}>Medium</option>
                    <option value={3}>High</option>
                    <option value={4}>Urgent</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Targeting & Schedule</h2>
              <p className="text-gray-600">Define who should see your ad and when</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Impressions
                </label>
                <input
                  type="number"
                  value={formData.max_impressions || ''}
                  onChange={(e) => setFormData({ ...formData, max_impressions: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Clicks
                </label>
                <input
                  type="number"
                  value={formData.max_clicks || ''}
                  onChange={(e) => setFormData({ ...formData, max_clicks: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            {/* A/B Test Configuration */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">A/B Testing</h3>
                  <p className="text-sm text-gray-500">Create variants to test performance</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={abTestConfig.enabled}
                    onChange={(e) => setAbTestConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {abTestConfig.enabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {abTestConfig.variants.map((variant) => (
                      <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{variant.name}</h4>
                        <input
                          type="text"
                          value={variant.description}
                          onChange={(e) => {
                            const newVariants = abTestConfig.variants.map(v =>
                              v.id === variant.id ? { ...v, description: e.target.value } : v
                            );
                            setAbTestConfig(prev => ({ ...prev, variants: newVariants }));
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          placeholder="Describe this variant"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Traffic Split
                    </label>
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <input
                            type="number"
                            value={abTestConfig.traffic_split.variant_a}
                            onChange={(e) => handleTrafficSplitChange('variant_a', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                            min="0"
                            max="100"
                          />
                          <p className="text-xs text-gray-500 mt-1">Variant A (%)</p>
                        </div>
                        <div className="text-gray-400">vs</div>
                        <div className="flex-1">
                          <input
                            type="number"
                            value={abTestConfig.traffic_split.variant_b}
                            onChange={(e) => handleTrafficSplitChange('variant_b', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                            min="0"
                            max="100"
                          />
                          <p className="text-xs text-gray-500 mt-1">Variant B (%)</p>
                        </div>
                      </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Budget & Pricing</h2>
              <p className="text-gray-600">Set your budget and payment preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Budget *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Model
                </label>
                <select
                  value={formData.cpm ? 'cpm' : formData.cpc ? 'cpc' : 'fixed'}
                  onChange={(e) => {
                    const model = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      cpm: model === 'cpm' ? (prev.cpm || 0) : undefined,
                      cpc: model === 'cpc' ? (prev.cpc || 0) : undefined
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="cpm">Cost per 1,000 impressions</option>
                  <option value="cpc">Cost per Click</option>
                </select>
              </div>
            </div>

            {(formData.cpm || formData.cpc) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.cpm && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CPM Rate
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        value={formData.cpm}
                        onChange={(e) => setFormData({ ...formData, cpm: parseFloat(e.target.value) })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {errors.cpm && <p className="text-red-500 text-sm mt-1">{errors.cpm}</p>}
                  </div>
                )}

                {formData.cpc && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CPC Rate
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        value={formData.cpc}
                        onChange={(e) => setFormData({ ...formData, cpc: parseFloat(e.target.value) })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {errors.cpc && <p className="text-red-500 text-sm mt-1">{errors.cpc}</p>}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional information or requirements"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Launch</h2>
              <p className="text-gray-600">Review your ad configuration before publishing</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Name:</span> {formData.name}</p>
                    <p><span className="text-gray-500">Title:</span> {formData.title}</p>
                    <p><span className="text-gray-500">Type:</span> {formData.ad_type}</p>
                    <p><span className="text-gray-500">Description:</span> {formData.description || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Content</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Target URL:</span> {formData.target_url}</p>
                    <p><span className="text-gray-500">Dimensions:</span> {formData.dimensions || 'N/A'}</p>
                    <p><span className="text-gray-500">Alt Text:</span> {formData.alt_text || 'N/A'}</p>
                    {formData.content_url && (
                      <p><span className="text-gray-500">Media:</span> <a href={formData.content_url} target="_blank" rel="noopener noreferrer" className="text-blue-600">View Uploaded File</a></p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Schedule</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Start Date:</span> {formData.start_date}</p>
                    <p><span className="text-gray-500">End Date:</span> {formData.end_date || 'No end date'}</p>
                    <p><span className="text-gray-500">Max Impressions:</span> {formData.max_impressions || 'Unlimited'}</p>
                    <p><span className="text-gray-500">Max Clicks:</span> {formData.max_clicks || 'Unlimited'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Budget</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Total Budget:</span> ${formData.budget?.toFixed(2)}</p>
                    <p><span className="text-gray-500">CPM:</span> {formData.cpm ? `$${formData.cpm.toFixed(2)}` : 'N/A'}</p>
                    <p><span className="text-gray-500">CPC:</span> {formData.cpc ? `$${formData.cpc.toFixed(2)}` : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {abTestConfig.enabled && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">A/B Testing</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Enabled:</span> Yes</p>
                    <p><span className="text-gray-500">Traffic Split:</span> {abTestConfig.traffic_split.variant_a}% A / {abTestConfig.traffic_split.variant_b}% B</p>
                  </div>
                </div>
              )}

              {formData.notes && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600">{formData.notes}</p>
                </div>
              )}
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{errors.general}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getTemplatePreviewStyle = (preview: string) => {
    switch (preview) {
      case 'gradient-bg':
        return 'bg-gradient-to-r from-blue-500 to-purple-600';
      case 'white-card':
        return 'bg-white border border-gray-200';
      case 'video-bg':
        return 'bg-gray-800';
      case 'social-card':
        return 'bg-white border-l-4 border-blue-500';
      case 'banner':
        return 'bg-gradient-to-r from-gray-100 to-gray-200';
      case 'text-card':
        return 'bg-gray-50 border border-gray-200';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isActive 
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <div className="flex space-x-3">
            {onCancel && (
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                currentStep === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isCreating}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Create Ad</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdCreationWizard;