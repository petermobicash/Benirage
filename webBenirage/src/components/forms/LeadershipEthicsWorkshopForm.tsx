import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import FormField from '../ui/FormField';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useToast } from '../../hooks/useToast';

interface WorkshopFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: string;
  educationLevel: string;
  currentRole: string;
  organization: string;
  leadershipExperience: string;
  whyAttend: string;
  expectations: string;
  timeCommitment: string;
  questions: string;
  dataConsent: boolean;
  termsAccepted: boolean;
}

const LeadershipEthicsWorkshopForm = () => {
  const [formData, setFormData] = useState<WorkshopFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    educationLevel: '',
    currentRole: '',
    organization: '',
    leadershipExperience: '',
    whyAttend: '',
    expectations: '',
    timeCommitment: '',
    questions: '',
    dataConsent: false,
    termsAccepted: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof WorkshopFormData, string>>>({});
  const { showToast } = useToast();

  const handleInputChange = <K extends keyof WorkshopFormData>(field: K, value: WorkshopFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof WorkshopFormData, string>> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.age.trim()) newErrors.age = 'Age is required';
    if (!formData.whyAttend.trim()) newErrors.whyAttend = 'Please tell us why you want to attend';
    if (!formData.dataConsent) newErrors.dataConsent = 'Data consent is required';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'Terms acceptance is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fill in all required fields correctly', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('leadership_ethics_workshop_registrations')
        .insert([{
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          age: parseInt(formData.age),
          education_level: formData.educationLevel,
          current_role: formData.currentRole,
          organization: formData.organization,
          leadership_experience: formData.leadershipExperience,
          why_attend: formData.whyAttend,
          expectations: formData.expectations,
          time_commitment: formData.timeCommitment,
          questions: formData.questions,
          data_consent: formData.dataConsent,
          terms_accepted: formData.termsAccepted,
          submission_date: new Date().toISOString(),
          status: 'pending'
        }]);

      if (error) throw error;

      showToast('Thank you for your interest in the Leadership Ethics Workshop! We will contact you soon with more details.', 'success');

      // Reset form
      setFormData({
        firstName: '', lastName: '', email: '', phone: '', age: '', educationLevel: '',
        currentRole: '', organization: '', leadershipExperience: '', whyAttend: '',
        expectations: '', timeCommitment: '', questions: '',
        dataConsent: false, termsAccepted: false
      });
      setErrors({});

    } catch (err: unknown) {
      console.error('Submission error:', err);
      showToast('There was an error submitting your registration. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const educationOptions = [
    'High School',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'Doctorate',
    'Other',
    'Currently Studying'
  ];

  const timeCommitmentOptions = [
    'Can attend all sessions',
    'Can attend most sessions',
    'Can attend occasionally',
    'Need to discuss schedule'
  ];

  return (
    <Card variant="premium" className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">⚖️</div>
        <h2 className="text-3xl font-bold text-blue-900 mb-4">
          Leadership Ethics Workshop Registration
        </h2>
        <p className="text-gray-600">
          Develop ethical leadership skills through practical philosophy and real-world applications
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="First Name"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Your first name"
            required
            error={errors.firstName}
          />
          <FormField
            label="Last Name"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Your last name"
            required
            error={errors.lastName}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your.email@example.com"
            required
            error={errors.email}
          />
          <FormField
            label="Phone/WhatsApp"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+250 ... or your country code"
            required
            error={errors.phone}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Age"
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            placeholder="Your age"
            min="18"
            max="65"
            required
            error={errors.age}
          />
          <FormField
            label="Education Level"
            type="select"
            value={formData.educationLevel}
            onChange={(e) => handleInputChange('educationLevel', e.target.value)}
            options={educationOptions}
            placeholder="Select your education level"
          />
        </div>

        {/* Professional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Current Role/Position"
            type="text"
            value={formData.currentRole}
            onChange={(e) => handleInputChange('currentRole', e.target.value)}
            placeholder="e.g., Student, Teacher, Manager"
          />
          <FormField
            label="Organization/Institution"
            type="text"
            value={formData.organization}
            onChange={(e) => handleInputChange('organization', e.target.value)}
            placeholder="School, company, or organization name"
          />
        </div>

        {/* Leadership Experience */}
        <FormField
          label="Leadership Experience"
          type="textarea"
          value={formData.leadershipExperience}
          onChange={(e) => handleInputChange('leadershipExperience', e.target.value)}
          placeholder="Describe any leadership roles or experience you have (optional)"
          rows={3}
        />

        {/* Why Attend */}
        <FormField
          label="Why do you want to attend this workshop?"
          type="textarea"
          value={formData.whyAttend}
          onChange={(e) => handleInputChange('whyAttend', e.target.value)}
          placeholder="What motivates you to develop ethical leadership skills?"
          required
          rows={4}
          error={errors.whyAttend}
        />

        {/* Expectations */}
        <FormField
          label="What do you hope to gain from this workshop?"
          type="textarea"
          value={formData.expectations}
          onChange={(e) => handleInputChange('expectations', e.target.value)}
          placeholder="What specific skills or knowledge do you want to develop?"
          rows={3}
        />

        {/* Time Commitment */}
        <div>
          <label className="block text-sm font-medium text-dark-blue mb-3">
            Time Commitment (select the best option)
          </label>
          <div className="space-y-2">
            {timeCommitmentOptions.map((option) => (
              <label key={option} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer">
                <input
                  type="radio"
                  name="timeCommitment"
                  value={option}
                  checked={formData.timeCommitment === option}
                  onChange={(e) => handleInputChange('timeCommitment', e.target.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Questions */}
        <FormField
          label="Questions or Special Requirements"
          type="textarea"
          value={formData.questions}
          onChange={(e) => handleInputChange('questions', e.target.value)}
          placeholder="Any questions about the workshop or special accommodations needed?"
          rows={3}
        />

        {/* Consent */}
        <div className="space-y-4 border-t pt-6">
          <FormField
            label="I consent to BENIRAGE collecting and processing my personal information for workshop registration purposes."
            type="checkbox"
            value={formData.dataConsent}
            onChange={(e) => handleInputChange('dataConsent', e.target.checked)}
            required
            error={errors.dataConsent}
          />

          <FormField
            label="I commit to attending the workshop sessions regularly and participating actively in the learning process."
            type="checkbox"
            value={formData.termsAccepted}
            onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
            required
            error={errors.termsAccepted}
          />
        </div>

        {/* Submit Button */}
        <div className="text-center pt-6">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="min-w-[200px]"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2">Loading...</span>
                </div>
                <span>Submitting...</span>
              </div>
            ) : (
              'Register for Workshop'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default LeadershipEthicsWorkshopForm;