
import { hybridSaveFormData } from './databaseAdapter';

export interface MembershipFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  maritalStatus: string;
  
  // Contact Information
  email: string;
  phone: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  
  // Community & Professional Background
  occupation: string;
  education: string;
  organization: string;
  
  // Membership Interests
  interests: string[];
  otherInterests: string;
  
  // Commitment & Contribution
  whyJoin: string;
  skills: string[];
  otherSkills: string;
  referenceInfo: string;
  financialSupport: string[];
  timeCommitment: string;
  
  // Membership Category
  membershipCategory: string;
  
  // Metadata
  submissionDate: string;
}

// Helper function to properly escape CSV fields
const escapeCSVField = (field: string): string => {
  if (!field) return '';

  const stringField = String(field);

  // If the field contains comma, quote, or newline, wrap it in quotes and escape internal quotes
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n') || stringField.includes('\r')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }

  return stringField;
};

export const exportToCSV = (data: MembershipFormData[], filename: string = 'benirage_members.csv'): boolean => {
  if (data.length === 0) {
    console.warn('No data to export');
    return false;
  }

  try {
    // Define CSV headers
    const headers = [
      'Submission Date',
      'First Name',
      'Last Name',
      'Gender',
      'Date of Birth',
      'Nationality',
      'Marital Status',
      'Email',
      'Phone/WhatsApp',
      'District',
      'Sector',
      'Cell',
      'Village',
      'Occupation',
      'Education Level',
      'Organization',
      'Areas of Interest',
      'Other Interests',
      'Why Join BENIRAGE',
      'Skills',
      'Other Skills',
      'Financial Support',
      'Reference Information',
      'Time Commitment',
      'Membership Category'
    ];

    // Convert data to CSV format with proper escaping
    const csvContent = [
      headers.join(','),
      ...data.map(member => [
        escapeCSVField(member.submissionDate),
        escapeCSVField(member.firstName),
        escapeCSVField(member.lastName),
        escapeCSVField(member.gender),
        escapeCSVField(member.dateOfBirth),
        escapeCSVField(member.nationality),
        escapeCSVField(member.maritalStatus),
        escapeCSVField(member.email),
        escapeCSVField(member.phone),
        escapeCSVField(member.district),
        escapeCSVField(member.sector),
        escapeCSVField(member.cell),
        escapeCSVField(member.village),
        escapeCSVField(member.occupation),
        escapeCSVField(member.education),
        escapeCSVField(member.organization),
        escapeCSVField(member.interests.join('; ')),
        escapeCSVField(member.otherInterests),
        escapeCSVField(member.whyJoin),
        escapeCSVField(member.skills.join('; ')),
        escapeCSVField(member.otherSkills),
        escapeCSVField(member.referenceInfo),
        escapeCSVField(member.financialSupport.join('; ')),
        escapeCSVField(member.timeCommitment),
        escapeCSVField(member.membershipCategory)
      ].join(','))
    ].join('\n');

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up the object URL
      return true;
    } else {
      console.error('Browser does not support file downloads');
      return false;
    }
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return false;
  }
};

// Helper function to check if error is quota exceeded
const isQuotaExceededError = (error: unknown): boolean => {
  if (!error) return false;
  const err = error as { code?: number; name?: string; message?: string };
  return !!(
    err.code === 22 || // DOMException.QUOTA_EXCEEDED_ERR
    err.code === 1014 || // NS_ERROR_DOM_QUOTA_REACHED
    err.name === 'QuotaExceededError' ||
    err.message?.includes('quota') ||
    err.message?.includes('storage') ||
    err.message?.includes('QuotaExceededError')
  );
};

export const saveFormDataLocally = (formData: MembershipFormData): boolean => {
  try {
    // Use the database adapter's hybrid storage function
    hybridSaveFormData('member', formData);
    return true;
  } catch (error) {
    if (isQuotaExceededError(error)) {
      console.error('Storage quota exceeded. Please clear some data or use a different browser.');
    } else {
      console.error('Error saving form data:', error);
    }
    return false;
  }
};

// Helper function to get data from localStorage with better error handling
const getMembersFromStorage = (): MembershipFormData[] => {
  try {
    const data = localStorage.getItem('benirage_members');
    if (!data) return [];

    const parsedData = JSON.parse(data);

    // Validate that the data is an array
    if (!Array.isArray(parsedData)) {
      console.warn('Invalid data format in localStorage, resetting to empty array');
      localStorage.removeItem('benirage_members');
      return [];
    }

    return parsedData;
  } catch (error) {
    if (isQuotaExceededError(error)) {
      console.error('Storage quota exceeded while reading data');
    } else {
      console.error('Error retrieving members data, possibly corrupted:', error);
      // Clear corrupted data
      try {
        localStorage.removeItem('benirage_members');
      } catch (clearError) {
        console.error('Failed to clear corrupted data:', clearError);
      }
    }
    return [];
  }
};

export const getAllMembersData = (): MembershipFormData[] => {
  return getMembersFromStorage();
};

export const clearAllMembersData = (): boolean => {
  try {
    localStorage.removeItem('benirage_members');
    return true;
  } catch (error) {
    if (isQuotaExceededError(error)) {
      console.error('Storage quota exceeded. Cannot clear data.');
    } else {
      console.error('Error clearing members data:', error);
    }
    return false;
  }
};