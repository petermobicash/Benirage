import React, { useState, useEffect, useCallback } from 'react';
import { submitDonation } from '../lib/supabase';
import { paymentService } from '../utils/paymentService';
import { performanceMonitor, coreWebVitals } from '../utils/performanceUtils';
import { useToast } from '../hooks/useToast';
import {
  Heart, Shield, Users, Target, CreditCard as CreditCardIcon,
  Smartphone, Building2, Star, CheckCircle, Award, Globe,
  Phone, Mail, MapPin, TrendingUp,
  ArrowRight, Play, Quote, Eye
} from 'lucide-react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { PaymentData, CardPaymentData, MobileMoneyData, BankTransferData, PayPalData, Currency, PaymentMethod } from '../types/payment';

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

// Mock testimonials and social proof data
const testimonials = [
  {
    name: "Sarah Nakimuli",
    role: "Community Leader",
    avatar: "/avatars/sarah.jpg",
    quote: "Benirage has transformed our community. Their programs have helped over 200 families, and my own children are now thriving thanks to their educational initiatives.",
    impact: "Helped 200+ families",
    rating: 5
  },
  {
    name: "Dr. James Mwangi",
    role: "Education Director",
    avatar: "/avatars/james.jpg", 
    quote: "The scholarship program changed my life trajectory. I'm now a doctor serving rural communities, and I give back to the program that believed in me.",
    impact: "500+ scholarships",
    rating: 5
  },
  {
    name: "Grace Mukamana",
    role: "Youth Participant",
    avatar: "/avatars/grace.jpg",
    quote: "Through Benirage's cultural preservation program, I've learned traditional crafts that are now my livelihood. They preserve our heritage while creating opportunities.",
    impact: "150+ youth trained",
    rating: 5
  }
];

const impactStats = [
  { number: "2,500+", label: "Lives Touched", icon: Users },
  { number: "150+", label: "Communities Served", icon: Globe },
  { number: "500+", label: "Scholarships Awarded", icon: Award },
  { number: "95%", label: "Program Success Rate", icon: TrendingUp }
];

const donationImpactExamples = [
  {
    amount: 25,
    impact: "Provides school supplies for one child for a month",
    icon: "📚"
  },
  {
    amount: 50,
    impact: "Supports a family with clean water access for one week",
    icon: "💧"
  },
  {
    amount: 100,
    impact: "Funds a complete traditional craft training workshop",
    icon: "🎨"
  },
  {
    amount: 250,
    impact: "Sponsors a child's education for one semester",
    icon: "🎓"
  },
  {
    amount: 500,
    impact: "Establishes a community health education program",
    icon: "🏥"
  },
  {
    amount: 1000,
    impact: "Builds infrastructure for cultural preservation center",
    icon: "🏛️"
  }
];

const Donate = () => {
  const [formData, setFormData] = useState({
    // Donor Information
    donorName: '',
    donorEmail: '',
    phone: '',
    address: '',

    // Donation Details
    amount: '',
    currency: 'USD',
    frequency: 'one-time',
    paymentMethod: 'card',
    designation: 'general',
    customDesignation: '',

    // Dedication & Recognition
    dedicationName: '',
    dedicationMessage: '',
    newsletterSignup: true,
    anonymousDonation: false,

    // Additional Information
    notes: ''
  });

  // Payment data state
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 0,
    currency: 'USD',
    method: 'card',
    cardData: undefined,
    mobileMoneyData: undefined,
    bankTransferData: undefined,
    paypalData: undefined
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showTestimonial, setShowTestimonial] = useState(0);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const totalSteps = 3;

  // Toast notifications hook
  const { success, error: showError, warning } = useToast();

  // Performance monitoring and accessibility setup
  useEffect(() => {
    // Track section visibility
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionName = entry.target.getAttribute('data-section');
          if (sectionName) {
            performanceMonitor.markSectionVisible(sectionName);
          }
        }
      });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('[data-section]').forEach((section) => {
      sectionObserver.observe(section);
    });

    // Core Web Vitals monitoring
    coreWebVitals.observeLCP(() => {
      // Performance monitoring - logging removed for production
    });

    coreWebVitals.observeFID(() => {
      // Performance monitoring - logging removed for production
    });

    coreWebVitals.observeCLS(() => {
      // Performance monitoring - logging removed for production
    });

    // Clean up
    return () => {
      sectionObserver.disconnect();
      coreWebVitals.disconnect();
    };
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setShowTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Smooth scroll to donation form
  const scrollToDonation = useCallback(() => {
    const element = document.getElementById('donation-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Keyboard navigation support
  const handleKeyNavigation = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      // Let default tab behavior work
      return;
    }
    
    if (event.key === 'Enter' && event.target === document.querySelector('#donation-form')) {
      scrollToDonation();
    }
  }, [scrollToDonation]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyNavigation);
    return () => document.removeEventListener('keydown', handleKeyNavigation);
  }, [handleKeyNavigation]);

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.donorName && formData.donorEmail && formData.amount && parseFloat(formData.amount) > 0);
      case 2:
        return !!(formData.paymentMethod && formData.designation);
      case 3:
        return true; // Optional step
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      warning('Please fill in all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(1) || !validateStep(2)) {
      warning('Please complete all required fields with valid information.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitize text inputs before submission
      const sanitizedData = {
        donorName: sanitizeInput(formData.donorName),
        donorEmail: formData.donorEmail.toLowerCase().trim(), // Normalize email
        phone: sanitizeInput(formData.phone),
        address: sanitizeInput(formData.address),
        customDesignation: sanitizeInput(formData.customDesignation),
        dedicationName: sanitizeInput(formData.dedicationName),
        dedicationMessage: sanitizeInput(formData.dedicationMessage),
        notes: sanitizeInput(formData.notes)
      };

      // Submit to Supabase database first
      const result = await submitDonation({
        donor_name: sanitizedData.donorName,
        donor_email: sanitizedData.donorEmail,
        phone: sanitizedData.phone,
        address: sanitizedData.address,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        frequency: formData.frequency,
        payment_method: formData.paymentMethod,
        designation: formData.designation,
        custom_designation: sanitizedData.customDesignation,
        dedication_name: sanitizedData.dedicationName,
        dedication_message: sanitizedData.dedicationMessage,
        newsletter_signup: formData.newsletterSignup,
        anonymous_donation: formData.anonymousDonation,
        notes: sanitizedData.notes,
        payment_status: 'pending'
      });

      if (!result.success) {
        throw new Error('Donation submission failed');
      }

      const donationId = result.data?.[0]?.id || `donation_${Date.now()}`;

      // Process payment if not cash or check
      if (formData.paymentMethod !== 'cash' && formData.paymentMethod !== 'check') {
        // Prepare payment data
        const paymentPayload: PaymentData = {
          amount: parseFloat(formData.amount),
          currency: formData.currency as Currency,
          method: formData.paymentMethod as PaymentMethod
        };

        // Add payment method specific data
        if (formData.paymentMethod === 'card' && paymentData.cardData) {
          paymentPayload.cardData = paymentData.cardData;
        } else if (formData.paymentMethod === 'mobile-money' && paymentData.mobileMoneyData) {
          paymentPayload.mobileMoneyData = paymentData.mobileMoneyData;
        } else if (formData.paymentMethod === 'bank-transfer' && paymentData.bankTransferData) {
          paymentPayload.bankTransferData = paymentData.bankTransferData;
        } else if (formData.paymentMethod === 'paypal' && paymentData.paypalData) {
          paymentPayload.paypalData = paymentData.paypalData;
        } else {
          // Ensure payment method data is provided for online payments
          throw new Error(`Payment method data is required for ${formData.paymentMethod}`);
        }

        // Process payment
        const paymentResult = await paymentService.processPayment({
          donationId,
          donorEmail: sanitizedData.donorEmail,
          paymentData: paymentPayload
        });

        if (paymentResult.success) {
          // Update donation with payment details
          await submitDonation({
            donor_name: sanitizedData.donorName,
            donor_email: sanitizedData.donorEmail,
            phone: sanitizedData.phone,
            address: sanitizedData.address,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            frequency: formData.frequency,
            payment_method: formData.paymentMethod,
            designation: formData.designation,
            custom_designation: sanitizedData.customDesignation,
            dedication_name: sanitizedData.dedicationName,
            dedication_message: sanitizedData.dedicationMessage,
            newsletter_signup: formData.newsletterSignup,
            anonymous_donation: formData.anonymousDonation,
            notes: sanitizedData.notes,
            payment_status: paymentResult.status,
            transaction_id: paymentResult.paymentId
          });

          if (paymentResult.redirectUrl) {
            // Redirect to payment provider
            window.location.href = paymentResult.redirectUrl;
            return;
          }

          success(`Payment ${paymentResult.status}! Thank you for your generous donation. You will receive a confirmation email shortly.`);
        } else {
          // Payment failed, update status
          await submitDonation({
            donor_name: sanitizedData.donorName,
            donor_email: sanitizedData.donorEmail,
            phone: sanitizedData.phone,
            address: sanitizedData.address,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            frequency: formData.frequency,
            payment_method: formData.paymentMethod,
            designation: formData.designation,
            custom_designation: sanitizedData.customDesignation,
            dedication_name: sanitizedData.dedicationName,
            dedication_message: sanitizedData.dedicationMessage,
            newsletter_signup: formData.newsletterSignup,
            anonymous_donation: formData.anonymousDonation,
            notes: sanitizedData.notes,
            payment_status: 'failed'
          });

          showError(`Payment failed: ${paymentResult.error}. Please try again or contact support.`);
        }
      } else {
        // Manual payment methods (cash/check)
        success('Thank you for your generous donation! Please complete your payment using the selected method. You will receive a confirmation email shortly.');
      }

      // Reset form
      setFormData({
        donorName: '', donorEmail: '', phone: '', address: '', amount: '', currency: 'USD',
        frequency: 'one-time', paymentMethod: 'card', designation: 'general', customDesignation: '',
        dedicationName: '', dedicationMessage: '', newsletterSignup: true, anonymousDonation: false,
        notes: ''
      });
      setPaymentData({
        amount: 0,
        currency: 'USD',
        method: 'card',
        cardData: undefined,
        mobileMoneyData: undefined,
        bankTransferData: undefined,
        paypalData: undefined
      });
      setCurrentStep(1);

    } catch (error) {
      // Professional error handling with better user feedback
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Donation error details:', errorMessage, error);
      
      // Show user-friendly error message
      showError('There was an error processing your donation. Please try again or contact support if the problem persists.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl font-semibold text-dark-blue mb-4">
                👤 Donor Information
              </h3>
              <p className="text-clear-gray">Your contact information for donation receipt</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="donorName" className="block text-sm font-medium text-blue-900 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="donorName"
                  required
                  value={formData.donorName}
                  onChange={(e) => handleInputChange('donorName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label htmlFor="donorEmail" className="block text-sm font-medium text-blue-900 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="donorEmail"
                  required
                  value={formData.donorEmail}
                  onChange={(e) => handleInputChange('donorEmail', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-blue-900 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  placeholder="+250 ... or your country code"
                />
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-blue-900 mb-2">
                  Currency
                </label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="USD">🇺🇸 USD - US Dollar</option>
                  <option value="EUR">🇪🇺 EUR - Euro</option>
                  <option value="RWF">🇷🇼 RWF - Rwandan Franc</option>
                  <option value="KES">🇰🇪 KES - Kenyan Shilling</option>
                  <option value="UGX">🇺🇬 UGX - Ugandan Shilling</option>
                  <option value="TZS">🇹🇿 TZS - Tanzanian Shilling</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-blue-900 mb-2">
                Address (Optional)
              </label>
              <textarea
                id="address"
                rows={3}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none transition-all duration-200"
                placeholder="Your mailing address for donation receipt"
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-blue-900">Choose Your Impact</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[25, 50, 100, 250, 500, 1000, 2500, 5000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleInputChange('amount', amount.toString())}
                    className={`p-4 border-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                      formData.amount === amount.toString()
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-600 shadow-md'
                        : 'border-gray-300 hover:border-yellow-500 hover:bg-yellow-50 text-blue-900'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="customAmount" className="block text-sm font-medium text-blue-900 mb-2">
                Custom Amount *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="customAmount"
                  min="1"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter amount"
                />
              </div>
              {formData.amount && (
                <p className="mt-2 text-sm text-gray-600">
                  {(() => {
                    const amount = parseFloat(formData.amount);
                    if (amount >= 1000) {
                      return "Your donation will establish community infrastructure that lasts for years.";
                    } else if (amount >= 250) {
                      return "This amount sponsors a child's education for one semester.";
                    } else if (amount >= 50) {
                      return "Your gift provides essential resources for a family in need.";
                    } else {
                      return "Every contribution, no matter the size, makes a meaningful difference.";
                    }
                  })()}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl font-semibold text-dark-blue mb-4">
                💳 Payment & Designation
              </h3>
              <p className="text-clear-gray">Choose how and where your donation will be used</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-blue-900 mb-2">
                  Donation Frequency *
                </label>
                <select
                  id="frequency"
                  required
                  value={formData.frequency}
                  onChange={(e) => handleInputChange('frequency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="one-time">One-time Donation</option>
                  <option value="monthly">Monthly Recurring</option>
                  <option value="quarterly">Quarterly Recurring</option>
                  <option value="annually">Annual Recurring</option>
                </select>
              </div>

              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-blue-900 mb-2">
                  Payment Method *
                </label>
                <select
                  id="paymentMethod"
                  required
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="card">💳 Credit/Debit Card</option>
                  <option value="bank-transfer">🏦 Bank Transfer</option>
                  <option value="mobile-money">📱 Mobile Money (MTN/Airtel)</option>
                  <option value="paypal">💰 PayPal</option>
                  <option value="check">📝 Check/Cheque</option>
                  <option value="cash">💵 Cash</option>
                  <option value="other">🔄 Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-blue-900 mb-2">
                Donation Purpose *
              </label>
              <select
                id="designation"
                required
                value={formData.designation}
                onChange={(e) => handleInputChange('designation', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
              >
                <option value="general">General Fund (Greatest Need)</option>
                <option value="spiritual">Spiritual Programs & Retreats</option>
                <option value="education">Educational Initiatives & Youth Development</option>
                <option value="culture">Cultural Preservation & Heritage</option>
                <option value="community">Community Health & Wellness</option>
                <option value="infrastructure">Infrastructure & Facilities</option>
                <option value="emergency">Emergency Relief & Support</option>
                <option value="research">Research & Documentation</option>
                <option value="events">Events & Festivals</option>
                <option value="scholarships">Scholarships & Training</option>
                <option value="custom">Custom Designation</option>
              </select>
            </div>

            {formData.designation === 'custom' && (
              <div>
                <label htmlFor="customDesignation" className="block text-sm font-medium text-blue-900 mb-2">
                  Custom Designation Details
                </label>
                <input
                  type="text"
                  id="customDesignation"
                  value={formData.customDesignation}
                  onChange={(e) => handleInputChange('customDesignation', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  placeholder="Specify how you'd like your donation to be used..."
                />
              </div>
            )}

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-blue-900 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none transition-all duration-200"
                placeholder="Any special instructions or messages for your donation..."
              />
            </div>

            {/* Payment Method Forms */}
            {formData.paymentMethod === 'card' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  💳 Card Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-blue-800 mb-2">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      required
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                      onChange={(e) => setPaymentData(prev => ({
                        ...prev,
                        cardData: { ...prev.cardData, cardNumber: e.target.value } as CardPaymentData
                      }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="expiryMonth" className="block text-sm font-medium text-blue-800 mb-2">
                      Expiry Month *
                    </label>
                    <select
                      id="expiryMonth"
                      required
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                      onChange={(e) => setPaymentData(prev => ({
                        ...prev,
                        cardData: { ...prev.cardData, expiryMonth: e.target.value } as CardPaymentData
                      }))}
                    >
                      <option value="">Month</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = (i + 1).toString().padStart(2, '0');
                        return (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="expiryYear" className="block text-sm font-medium text-blue-800 mb-2">
                      Expiry Year *
                    </label>
                    <select
                      id="expiryYear"
                      required
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                      onChange={(e) => setPaymentData(prev => ({
                        ...prev,
                        cardData: { ...prev.cardData, expiryYear: e.target.value } as CardPaymentData
                      }))}
                    >
                      <option value="">Year</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = (new Date().getFullYear() + i).toString();
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="cvv" className="block text-sm font-medium text-blue-800 mb-2">
                      CVV *
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      required
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                      onChange={(e) => setPaymentData(prev => ({
                        ...prev,
                        cardData: { ...prev.cardData, cvv: e.target.value } as CardPaymentData
                      }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="cardHolderName" className="block text-sm font-medium text-blue-800 mb-2">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      id="cardHolderName"
                      required
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                      onChange={(e) => setPaymentData(prev => ({
                        ...prev,
                        cardData: { ...prev.cardData, holderName: e.target.value } as CardPaymentData
                      }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.paymentMethod === 'mobile-money' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                  <Smartphone className="w-5 h-5 mr-2" />
                  📱 Mobile Money Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-green-800 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="mobileNumber"
                      required
                      placeholder="+250123456789"
                      className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                      onChange={(e) => setPaymentData(prev => ({
                        ...prev,
                        mobileMoneyData: { ...prev.mobileMoneyData, phoneNumber: e.target.value } as MobileMoneyData
                      }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="mobileProvider" className="block text-sm font-medium text-green-800 mb-2">
                      Mobile Provider *
                    </label>
                    <select
                      id="mobileProvider"
                      required
                      className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                      onChange={(e) => setPaymentData(prev => ({
                        ...prev,
                        mobileMoneyData: { ...prev.mobileMoneyData, provider: e.target.value as 'mtn' | 'airtel' } as MobileMoneyData
                      }))}
                    >
                      <option value="">Select Provider</option>
                      <option value="mtn">📱 MTN Mobile Money</option>
                      <option value="airtel">📶 Airtel Money</option>
                    </select>
                  </div>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  💡 You'll receive a prompt on your phone to confirm the payment
                </p>
              </div>
            )}

            {formData.paymentMethod === 'bank-transfer' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h4 className="font-semibold text-purple-800 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  🏦 Bank Transfer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="bankName" className="block text-sm font-medium text-purple-800 mb-2">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      id="bankName"
                      required
                      placeholder="Bank of Kigali, Equity Bank, etc."
                      className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                      onChange={(e) => setPaymentData(prev => ({
                        ...prev,
                        bankTransferData: { ...prev.bankTransferData, bankName: e.target.value } as BankTransferData
                      }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="accountNumber" className="block text-sm font-medium text-purple-800 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      id="accountNumber"
                      required
                      placeholder="Your account number"
                      className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                      onChange={(e) => setPaymentData(prev => ({
                        ...prev,
                        bankTransferData: { ...prev.bankTransferData, accountNumber: e.target.value } as BankTransferData
                      }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="accountHolder" className="block text-sm font-medium text-purple-800 mb-2">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      id="accountHolder"
                      required
                      placeholder="Full name on the account"
                      className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                      onChange={(e) => setPaymentData(prev => ({
                        ...prev,
                        bankTransferData: { ...prev.bankTransferData, accountHolder: e.target.value } as BankTransferData
                      }))}
                    />
                  </div>
                </div>
                <p className="text-sm text-purple-700 mt-2">
                  💡 Please transfer the amount to our bank account. Reference: {`DON-${Date.now()}`}
                </p>
              </div>
            )}

            {formData.paymentMethod === 'paypal' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h4 className="font-semibold text-yellow-800 mb-4">
                  💰 PayPal Information
                </h4>
                <div>
                  <label htmlFor="paypalEmail" className="block text-sm font-medium text-yellow-800 mb-2">
                    PayPal Email Address *
                  </label>
                  <input
                    type="email"
                    id="paypalEmail"
                    required
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                    onChange={(e) => setPaymentData(prev => ({
                      ...prev,
                      paypalData: { email: e.target.value } as PayPalData
                    }))}
                  />
                </div>
                <p className="text-sm text-yellow-700 mt-2">
                  💡 You'll be redirected to PayPal to complete your payment securely
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl font-semibold text-dark-blue mb-4">
                💝 Dedication & Preferences
              </h3>
              <p className="text-clear-gray">Optional dedication and communication preferences</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h4 className="font-semibold text-yellow-800 mb-4">🎗️ Dedication (Optional)</h4>
              <p className="text-yellow-700 text-sm mb-4">
                You can dedicate this donation in honor or memory of someone special
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dedicationName" className="block text-sm font-medium text-yellow-800 mb-2">
                    Dedication Name
                  </label>
                  <input
                    type="text"
                    id="dedicationName"
                    value={formData.dedicationName}
                    onChange={(e) => handleInputChange('dedicationName', e.target.value)}
                    className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                    placeholder="In honor/memory of..."
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="dedicationMessage" className="block text-sm font-medium text-yellow-800 mb-2">
                  Dedication Message
                </label>
                <textarea
                  id="dedicationMessage"
                  rows={3}
                  value={formData.dedicationMessage}
                  onChange={(e) => handleInputChange('dedicationMessage', e.target.value)}
                  className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none transition-all duration-200"
                  placeholder="Optional message for the dedication..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-display text-lg font-semibold text-dark-blue">
                Communication Preferences
              </h4>

              <label className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                <input
                  type="checkbox"
                  checked={formData.newsletterSignup}
                  onChange={(e) => handleInputChange('newsletterSignup', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 transition-all duration-200"
                />
                <span className="text-sm text-blue-900">
                  <strong>Newsletter Subscription</strong><br />
                  Subscribe to our newsletter for updates on how your donation is making a difference, upcoming events, and community impact stories.
                </span>
              </label>

              <label className="flex items-start space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors duration-200">
                <input
                  type="checkbox"
                  checked={formData.anonymousDonation}
                  onChange={(e) => handleInputChange('anonymousDonation', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500 transition-all duration-200"
                />
                <span className="text-sm text-blue-900">
                  <strong>Anonymous Donation</strong><br />
                  Make this an anonymous donation. Your name will not be shared publicly, though we'll still send you a receipt for tax purposes.
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
    <div className="min-h-screen"
         role="main"
         aria-label="Donation page"
         style={highContrast ? {
           '--tw-bg-opacity': '1',
           backgroundColor: '#000000',
           color: '#ffffff'
         } as React.CSSProperties : {}}>
      
      {/* Accessibility Controls */}
      <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
        <div className="flex gap-2">
          <button
            onClick={() => setAccessibilityMode(!accessibilityMode)}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            aria-label="Toggle accessibility mode"
            title="Accessibility Mode"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            aria-label="Toggle high contrast mode"
            title="High Contrast"
          >
            <span className="text-lg font-bold">⚫</span>
          </button>
        </div>
      </div>

      {/* Hero Section with Clear Value Proposition */}
      <section
        className="relative py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-yellow-600 text-white overflow-hidden"
        data-section="hero"
        role="banner"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Heart
                  className="w-20 h-20 text-white animate-pulse"
                  role="img"
                  aria-label="Heart symbol representing love and care"
                />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-900">✓</span>
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Transform Lives in
              <span className="block text-yellow-400">Rwanda Today</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              Every donation creates lasting change. Support education, preserve culture, and build stronger communities.
              <span className="block mt-2 text-lg text-yellow-200">95% of your gift goes directly to programs that matter.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={scrollToDonation}
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold text-lg px-8 py-4 transform hover:scale-105 transition-all duration-200 shadow-lg"
                icon={ArrowRight}
                aria-describedby="donate-button-description"
              >
                Start Your Impact
              </Button>
              <div id="donate-button-description" className="sr-only">
                Scrolls to donation form to start making a contribution
              </div>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-900 text-lg px-8 py-4 transition-all duration-200"
                icon={Play}
                aria-label="Watch video story about our impact"
              >
                Watch Our Story
              </Button>
            </div>

            {/* Quick Impact Stats with improved accessibility */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto" role="list" aria-label="Impact statistics">
              {impactStats.map((stat, index) => (
                <div key={index} className="text-center" >
                  <div className="flex justify-center mb-2" aria-hidden="true">
                    <stat.icon className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-yellow-400" aria-label={`${stat.number} ${stat.label}`}>
                    {stat.number}
                  </div>
                  <div className="text-sm text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof & Testimonials */}
      <Section className="py-20 bg-gradient-to-b from-gray-50 to-white" data-section="testimonials">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-dark-blue mb-6">
              Real Impact, Real Stories
            </h2>
            <p className="text-xl text-clear-gray max-w-3xl mx-auto">
              See how your donation creates lasting change in the lives of real people and communities
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16" role="list" aria-label="Testimonials from community members">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className={`p-6 hover:shadow-xl transition-all duration-300 ${index === showTestimonial ? 'ring-2 ring-yellow-400' : ''}`}
                
              >
                <div className="flex items-center mb-4">
                  <div
                    className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4"
                    role="img"
                    aria-label={`Profile picture placeholder for ${testimonial.name}`}
                  >
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 id={`testimonial-${index}-name`} className="font-semibold text-dark-blue">{testimonial.name}</h4>
                    <p className="text-sm text-clear-gray">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex mb-3" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {renderStars(testimonial.rating)}
                </div>
                
                <Quote className="w-8 h-8 text-yellow-400 mb-3" aria-hidden="true" />
                
                <p id={`testimonial-${index}-quote`} className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800 font-medium">
                    ✨ {testimonial.impact}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Live Testimonial Carousel */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12" role="region" aria-live="polite" aria-label="Featured testimonial">
            <div className="text-center">
              <div className="flex justify-center mb-4" role="img" aria-label={`${testimonials[showTestimonial].rating} out of 5 stars`}>
                {renderStars(testimonials[showTestimonial].rating)}
              </div>
              <blockquote className="text-2xl md:text-3xl font-medium text-gray-800 mb-6 italic">
                "{testimonials[showTestimonial].quote}"
              </blockquote>
              <div className="flex items-center justify-center">
                <div
                  className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4"
                  role="img"
                  aria-label={`Profile picture for ${testimonials[showTestimonial].name}`}
                >
                  {testimonials[showTestimonial].name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-dark-blue text-lg">{testimonials[showTestimonial].name}</div>
                  <div className="text-clear-gray">{testimonials[showTestimonial].role}</div>
                  <div className="text-sm text-green-600 font-medium">Impact: {testimonials[showTestimonial].impact}</div>
                </div>
              </div>
            </div>
            
            {/* Testimonial navigation */}
            <div className="flex justify-center mt-6 space-x-2" role="tablist" aria-label="Testimonial navigation">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setShowTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === showTestimonial ? 'bg-yellow-400' : 'bg-gray-300'
                  }`}
                  aria-label={`View testimonial ${index + 1}`}
                  role="tab"
                  aria-selected={index === showTestimonial}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Donation Impact Examples */}
      <Section className="py-20 bg-white" data-section="impact">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-dark-blue mb-6">
              Your Donation in Action
            </h2>
            <p className="text-xl text-clear-gray max-w-3xl mx-auto">
              See exactly how your contribution makes a real difference in people's lives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Donation impact examples">
            {donationImpactExamples.map((example, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-yellow-400"
                
              >
                <div className="text-center">
                  <div className="text-4xl mb-4" role="img" aria-label={`Impact icon for $${example.amount} donation`}>
                    {example.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-dark-blue mb-2" aria-label={`$${example.amount} donation`}>
                    ${example.amount}
                  </h3>
                  <p className="text-gray-700 font-medium">{example.impact}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Enhanced Donation Form */}
      <Section id="donation-form" className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto">
          <Card variant="premium" className="overflow-hidden">
            {/* Progress Indicator */}
            <div className="bg-gradient-to-r from-blue-600 to-yellow-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm opacity-90">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="bg-white h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {renderStep()}

                {/* Enhanced Navigation Buttons */}
                <div className="flex justify-between pt-8 border-t border-gray-200">
                  <div>
                    {currentStep > 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={prevStep}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        Previous Step
                      </Button>
                    )}
                  </div>

                  <div>
                    {currentStep < totalSteps ? (
                      <Button 
                        type="button" 
                        onClick={nextStep}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold px-8 py-3 transform hover:scale-105 transition-all duration-200"
                        icon={ArrowRight}
                      >
                        Next Step
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        icon={Heart} 
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-8 py-3 transform hover:scale-105 transition-all duration-200 shadow-lg"
                      >
                        {isSubmitting ? 'Processing Donation...' : 'Complete Donation & Change Lives'}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </Card>

          {/* Enhanced Security Notice */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <Shield className="w-6 h-6 text-green-600" />
                <span className="font-semibold text-green-800">Bank-Level Security</span>
              </div>
              <p className="text-sm text-green-700">
                256-bit SSL encryption protects your donation information
              </p>
            </div>

            <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle className="w-6 h-6 text-blue-600" />
                <span className="font-semibold text-blue-800">Tax Deductible</span>
              </div>
              <p className="text-sm text-blue-700">
                All donations are tax-deductible and receipt provided
              </p>
            </div>

            <div className="p-6 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <Target className="w-6 h-6 text-purple-600" />
                <span className="font-semibold text-purple-800">95% Direct Impact</span>
              </div>
              <p className="text-sm text-purple-700">
                95% of your donation goes directly to programs
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Trust & Contact Section */}
      <Section className="py-20 bg-gradient-to-b from-dark-blue to-blue-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Trust & Transparency
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              We're committed to accountability and keeping you informed about your impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center p-6">
              <Award className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Certified Charity</h3>
              <p className="text-blue-100">Registered and certified non-profit organization</p>
            </div>

            <div className="text-center p-6">
              <TrendingUp className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Annual Reports</h3>
              <p className="text-blue-100">Detailed impact reports and financial transparency</p>
            </div>

            <div className="text-center p-6">
              <Users className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community Board</h3>
              <p className="text-blue-100">Community-led governance and decision making</p>
            </div>

            <div className="text-center p-6">
              <Globe className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Global Partners</h3>
              <p className="text-blue-100">Recognized by international development organizations</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4">Get In Touch</h3>
              <p className="text-blue-100 text-lg">
                We're here to answer your questions and share more about our work
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Phone className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Call Us</h4>
                <p className="text-blue-100">+250 788 529 611</p>
                <p className="text-sm text-blue-200">Available Mon-Fri, 9AM-5PM</p>
              </div>

              <div className="text-center">
                <Mail className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Email Us</h4>
                <p className="text-blue-100">info@benirage.org</p>
                <p className="text-sm text-blue-200">We respond within 24 hours</p>
              </div>

              <div className="text-center">
                <MapPin className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Visit Us</h4>
                <p className="text-blue-100">Kigali, Rwanda</p>
                <p className="text-sm text-blue-200">By appointment only</p>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Donate;