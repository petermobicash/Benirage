import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import FormField from '../ui/FormField';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useToast } from '../../hooks/useToast';
import { submitPhilosophyCafeApplication } from '../../lib/supabase';

interface PhilosophyCafeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: string;
  schoolGrade: string;
  previousExperience: string;
  whyJoin: string;
  availability: string[];
  questions: string;
  dataConsent: boolean;
  termsAccepted: boolean;
}

const PhilosophyCafeJoinForm = () => {
  const [formData, setFormData] = useState<PhilosophyCafeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    schoolGrade: '',
    previousExperience: '',
    whyJoin: '',
    availability: [],
    questions: '',
    dataConsent: false,
    termsAccepted: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof PhilosophyCafeFormData, string>>>({});
  const { showToast } = useToast();

  const handleInputChange = <K extends keyof PhilosophyCafeFormData>(field: K, value: PhilosophyCafeFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof PhilosophyCafeFormData, string>> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.age.trim()) newErrors.age = 'Age is required';
    if (!formData.whyJoin.trim()) newErrors.whyJoin = 'Please tell us why you want to join';
    if (!formData.dataConsent) newErrors.dataConsent = 'Data consent is required';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'Terms acceptance is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Age validation - must be a number between 13 and 25
    if (formData.age) {
      const ageValue = parseInt(formData.age);
      if (isNaN(ageValue)) {
        newErrors.age = 'Please enter a valid age';
      } else if (ageValue < 13 || ageValue > 25) {
        newErrors.age = 'Age must be between 13 and 25';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log('🚀 Philosophy Cafe Form submission started');
    console.log('📝 Form data:', formData);
    console.log('🔧 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      console.log('🔍 Current form data:', formData);
      console.log('🔍 Validation errors:', errors);
      showToast('Please fill in all required fields correctly', 'error');
      return;
    }

    console.log('✅ Form validation passed');

    console.log('Form validation passed, submitting to database...');
    setIsSubmitting(true);

    try {
        const ageValue = parseInt(formData.age);
        if (isNaN(ageValue)) {
          throw new Error('Invalid age value');
        }

        const { data, error } = await submitPhilosophyCafeApplication({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          age: ageValue,
          school_grade: formData.schoolGrade,
          previous_experience: formData.previousExperience,
          why_join: formData.whyJoin,
          availability: formData.availability,
          questions: formData.questions,
          data_consent: formData.dataConsent,
          terms_accepted: formData.termsAccepted
        });

        if (error) throw error;

       console.log('✅ Form submitted successfully:', data);
       console.log('🎉 Philosophy Cafe application saved to database');
       showToast('Thank you for your interest in Philosophy Cafe! We will contact you soon with more details.', 'success');

      // Reset form
      setFormData({
        firstName: '', lastName: '', email: '', phone: '', age: '', schoolGrade: '',
        previousExperience: '', whyJoin: '', availability: [], questions: '',
        dataConsent: false, termsAccepted: false
      });
      setErrors({});

    } catch (err: unknown) {
        console.error('❌ Philosophy Cafe Form submission error:', err);
        const error = err as Error;
        console.error('🔍 Error details:', {
          message: error.message,
          stack: error.stack
        });

        // Provide more specific error messages
        let errorMessage = 'There was an error submitting your application. Please try again.';
        if (error.message?.includes('JWT')) {
          errorMessage = 'Authentication error. Please refresh the page and try again.';
        } else if (error.message?.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message?.includes('permission')) {
          errorMessage = 'Permission error. Please contact support if this persists.';
        }

        showToast(errorMessage, 'error');
     } finally {
       setIsSubmitting(false);
     }
  };

  const availabilityOptions = [
    'Saturday 2-4 PM',
    'Can attend regularly',
    'Can attend occasionally',
    'Would prefer different time'
  ];

  return (
    <Card variant="premium" className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🧠</div>
        <h2 className="text-3xl font-bold text-blue-900 mb-4">
          Join Philosophy Cafe
        </h2>
        <p className="text-gray-600">
          Discover wisdom, engage in meaningful discussions, and connect with fellow young thinkers
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="First Name"
            type="text"
            value={formData.firstName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('firstName', e.target.value)}
            placeholder="Your first name"
            required
            error={errors.firstName}
          />
          <FormField
            label="Last Name"
            type="text"
            value={formData.lastName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('lastName', e.target.value)}
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
            placeholder="your.email@example.com"
            required
            error={errors.email}
          />
          <FormField
            label="Phone/WhatsApp"
            type="tel"
            value={formData.phone}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('age', e.target.value)}
            placeholder="Your age"
            min="13"
            max="25"
            required
            error={errors.age}
          />
          <FormField
            label="School Grade/Class"
            type="text"
            value={formData.schoolGrade}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('schoolGrade', e.target.value)}
            placeholder="e.g., S6, University Year 1"
          />
        </div>

        {/* Philosophy Experience */}
        <FormField
          label="Previous Philosophy Experience"
          type="textarea"
          value={formData.previousExperience}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('previousExperience', e.target.value)}
          placeholder="Have you participated in philosophy discussions before? Any background in philosophy or related subjects?"
          rows={3}
        />

        {/* Why Join */}
        <FormField
          label="Why do you want to join Philosophy Cafe?"
          type="textarea"
          value={formData.whyJoin}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('whyJoin', e.target.value)}
          placeholder="What interests you about philosophical discussions? What do you hope to gain from participating?"
          required
          rows={4}
          error={errors.whyJoin}
        />

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-dark-blue mb-3">
            Availability (select all that apply)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availabilityOptions.map((option) => (
              <label key={option} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.availability.includes(option)}
                  onChange={(e) => handleCheckboxChange('availability', option, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Questions */}
        <FormField
          label="Questions or Comments"
          type="textarea"
          value={formData.questions}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('questions', e.target.value)}
          placeholder="Any questions about the Philosophy Cafe or special accommodations needed?"
          rows={3}
        />

        {/* Consent */}
        <div className="space-y-4 border-t pt-6">
          <FormField
            label="I consent to BENIRAGE collecting and processing my personal information for Philosophy Cafe participation."
            type="checkbox"
            value={formData.dataConsent}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('dataConsent', e.target.checked)}
            required
            error={errors.dataConsent}
          />

          <FormField
            label="I agree to follow BENIRAGE's community guidelines and participate respectfully in philosophical discussions."
            type="checkbox"
            value={formData.termsAccepted}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('termsAccepted', e.target.checked)}
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
              'Join Philosophy Cafe'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default PhilosophyCafeJoinForm;