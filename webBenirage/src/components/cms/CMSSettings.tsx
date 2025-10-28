import { useState, useEffect, useCallback, useMemo } from 'react';
import { Save, Settings, Globe, Mail, Shield, Database, Palette } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { useToast } from '../../hooks/useToast';

interface Setting {
  key: string;
  value: string;
  updated_at: string;
  updated_by?: string;
}

const CMSSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const { showToast } = useToast();

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'site', label: 'Site Info', icon: Globe },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  const defaultSettings = useMemo(() => ({
    // General
    site_name: 'BENIRAGE',
    site_tagline: 'Grounded • Home • Guided • Rooted',
    site_description: 'A spiritual and cultural movement fostering community, wisdom, and personal growth.',
    admin_email: 'admin@benirage.org',
    timezone: 'UTC',
    date_format: 'Y-m-d',
    time_format: 'H:i:s',

    // Site Info
    site_url: 'https://benirage.org',
    contact_email: 'contact@benirage.org',
    contact_phone: '+1 (555) 123-4567',
    contact_address: '123 Spiritual Way, Wisdom City, WC 12345',
    social_facebook: 'https://facebook.com/benirage',
    social_twitter: 'https://twitter.com/benirage',
    social_instagram: 'https://instagram.com/benirage',
    social_youtube: 'https://youtube.com/benirage',

    // Email
    smtp_host: 'smtp.gmail.com',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    from_email: 'noreply@benirage.org',
    from_name: 'BENIRAGE',

    // Security
    enable_registration: 'true',
    require_email_verification: 'true',
    password_min_length: '8',
    session_timeout: '3600',
    max_login_attempts: '5',
    enable_two_factor: 'false',

    // Database
    backup_frequency: 'daily',
    backup_retention: '30',
    enable_query_logging: 'false',
    maintenance_mode: 'false',

    // Appearance
    primary_color: '#2563eb',
    secondary_color: '#059669',
    accent_color: '#dc2626',
    font_family: 'Inter',
    logo_url: '/benirage.png',
    favicon_url: '/favicon.ico'
  }), []);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((setting: Setting) => {
        settingsMap[setting.key] = setting.value;
      });

      // Merge with defaults
      setSettings({ ...defaultSettings, ...settingsMap });
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast('Failed to load settings', 'error');
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, [showToast, defaultSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Convert settings object to array of upsert operations
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_by: 'Current User' // Replace with actual user
      }));

      const { error } = await supabase
        .from('settings')
        .upsert(settingsArray, { onConflict: 'key' });

      if (error) throw error;
      
      showToast('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key: string, value: string | number | boolean) => {
    const stringValue = typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value);
    setSettings(prev => ({ ...prev, [key]: stringValue }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-4">
      <FormField
        label="Site Name"
        type="text"
        value={settings.site_name || ''}
        onChange={(value) => handleInputChange('site_name', value)}
      />
      
      <FormField
        label="Site Tagline"
        type="text"
        value={settings.site_tagline || ''}
        onChange={(value) => handleInputChange('site_tagline', value)}
      />
      
      <FormField
        label="Site Description"
        type="textarea"
        value={settings.site_description || ''}
        onChange={(value) => handleInputChange('site_description', value)}
        rows={3}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Admin Email"
          type="email"
          value={settings.admin_email || ''}
          onChange={(value) => handleInputChange('admin_email', value)}
        />
        
        <FormField
          label="Timezone"
          type="select"
          value={settings.timezone || ''}
          onChange={(value) => handleInputChange('timezone', value)}
          options={[
            { value: 'UTC', label: 'UTC' },
            { value: 'America/New_York', label: 'Eastern Time' },
            { value: 'America/Chicago', label: 'Central Time' },
            { value: 'America/Denver', label: 'Mountain Time' },
            { value: 'America/Los_Angeles', label: 'Pacific Time' }
          ]}
        />
        
        <FormField
          label="Date Format"
          type="select"
          value={settings.date_format || ''}
          onChange={(value) => handleInputChange('date_format', value)}
          options={[
            { value: 'Y-m-d', label: '2024-01-15' },
            { value: 'm/d/Y', label: '01/15/2024' },
            { value: 'd/m/Y', label: '15/01/2024' },
            { value: 'F j, Y', label: 'January 15, 2024' }
          ]}
        />
        
        <FormField
          label="Time Format"
          type="select"
          value={settings.time_format || ''}
          onChange={(value) => handleInputChange('time_format', value)}
          options={[
            { value: 'H:i:s', label: '24-hour (14:30:00)' },
            { value: 'g:i A', label: '12-hour (2:30 PM)' }
          ]}
        />
      </div>
    </div>
  );

  const renderSiteSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Site URL"
          type="url"
          value={settings.site_url || ''}
          onChange={(value) => handleInputChange('site_url', value)}
        />
        
        <FormField
          label="Contact Email"
          type="email"
          value={settings.contact_email || ''}
          onChange={(value) => handleInputChange('contact_email', value)}
        />
        
        <FormField
          label="Contact Phone"
          type="tel"
          value={settings.contact_phone || ''}
          onChange={(value) => handleInputChange('contact_phone', value)}
        />
      </div>
      
      <FormField
        label="Contact Address"
        type="textarea"
        value={settings.contact_address || ''}
        onChange={(value) => handleInputChange('contact_address', value)}
        rows={2}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Facebook URL"
          type="url"
          value={settings.social_facebook || ''}
          onChange={(value) => handleInputChange('social_facebook', value)}
        />
        
        <FormField
          label="Twitter URL"
          type="url"
          value={settings.social_twitter || ''}
          onChange={(value) => handleInputChange('social_twitter', value)}
        />
        
        <FormField
          label="Instagram URL"
          type="url"
          value={settings.social_instagram || ''}
          onChange={(value) => handleInputChange('social_instagram', value)}
        />
        
        <FormField
          label="YouTube URL"
          type="url"
          value={settings.social_youtube || ''}
          onChange={(value) => handleInputChange('social_youtube', value)}
        />
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="SMTP Host"
          type="text"
          value={settings.smtp_host || ''}
          onChange={(value) => handleInputChange('smtp_host', value)}
        />
        
        <FormField
          label="SMTP Port"
          type="number"
          value={settings.smtp_port || ''}
          onChange={(value) => handleInputChange('smtp_port', value)}
        />
        
        <FormField
          label="SMTP Username"
          type="text"
          value={settings.smtp_username || ''}
          onChange={(value) => handleInputChange('smtp_username', value)}
        />
        
        <FormField
          label="SMTP Password"
          type="password"
          value={settings.smtp_password || ''}
          onChange={(value) => handleInputChange('smtp_password', value)}
        />
        
        <FormField
          label="Encryption"
          type="select"
          value={settings.smtp_encryption || ''}
          onChange={(value) => handleInputChange('smtp_encryption', value)}
          options={[
            { value: 'none', label: 'None' },
            { value: 'tls', label: 'TLS' },
            { value: 'ssl', label: 'SSL' }
          ]}
        />
        
        <FormField
          label="From Email"
          type="email"
          value={settings.from_email || ''}
          onChange={(value) => handleInputChange('from_email', value)}
        />
        
        <FormField
          label="From Name"
          type="text"
          value={settings.from_name || ''}
          onChange={(value) => handleInputChange('from_name', value)}
        />
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enable_registration"
            checked={settings.enable_registration === 'true'}
            onChange={(e) => handleInputChange('enable_registration', e.target.checked ? 'true' : 'false')}
            className="rounded"
          />
          <label htmlFor="enable_registration" className="text-sm font-medium text-gray-700">
            Enable User Registration
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="require_email_verification"
            checked={settings.require_email_verification === 'true'}
            onChange={(e) => handleInputChange('require_email_verification', e.target.checked ? 'true' : 'false')}
            className="rounded"
          />
          <label htmlFor="require_email_verification" className="text-sm font-medium text-gray-700">
            Require Email Verification
          </label>
        </div>
        
        <FormField
          label="Minimum Password Length"
          type="number"
          value={settings.password_min_length || ''}
          onChange={(value) => handleInputChange('password_min_length', value)}
          min="6"
          max="50"
        />
        
        <FormField
          label="Session Timeout (seconds)"
          type="number"
          value={settings.session_timeout || ''}
          onChange={(value) => handleInputChange('session_timeout', value)}
        />
        
        <FormField
          label="Max Login Attempts"
          type="number"
          value={settings.max_login_attempts || ''}
          onChange={(value) => handleInputChange('max_login_attempts', value)}
          min="1"
          max="10"
        />
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enable_two_factor"
            checked={settings.enable_two_factor === 'true'}
            onChange={(e) => handleInputChange('enable_two_factor', e.target.checked ? 'true' : 'false')}
            className="rounded"
          />
          <label htmlFor="enable_two_factor" className="text-sm font-medium text-gray-700">
            Enable Two-Factor Authentication
          </label>
        </div>
      </div>
    </div>
  );

  const renderDatabaseSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Backup Frequency"
          type="select"
          value={settings.backup_frequency || ''}
          onChange={(value) => handleInputChange('backup_frequency', value)}
          options={[
            { value: 'hourly', label: 'Hourly' },
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' }
          ]}
        />
        
        <FormField
          label="Backup Retention (days)"
          type="number"
          value={settings.backup_retention || ''}
          onChange={(value) => handleInputChange('backup_retention', value)}
          min="1"
          max="365"
        />
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enable_query_logging"
            checked={settings.enable_query_logging === 'true'}
            onChange={(e) => handleInputChange('enable_query_logging', e.target.checked ? 'true' : 'false')}
            className="rounded"
          />
          <label htmlFor="enable_query_logging" className="text-sm font-medium text-gray-700">
            Enable Query Logging
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="maintenance_mode"
            checked={settings.maintenance_mode === 'true'}
            onChange={(e) => handleInputChange('maintenance_mode', e.target.checked ? 'true' : 'false')}
            className="rounded"
          />
          <label htmlFor="maintenance_mode" className="text-sm font-medium text-gray-700">
            Maintenance Mode
          </label>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Primary Color"
          type="color"
          value={settings.primary_color || ''}
          onChange={(value) => handleInputChange('primary_color', value)}
        />
        
        <FormField
          label="Secondary Color"
          type="color"
          value={settings.secondary_color || ''}
          onChange={(value) => handleInputChange('secondary_color', value)}
        />
        
        <FormField
          label="Accent Color"
          type="color"
          value={settings.accent_color || ''}
          onChange={(value) => handleInputChange('accent_color', value)}
        />
        
        <FormField
          label="Font Family"
          type="select"
          value={settings.font_family || ''}
          onChange={(value) => handleInputChange('font_family', value)}
          options={[
            { value: 'Inter', label: 'Inter' },
            { value: 'Roboto', label: 'Roboto' },
            { value: 'Open Sans', label: 'Open Sans' },
            { value: 'Lato', label: 'Lato' },
            { value: 'Montserrat', label: 'Montserrat' }
          ]}
        />
        
        <FormField
          label="Logo URL"
          type="url"
          value={settings.logo_url || ''}
          onChange={(value) => handleInputChange('logo_url', value)}
        />
        
        <FormField
          label="Favicon URL"
          type="url"
          value={settings.favicon_url || ''}
          onChange={(value) => handleInputChange('favicon_url', value)}
        />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'site':
        return renderSiteSettings();
      case 'email':
        return renderEmailSettings();
      case 'security':
        return renderSecuritySettings();
      case 'database':
        return renderDatabaseSettings();
      case 'appearance':
        return renderAppearanceSettings();
      default:
        return renderGeneralSettings();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">CMS Settings</h1>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default CMSSettings;