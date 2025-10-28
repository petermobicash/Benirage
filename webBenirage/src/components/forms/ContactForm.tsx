import React, { useState } from 'react';
import { submitContactForm } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';
import FormField from '../ui/FormField';
import Card from '../ui/Card';
import Button from '../ui/Button';

const ContactForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    organization: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
      alert(t('forms.required'));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitContactForm({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        organization: formData.organization,
        subject: formData.subject,
        message: formData.message,
        status: 'new'
      });
      
      if (result.success) {
        alert(t('forms.success'));
        
        // Reset form
        setFormData({
          firstName: '', lastName: '', email: '', phone: '', subject: '', message: '', organization: ''
        });
      } else {
        throw new Error('Submission failed');
      }
      
    } catch (error) {
      console.error('Contact form error:', error);
      alert(t('forms.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card variant="premium">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label={t('forms.firstName')}
            type="text"
            value={formData.firstName || ''}
            onChange={(value) => handleInputChange('firstName', value)}
            placeholder={t('forms.firstName')}
            required
          />
          <FormField
            label={t('forms.lastName')}
            type="text"
            value={formData.lastName || ''}
            onChange={(value) => handleInputChange('lastName', value)}
            placeholder={t('forms.lastName')}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label={t('forms.email')}
            type="email"
            value={formData.email || ''}
            onChange={(value) => handleInputChange('email', value)}
            placeholder="your.email@example.com"
            required
          />
          <FormField
            label={t('forms.phone')}
            type="tel"
            value={formData.phone || ''}
            onChange={(value) => handleInputChange('phone', value)}
            placeholder="+250 ... or your country code"
          />
        </div>

        <FormField
          label={t('forms.organization')}
          type="text"
          value={formData.organization || ''}
          onChange={(value) => handleInputChange('organization', value)}
          placeholder={t('forms.organization')}
        />

        <FormField
          label={t('forms.subject')}
          type="select"
          value={formData.subject || ''}
          onChange={(value) => handleInputChange('subject', value)}
          options={[
            'General Inquiry',
            'Membership Information',
            'Volunteer Opportunities',
            'Partnership Proposal',
            'Donation & Support',
            'Programs & Events',
            'Media & Press',
            'Technical Support',
            'Feedback & Suggestions',
            'Other'
          ]}
          placeholder={`${t('common.select')} ${t('forms.subject').toLowerCase()}`}
          required
        />

        <FormField
          label={t('forms.message')}
          type="textarea"
          value={formData.message || ''}
          onChange={(value) => handleInputChange('message', value)}
          placeholder={t('forms.message')}
          required
          rows={6}
        />

        <div className="text-center">
          <Button 
            type="submit" 
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>{t('forms.submitting')}</span>
              </div>
            ) : (
              t('forms.submit')
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ContactForm;