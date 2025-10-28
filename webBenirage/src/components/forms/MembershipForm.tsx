import React, { useState } from 'react';
import { submitMembershipApplication } from '../../lib/supabase';
import { validateForm, membershipValidationRules } from '../../utils/formValidation';
import { generateMembershipPDF } from '../../utils/generateMembershipPDF';
import FormField from '../ui/FormField';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ImageUpload from '../ui/ImageUpload';
import { useToast } from '../../hooks/useToast';
import {
  LOCATION_DATA,
  getDistrictsForCountry,
  getSectorsForDistrict,
  getCellsForSector,
  getVillagesForCell,
  type LocationOption
} from '../../utils/locationData';

// Input sanitization utility
const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 1000); // Limit length
};

interface MembershipFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fatherName: string;
  motherName: string;
  fatherPhotoUrl: string;
  fatherPhotoFilename: string;
  motherPhotoUrl: string;
  motherPhotoFilename: string;
  photoUrl: string;
  photoFilename: string;
  gender: string;
  dateOfBirth: string;
  country: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  occupation: string;
  education: string;
  organization: string;
  englishLevel: string;
  frenchLevel: string;
  kinyarwandaLevel: string;
  skills: string[];
  workExperience: string;
  interests: string[];
  whyJoin: string;
  membershipCategory: string;
  reference1Name: string;
  reference1Contact: string;
  reference1Relationship: string;
  reference2Name: string;
  reference2Contact: string;
  reference2Relationship: string;
  dataConsent: boolean;
  termsAccepted: boolean;
  codeOfConductAccepted: boolean;
  communicationConsent: boolean;
}

interface MembershipApplicationData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo_url?: string | null;
  photo_filename?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  country?: string | null;
  district?: string | null;
  sector?: string | null;
  cell?: string | null;
  village?: string | null;
  occupation?: string | null;
  education?: string | null;
  organization?: string | null;
  english_level?: string | null;
  french_level?: string | null;
  kinyarwanda_level?: string | null;
  skills: string[];
  work_experience?: string | null;
  interests: string[];
  why_join: string;
  membership_category?: string | null;
  reference1_name?: string | null;
  reference1_contact?: string | null;
  reference1_relationship?: string | null;
  reference2_name?: string | null;
  reference2_contact?: string | null;
  reference2_relationship?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  father_photo_url?: string | null;
  father_photo_filename?: string | null;
  mother_photo_url?: string | null;
  mother_photo_filename?: string | null;
  data_consent: boolean;
  terms_accepted: boolean;
  code_of_conduct_accepted: boolean;
  communication_consent: boolean;
  status?: string;
}

const MembershipForm = () => {
  const [applicationId] = useState(() => crypto.randomUUID());
  const [formData, setFormData] = useState<MembershipFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    fatherName: '',
    motherName: '',
    fatherPhotoUrl: '',
    fatherPhotoFilename: '',
    motherPhotoUrl: '',
    motherPhotoFilename: '',
    photoUrl: '',
    photoFilename: '',
    gender: '',
    dateOfBirth: '',
    country: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    occupation: '',
    education: '',
    organization: '',
    englishLevel: '',
    frenchLevel: '',
    kinyarwandaLevel: '',
    skills: [] as string[],
    workExperience: '',
    interests: [] as string[],
    whyJoin: '',
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
    communicationConsent: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof MembershipFormData, string>>>({});
  const { success, error } = useToast();

  // Location state for cascading dropdowns
  const [availableDistricts, setAvailableDistricts] = useState<LocationOption[]>([]);
  const [availableSectors, setAvailableSectors] = useState<LocationOption[]>([]);
  const [availableCells, setAvailableCells] = useState<LocationOption[]>([]);
  const [availableVillages, setAvailableVillages] = useState<LocationOption[]>([]);

  // Handle country selection and update districts
  const handleCountryChange = (country: string) => {
    handleInputChange('country', country);
    handleInputChange('district', '');
    handleInputChange('sector', '');
    handleInputChange('cell', '');
    handleInputChange('village', '');

    // Update available districts
    const districts = getDistrictsForCountry(country);
    setAvailableDistricts(districts);
    setAvailableSectors([]);
    setAvailableCells([]);
    setAvailableVillages([]);
  };

  // Handle district selection and update sectors
  const handleDistrictChange = (district: string) => {
    handleInputChange('district', district);
    handleInputChange('sector', '');
    handleInputChange('cell', '');
    handleInputChange('village', '');

    // Update available sectors
    const sectors = getSectorsForDistrict(formData.country, district);
    setAvailableSectors(sectors);
    setAvailableCells([]);
    setAvailableVillages([]);
  };

  // Handle sector selection and update cells
  const handleSectorChange = (sector: string) => {
    handleInputChange('sector', sector);
    handleInputChange('cell', '');
    handleInputChange('village', '');

    // Update available cells
    const cells = getCellsForSector(formData.country, sector);
    setAvailableCells(cells);
    setAvailableVillages([]);
  };

  // Handle cell selection and update villages
  const handleCellChange = (cell: string) => {
    handleInputChange('cell', cell);
    handleInputChange('village', '');

    // Update available villages
    const villages = getVillagesForCell(formData.country, cell);
    setAvailableVillages(villages);
  };

  const handleInputChange = <K extends keyof MembershipFormData>(field: K, value: MembershipFormData[K]) => {
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

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generateMembershipPDF({ ...formData, applicationId });
      success('PDF generated successfully!');
    } catch (err) {
      console.error('PDF generation error:', err);
      error('There was an error generating the PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm(formData, membershipValidationRules);
    if (validationErrors.length > 0) {
      const errorMap = validationErrors.reduce((acc, err) => ({
        ...acc,
        [err.field]: err.message
      }), {});
      setErrors(errorMap);

      // Show specific error message
      const firstError = validationErrors[0];
      error(`Please fix the following error: ${firstError.message}`);

      // Scroll to first error field
      const firstErrorField = document.querySelector(`[name="${firstError.field}"]`) as HTMLElement;
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
        // Sanitize text inputs before submission
        const sanitizedData = {
          firstName: sanitizeInput(formData.firstName),
          lastName: sanitizeInput(formData.lastName),
          email: formData.email.toLowerCase().trim(), // Normalize email
          phone: sanitizeInput(formData.phone),
          fatherName: sanitizeInput(formData.fatherName),
          motherName: sanitizeInput(formData.motherName),
          fatherPhotoUrl: sanitizeInput(formData.fatherPhotoUrl),
          fatherPhotoFilename: sanitizeInput(formData.fatherPhotoFilename),
          motherPhotoUrl: sanitizeInput(formData.motherPhotoUrl),
          motherPhotoFilename: sanitizeInput(formData.motherPhotoFilename),
          photoUrl: sanitizeInput(formData.photoUrl),
          photoFilename: sanitizeInput(formData.photoFilename),
          country: sanitizeInput(formData.country),
          district: sanitizeInput(formData.district),
          sector: sanitizeInput(formData.sector),
          cell: sanitizeInput(formData.cell),
          village: sanitizeInput(formData.village),
          occupation: sanitizeInput(formData.occupation),
          education: formData.education || null,
          organization: sanitizeInput(formData.organization),
          englishLevel: formData.englishLevel || null,
          frenchLevel: formData.frenchLevel || null,
          kinyarwandaLevel: formData.kinyarwandaLevel || null,
          workExperience: sanitizeInput(formData.workExperience),
          whyJoin: sanitizeInput(formData.whyJoin),
          membershipCategory: formData.membershipCategory || null,
          reference1Name: sanitizeInput(formData.reference1Name),
          reference1Contact: sanitizeInput(formData.reference1Contact),
          reference1Relationship: sanitizeInput(formData.reference1Relationship),
          reference2Name: sanitizeInput(formData.reference2Name),
          reference2Contact: sanitizeInput(formData.reference2Contact),
          reference2Relationship: sanitizeInput(formData.reference2Relationship)
        };

        // Build the application data object with proper typing
        const applicationData: MembershipApplicationData = {
          first_name: sanitizedData.firstName,
          last_name: sanitizedData.lastName,
          email: sanitizedData.email,
          phone: sanitizedData.phone,
          photo_url: sanitizedData.photoUrl,
          photo_filename: sanitizedData.photoFilename,
          gender: formData.gender || null,
          date_of_birth: formData.dateOfBirth || null,
          country: sanitizedData.country || null,
          district: sanitizedData.district || null,
          sector: sanitizedData.sector || null,
          cell: sanitizedData.cell || null,
          village: sanitizedData.village || null,
          occupation: sanitizedData.occupation || null,
          education: sanitizedData.education,
          organization: sanitizedData.organization || null,
          english_level: sanitizedData.englishLevel,
          french_level: sanitizedData.frenchLevel,
          kinyarwanda_level: sanitizedData.kinyarwandaLevel,
          skills: formData.skills,
          work_experience: sanitizedData.workExperience || null,
          interests: formData.interests,
          why_join: sanitizedData.whyJoin,
          membership_category: sanitizedData.membershipCategory,
          reference1_name: sanitizedData.reference1Name || null,
          reference1_contact: sanitizedData.reference1Contact || null,
          reference1_relationship: sanitizedData.reference1Relationship || null,
          reference2_name: sanitizedData.reference2Name || null,
          reference2_contact: sanitizedData.reference2Contact || null,
          reference2_relationship: sanitizedData.reference2Relationship || null,
          data_consent: formData.dataConsent,
          terms_accepted: formData.termsAccepted,
          code_of_conduct_accepted: formData.codeOfConductAccepted,
          communication_consent: formData.communicationConsent,
          status: 'pending'
        };

        // Add optional parent names if they exist
        if (sanitizedData.fatherName) {
          applicationData.father_name = sanitizedData.fatherName;
        }
        if (sanitizedData.motherName) {
          applicationData.mother_name = sanitizedData.motherName;
        }

        // Add optional parent photos if they exist
        if (sanitizedData.fatherPhotoUrl) {
          applicationData.father_photo_url = sanitizedData.fatherPhotoUrl;
          applicationData.father_photo_filename = sanitizedData.fatherPhotoFilename;
        }
        if (sanitizedData.motherPhotoUrl) {
          applicationData.mother_photo_url = sanitizedData.motherPhotoUrl;
          applicationData.mother_photo_filename = sanitizedData.motherPhotoFilename;
        }

       const result = await submitMembershipApplication(applicationData);
      
      if (result.success) {
        success('Thank you for joining BENIRAGE! Your membership application has been submitted successfully.');
        
        // Reset form
        setFormData({
          firstName: '', lastName: '', email: '', phone: '', fatherName: '', motherName: '',
          fatherPhotoUrl: '', fatherPhotoFilename: '', motherPhotoUrl: '', motherPhotoFilename: '',
          photoUrl: '', photoFilename: '', gender: '', dateOfBirth: '', country: '', district: '',
          sector: '', cell: '', village: '', occupation: '', education: '', organization: '',
          englishLevel: '', frenchLevel: '', kinyarwandaLevel: '', skills: [], workExperience: '',
          interests: [], whyJoin: '', membershipCategory: '', reference1Name: '', reference1Contact: '',
          reference1Relationship: '', reference2Name: '', reference2Contact: '', reference2Relationship: '',
          dataConsent: false, termsAccepted: false, codeOfConductAccepted: false, communicationConsent: false
        });
        setErrors({});
      } else {
        throw new Error('Submission failed');
      }
      
    } catch (err) {
      console.error('Submission error:', err);
      error('There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card variant="premium">
      {/* Header with Purple Gradient */}
      <div className="relative mb-8 bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-t-lg">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Left: Logo and Title */}
          <div className="flex items-center mb-4 md:mb-0">
            <img src="/benirage.png" alt="BENIRAGE Logo" className="w-16 h-16 mr-4 rounded-full border-4 border-white" />
            <div>
              <h2 className="text-2xl font-bold">BENIRAGE Membership Application</h2>
              <p className="text-purple-100">Join our community of cultural and spiritual leaders</p>
            </div>
          </div>
          {/* Right: Status and Application ID */}
          <div className="text-center md:text-right">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500 text-white mb-2">
              ✅ Approved
            </div>
            <div className="bg-yellow-400 text-yellow-900 px-3 py-2 rounded-lg font-mono text-sm">
              Application ID: {applicationId}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Body */}
        <div className="body-section">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <div className="border-b-2 border-navy-blue pb-2 hover:border-golden transition-colors duration-200">
            <h3 className="text-lg font-semibold text-navy-blue flex items-center">
              <span className="mr-2">👤</span> Personal Information
            </h3>
            <p className="text-sm text-gray-600 mt-1">Let's start with your basic information</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="First Name"
              type="text"
              value={formData.firstName || ''}
              onChange={(value) => handleInputChange('firstName', value)}
              placeholder="Your first name"
              required
              error={errors.firstName}
            />
            <FormField
              label="Last Name"
              type="text"
              value={formData.lastName || ''}
              onChange={(value) => handleInputChange('lastName', value)}
              placeholder="Your last name"
              required
              error={errors.lastName}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Father's Name (Optional)"
              type="text"
              value={formData.fatherName || ''}
              onChange={(value) => handleInputChange('fatherName', value)}
              placeholder="Father's full name"
            />
            <FormField
              label="Mother's Name (Optional)"
              type="text"
              value={formData.motherName || ''}
              onChange={(value) => handleInputChange('motherName', value)}
              placeholder="Mother's full name"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-dark-blue">
              Parents' Photos (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Father's Photo
                </label>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <ImageUpload
                      onUpload={(url, filename) => {
                        handleInputChange('fatherPhotoUrl', url);
                        handleInputChange('fatherPhotoFilename', filename);
                      }}
                      currentImage={formData.fatherPhotoUrl}
                      className="w-24 h-24"
                      previewSize={{ width: 96, height: 96 }}
                      maxSize={5}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">
                      Upload father's photo (Optional). Supported formats: JPG, PNG, GIF. Maximum size: 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mother's Photo
                </label>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <ImageUpload
                      onUpload={(url, filename) => {
                        handleInputChange('motherPhotoUrl', url);
                        handleInputChange('motherPhotoFilename', filename);
                      }}
                      currentImage={formData.motherPhotoUrl}
                      className="w-24 h-24"
                      previewSize={{ width: 96, height: 96 }}
                      maxSize={5}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">
                      Upload mother's photo (Optional). Supported formats: JPG, PNG, GIF. Maximum size: 5MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-dark-blue">
              Profile Photo (Optional)
            </label>
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <ImageUpload
                  onUpload={(url, filename) => {
                    handleInputChange('photoUrl', url);
                    handleInputChange('photoFilename', filename);
                  }}
                  currentImage={formData.photoUrl}
                  className="w-32 h-32"
                  previewSize={{ width: 128, height: 128 }}
                  maxSize={5}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  Upload a recent photo of yourself. This helps us personalize your membership experience.
                  Supported formats: JPG, PNG, GIF. Maximum size: 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Email Address"
              type="email"
              value={formData.email || ''}
              onChange={(value) => handleInputChange('email', value)}
              placeholder="your.email@example.com"
              required
              error={errors.email}
            />
            <FormField
              label="Phone/WhatsApp"
              type="tel"
              value={formData.phone || ''}
              onChange={(value) => handleInputChange('phone', value)}
              placeholder="+250 ... or your country code"
              required
              error={errors.phone}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Gender"
              type="select"
              value={formData.gender || ''}
              onChange={(value) => handleInputChange('gender', value)}
              options={[
                'Male',
                'Female',
                'Other',
                'Prefer not to say'
              ]}
              placeholder="Select your gender"
            />
            <FormField
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth || ''}
              onChange={(value) => handleInputChange('dateOfBirth', value)}
              placeholder="Select your date of birth"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-b-2 border-dark-blue-900 pb-2 hover:border-golden-500 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-dark-blue-900 flex items-center">
              <span className="mr-2">📍</span> Location Information
            </h3>
            <p className="text-sm text-gray-600 mt-1">Help us understand your geographic location</p>
          </div>

          <FormField
            label="Country *"
            type="select"
            value={formData.country || ''}
            onChange={handleCountryChange}
            options={Object.keys(LOCATION_DATA).map(country => ({
              value: country,
              label: country === 'Other' ? 'Other Country' : country
            }))}
            placeholder="Select your country"
            required
            error={errors.country}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="District/Province *"
              type="select"
              value={formData.district || ''}
              onChange={handleDistrictChange}
              options={availableDistricts}
              placeholder={formData.country ? "Select district/province" : "Select country first"}
              required
              error={errors.district}
              disabled={!formData.country || availableDistricts.length === 0}
            />
            <FormField
              label="Sector/Commune"
              type="select"
              value={formData.sector || ''}
              onChange={handleSectorChange}
              options={availableSectors}
              placeholder={formData.district ? "Select sector/commune" : "Select district first"}
              error={errors.sector}
              disabled={!formData.district || availableSectors.length === 0}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Cell/Ward"
              type="select"
              value={formData.cell || ''}
              onChange={handleCellChange}
              options={availableCells}
              placeholder={formData.sector ? "Select cell/ward" : "Select sector first"}
              error={errors.cell}
              disabled={!formData.sector || availableCells.length === 0}
            />
            <FormField
              label="Village/Zone"
              type="select"
              value={formData.village || ''}
              onChange={(value) => handleInputChange('village', value)}
              options={availableVillages}
              placeholder={formData.cell ? "Select village/zone" : "Select cell first"}
              error={errors.village}
              disabled={!formData.cell || availableVillages.length === 0}
            />
          </div>

          {/* Show manual input option for locations not in the predefined lists */}
          {formData.country && (formData.country === 'Other' || availableDistricts.length === 0) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800 mb-3">
                If your location is not listed above, please provide the details manually:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="District/Province"
                  type="text"
                  value={formData.district || ''}
                  onChange={(value) => handleInputChange('district', value)}
                  placeholder="Enter district/province"
                />
                <FormField
                  label="Sector/Commune"
                  type="text"
                  value={formData.sector || ''}
                  onChange={(value) => handleInputChange('sector', value)}
                  placeholder="Enter sector/commune"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="border-b-2 border-dark-blue-900 pb-2 hover:border-golden-500 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-dark-blue-900 flex items-center">
              <span className="mr-2">🎓</span> Education & Work
            </h3>
            <p className="text-sm text-gray-600 mt-1">Tell us about your professional background</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Occupation"
              type="text"
              value={formData.occupation || ''}
              onChange={(value) => handleInputChange('occupation', value)}
              placeholder="Your current occupation"
            />
            <FormField
              label="Education Level"
              type="select"
              value={formData.education || ''}
              onChange={(value) => handleInputChange('education', value)}
              options={[
                'Primary School',
                'Secondary School',
                'Diploma',
                'Bachelor\'s Degree',
                'Master\'s Degree',
                'PhD',
                'Other'
              ]}
              placeholder="Select your education level"
            />
          </div>
          <FormField
            label="Organization/Institution"
            type="text"
            value={formData.organization || ''}
            onChange={(value) => handleInputChange('organization', value)}
            placeholder="Current organization or institution"
          />
          <FormField
            label="Work Experience"
            type="textarea"
            value={formData.workExperience || ''}
            onChange={(value) => handleInputChange('workExperience', value)}
            placeholder="Brief description of your work experience..."
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <div className="border-b-2 border-dark-blue-900 pb-2 hover:border-golden-500 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-dark-blue-900 flex items-center">
              <span className="mr-2">🌐</span> Language Skills
            </h3>
            <p className="text-sm text-gray-600 mt-1">Help us understand your language capabilities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="English Level"
              type="select"
              value={formData.englishLevel || ''}
              onChange={(value) => handleInputChange('englishLevel', value)}
              options={[
                'Beginner',
                'Intermediate',
                'Advanced',
                'Native'
              ]}
              placeholder="Select English level"
            />
            <FormField
              label="French Level"
              type="select"
              value={formData.frenchLevel || ''}
              onChange={(value) => handleInputChange('frenchLevel', value)}
              options={[
                'Beginner',
                'Intermediate',
                'Advanced',
                'Native'
              ]}
              placeholder="Select French level"
            />
            <FormField
              label="Kinyarwanda Level"
              type="select"
              value={formData.kinyarwandaLevel || ''}
              onChange={(value) => handleInputChange('kinyarwandaLevel', value)}
              options={[
                'Beginner',
                'Intermediate',
                'Advanced',
                'Native'
              ]}
              placeholder="Select Kinyarwanda level"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-b-2 border-dark-blue-900 pb-2 hover:border-golden-500 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-dark-blue-900 flex items-center">
              <span className="mr-2">⚡</span> Skills & Expertise
            </h3>
            <p className="text-sm text-gray-600 mt-1">Share your professional skills and areas of expertise</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Leadership & Management',
              'Teaching & Training',
              'Community Organizing',
              'Project Management',
              'Communication & Public Speaking',
              'Cultural Arts & Performance',
              'Technical Skills (IT/Software)',
              'Research & Analysis',
              'Fundraising & Resource Mobilization',
              'Event Planning & Coordination',
              'Counseling & Mentoring',
              'Administrative Skills'
            ].map((skill) => (
              <label key={skill} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-golden/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.skills.includes(skill)}
                  onChange={(e) => handleCheckboxChange('skills', skill, e.target.checked)}
                  className="rounded border-gray-300 text-golden focus:ring-golden"
                />
                <span className="text-clear-gray text-sm">{skill}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-b-2 border-dark-blue-900 pb-2 hover:border-golden-500 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-dark-blue-900 flex items-center">
              <span className="mr-2">💡</span> Areas of Interest
            </h3>
            <p className="text-sm text-gray-600 mt-1">Select the BENIRAGE programs and activities that interest you most</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Spiritual Development & Meditation',
              'Cultural Heritage & Traditions',
              'Philosophy & Wisdom Teachings',
              'Community Service & Outreach',
              'Youth Development Programs',
              'Health & Wellness Initiatives'
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
          <label className="block text-sm font-medium text-dark-blue-900 mb-3">
            Reference Information
          </label>
          <p className="text-sm text-gray-600 mb-4">Please provide contact information for 1-2 references who can speak to your character and commitment.</p>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-dark-blue-900 mb-3">Reference 1</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Full Name"
                  type="text"
                  value={formData.reference1Name || ''}
                  onChange={(value) => handleInputChange('reference1Name', value)}
                  placeholder="Reference full name"
                />
                <FormField
                  label="Contact (Phone/Email)"
                  type="text"
                  value={formData.reference1Contact || ''}
                  onChange={(value) => handleInputChange('reference1Contact', value)}
                  placeholder="Phone or email"
                />
                <FormField
                  label="Relationship"
                  type="text"
                  value={formData.reference1Relationship || ''}
                  onChange={(value) => handleInputChange('reference1Relationship', value)}
                  placeholder="How do you know them?"
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-dark-blue-900 mb-3">Reference 2 (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Full Name"
                  type="text"
                  value={formData.reference2Name || ''}
                  onChange={(value) => handleInputChange('reference2Name', value)}
                  placeholder="Reference full name (optional)"
                />
                <FormField
                  label="Contact (Phone/Email)"
                  type="text"
                  value={formData.reference2Contact || ''}
                  onChange={(value) => handleInputChange('reference2Contact', value)}
                  placeholder="Phone or email (optional)"
                />
                <FormField
                  label="Relationship"
                  type="text"
                  value={formData.reference2Relationship || ''}
                  onChange={(value) => handleInputChange('reference2Relationship', value)}
                  placeholder="How do you know them? (optional)"
                />
              </div>
            </div>
          </div>
        </div>

        <FormField
          label="Why do you want to join BENIRAGE?"
          type="textarea"
          value={formData.whyJoin || ''}
          onChange={(value) => handleInputChange('whyJoin', value)}
          placeholder="Share your motivation for joining our community..."
          required
          rows={4}
          error={errors.whyJoin}
        />

        <FormField
          label="Membership Category"
          type="select"
          value={formData.membershipCategory || ''}
          onChange={(value) => handleInputChange('membershipCategory', value)}
          options={[
            'Active Member - Regular participation',
            'Supporting Member - Financial support',
            'Youth Member - Under 25 years old',
            'Senior Member - Over 60 years old'
          ]}
          placeholder="Select membership type"
        />

        <div className="space-y-4">
          <FormField
            label="I consent to BENIRAGE collecting and processing my personal information for membership purposes."
            type="checkbox"
            value={formData.dataConsent}
            onChange={(value) => handleInputChange('dataConsent', value)}
            required
            error={errors.dataConsent}
          />

          <FormField
            label="I agree to abide by BENIRAGE's terms and conditions and community guidelines."
            type="checkbox"
            value={formData.termsAccepted}
            onChange={(value) => handleInputChange('termsAccepted', value)}
            required
            error={errors.termsAccepted}
          />

          <FormField
            label="I agree to follow BENIRAGE's Code of Conduct and uphold the organization's values and principles."
            type="checkbox"
            value={formData.codeOfConductAccepted}
            onChange={(value) => handleInputChange('codeOfConductAccepted', value)}
            required
          />

          <FormField
            label="I consent to receive communications from BENIRAGE about events, programs, and community updates."
            type="checkbox"
            value={formData.communicationConsent}
            onChange={(value) => handleInputChange('communicationConsent', value)}
          />
        </div>
        </div>

        {/* Footer */}
        <div className="footer-section">
          <div className="text-center pt-6 border-t border-dark-blue-900">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
              <Button
                type="button"
                size="lg"
                onClick={handleGeneratePDF}
                disabled={isGeneratingPDF}
                className="min-w-[200px] bg-gradient-to-r from-dark-blue-900 to-dark-blue-700 hover:from-dark-blue-800 hover:to-dark-blue-600 text-golden-500 hover:text-golden-400 transition-all duration-200"
              >
                {isGeneratingPDF ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 border-2 border-golden-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating PDF...</span>
                  </div>
                ) : (
                  '📄 Generate PDF'
                )}
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="min-w-[200px] bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-400 hover:to-golden-500 text-dark-blue-900 font-bold transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-dark-blue-900 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2 text-dark-blue-900">Loading...</span>
                    </div>
                    <span>Submitting Application...</span>
                  </div>
                ) : (
                  '✨ Submit Membership Application'
                )}
              </Button>
            </div>
            <div className="flex items-center justify-center space-x-4 text-sm text-dark-blue-900">
              <img src="/benirage.png" alt="BENIRAGE Logo" className="w-8 h-8" />
              <span>© 2025 BENIRAGE. All rights reserved.</span>
              <span className="text-golden-500">• Contact • Support • Privacy</span>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default MembershipForm;