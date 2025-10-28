import React, { useState } from 'react';
import { submitVolunteerApplication } from '../lib/supabase';
import { Users, Heart, Shield } from 'lucide-react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { NATIONALITIES } from '../utils/nationalities';

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

const Volunteer = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    dateOfBirth: '',
    gender: '',
    
    // Program Interests
    programInterests: [] as string[],
    otherInterests: '',
    
    // Identity & Legal
    nationality: '',
    idNumber: '',
    passportNumber: '',
    workPermit: '',
    address: '',
    
    // Emergency Contact
    emergencyContact: '',
    emergencyPhone: '',
    
    // Background
    education: '',
    occupation: '',
    experience: '',
    
    // Languages
    languages: [] as string[],
    otherLanguages: '',
    
    // Health Information
    healthConditions: '',
    medications: '',
    
    // References
    referenceInfo: '',
    
    // Availability
    availability: [] as string[],
    startDate: '',
    duration: '',
    hoursPerWeek: '',
    
    // Skills
    skills: [] as string[],
    otherSkills: '',
    
    // Agreements
    backgroundCheck: false,
    agreement: false,
    dataConsent: false,
    contractType: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (field: string, value: any) => {
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
        return !!(formData.firstName && formData.lastName && formData.email && formData.phone);
      case 2:
        return !!(formData.programInterests.length > 0);
      case 3:
        // Optional step - no required fields since detailed info isn't saved to DB yet
        return true;
      case 4:
        // Optional step - no required fields since detailed info isn't saved to DB yet
        return true;
      case 5:
        return !!(formData.availability.length > 0);
      case 6:
        return !!(formData.agreement && formData.dataConsent);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      alert('Please fill in all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(6)) {
      alert('Please complete all required fields and accept the agreements.');
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
        location: sanitizeInput(formData.location),
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        otherInterests: sanitizeInput(formData.otherInterests),
        nationality: sanitizeInput(formData.nationality),
        idNumber: sanitizeInput(formData.idNumber),
        passportNumber: sanitizeInput(formData.passportNumber),
        workPermit: formData.workPermit || null,
        address: sanitizeInput(formData.address),
        emergencyContact: sanitizeInput(formData.emergencyContact),
        emergencyPhone: sanitizeInput(formData.emergencyPhone),
        education: formData.education || null,
        occupation: sanitizeInput(formData.occupation),
        experience: sanitizeInput(formData.experience),
        otherLanguages: sanitizeInput(formData.otherLanguages),
        healthConditions: sanitizeInput(formData.healthConditions),
        medications: sanitizeInput(formData.medications),
        referenceInfo: sanitizeInput(formData.referenceInfo),
        startDate: formData.startDate || null,
        duration: formData.duration || null,
        hoursPerWeek: formData.hoursPerWeek || null,
        otherSkills: sanitizeInput(formData.otherSkills),
        contractType: formData.contractType || null
      };

      const result = await submitVolunteerApplication({
        first_name: sanitizedData.firstName,
        last_name: sanitizedData.lastName,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        location: sanitizedData.location,
        date_of_birth: sanitizedData.dateOfBirth,
        gender: sanitizedData.gender,
        program_interests: formData.programInterests,
        other_interests: sanitizedData.otherInterests,
        nationality: sanitizedData.nationality,
        id_number: sanitizedData.idNumber,
        passport_number: sanitizedData.passportNumber,
        work_permit: sanitizedData.workPermit,
        address: sanitizedData.address,
        emergency_contact: sanitizedData.emergencyContact,
        emergency_phone: sanitizedData.emergencyPhone,
        education: sanitizedData.education,
        occupation: sanitizedData.occupation,
        experience: sanitizedData.experience,
        languages: formData.languages,
        other_languages: sanitizedData.otherLanguages,
        health_conditions: sanitizedData.healthConditions,
        medications: sanitizedData.medications,
        reference_info: sanitizedData.referenceInfo,
        availability: formData.availability,
        start_date: sanitizedData.startDate,
        duration: sanitizedData.duration,
        hours_per_week: sanitizedData.hoursPerWeek,
        skills: formData.skills,
        other_skills: sanitizedData.otherSkills,
        background_check: formData.backgroundCheck,
        agreement: formData.agreement,
        data_consent: formData.dataConsent,
        contract_type: sanitizedData.contractType,
        status: 'pending'
      });
      
      if (result.success) {
        alert('Thank you for your interest in volunteering with BENIRAGE! Your application has been submitted successfully. We will review your application and contact you within 3-5 business days.');
        
        // Reset form
        setFormData({
          firstName: '', lastName: '', email: '', phone: '', location: '', dateOfBirth: '',
          gender: '', programInterests: [], otherInterests: '', nationality: '', idNumber: '',
          passportNumber: '', workPermit: '', address: '', emergencyContact: '', emergencyPhone: '',
          education: '', occupation: '', experience: '', languages: [], otherLanguages: '',
          healthConditions: '', medications: '', referenceInfo: '', availability: [],
          startDate: '', duration: '', hoursPerWeek: '', skills: [], otherSkills: '',
          backgroundCheck: false, agreement: false, dataConsent: false, contractType: ''
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
                <label htmlFor="location" className="block text-sm font-medium text-dark-blue mb-2">
                  Current Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="City, Country"
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
                🎯 Program Interests
              </h3>
              <p className="text-clear-gray">Which BENIRAGE programs interest you most?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-blue mb-3">
                Program Areas (select all that apply) *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Spiritual Guidance & Retreats',
                  'Cultural Heritage Preservation',
                  'Youth Philosophy Programs',
                  'Community Health Initiatives',
                  'Educational Workshops & Training',
                  'Event Organization & Management',
                  'Media & Communications',
                  'Research & Documentation',
                  'Arts & Creative Expression',
                  'Environmental Conservation',
                  'Social Justice & Advocacy',
                  'Interfaith Dialogue & Unity'
                ].map((interest) => (
                  <label key={interest} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-golden/10 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.programInterests.includes(interest)}
                      onChange={(e) => handleCheckboxChange('programInterests', interest, e.target.checked)}
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
              <textarea
                id="otherInterests"
                rows={3}
                value={formData.otherInterests}
                onChange={(e) => handleInputChange('otherInterests', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-none"
                placeholder="Describe any other areas of interest or specific programs you'd like to contribute to..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl font-semibold text-dark-blue mb-4">
                🆔 Identity & Legal Information
              </h3>
              <p className="text-clear-gray">Help us verify your identity and legal status</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nationality" className="block text-sm font-medium text-dark-blue mb-2">
                  Nationality *
                </label>
                <select
                  id="nationality"
                  required
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
                <label htmlFor="idNumber" className="block text-sm font-medium text-dark-blue mb-2">
                  National ID Number
                </label>
                <input
                  type="text"
                  id="idNumber"
                  value={formData.idNumber}
                  onChange={(e) => handleInputChange('idNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="Your national ID number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="passportNumber" className="block text-sm font-medium text-dark-blue mb-2">
                  Passport Number (if applicable)
                </label>
                <input
                  type="text"
                  id="passportNumber"
                  value={formData.passportNumber}
                  onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="Passport number for international volunteers"
                />
              </div>
              <div>
                <label htmlFor="workPermit" className="block text-sm font-medium text-dark-blue mb-2">
                  Work Permit Status
                </label>
                <select
                  id="workPermit"
                  value={formData.workPermit}
                  onChange={(e) => handleInputChange('workPermit', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                >
                  <option value="">Select status</option>
                  <option value="citizen">Citizen</option>
                  <option value="permanent-resident">Permanent Resident</option>
                  <option value="work-permit">Work Permit Holder</option>
                  <option value="student-visa">Student Visa</option>
                  <option value="tourist-visa">Tourist Visa</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-dark-blue mb-2">
                Full Address *
              </label>
              <textarea
                id="address"
                rows={3}
                required
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-none"
                placeholder="Your complete address including street, city, district, and country..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="emergencyContact" className="block text-sm font-medium text-dark-blue mb-2">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="Full name of emergency contact"
                />
              </div>
              <div>
                <label htmlFor="emergencyPhone" className="block text-sm font-medium text-dark-blue mb-2">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  placeholder="+250 ... or country code"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl font-semibold text-dark-blue mb-4">
                🎓 Background & Experience
              </h3>
              <p className="text-clear-gray">Tell us about your education and experience</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-dark-blue mb-2">
                  Current Occupation *
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
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-dark-blue mb-2">
                Relevant Experience
              </label>
              <textarea
                id="experience"
                rows={4}
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-none"
                placeholder="Describe any relevant volunteer experience, skills, or background that would help in your volunteer role..."
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
                  'Arabic',
                  'Spanish',
                  'German',
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

            <div>
              <label htmlFor="otherLanguages" className="block text-sm font-medium text-dark-blue mb-2">
                Other Languages & Proficiency Levels
              </label>
              <textarea
                id="otherLanguages"
                rows={2}
                value={formData.otherLanguages}
                onChange={(e) => handleInputChange('otherLanguages', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-none"
                placeholder="List any other languages and your proficiency level (e.g., Portuguese - Intermediate, Mandarin - Basic)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="healthConditions" className="block text-sm font-medium text-dark-blue mb-2">
                  Health Conditions (Optional)
                </label>
                <textarea
                  id="healthConditions"
                  rows={3}
                  value={formData.healthConditions}
                  onChange={(e) => handleInputChange('healthConditions', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-none"
                  placeholder="Any health conditions we should be aware of for volunteer activities..."
                />
              </div>
              <div>
                <label htmlFor="medications" className="block text-sm font-medium text-dark-blue mb-2">
                  Current Medications (Optional)
                </label>
                <textarea
                  id="medications"
                  rows={3}
                  value={formData.medications}
                  onChange={(e) => handleInputChange('medications', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-none"
                  placeholder="List any medications you're currently taking..."
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
                📅 Availability & Commitment
              </h3>
              <p className="text-clear-gray">When are you available to volunteer?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-blue mb-3">
                Availability (select all that apply) *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  'Weekday Mornings (8AM-12PM)',
                  'Weekday Afternoons (12PM-5PM)',
                  'Weekday Evenings (5PM-8PM)',
                  'Weekend Mornings (8AM-12PM)',
                  'Weekend Afternoons (12PM-5PM)',
                  'Weekend Evenings (5PM-8PM)',
                  'Flexible Schedule',
                  'Special Events Only',
                  'School Holidays',
                  'Summer Break',
                  'Emergency Response',
                  'Remote/Online Only'
                ].map((time) => (
                  <label key={time} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={formData.availability.includes(time)}
                      onChange={(e) => handleCheckboxChange('availability', time, e.target.checked)}
                      className="rounded border-gray-300 text-golden focus:ring-golden" 
                    />
                    <span className="text-clear-gray text-xs">{time}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-dark-blue mb-2">
                  Preferred Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  required
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-dark-blue mb-2">
                  Commitment Duration
                </label>
                <select
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                >
                  <option value="">Select duration</option>
                  <option value="1-3-months">1-3 months</option>
                  <option value="3-6-months">3-6 months</option>
                  <option value="6-12-months">6-12 months</option>
                  <option value="1-2-years">1-2 years</option>
                  <option value="long-term">Long-term (2+ years)</option>
                  <option value="project-based">Project-based</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div>
                <label htmlFor="hoursPerWeek" className="block text-sm font-medium text-dark-blue mb-2">
                  Hours Per Week
                </label>
                <select
                  id="hoursPerWeek"
                  value={formData.hoursPerWeek}
                  onChange={(e) => handleInputChange('hoursPerWeek', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
                >
                  <option value="">Select hours</option>
                  <option value="1-5-hours">1-5 hours</option>
                  <option value="5-10-hours">5-10 hours</option>
                  <option value="10-20-hours">10-20 hours</option>
                  <option value="20-30-hours">20-30 hours</option>
                  <option value="30-plus-hours">30+ hours</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
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
                  'Agriculture & Environment',
                  'Photography & Videography',
                  'Social Media Management',
                  'Project Management',
                  'Public Speaking'
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
              <textarea
                id="otherSkills"
                rows={3}
                value={formData.otherSkills}
                onChange={(e) => handleInputChange('otherSkills', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-none"
                placeholder="Describe any other skills, talents, or experiences that would be valuable for volunteering..."
              />
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

            <div>
              <label htmlFor="referenceInfo" className="block text-sm font-medium text-dark-blue mb-2">
                Reference Information
              </label>
              <textarea
                id="referenceInfo"
                rows={4}
                value={formData.referenceInfo}
                onChange={(e) => handleInputChange('referenceInfo', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent resize-none"
                placeholder="Provide contact information for 2-3 references who can speak to your character, work ethic, and volunteer experience. Include names, relationships, phone numbers, and/or email addresses..."
              />
            </div>

            <div>
              <label htmlFor="contractType" className="block text-sm font-medium text-dark-blue mb-2">
                Volunteer Contract Type
              </label>
              <select
                id="contractType"
                value={formData.contractType}
                onChange={(e) => handleInputChange('contractType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden focus:border-transparent"
              >
                <option value="">Select contract type</option>
                <option value="casual">Casual Volunteer (No formal contract)</option>
                <option value="regular">Regular Volunteer (Informal agreement)</option>
                <option value="formal">Formal Volunteer (Written agreement)</option>
                <option value="skilled">Skilled Volunteer (Professional services)</option>
                <option value="internship">Volunteer Internship</option>
                <option value="board">Board/Committee Member</option>
              </select>
            </div>

            <div className="space-y-4">
              <h4 className="font-display text-lg font-semibold text-dark-blue">
                Volunteer Agreements
              </h4>
              
              <label className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <input 
                  type="checkbox" 
                  checked={formData.backgroundCheck}
                  onChange={(e) => handleInputChange('backgroundCheck', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-golden focus:ring-golden" 
                />
                <span className="text-sm text-dark-blue">
                  <strong>Background Check Consent (Optional)</strong><br />
                  I consent to a background check if required for my volunteer role. I understand this may be necessary for certain positions involving vulnerable populations or sensitive activities.
                </span>
              </label>

              <label className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <input 
                  type="checkbox" 
                  required
                  checked={formData.agreement}
                  onChange={(e) => handleInputChange('agreement', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-golden focus:ring-golden" 
                />
                <span className="text-sm text-dark-blue">
                  <strong>Volunteer Agreement *</strong><br />
                  I agree to follow BENIRAGE's volunteer policies, code of conduct, and safety guidelines. I commit to my volunteer responsibilities and understand that I can withdraw from volunteering with appropriate notice.
                </span>
              </label>

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
                  I consent to BENIRAGE collecting, processing, and storing my personal information for volunteer management, communication, and program coordination. I understand my data will be handled securely and in accordance with applicable privacy laws.
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
      <Section className="py-20 bg-gradient-to-br from-green-600 to-blue-600 text-white">
        <div className="text-center">
          <div className="text-6xl mb-6">🤝</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Volunteer With Us
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Share your skills and passion to make a meaningful impact in our community
          </p>
        </div>
      </Section>

      {/* Volunteer Benefits */}
      <Section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-900 mb-8">
            Why Volunteer with BENIRAGE?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:scale-105 transition-transform">
              <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Make Real Impact
              </h3>
              <p className="text-gray-600">
                Directly contribute to spiritual growth, cultural preservation, and community development
              </p>
            </Card>

            <Card className="text-center hover:scale-105 transition-transform">
              <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Build Community
              </h3>
              <p className="text-gray-600">
                Connect with like-minded individuals and build meaningful relationships within our movement
              </p>
            </Card>

            <Card className="text-center hover:scale-105 transition-transform">
              <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Develop Skills
              </h3>
              <p className="text-gray-600">
                Gain new skills, leadership experience, and personal growth through meaningful service
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* Volunteer Opportunities */}
      <Section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-6">
              Volunteer Opportunities
            </h2>
            <p className="text-xl text-gray-700">
              Choose from various ways to contribute your time and talents
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-6">✨</div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">
                Spiritual Programs
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Support meditation sessions, spiritual retreats, and healing circles
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-1">
                <li>• Meditation facilitator</li>
                <li>• Retreat coordinator</li>
                <li>• Spiritual counselor</li>
                <li>• Prayer circle leader</li>
              </ul>
            </Card>

            <Card className="text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-6">🧠</div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">
                Philosophy Programs
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Help with youth philosophy workshops and wisdom teachings
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-1">
                <li>• Workshop facilitator</li>
                <li>• Discussion moderator</li>
                <li>• Youth mentor</li>
                <li>• Research assistant</li>
              </ul>
            </Card>

            <Card className="text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-6">🌍</div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">
                Cultural Programs
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Preserve heritage through arts, crafts, and cultural events
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-1">
                <li>• Cultural event organizer</li>
                <li>• Arts & crafts instructor</li>
                <li>• Heritage documenter</li>
                <li>• Festival coordinator</li>
              </ul>
            </Card>

            <Card className="text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-6">🎓</div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">
                Educational Support
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Support educational programs and community learning initiatives
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-1">
                <li>• Teacher/tutor</li>
                <li>• Curriculum developer</li>
                <li>• Educational coordinator</li>
                <li>• Learning facilitator</li>
              </ul>
            </Card>

            <Card className="text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-6">💻</div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">
                Digital & Media
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Help with technology, social media, and digital content creation
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-1">
                <li>• Content creator</li>
                <li>• Social media manager</li>
                <li>• Web developer</li>
                <li>• Graphic designer</li>
              </ul>
            </Card>

            <Card className="text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-6">🤝</div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">
                Community Outreach
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Engage with communities and support outreach initiatives
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-1">
                <li>• Community liaison</li>
                <li>• Outreach coordinator</li>
                <li>• Program assistant</li>
                <li>• Field volunteer</li>
              </ul>
            </Card>
          </div>
        </div>
      </Section>

      {/* Volunteer Application Form */}
      <Section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Volunteer Application
            </h2>
            <p className="text-lg text-gray-700">
              Join our team of dedicated volunteers making a difference
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
                  className={`progress-bar progress-bar-width-${currentStep}`}
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
                      {isSubmitting ? 'Submitting Application...' : 'Submit Volunteer Application'}
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
                Your personal information is encrypted and securely stored. We respect your privacy and will only use your information for volunteer management and program coordination.
              </p>
            </div>
          </Card>
        </div>
      </Section>

      {/* Volunteer Impact */}
      <Section className="py-20 bg-blue-900 text-blue-900">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">
            Your Volunteer Impact
          </h2>
          <p className="text-xl text-blue-900/90 mb-12">
            Join hundreds of volunteers who are already making a difference
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl mb-4">500+</div>
              <h3 className="font-semibold mb-2">Lives Touched</h3>
              <p className="text-blue-900/80 text-sm">Through volunteer programs</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl mb-4">50+</div>
              <h3 className="font-semibold mb-2">Active Volunteers</h3>
              <p className="text-blue-900/80 text-sm">Contributing their time and skills</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl mb-4">25+</div>
              <h3 className="font-semibold mb-2">Programs Supported</h3>
              <p className="text-blue-900/80 text-sm">Across all three pillars</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button variant="secondary" size="lg" className="text-white border-white hover:bg-white hover:text-blue-900">
              Start Your Application
            </Button>
            <Button variant="secondary" size="lg" className="text-white border-white hover:bg-white hover:text-blue-900">
              Learn More About Programs
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Volunteer;