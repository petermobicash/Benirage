import React, { useState } from 'react';
import { submitPartnershipApplication } from '../lib/supabase';
import { Building, Handshake, Users, Target, Shield } from 'lucide-react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

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

const Partnership = () => {
  const [formData, setFormData] = useState({
    // Organization Information
    organizationName: '',
    organizationType: '',
    organizationSize: '',
    foundedYear: '',
    registrationNumber: '',
    website: '',
    
    // Contact Person
    contactPerson: '',
    title: '',
    email: '',
    phone: '',
    alternateContact: '',
    alternateEmail: '',
    
    // Location & Scope
    headquarters: '',
    operatingCountries: [] as string[],
    location: '',
    
    // Organization Details
    description: '',
    mission: '',
    currentPrograms: '',
    targetBeneficiaries: '',
    annualBudget: '',
    
    // Partnership Details
    partnershipType: [] as string[],
    otherPartnershipType: '',
    resources: [] as string[],
    otherResources: '',
    
    // Collaboration Goals
    goals: '',
    timeline: '',
    expectedOutcomes: '',
    successMetrics: '',
    
    // Experience & Capacity
    previousPartnerships: '',
    organizationalCapacity: '',
    referencesInfo: '',
    
    // Financial & Legal
    financialContribution: '',
    legalRequirements: '',
    
    // Expectations & Commitments
    expectations: '',
    commitments: '',
    
    // Agreements
    dataConsent: false,
    termsAccepted: false,
    dueDiligenceConsent: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const handleInputChange = (field: string, value: unknown) => {
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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.organizationName && formData.organizationType && formData.contactPerson && formData.email && formData.phone);
      case 2:
        return !!(formData.description && formData.mission);
      case 3:
        return !!(formData.partnershipType.length > 0 && formData.goals);
      case 4:
        return !!(formData.timeline && formData.expectedOutcomes);
      case 5:
        return !!(formData.dataConsent && formData.termsAccepted && formData.dueDiligenceConsent);
      default:
        return true;
    }
  };

  const getStepValidationErrors = (step: number): string[] => {
    const errors: string[] = [];
    switch (step) {
      case 1:
        if (!formData.organizationName) errors.push('Organization name is required');
        if (!formData.organizationType) errors.push('Organization type is required');
        if (!formData.contactPerson) errors.push('Contact person name is required');
        if (!formData.email) errors.push('Email address is required');
        if (!formData.phone) errors.push('Phone number is required');
        break;
      case 2:
        if (!formData.description) errors.push('Organization description is required');
        if (!formData.mission) errors.push('Mission statement is required');
        break;
      case 3:
        if (formData.partnershipType.length === 0) errors.push('At least one partnership type must be selected');
        if (!formData.goals) errors.push('Partnership goals are required');
        break;
      case 4:
        if (!formData.timeline) errors.push('Timeline is required');
        if (!formData.expectedOutcomes) errors.push('Expected outcomes are required');
        break;
      case 5:
        if (!formData.dataConsent) errors.push('Data consent agreement is required');
        if (!formData.termsAccepted) errors.push('Terms acceptance is required');
        if (!formData.dueDiligenceConsent) errors.push('Due diligence consent is required');
        break;
    }
    return errors;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      const errors = getStepValidationErrors(currentStep);
      alert(`Please complete the following required fields:\n\n${errors.join('\n')}`);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(5)) {
      const errors = getStepValidationErrors(5);
      alert(`Please complete the following before submitting:\n\n${errors.join('\n')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitize text inputs before submission
      const sanitizedData = {
        organizationName: sanitizeInput(formData.organizationName),
        organizationType: formData.organizationType || null,
        organizationSize: formData.organizationSize || null,
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : null,
        registrationNumber: sanitizeInput(formData.registrationNumber),
        website: sanitizeInput(formData.website),
        contactPerson: sanitizeInput(formData.contactPerson),
        title: sanitizeInput(formData.title),
        email: formData.email.toLowerCase().trim(), // Normalize email
        phone: sanitizeInput(formData.phone),
        alternateContact: sanitizeInput(formData.alternateContact),
        alternateEmail: formData.alternateEmail ? formData.alternateEmail.toLowerCase().trim() : null,
        headquarters: sanitizeInput(formData.headquarters),
        location: sanitizeInput(formData.location),
        description: sanitizeInput(formData.description),
        mission: sanitizeInput(formData.mission),
        currentPrograms: sanitizeInput(formData.currentPrograms),
        targetBeneficiaries: sanitizeInput(formData.targetBeneficiaries),
        annualBudget: formData.annualBudget || null,
        otherPartnershipType: sanitizeInput(formData.otherPartnershipType),
        otherResources: sanitizeInput(formData.otherResources),
        goals: sanitizeInput(formData.goals),
        timeline: formData.timeline || null,
        expectedOutcomes: sanitizeInput(formData.expectedOutcomes),
        successMetrics: sanitizeInput(formData.successMetrics),
        previousPartnerships: sanitizeInput(formData.previousPartnerships),
        organizationalCapacity: sanitizeInput(formData.organizationalCapacity),
        financialContribution: formData.financialContribution || null,
        legalRequirements: sanitizeInput(formData.legalRequirements),
        expectations: sanitizeInput(formData.expectations),
        commitments: sanitizeInput(formData.commitments)
      };

      const result = await submitPartnershipApplication({
        organization_name: sanitizedData.organizationName,
        organization_type: sanitizedData.organizationType,
        organization_size: sanitizedData.organizationSize,
        founded_year: sanitizedData.foundedYear,
        registration_number: sanitizedData.registrationNumber,
        website: sanitizedData.website,
        contact_person: sanitizedData.contactPerson,
        title: sanitizedData.title,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        alternate_contact: sanitizedData.alternateContact,
        alternate_email: sanitizedData.alternateEmail,
        headquarters: sanitizedData.headquarters,
        operating_countries: formData.operatingCountries,
        location: sanitizedData.location,
        description: sanitizedData.description,
        mission: sanitizedData.mission,
        current_programs: sanitizedData.currentPrograms,
        target_beneficiaries: sanitizedData.targetBeneficiaries,
        annual_budget: sanitizedData.annualBudget,
        partnership_type: formData.partnershipType,
        other_partnership_type: sanitizedData.otherPartnershipType,
        resources: formData.resources,
        other_resources: sanitizedData.otherResources,
        goals: sanitizedData.goals,
        timeline: sanitizedData.timeline,
        expected_outcomes: sanitizedData.expectedOutcomes,
        success_metrics: sanitizedData.successMetrics,
        previous_partnerships: sanitizedData.previousPartnerships,
        organizational_capacity: sanitizedData.organizationalCapacity,
        financial_contribution: sanitizedData.financialContribution,
        legal_requirements: sanitizedData.legalRequirements,
        expectations: sanitizedData.expectations,
        commitments: sanitizedData.commitments,
        data_consent: formData.dataConsent,
        terms_accepted: formData.termsAccepted,
        due_diligence_consent: formData.dueDiligenceConsent,
        status: 'pending'
      });
      
      if (result.success) {
        alert('Thank you for your interest in partnering with BENIRAGE! Your partnership proposal has been submitted successfully. Our partnerships team will review your application and contact you within 7-10 business days to discuss collaboration opportunities.');
        
        // Reset form
        setFormData({
          organizationName: '',
          organizationType: '',
          organizationSize: '',
          foundedYear: '',
          registrationNumber: '',
          website: '',
          contactPerson: '',
          title: '',
          email: '',
          phone: '',
          alternateContact: '',
          alternateEmail: '',
          headquarters: '',
          operatingCountries: [],
          location: '',
          description: '',
          mission: '',
          currentPrograms: '',
          targetBeneficiaries: '',
          annualBudget: '',
          partnershipType: [],
          otherPartnershipType: '',
          resources: [],
          otherResources: '',
          goals: '',
          timeline: '',
          expectedOutcomes: '',
          successMetrics: '',
          previousPartnerships: '',
          organizationalCapacity: '',
          referencesInfo: '',
          financialContribution: '',
          legalRequirements: '',
          expectations: '',
          commitments: '',
          dataConsent: false,
          termsAccepted: false,
          dueDiligenceConsent: false
        });
        setCurrentStep(1);
      } else {
        throw new Error('Submission failed');
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your application. Please try again.');
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
                🏢 Organization Information
              </h3>
              <p className="text-clear-gray">Tell us about your organization</p>
            </div>

            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-dark-blue mb-2">
                Organization Name *
              </label>
              <input
                type="text"
                id="organizationName"
                required
                value={formData.organizationName}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                placeholder="Your organization's full legal name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="organizationType" className="block text-sm font-medium text-dark-blue mb-2">
                  Organization Type *
                </label>
                <select
                  id="organizationType"
                  required
                  value={formData.organizationType}
                  onChange={(e) => handleInputChange('organizationType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                >
                  <option value="">Select organization type</option>
                  <option value="ngo">NGO/Non-profit Organization</option>
                  <option value="school">School/Educational Institution</option>
                  <option value="university">University/Research Institution</option>
                  <option value="religious">Religious Organization</option>
                  <option value="cultural">Cultural Institution/Museum</option>
                  <option value="government">Government Agency</option>
                  <option value="private">Private Company</option>
                  <option value="foundation">Foundation/Trust</option>
                  <option value="international">International Organization</option>
                  <option value="community">Community-Based Organization</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="organizationSize" className="block text-sm font-medium text-dark-blue mb-2">
                  Organization Size
                </label>
                <select
                  id="organizationSize"
                  value={formData.organizationSize}
                  onChange={(e) => handleInputChange('organizationSize', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                >
                  <option value="">Select size</option>
                  <option value="micro">Micro (1-10 people)</option>
                  <option value="small">Small (11-50 people)</option>
                  <option value="medium">Medium (51-250 people)</option>
                  <option value="large">Large (251-1000 people)</option>
                  <option value="enterprise">Enterprise (1000+ people)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="foundedYear" className="block text-sm font-medium text-dark-blue mb-2">
                  Founded Year
                </label>
                <input
                  type="number"
                  id="foundedYear"
                  value={formData.foundedYear}
                  onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="e.g., 2020"
                  min="1900"
                  max="2025"
                />
              </div>
              <div>
                <label htmlFor="registrationNumber" className="block text-sm font-medium text-dark-blue mb-2">
                  Registration Number
                </label>
                <input
                  type="text"
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="Official registration number"
                />
              </div>
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-dark-blue mb-2">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="https://your-website.com"
                />
              </div>
            </div>

            {/* Primary Contact */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-display text-lg font-semibold text-dark-blue mb-4">
                Primary Contact Person
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contactPerson" className="block text-sm font-medium text-dark-blue mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="contactPerson"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                    placeholder="Contact person's full name"
                  />
                </div>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-dark-blue mb-2">
                    Title/Position
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                    placeholder="e.g., Director, Manager, Coordinator"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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
                    placeholder="contact@organization.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-dark-blue mb-2">
                    Phone Number *
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label htmlFor="alternateContact" className="block text-sm font-medium text-dark-blue mb-2">
                    Alternate Contact (Optional)
                  </label>
                  <input
                    type="text"
                    id="alternateContact"
                    value={formData.alternateContact}
                    onChange={(e) => handleInputChange('alternateContact', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                    placeholder="Backup contact person"
                  />
                </div>
                <div>
                  <label htmlFor="alternateEmail" className="block text-sm font-medium text-dark-blue mb-2">
                    Alternate Email (Optional)
                  </label>
                  <input
                    type="email"
                    id="alternateEmail"
                    value={formData.alternateEmail}
                    onChange={(e) => handleInputChange('alternateEmail', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                    placeholder="backup@organization.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-dark-blue mb-2">
                  Primary Location/Office
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="City, Country where your main office is located"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl font-semibold text-dark-blue mb-4">
                🌍 Organization Profile
              </h3>
              <p className="text-clear-gray">Help us understand your organization better</p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-dark-blue mb-2">
                Organization Description *
              </label>
              <textarea
                id="description"
                rows={4}
                required
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-none"
                placeholder="Provide a comprehensive description of your organization's activities, focus areas, and impact..."
              />
            </div>

            <div>
              <label htmlFor="mission" className="block text-sm font-medium text-dark-blue mb-2">
                Mission Statement *
              </label>
              <textarea
                id="mission"
                rows={3}
                required
                value={formData.mission}
                onChange={(e) => handleInputChange('mission', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-none"
                placeholder="Your organization's mission and core values..."
              />
            </div>

            <div>
              <label htmlFor="currentPrograms" className="block text-sm font-medium text-dark-blue mb-2">
                Current Programs & Initiatives
              </label>
              <textarea
                id="currentPrograms"
                rows={4}
                value={formData.currentPrograms}
                onChange={(e) => handleInputChange('currentPrograms', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-none"
                placeholder="Describe your current programs, projects, and initiatives..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="targetBeneficiaries" className="block text-sm font-medium text-dark-blue mb-2">
                  Target Beneficiaries
                </label>
                <input
                  type="text"
                  id="targetBeneficiaries"
                  value={formData.targetBeneficiaries}
                  onChange={(e) => handleInputChange('targetBeneficiaries', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="e.g., Youth, Women, Rural Communities"
                />
              </div>
              <div>
                <label htmlFor="annualBudget" className="block text-sm font-medium text-dark-blue mb-2">
                  Annual Budget Range
                </label>
                <select
                  id="annualBudget"
                  value={formData.annualBudget}
                  onChange={(e) => handleInputChange('annualBudget', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                >
                  <option value="">Select budget range</option>
                  <option value="under-10k">Under $10,000</option>
                  <option value="10k-50k">$10,000 - $50,000</option>
                  <option value="50k-100k">$50,000 - $100,000</option>
                  <option value="100k-500k">$100,000 - $500,000</option>
                  <option value="500k-1m">$500,000 - $1,000,000</option>
                  <option value="over-1m">Over $1,000,000</option>
                  <option value="confidential">Confidential</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="headquarters" className="block text-sm font-medium text-dark-blue mb-2">
                Headquarters Location
              </label>
              <input
                type="text"
                id="headquarters"
                value={formData.headquarters}
                onChange={(e) => handleInputChange('headquarters', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label id="countries-label" className="block text-sm font-medium text-dark-blue mb-3">
                Countries of Operation (select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3" role="group" aria-labelledby="countries-label">
                {[
                  '🇷🇼 Rwanda',
                  '🇧🇮 Burundi',
                  '🇺🇬 Uganda',
                  '🇰🇪 Kenya',
                  '🇹🇿 Tanzania',
                  '🇨🇩 DRC',
                  '🇺🇸 United States',
                  '🇨🇦 Canada',
                  '🇬🇧 United Kingdom',
                  '🇫🇷 France',
                  '🇧🇪 Belgium',
                  '🌍 Other African Countries',
                  '🌎 Other Countries'
                ].map((country) => (
                  <label key={country} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.operatingCountries.includes(country)}
                      onChange={(e) => handleCheckboxChange('operatingCountries', country, e.target.checked)}
                      className="rounded border-gray-300 text-golden focus:ring-golden"
                      aria-describedby={`country-${country.replace(/\s+/g, '-').toLowerCase()}`}
                    />
                    <span className="text-sm text-clear-gray" id={`country-${country.replace(/\s+/g, '-').toLowerCase()}`}>
                      {country}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl font-semibold text-dark-blue mb-4">
                🤝 Partnership Details
              </h3>
              <p className="text-clear-gray">What type of partnership are you seeking?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-blue mb-3">
                Type of Partnership (select all that apply) *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Educational Programs & Curriculum Development',
                  'Cultural Events & Festivals',
                  'Research Collaboration & Studies',
                  'Resource Sharing & Exchange',
                  'Joint Fundraising Initiatives',
                  'Community Outreach Programs',
                  'Spiritual & Wellness Programs',
                  'Youth Development & Mentorship',
                  'Technology & Digital Innovation',
                  'Media & Communications',
                  'Capacity Building & Training',
                  'Policy Advocacy & Development',
                  'International Exchange Programs',
                  'Emergency Response & Relief'
                ].map((type) => (
                  <label key={type} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-golden/10 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.partnershipType.includes(type)}
                      onChange={(e) => handleCheckboxChange('partnershipType', type, e.target.checked)}
                      className="rounded border-gray-300 text-golden focus:ring-golden" 
                    />
                    <span className="text-clear-gray text-sm">{type}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Other partnership types not listed above..."
                  value={formData.otherPartnershipType}
                  onChange={(e) => handleInputChange('otherPartnershipType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-blue mb-3">
                Resources You Can Contribute (select all that apply)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Financial Funding',
                  'Venue/Meeting Spaces',
                  'Equipment & Technology',
                  'Professional Expertise',
                  'Volunteer Staff',
                  'Marketing & Promotion',
                  'Network Access & Connections',
                  'Training & Capacity Building',
                  'Educational Materials',
                  'Research Capabilities',
                  'Translation Services',
                  'Legal Support',
                  'Media Production',
                  'Transportation',
                  'Catering Services',
                  'Administrative Support'
                ].map((resource) => (
                  <label key={resource} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-golden/10 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.resources.includes(resource)}
                      onChange={(e) => handleCheckboxChange('resources', resource, e.target.checked)}
                      className="rounded border-gray-300 text-golden focus:ring-golden" 
                    />
                    <span className="text-clear-gray text-sm">{resource}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Other resources you can contribute..."
                  value={formData.otherResources}
                  onChange={(e) => handleInputChange('otherResources', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="goals" className="block text-sm font-medium text-dark-blue mb-2">
                Partnership Goals & Objectives *
              </label>
              <textarea
                id="goals"
                rows={5}
                required
                value={formData.goals}
                onChange={(e) => handleInputChange('goals', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-none"
                placeholder="What do you hope to achieve through this partnership? What are your specific goals and how do they align with BENIRAGE's mission?"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl font-semibold text-dark-blue mb-4">
                📊 Implementation & Expectations
              </h3>
              <p className="text-clear-gray">Let's plan the partnership details</p>
            </div>

            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-dark-blue mb-2">
                Proposed Timeline *
              </label>
              <select
                id="timeline"
                required
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
              >
                <option value="">Select timeline</option>
                <option value="immediate">Immediate (within 1 month)</option>
                <option value="short-term">Short-term (1-6 months)</option>
                <option value="medium-term">Medium-term (6-12 months)</option>
                <option value="long-term">Long-term (1-3 years)</option>
                <option value="ongoing">Ongoing partnership (3+ years)</option>
                <option value="project-specific">Project-specific duration</option>
              </select>
            </div>

            <div>
              <label htmlFor="expectedOutcomes" className="block text-sm font-medium text-dark-blue mb-2">
                Expected Outcomes & Impact *
              </label>
              <textarea
                id="expectedOutcomes"
                rows={4}
                required
                value={formData.expectedOutcomes}
                onChange={(e) => handleInputChange('expectedOutcomes', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-none"
                placeholder="What specific outcomes do you expect from this partnership? How will success be measured?"
              />
            </div>

            <div>
              <label htmlFor="successMetrics" className="block text-sm font-medium text-dark-blue mb-2">
                Success Metrics & KPIs
              </label>
              <textarea
                id="successMetrics"
                rows={3}
                value={formData.successMetrics}
                onChange={(e) => handleInputChange('successMetrics', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-none"
                placeholder="How will you measure the success of this partnership? What key performance indicators will you track?"
              />
            </div>

            <div>
              <label htmlFor="previousPartnerships" className="block text-sm font-medium text-dark-blue mb-2">
                Previous Partnership Experience
              </label>
              <textarea
                id="previousPartnerships"
                rows={4}
                value={formData.previousPartnerships}
                onChange={(e) => handleInputChange('previousPartnerships', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-none"
                placeholder="Describe any relevant partnership experience, including successful collaborations and lessons learned..."
              />
            </div>

            <div>
              <label htmlFor="organizationalCapacity" className="block text-sm font-medium text-dark-blue mb-2">
                Organizational Capacity
              </label>
              <textarea
                id="organizationalCapacity"
                rows={3}
                value={formData.organizationalCapacity}
                onChange={(e) => handleInputChange('organizationalCapacity', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-none"
                placeholder="Describe your organization's capacity to implement partnership activities (staff, resources, infrastructure)..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="financialContribution" className="block text-sm font-medium text-dark-blue mb-2">
                  Financial Contribution Capacity
                </label>
                <select
                  id="financialContribution"
                  value={formData.financialContribution}
                  onChange={(e) => handleInputChange('financialContribution', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                >
                  <option value="">Select contribution level</option>
                  <option value="no-financial">No financial contribution</option>
                  <option value="small">Small ($1,000 - $5,000)</option>
                  <option value="medium">Medium ($5,000 - $25,000)</option>
                  <option value="large">Large ($25,000 - $100,000)</option>
                  <option value="major">Major ($100,000+)</option>
                  <option value="in-kind">In-kind contributions only</option>
                  <option value="to-discuss">To be discussed</option>
                </select>
              </div>
              <div>
                <label htmlFor="legalRequirements" className="block text-sm font-medium text-dark-blue mb-2">
                  Legal/Compliance Requirements
                </label>
                <input
                  type="text"
                  id="legalRequirements"
                  value={formData.legalRequirements}
                  onChange={(e) => handleInputChange('legalRequirements', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="Any legal requirements for partnership"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl font-semibold text-dark-blue mb-4">
                📋 Expectations & Agreements
              </h3>
              <p className="text-clear-gray">Final details and consent</p>
            </div>

            <div>
              <label htmlFor="expectations" className="block text-sm font-medium text-dark-blue mb-2">
                Expectations from BENIRAGE
              </label>
              <textarea
                id="expectations"
                rows={4}
                value={formData.expectations}
                onChange={(e) => handleInputChange('expectations', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-none"
                placeholder="What do you expect from BENIRAGE in this partnership? What support or contributions do you need from us?"
              />
            </div>

            <div>
              <label htmlFor="commitments" className="block text-sm font-medium text-dark-blue mb-2">
                Your Organization's Commitments
              </label>
              <textarea
                id="commitments"
                rows={4}
                value={formData.commitments}
                onChange={(e) => handleInputChange('commitments', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-none"
                placeholder="What specific commitments can your organization make to ensure partnership success?"
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-display text-lg font-semibold text-dark-blue">
                Partnership Agreements
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
                  <strong>Data Privacy & Information Sharing *</strong><br />
                  I consent to BENIRAGE collecting and processing our organization's information for partnership evaluation. I understand that sensitive information will be handled confidentially and in accordance with applicable data protection laws.
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
                  <strong>Partnership Terms & Conditions *</strong><br />
                  I confirm that our organization is committed to exploring a meaningful partnership with BENIRAGE based on mutual respect, shared values, and complementary goals. We agree to engage in good faith negotiations and maintain confidentiality during discussions.
                </span>
              </label>

              <label className="flex items-start space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <input 
                  type="checkbox" 
                  required
                  checked={formData.dueDiligenceConsent}
                  onChange={(e) => handleInputChange('dueDiligenceConsent', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-golden focus:ring-golden" 
                />
                <span className="text-sm text-dark-blue">
                  <strong>Due Diligence & Verification *</strong><br />
                  I consent to BENIRAGE conducting due diligence on our organization, including verification of registration status, financial standing, and reputation. I understand this is standard practice for establishing partnerships.
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
          <div className="text-6xl mb-6">🤝</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Partner With Us
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Collaborate with schools, NGOs, religious centers, and cultural institutions
          </p>
        </div>
      </Section>

      {/* Partnership Types */}
      <Section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-900 mb-8">
            Partnership Opportunities
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">
                Educational Partnerships
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Collaborate with schools and universities on cultural education and research programs
              </p>
            </Card>

            <Card className="text-center hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Handshake className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">
                Community Partnerships
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Work with NGOs, religious centers, and community organizations on shared initiatives
              </p>
            </Card>

            <Card className="text-center hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">
                Strategic Alliances
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Form long-term partnerships for cultural preservation and spiritual development
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* Partnership Application Form */}
      <Section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Partnership Application
            </h2>
            <p className="text-lg text-gray-700">
              Let's explore how we can work together to achieve our shared goals
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
                  className="progress-bar-fill h-2 rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${(currentStep / totalSteps) * 100}%`,
                    background: 'linear-gradient(to right, #f59e0b, #fbbf24)'
                  }}
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
                    <Button type="submit" icon={Building} disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting Proposal...' : 'Submit Partnership Proposal'}
                    </Button>
                  )}
                </div>
              </div>
            </form>

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Confidential Partnership Process</span>
              </div>
              <p className="text-sm text-green-700">
                All partnership discussions are conducted with strict confidentiality. We respect your organization's sensitive information and maintain professional standards throughout the evaluation process.
              </p>
            </div>
          </Card>
        </div>
      </Section>

      {/* Call to Action */}
      <Section className="py-20 bg-blue-900 text-blue-900">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Transform Communities Together
          </h2>
          <p className="text-xl text-blue-900/90 mb-12 max-w-3xl mx-auto">
            Join our network of partners making a meaningful difference in spiritual and cultural development
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button variant="secondary" size="lg" className="text-white border-white hover:bg-white hover:text-blue-900">
              Explore Partnership Types
            </Button>
            <Button variant="secondary" size="lg" className="text-white border-white hover:bg-white hover:text-blue-900">
              Contact Partnership Team
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Partnership;