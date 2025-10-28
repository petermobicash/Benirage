import React, { useState } from 'react';
import { submitMembershipApplication } from '../lib/supabase';
import { Users, Heart, Shield } from 'lucide-react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ImageUpload from '../components/ui/ImageUpload';
import { NATIONALITIES } from '../utils/nationalities';

const Membership = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fatherName: '',
    motherName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    nationality: '',
    maritalStatus: '',
    country: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    postalCode: '',
    occupation: '',
    education: '',
    organization: '',
    workExperience: '',
    languages: [] as string[],
    englishLevel: '',
    frenchLevel: '',
    kinyarwandaLevel: '',
    otherLanguages: '',
    interests: [] as string[],
    otherInterests: '',
    whyJoin: '',
    skills: [] as string[],
    otherSkills: '',
    financialSupport: [] as string[],
    timeCommitment: '',
    membershipCategory: '',
    reference1Name: '',
    reference1Contact: '',
    reference1Relationship: '',
    reference2Name: '',
    reference2Contact: '',
    reference2Relationship: '',
    dataConsent: false,
    termsAccepted: false,
    codeOfConductAccepted: false,
    communicationConsent: false,
    profilePhoto: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const handleInputChange = (field: string, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.email && formData.phone) &&
               validateEmail(formData.email);
      case 2:
        return !!(formData.country && formData.district);
      case 3:
        return !!(formData.occupation && formData.education);
      case 4:
        return !!(formData.interests.length > 0 && formData.whyJoin);
      case 5:
        return !!(formData.membershipCategory && formData.timeCommitment);
      case 6:
        return !!(formData.dataConsent && formData.termsAccepted && formData.codeOfConductAccepted);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      let errorMessage = 'Please fill in all required fields before proceeding.';
      if (currentStep === 1 && formData.email && !validateEmail(formData.email)) {
        errorMessage = 'Please enter a valid email address.';
      }
      alert(errorMessage);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (_e: React.FormEvent) => {
    _e.preventDefault();
    
    if (!validateStep(6)) {
      alert('Please complete all required fields and accept the agreements.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitMembershipApplication({
        first_name: formData.firstName,
        last_name: formData.lastName,
        father_name: formData.fatherName,
        mother_name: formData.motherName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth,
        nationality: formData.nationality,
        marital_status: formData.maritalStatus,
        country: formData.country,
        district: formData.district,
        sector: formData.sector,
        cell: formData.cell,
        village: formData.village,
        postal_code: formData.postalCode,
        occupation: formData.occupation,
        education: formData.education,
        organization: formData.organization,
        work_experience: formData.workExperience,
        languages: formData.languages,
        english_level: formData.englishLevel,
        french_level: formData.frenchLevel,
        kinyarwanda_level: formData.kinyarwandaLevel,
        other_languages: formData.otherLanguages,
        interests: formData.interests,
        other_interests: formData.otherInterests,
        why_join: formData.whyJoin,
        skills: formData.skills,
        other_skills: formData.otherSkills,
        financial_support: formData.financialSupport,
        time_commitment: formData.timeCommitment,
        membership_category: formData.membershipCategory,
        reference1_name: formData.reference1Name,
        reference1_contact: formData.reference1Contact,
        reference1_relationship: formData.reference1Relationship,
        reference2_name: formData.reference2Name,
        reference2_contact: formData.reference2Contact,
        reference2_relationship: formData.reference2Relationship,
        data_consent: formData.dataConsent,
        terms_accepted: formData.termsAccepted,
        code_of_conduct_accepted: formData.codeOfConductAccepted,
        communication_consent: formData.communicationConsent,
        status: 'pending'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      
      if (result.success) {
        alert('Thank you for joining BENIRAGE! Your membership application has been submitted successfully. We will review your application and contact you within 5-7 business days.');
        
        // Reset form
        setFormData({
          firstName: '', lastName: '', fatherName: '', motherName: '', email: '', phone: '', gender: '', dateOfBirth: '',
          nationality: '', maritalStatus: '', country: '', district: '', sector: '', cell: '',
          village: '', postalCode: '', occupation: '', education: '', organization: '',
          workExperience: '', languages: [], englishLevel: '', frenchLevel: '', kinyarwandaLevel: '',
          otherLanguages: '', interests: [], otherInterests: '', whyJoin: '', skills: [],
          otherSkills: '', financialSupport: [], timeCommitment: '', membershipCategory: '',
          reference1Name: '', reference1Contact: '', reference1Relationship: '', reference2Name: '',
          reference2Contact: '', reference2Relationship: '', dataConsent: false, termsAccepted: false,
          codeOfConductAccepted: false, communicationConsent: false, profilePhoto: ''
        });
        setCurrentStep(1);
      } else {
        throw new Error('Submission failed');
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      console.error('Full error details:', error);

      // Type guard to safely handle unknown error type
      const getErrorMessage = (err: unknown): string => {
        if (err instanceof Error) {
          return err.message;
        }
        if (typeof err === 'string') {
          return err;
        }
        if (err && typeof err === 'object' && 'message' in err && typeof (err as Record<string, string>).message === 'string') {
          return (err as Record<string, string>).message;
        }
        return 'An unexpected error occurred';
      };

      const errorMessage = getErrorMessage(error);
      console.error('Detailed error information:', {
        error,
        errorType: typeof error,
        errorMessage,
        stack: error instanceof Error ? error.stack : 'No stack trace available'
      });

      alert(`There was an error submitting your application: ${errorMessage}. Please try again or contact support.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl font-semibold text-dark-blue mb-4">
                👤 Personal Information
              </h3>
              <p className="text-clear-gray">Let's start with your basic information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-dark-blue mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="Your first name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-dark-blue mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="Your last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fatherName" className="block text-sm font-medium text-dark-blue mb-2">
                  Father's Name
                </label>
                <input
                  type="text"
                  id="fatherName"
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="Your father's name"
                />
              </div>
              <div>
                <label htmlFor="motherName" className="block text-sm font-medium text-dark-blue mb-2">
                  Mother's Name
                </label>
                <input
                  type="text"
                  id="motherName"
                  value={formData.motherName}
                  onChange={(e) => handleInputChange('motherName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="Your mother's name"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-dark-blue mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-dark-blue mb-2">
                  Phone/WhatsApp *
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="+250 ... or your country code"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-dark-blue mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-dark-blue mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="maritalStatus" className="block text-sm font-medium text-dark-blue mb-2">
                  Marital Status
                </label>
                <select
                  id="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                >
                  <option value="">Select status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="engaged">Engaged</option>
                  <option value="in-relationship">In a Relationship</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="nationality" className="block text-sm font-medium text-dark-blue mb-2">
                Nationality
              </label>
              <select
                id="nationality"
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
              >
                <option value="">Select your nationality</option>
                {NATIONALITIES.map((nationality) => (
                  <option key={nationality.value} value={nationality.value}>
                    {nationality.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-blue mb-2">
                Profile Photo (Optional)
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Upload a recent photo of yourself to help us know you better. This will be used for your membership profile.
              </p>

              {!formData.profilePhoto ? (
                <ImageUpload
                  onUpload={(url, path) => {
                    console.log('Profile photo uploaded to:', path);
                    handleInputChange('profilePhoto', url);
                  }}
                  onRemove={() => handleInputChange('profilePhoto', '')}
                  currentImage={formData.profilePhoto}
                  maxSize={2}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                  uploadPath="membership-photos"
                  previewSize={{ width: 200, height: 200 }}
                  className="max-w-sm"
                />
              ) : (
                <div className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <img
                    src={formData.profilePhoto}
                    alt="Profile preview"
                    className="w-20 h-20 object-cover rounded-lg border-2 border-green-300"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">Photo uploaded successfully!</p>
                    <p className="text-xs text-green-600 mt-1">Click remove to upload a different photo</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange('profilePhoto', '')}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl font-semibold text-dark-blue mb-4">
                📍 Location Information
              </h3>
              <p className="text-clear-gray">Help us understand where you're located</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-dark-blue mb-2">
                  Country *
                </label>
                <select
                  id="country"
                  required
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                >
                  <option value="">Select country</option>

                  {/* East African Community */}
                  <optgroup label="🌍 East African Community">
                    <option value="Rwanda">🇷🇼 Rwanda</option>
                    <option value="Burundi">🇧🇮 Burundi</option>
                    <option value="Uganda">🇺🇬 Uganda</option>
                    <option value="Kenya">🇰🇪 Kenya</option>
                    <option value="Tanzania">🇹🇿 Tanzania</option>
                    <option value="South Sudan">🇸🇸 South Sudan</option>
                    <option value="DRC">🇨🇩 Democratic Republic of Congo</option>
                  </optgroup>

                  {/* Other African Countries */}
                  <optgroup label="🌍 Other African Countries">
                    <option value="Algeria">🇩🇿 Algeria</option>
                    <option value="Angola">🇦🇴 Angola</option>
                    <option value="Benin">🇧🇯 Benin</option>
                    <option value="Botswana">🇧🇼 Botswana</option>
                    <option value="Burkina Faso">🇧🇫 Burkina Faso</option>
                    <option value="Cameroon">🇨🇲 Cameroon</option>
                    <option value="Cape Verde">🇨🇻 Cape Verde</option>
                    <option value="Chad">🇹🇩 Chad</option>
                    <option value="Comoros">🇰🇲 Comoros</option>
                    <option value="Djibouti">🇩🇯 Djibouti</option>
                    <option value="Egypt">🇪🇬 Egypt</option>
                    <option value="Equatorial Guinea">🇬🇶 Equatorial Guinea</option>
                    <option value="Eritrea">🇪🇷 Eritrea</option>
                    <option value="Eswatini">🇸🇿 Eswatini</option>
                    <option value="Ethiopia">🇪🇹 Ethiopia</option>
                    <option value="Gabon">🇬🇦 Gabon</option>
                    <option value="Gambia">🇬🇲 Gambia</option>
                    <option value="Ghana">🇬🇭 Ghana</option>
                    <option value="Guinea">🇬🇳 Guinea</option>
                    <option value="Guinea-Bissau">🇬🇼 Guinea-Bissau</option>
                    <option value="Ivory Coast">🇨🇮 Ivory Coast</option>
                    <option value="Lesotho">🇱🇸 Lesotho</option>
                    <option value="Liberia">🇱🇷 Liberia</option>
                    <option value="Libya">🇱🇾 Libya</option>
                    <option value="Madagascar">🇲🇬 Madagascar</option>
                    <option value="Malawi">🇲🇼 Malawi</option>
                    <option value="Mali">🇲🇱 Mali</option>
                    <option value="Mauritania">🇲🇷 Mauritania</option>
                    <option value="Mauritius">🇲🇺 Mauritius</option>
                    <option value="Morocco">🇲🇦 Morocco</option>
                    <option value="Mozambique">🇲🇿 Mozambique</option>
                    <option value="Namibia">🇳🇦 Namibia</option>
                    <option value="Niger">🇳🇪 Niger</option>
                    <option value="Nigeria">🇳🇬 Nigeria</option>
                    <option value="Senegal">🇸🇳 Senegal</option>
                    <option value="Seychelles">🇸🇨 Seychelles</option>
                    <option value="Sierra Leone">🇸🇱 Sierra Leone</option>
                    <option value="Somalia">🇸🇴 Somalia</option>
                    <option value="Sudan">🇸🇩 Sudan</option>
                    <option value="Togo">🇹🇬 Togo</option>
                    <option value="Tunisia">🇹🇳 Tunisia</option>
                    <option value="Zambia">🇿🇲 Zambia</option>
                    <option value="Zimbabwe">🇿🇼 Zimbabwe</option>
                  </optgroup>

                  {/* International */}
                  <optgroup label="🌍 International">
                    <option value="United States">🇺🇸 United States</option>
                    <option value="Canada">🇨🇦 Canada</option>
                    <option value="United Kingdom">🇬🇧 United Kingdom</option>
                    <option value="France">🇫🇷 France</option>
                    <option value="Germany">🇩🇪 Germany</option>
                    <option value="Italy">🇮🇹 Italy</option>
                    <option value="Spain">🇪🇸 Spain</option>
                    <option value="Portugal">🇵🇹 Portugal</option>
                    <option value="Netherlands">🇳🇱 Netherlands</option>
                    <option value="Belgium">🇧🇪 Belgium</option>
                    <option value="Switzerland">🇨🇭 Switzerland</option>
                    <option value="Austria">🇦🇹 Austria</option>
                    <option value="Sweden">🇸🇪 Sweden</option>
                    <option value="Norway">🇳🇴 Norway</option>
                    <option value="Denmark">🇩🇰 Denmark</option>
                    <option value="Finland">🇫🇮 Finland</option>
                    <option value="Ireland">🇮🇪 Ireland</option>
                    <option value="Australia">🇦🇺 Australia</option>
                    <option value="New Zealand">🇳🇿 New Zealand</option>
                    <option value="Japan">🇯🇵 Japan</option>
                    <option value="South Korea">🇰🇷 South Korea</option>
                    <option value="China">🇨🇳 China</option>
                    <option value="India">🇮🇳 India</option>
                    <option value="Brazil">🇧🇷 Brazil</option>
                    <option value="Argentina">🇦🇷 Argentina</option>
                    <option value="Mexico">🇲🇽 Mexico</option>
                    <option value="Other">🌍 Other</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label htmlFor="district" className="block text-sm font-medium text-dark-blue mb-2">
                  District/Province *
                </label>
                <input
                  type="text"
                  id="district"
                  required
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="Your district or province"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="sector" className="block text-sm font-medium text-dark-blue mb-2">
                  Sector/City
                </label>
                <input
                  type="text"
                  id="sector"
                  value={formData.sector}
                  onChange={(e) => handleInputChange('sector', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="Your sector or city"
                />
              </div>
              <div>
                <label htmlFor="cell" className="block text-sm font-medium text-dark-blue mb-2">
                  Cell/Area
                </label>
                <input
                  type="text"
                  id="cell"
                  value={formData.cell}
                  onChange={(e) => handleInputChange('cell', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="Your cell or area"
                />
              </div>
              <div>
                <label htmlFor="village" className="block text-sm font-medium text-dark-blue mb-2">
                  Village/Neighborhood
                </label>
                <input
                  type="text"
                  id="village"
                  value={formData.village}
                  onChange={(e) => handleInputChange('village', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="Your village or neighborhood"
                />
              </div>
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-dark-blue mb-2">
                Postal Code (if applicable)
              </label>
              <input
                type="text"
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                placeholder="Postal or ZIP code"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl font-semibold text-dark-blue mb-4">
                💼 Professional Background
              </h3>
              <p className="text-clear-gray">Tell us about your work and education</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-dark-blue mb-2">
                  Occupation *
                </label>
                <input
                  type="text"
                  id="occupation"
                  required
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="Your current job or profession"
                />
              </div>
              <div>
                <label htmlFor="education" className="block text-sm font-medium text-dark-blue mb-2">
                  Education Level *
                </label>
                <select
                  id="education"
                  required
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                >
                  <option value="">Select education level</option>
                  <option value="primary">Primary Education</option>
                  <option value="secondary">Secondary Education</option>
                  <option value="vocational">Vocational Training</option>
                  <option value="diploma">Diploma</option>
                  <option value="bachelor">Bachelor's Degree</option>
                  <option value="master">Master's Degree</option>
                  <option value="phd">PhD/Doctorate</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-dark-blue mb-2">
                Organization/Company
              </label>
              <input
                type="text"
                id="organization"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                placeholder="Where do you work or study?"
              />
            </div>

            <div>
              <label htmlFor="workExperience" className="block text-sm font-medium text-dark-blue mb-2">
                Work Experience
              </label>
              <textarea
                id="workExperience"
                rows={4}
                value={formData.workExperience}
                onChange={(e) => handleInputChange('workExperience', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-none"
                placeholder="Briefly describe your work experience and any relevant background..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-blue mb-3">
                Languages (select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Kinyarwanda',
                  'English',
                  'French',
                  'Swahili',
                  'Kirundi',
                  'Other'
                ].map((language) => (
                  <label key={language} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={formData.languages.includes(language)}
                      onChange={(e) => handleCheckboxChange('languages', language, e.target.checked)}
                      className="rounded border-gray-300 text-golden focus:ring-golden" 
                    />
                    <span className="text-sm text-clear-gray">{language}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="kinyarwandaLevel" className="block text-sm font-medium text-dark-blue mb-2">
                  Kinyarwanda Level
                </label>
                <select
                  id="kinyarwandaLevel"
                  value={formData.kinyarwandaLevel}
                  onChange={(e) => handleInputChange('kinyarwandaLevel', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                >
                  <option value="">Select level</option>
                  <option value="native">Native Speaker</option>
                  <option value="fluent">Fluent</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="basic">Basic</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label htmlFor="englishLevel" className="block text-sm font-medium text-dark-blue mb-2">
                  English Level
                </label>
                <select
                  id="englishLevel"
                  value={formData.englishLevel}
                  onChange={(e) => handleInputChange('englishLevel', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                >
                  <option value="">Select level</option>
                  <option value="native">Native Speaker</option>
                  <option value="fluent">Fluent</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="basic">Basic</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label htmlFor="frenchLevel" className="block text-sm font-medium text-dark-blue mb-2">
                  French Level
                </label>
                <select
                  id="frenchLevel"
                  value={formData.frenchLevel}
                  onChange={(e) => handleInputChange('frenchLevel', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                >
                  <option value="">Select level</option>
                  <option value="native">Native Speaker</option>
                  <option value="fluent">Fluent</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="basic">Basic</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl font-semibold text-dark-blue mb-4">
                💡 Interests & Motivation
              </h3>
              <p className="text-clear-gray">What draws you to BENIRAGE?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-blue mb-3">
                Areas of Interest (select all that apply) *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Spiritual Development & Meditation',
                  'Cultural Heritage & Traditions',
                  'Philosophy & Wisdom Teachings',
                  'Community Service & Outreach',
                  'Youth Development Programs',
                  'Health & Wellness Initiatives',
                  'Educational Programs & Research',
                  'Arts & Creative Expression',
                  'Environmental Conservation',
                  'Social Justice & Advocacy',
                  'Interfaith Dialogue & Unity',
                  'Leadership Development'
                ].map((interest) => (
                  <label key={interest} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-golden/10 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.interests.includes(interest)}
                      onChange={(e) => handleCheckboxChange('interests', interest, e.target.checked)}
                      className="rounded border-gray-300 text-golden focus:ring-golden" 
                    />
                    <span className="text-clear-gray text-sm">{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="otherInterests" className="block text-sm font-medium text-dark-blue mb-2">
                Other Interests (not listed above)
              </label>
              <input
                type="text"
                id="otherInterests"
                value={formData.otherInterests}
                onChange={(e) => handleInputChange('otherInterests', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                placeholder="Any other areas of interest..."
              />
            </div>

            <div>
              <label htmlFor="whyJoin" className="block text-sm font-medium text-dark-blue mb-2">
                Why do you want to join BENIRAGE? *
              </label>
              <textarea
                id="whyJoin"
                rows={5}
                required
                value={formData.whyJoin}
                onChange={(e) => handleInputChange('whyJoin', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-none"
                placeholder="Share your motivation for joining our community. What do you hope to gain and contribute? How do our three pillars (Spiritual Grounding, Human Philosophy, Human Culture) resonate with you?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-blue mb-3">
                Skills & Talents (select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Teaching & Training',
                  'Counseling & Guidance',
                  'Event Organization',
                  'Writing & Communication',
                  'Music & Performance',
                  'Arts & Crafts',
                  'Technology & Digital',
                  'Research & Analysis',
                  'Translation & Languages',
                  'Healthcare & Wellness',
                  'Business & Finance',
                  'Agriculture & Environment'
                ].map((skill) => (
                  <label key={skill} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={formData.skills.includes(skill)}
                      onChange={(e) => handleCheckboxChange('skills', skill, e.target.checked)}
                      className="rounded border-gray-300 text-golden focus:ring-golden" 
                    />
                    <span className="text-sm text-clear-gray">{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="otherSkills" className="block text-sm font-medium text-dark-blue mb-2">
                Other Skills & Talents
              </label>
              <input
                type="text"
                id="otherSkills"
                value={formData.otherSkills}
                onChange={(e) => handleInputChange('otherSkills', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                placeholder="Any other skills or talents you'd like to share..."
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl font-semibold text-dark-blue mb-4">
                🤝 Commitment & Contribution
              </h3>
              <p className="text-clear-gray">How would you like to contribute to our community?</p>
            </div>

            <div>
              <label htmlFor="membershipCategory" className="block text-sm font-medium text-dark-blue mb-2">
                Membership Category *
              </label>
              <select
                id="membershipCategory"
                required
                value={formData.membershipCategory}
                onChange={(e) => handleInputChange('membershipCategory', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
              >
                <option value="">Select membership type</option>
                <option value="active">Active Member - Regular participation in programs and events</option>
                <option value="supporting">Supporting Member - Financial support and occasional participation</option>
                <option value="youth">Youth Member - Under 25 years old with special youth programs</option>
                <option value="senior">Senior Member - Over 60 years old with wisdom-sharing opportunities</option>
                <option value="international">International Member - Living outside Rwanda but supporting the mission</option>
                <option value="honorary">Honorary Member - Special recognition for significant contributions</option>
              </select>
            </div>

            <div>
              <label htmlFor="timeCommitment" className="block text-sm font-medium text-dark-blue mb-2">
                Time Commitment *
              </label>
              <select
                id="timeCommitment"
                required
                value={formData.timeCommitment}
                onChange={(e) => handleInputChange('timeCommitment', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
              >
                <option value="">Select time commitment</option>
                <option value="minimal">Minimal (1-2 hours per month) - Newsletter and occasional events</option>
                <option value="moderate">Moderate (3-5 hours per month) - Regular program participation</option>
                <option value="active">Active (6-10 hours per month) - Regular participation and some volunteering</option>
                <option value="dedicated">Dedicated (10+ hours per month) - Leadership roles and significant involvement</option>
                <option value="flexible">Flexible - Varies based on availability and life circumstances</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-blue mb-3">
                Financial Support (select all that apply)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Monthly Donations ($10-50)',
                  'Annual Donations ($100-500)',
                  'Event Sponsorship',
                  'Program Funding',
                  'Infrastructure Support',
                  'Educational Materials',
                  'No Financial Contribution (Time & Skills Only)'
                ].map((support) => (
                  <label key={support} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-golden/10 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.financialSupport.includes(support)}
                      onChange={(e) => handleCheckboxChange('financialSupport', support, e.target.checked)}
                      className="rounded border-gray-300 text-golden focus:ring-golden" 
                    />
                    <span className="text-clear-gray text-sm">{support}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl font-semibold text-dark-blue mb-4">
                📞 References & Agreements
              </h3>
              <p className="text-clear-gray">Final step - references and consent</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-display text-lg font-semibold text-dark-blue">
                  Reference 1
                </h4>
                <div>
                  <label htmlFor="reference1Name" className="block text-sm font-medium text-dark-blue mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="reference1Name"
                    value={formData.reference1Name}
                    onChange={(e) => handleInputChange('reference1Name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                    placeholder="Reference's full name"
                  />
                </div>
                <div>
                  <label htmlFor="reference1Contact" className="block text-sm font-medium text-dark-blue mb-2">
                    Contact Information
                  </label>
                  <input
                    type="text"
                    id="reference1Contact"
                    value={formData.reference1Contact}
                    onChange={(e) => handleInputChange('reference1Contact', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                    placeholder="Phone or email"
                  />
                </div>
                <div>
                  <label htmlFor="reference1Relationship" className="block text-sm font-medium text-dark-blue mb-2">
                    Relationship
                  </label>
                  <input
                    type="text"
                    id="reference1Relationship"
                    value={formData.reference1Relationship}
                    onChange={(e) => handleInputChange('reference1Relationship', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                    placeholder="e.g., Pastor, Teacher, Employer"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-display text-lg font-semibold text-dark-blue">
                  Reference 2 (Optional)
                </h4>
                <div>
                  <label htmlFor="reference2Name" className="block text-sm font-medium text-dark-blue mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="reference2Name"
                    value={formData.reference2Name}
                    onChange={(e) => handleInputChange('reference2Name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                    placeholder="Reference's full name"
                  />
                </div>
                <div>
                  <label htmlFor="reference2Contact" className="block text-sm font-medium text-dark-blue mb-2">
                    Contact Information
                  </label>
                  <input
                    type="text"
                    id="reference2Contact"
                    value={formData.reference2Contact}
                    onChange={(e) => handleInputChange('reference2Contact', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                    placeholder="Phone or email"
                  />
                </div>
                <div>
                  <label htmlFor="reference2Relationship" className="block text-sm font-medium text-dark-blue mb-2">
                    Relationship
                  </label>
                  <input
                    type="text"
                    id="reference2Relationship"
                    value={formData.reference2Relationship}
                    onChange={(e) => handleInputChange('reference2Relationship', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                    placeholder="e.g., Friend, Colleague, Community Leader"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-display text-lg font-semibold text-dark-blue">
                Membership Agreements
              </h4>
              
              <label className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <input 
                  type="checkbox" 
                  required
                  checked={formData.dataConsent}
                  onChange={(e) => handleInputChange('dataConsent', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-golden focus:ring-golden" 
                />
                <span className="text-sm text-dark-blue">
                  <strong>Data Privacy Consent *</strong><br />
                  I consent to BENIRAGE collecting, processing, and storing my personal information for membership management, communication, and program coordination. I understand my data will be handled in accordance with applicable privacy laws.
                </span>
              </label>

              <label className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <input 
                  type="checkbox" 
                  required
                  checked={formData.termsAccepted}
                  onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-golden focus:ring-golden" 
                />
                <span className="text-sm text-dark-blue">
                  <strong>Terms & Conditions *</strong><br />
                  I agree to abide by BENIRAGE's terms and conditions, including membership responsibilities, community guidelines, and organizational policies. I commit to supporting the mission and values of BENIRAGE.
                </span>
              </label>

              <label className="flex items-start space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <input 
                  type="checkbox" 
                  required
                  checked={formData.codeOfConductAccepted}
                  onChange={(e) => handleInputChange('codeOfConductAccepted', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-golden focus:ring-golden" 
                />
                <span className="text-sm text-dark-blue">
                  <strong>Code of Conduct *</strong><br />
                  I agree to follow BENIRAGE's code of conduct, which includes treating all community members with respect, maintaining confidentiality when appropriate, and contributing positively to our spiritual and cultural mission.
                </span>
              </label>

              <label className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <input 
                  type="checkbox" 
                  checked={formData.communicationConsent}
                  onChange={(e) => handleInputChange('communicationConsent', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-golden focus:ring-golden" 
                />
                <span className="text-sm text-dark-blue">
                  <strong>Communication Consent (Optional)</strong><br />
                  I consent to receiving newsletters, event announcements, and other communications from BENIRAGE via email, phone, or WhatsApp. I can unsubscribe at any time.
                </span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Hero */}
      <Section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="text-center">
          <Users className="w-16 h-16 text-white mx-auto mb-6 animate-float" />
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Join BENIRAGE
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Become part of our transformative spiritual and cultural movement
          </p>
        </div>
      </Section>

      {/* Membership Benefits */}
      <Section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-900 mb-8">
            Membership Benefits
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:scale-105 transition-transform">
              <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Spiritual Growth
              </h3>
              <p className="text-gray-600">
                Access to exclusive spiritual programs, meditation sessions, and personal development resources
              </p>
            </Card>

            <Card className="text-center hover:scale-105 transition-transform">
              <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Community Connection
              </h3>
              <p className="text-gray-600">
                Connect with like-minded individuals and build meaningful relationships within our community
              </p>
            </Card>

            <Card className="text-center hover:scale-105 transition-transform">
              <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Cultural Preservation
              </h3>
              <p className="text-gray-600">
                Participate in preserving and celebrating Rwandan heritage and cultural traditions
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* Membership Application Form */}
      <Section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Membership Application
            </h2>
            <p className="text-lg text-gray-700">
              Join our community of spiritual seekers and cultural preservers
            </p>
          </div>

          <Card variant="premium">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-dark-blue">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm text-clear-gray">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-golden to-yellow-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t border-gray-200">
                <div>
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Previous Step
                    </Button>
                  )}
                </div>
                
                <div>
                  {currentStep < totalSteps ? (
                    <Button type="button" onClick={nextStep}>
                      Next Step
                    </Button>
                  ) : (
                    <Button type="submit" icon={Users} disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting Application...' : 'Submit Membership Application'}
                    </Button>
                  )}
                </div>
              </div>
            </form>

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Secure Application Process</span>
              </div>
              <p className="text-sm text-green-700">
                Your personal information is encrypted and securely stored. We respect your privacy and will only use your information for membership management and community communication.
              </p>
            </div>
          </Card>
        </div>
      </Section>
    </div>
  );
};

export default Membership;