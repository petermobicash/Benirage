import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { PaymentMethod, PaymentData, DonationPaymentData, Currency } from '../../types/payment';
import { paymentService } from '../../utils/paymentService';

interface DonationFormData {
  amount: number;
  currency: Currency;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  paymentMethod: PaymentMethod;
  message?: string;
  isAnonymous: boolean;
}

interface DonationFormProps {
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export const DonationForm: React.FC<DonationFormProps> = ({
  onSuccess,
  onError,
  onCancel
}) => {
  const [formData, setFormData] = useState<DonationFormData>({
    amount: 1000,
    currency: 'RWF',
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    paymentMethod: 'mobile-money',
    message: '',
    isAnonymous: false
  });

  // Available currencies based on payment service configuration
  const availableCurrencies: { value: Currency; label: string; symbol: string }[] = [
    { value: 'RWF', label: 'Rwandan Franc', symbol: 'RWF' },
    { value: 'USD', label: 'US Dollar', symbol: '$' },
    { value: 'EUR', label: 'Euro', symbol: '€' }
  ];

  // Helper function to get current currency info
  const getCurrentCurrency = () => {
    return availableCurrencies.find(c => c.value === formData.currency) || availableCurrencies[0];
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = <K extends keyof DonationFormData>(field: K, value: DonationFormData[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.donorEmail && !formData.isAnonymous) {
      newErrors.donorEmail = 'Email is required unless donation is anonymous';
    }

    if (formData.paymentMethod === 'mobile-money' && !formData.donorPhone) {
      newErrors.donorPhone = 'Phone number is required for mobile money payments';
    }

    if (!formData.donorName && !formData.isAnonymous) {
      newErrors.donorName = 'Name is required unless donation is anonymous';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment data
      const paymentData: PaymentData = {
        amount: formData.amount,
        currency: formData.currency,
        method: formData.paymentMethod
      };

      // Add mobile money data if selected
      if (formData.paymentMethod === 'mobile-money') {
        paymentData.mobileMoneyData = {
          phoneNumber: formData.donorPhone,
          provider: 'mtn' // Default to MTN for Rwanda
        };
      }

      // Create donation payment data
      const donationPaymentData: DonationPaymentData = {
        donationId: `donation_${Date.now()}`,
        donorEmail: formData.donorEmail,
        paymentData,
        callbackUrl: `${window.location.origin}/donation/callback`,
        webhookUrl: `${window.location.origin}/api/payments/webhook`
      };

      // Process payment
      const response = await paymentService.processPayment(donationPaymentData);

      if (response.success) {
        onSuccess?.(response.paymentId || '');
      } else {
        onError?.(response.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Donation form error:', error);
      onError?.('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const predefinedAmounts = [500, 1000, 2500, 5000, 10000];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-center">
          Make a Donation
        </h2>
        <p className="text-center text-gray-600 mt-2">
          Support our mission with your generous contribution
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Donation Amount ({getCurrentCurrency().symbol})</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {predefinedAmounts.map(amount => (
                <Button
                  key={amount}
                  type="button"
                  variant={formData.amount === amount ? "primary" : "outline"}
                  onClick={() => handleInputChange('amount', amount)}
                  className="text-sm"
                >
                  {amount.toLocaleString()}
                </Button>
              ))}
            </div>
            <FormField
              label="Custom Amount"
              type="number"
              value={formData.amount}
              onChange={(value) => handleInputChange('amount', parseFloat(value) || 0)}
              placeholder="Enter custom amount"
              error={errors.amount}
              min="100"
            />
          </div>

          {/* Currency Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Currency</label>
            <div className="grid grid-cols-3 gap-2">
              {availableCurrencies.map(currency => (
                <Button
                  key={currency.value}
                  type="button"
                  variant={formData.currency === currency.value ? "primary" : "outline"}
                  onClick={() => handleInputChange('currency', currency.value)}
                  className="text-sm"
                >
                  {currency.symbol}
                </Button>
              ))}
            </div>
          </div>

          {/* Donor Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={formData.isAnonymous}
                onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isAnonymous" className="text-sm">
                Make this donation anonymous
              </label>
            </div>

            {!formData.isAnonymous && (
              <>
                <FormField
                  label="Full Name"
                  type="text"
                  value={formData.donorName}
                  onChange={(value) => handleInputChange('donorName', value)}
                  placeholder="Enter your full name"
                  error={errors.donorName}
                  required
                />

                <FormField
                  label="Email Address"
                  type="email"
                  value={formData.donorEmail}
                  onChange={(value) => handleInputChange('donorEmail', value)}
                  placeholder="Enter your email address"
                  error={errors.donorEmail}
                  required
                />
              </>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Payment Method</label>
            <div className="grid grid-cols-1 gap-2">
              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mobile-money"
                  checked={formData.paymentMethod === 'mobile-money'}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value as PaymentMethod)}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-medium">MTN Mobile Money</div>
                  <div className="text-sm text-gray-500">Pay using MTN MoMo</div>
                </div>
              </label>

              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value as PaymentMethod)}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-medium">Credit/Debit Card</div>
                  <div className="text-sm text-gray-500">Pay with Visa, Mastercard, etc.</div>
                </div>
              </label>

              <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank-transfer"
                  checked={formData.paymentMethod === 'bank-transfer'}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value as PaymentMethod)}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-medium">Bank Transfer</div>
                  <div className="text-sm text-gray-500">Direct bank transfer</div>
                </div>
              </label>
            </div>
          </div>

          {/* Phone number for mobile money */}
          {formData.paymentMethod === 'mobile-money' && (
            <FormField
              label="Phone Number"
              type="tel"
              value={formData.donorPhone}
              onChange={(value) => handleInputChange('donorPhone', value)}
              placeholder="Enter your MTN phone number (e.g., +2507xxxxxxxx)"
              error={errors.donorPhone}
              required
            />
          )}

          {/* Optional message */}
          <FormField
            label="Message (Optional)"
            type="textarea"
            value={formData.message}
            onChange={(value) => handleInputChange('message', value)}
            placeholder="Add a message with your donation"
            rows={3}
          />

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Donate {formData.amount.toLocaleString()} ${getCurrentCurrency().symbol}`}
            </Button>
          </div>

          {/* Security notice */}
          <div className="text-xs text-gray-500 text-center pt-2">
            Your payment information is secure and encrypted. We support MTN Mobile Money for Rwanda.
          </div>
        </form>
      </div>
    </Card>
  );
};

export default DonationForm;