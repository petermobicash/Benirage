// Form validation utilities for BENIRAGE forms

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  custom?: (value: unknown, formData?: Record<string, unknown>) => string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export const validateField = (value: unknown, rules: ValidationRule, fieldName: string): string | null => {
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return `${fieldName} is required`;
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  // String validations
  if (typeof value === 'string') {
    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      return `${fieldName} must be at least ${rules.minLength} characters`;
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      return `${fieldName} must be no more than ${rules.maxLength} characters`;
    }

    // Email validation
    if (rules.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return `${fieldName} must be a valid email address`;
      }
    }

    // Phone validation
    if (rules.phone) {
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/[\s-()]/g, ''))) {
        return `${fieldName} must be a valid phone number`;
      }
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return `${fieldName} format is invalid`;
    }
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export const validateForm = (formData: Record<string, unknown>, validationRules: Record<string, ValidationRule>): ValidationError[] => {
  const errors: ValidationError[] = [];

  Object.entries(validationRules).forEach(([field, rules]) => {
    const error = validateField(formData[field], rules, field);
    if (error) {
      errors.push({ field, message: error });
    }
  });

  return errors;
};

// Specific validation rules for BENIRAGE forms
export const membershipValidationRules: Record<string, ValidationRule> = {
  firstName: { required: true, minLength: 2, maxLength: 50 },
  lastName: { required: true, minLength: 2, maxLength: 50 },
  email: { required: true, email: true },
  phone: { required: true, phone: true },
  fatherName: { minLength: 2, maxLength: 100 },
  motherName: { minLength: 2, maxLength: 100 },
  whyJoin: { required: true, minLength: 50, maxLength: 1000 },
  membershipCategory: { required: true },
  interests: {
    required: true,
    custom: (value: unknown) => {
      const arr = value as string[];
      if (!Array.isArray(arr) || arr.length === 0) {
        return 'Please select at least one area of interest';
      }
      return null;
    }
  },
  reference1Name: { minLength: 2, maxLength: 100 },
  reference1Contact: {
    custom: (value: unknown, formData?: Record<string, unknown>) => {
      const strValue = value as string;
      if (formData?.reference1Name && (!strValue || strValue.trim() === '')) {
        return 'Contact information is required when providing a reference';
      }
      if (strValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue) && !/^[+\]?[1-9][\d]{0,15}$/.test(strValue.replace(/[\s-()]/g, ''))) {
        return 'Please provide a valid email or phone number';
      }
      return null;
    }
  },
  reference1Relationship: { minLength: 2, maxLength: 100 },
  reference2Name: { minLength: 2, maxLength: 100 },
  reference2Contact: {
    custom: (value: unknown, formData?: Record<string, unknown>) => {
      const strValue = value as string;
      if (formData?.reference2Name && (!strValue || strValue.trim() === '')) {
        return 'Contact information is required when providing a reference';
      }
      if (strValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue) && !/^[+\]?[1-9][\d]{0,15}$/.test(strValue.replace(/[\s-()]/g, ''))) {
        return 'Please provide a valid email or phone number';
      }
      return null;
    }
  },
  reference2Relationship: { minLength: 2, maxLength: 100 },
  dataConsent: { required: true },
  termsAccepted: { required: true }
};

export const volunteerValidationRules: Record<string, ValidationRule> = {
  firstName: { required: true, minLength: 2, maxLength: 50 },
  lastName: { required: true, minLength: 2, maxLength: 50 },
  email: { required: true, email: true },
  phone: { required: true, phone: true },
  experience: { maxLength: 1000 },
  agreement: { required: true },
  dataConsent: { required: true }
};

export const contactValidationRules: Record<string, ValidationRule> = {
  firstName: { required: true, minLength: 2, maxLength: 50 },
  lastName: { required: true, minLength: 2, maxLength: 50 },
  email: { required: true, email: true },
  subject: { required: true },
  message: { required: true, minLength: 10, maxLength: 2000 }
};

export const donationValidationRules: Record<string, ValidationRule> = {
  donorName: { required: true, minLength: 2, maxLength: 100 },
  donorEmail: { required: true, email: true },
  amount: {
    required: true,
    custom: (value: unknown) => {
      const strValue = value as string;
      const num = parseFloat(strValue);
      if (isNaN(num) || num <= 0) return 'Amount must be a positive number';
      if (num < 1) return 'Minimum donation amount is $1';
      if (num > 100000) return 'Maximum donation amount is $100,000';
      return null;
    }
  }
};

// Utility functions
export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors.map(error => error.message).join('\n');
};

export const hasValidationErrors = (errors: ValidationError[]): boolean => {
  return errors.length > 0;
};

export const getFieldError = (errors: ValidationError[], fieldName: string): string | null => {
  const error = errors.find(err => err.field === fieldName);
  return error ? error.message : null;
};