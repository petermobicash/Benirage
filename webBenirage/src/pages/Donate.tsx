import React, { useState } from 'react';
import { submitDonation } from '../lib/supabase';
import { paymentService } from '../utils/paymentService';
import { Heart, Shield, Gift, Users, Target, CreditCard as CreditCardIcon, Smartphone, Building2 } from 'lucide-react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { PaymentData, CardPaymentData, MobileMoneyData, BankTransferData, PayPalData } from '../types/payment';

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
    newsletterSignup: false,
    anonymousDonation: false,

    // Additional Information
    notes: ''
  });

  // Payment data state
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 0,
    currency: 'USD',
    method: 'card'
  });

  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

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
      alert('Please fill in all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(1) || !validateStep(2)) {
      alert('Please complete all required fields with valid information.');
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currency: formData.currency as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          method: formData.paymentMethod as any
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

          alert(`Payment ${paymentResult.status}! Thank you for your generous donation. You will receive a confirmation email shortly.`);
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

          alert(`Payment failed: ${paymentResult.error}. Please try again or contact support.`);
        }
      } else {
        // Manual payment methods (cash/check)
        alert('Thank you for your generous donation! Please complete your payment using the selected method. You will receive a confirmation email shortly.');
      }

      // Reset form
      setFormData({
        donorName: '', donorEmail: '', phone: '', address: '', amount: '', currency: 'USD',
        frequency: 'one-time', paymentMethod: 'card', designation: 'general', customDesignation: '',
        dedicationName: '', dedicationMessage: '', newsletterSignup: false, anonymousDonation: false,
        notes: ''
      });
      setPaymentData({ amount: 0, currency: 'USD', method: 'card' });
      setCurrentStep(1);

    } catch (error) {
      console.error('Donation error:', error);
      alert('There was an error processing your donation. Please try again.');
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                placeholder="Your mailing address for donation receipt"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[25, 50, 100, 250].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleInputChange('amount', amount.toString())}
                  className={`p-4 border-2 rounded-xl font-semibold transition-all duration-300 ${
                    formData.amount === amount.toString()
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-600'
                      : 'border-gray-300 hover:border-yellow-500 hover:bg-yellow-50 text-blue-900'
                  }`}
                >
                  ${amount}
                </button>
              ))}
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
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter amount"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
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
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  placeholder="Optional message for the dedication..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-display text-lg font-semibold text-dark-blue">
                Communication Preferences
              </h4>
              
              <label className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <input 
                  type="checkbox" 
                  checked={formData.newsletterSignup}
                  onChange={(e) => handleInputChange('newsletterSignup', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500" 
                />
                <span className="text-sm text-blue-900">
                  <strong>Newsletter Subscription</strong><br />
                  Subscribe to our newsletter for updates on how your donation is making a difference, upcoming events, and community impact stories.
                </span>
              </label>

              <label className="flex items-start space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <input 
                  type="checkbox" 
                  checked={formData.anonymousDonation}
                  onChange={(e) => handleInputChange('anonymousDonation', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500" 
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
    <div>
      {/* Hero */}
      <Section className="py-20 bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
        <div className="text-center">
          <Heart className="w-16 h-16 text-white mx-auto mb-6 animate-float" />
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Support Our Mission
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Your generosity helps us nurture spirits, preserve culture, and build stronger communities
          </p>
        </div>
      </Section>

      {/* Impact Areas */}
      <Section className="py-20 bg-white">
        <div>
          <Card variant="premium">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-dark-blue">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm text-clear-gray">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-orange-400 h-2 rounded-full transition-all duration-500"
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
                    <Button type="submit" icon={Heart} disabled={isSubmitting}>
                      {isSubmitting ? 'Processing Donation...' : 'Complete Donation'}
                    </Button>
                  )}
                </div>
              </div>
            </form>

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Secure Donation Process</span>
              </div>
              <p className="text-sm text-green-700">
                Your donation information is encrypted and securely processed. We use industry-standard security measures to protect your personal and financial information.
              </p>
            </div>
          </Card>
        </div>
      </Section>

      {/* Donation Recognition */}
      <Section className="py-20 bg-blue-900 text-blue-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Recognition & Transparency
          </h2>
          <p className="text-xl mb-8">
            We believe in transparency and recognizing our generous supporters
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-blue-900/10 backdrop-blur-sm rounded-xl p-6">
              <Gift className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-blue-900 font-semibold mb-3">Tax Receipts</h3>
              <p className="text-blue-900/80">
                Receive official tax-deductible receipts for all donations
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Users className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Impact Reports</h3>
              <p className="text-blue-900/80">
                Regular updates on how your donation is making a difference
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Target className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Donor Recognition</h3>
              <p className="text-blue-900/80">
                Optional recognition in our annual report and website
              </p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Donate;