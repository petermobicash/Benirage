import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { PaymentResponse } from '../../types/payment';

interface DonationResultProps {
  type: 'success' | 'error';
  paymentResponse?: PaymentResponse;
  amount?: number;
  paymentMethod?: string;
  onClose?: () => void;
  onRetry?: () => void;
  onViewReceipt?: () => void;
}

export const DonationResult: React.FC<DonationResultProps> = ({
  type,
  paymentResponse,
  amount,
  paymentMethod,
  onClose,
  onRetry,
  onViewReceipt
}) => {
  const isSuccess = type === 'success';

  const getTitle = () => {
    return isSuccess ? 'Donation Successful!' : 'Donation Failed';
  };

  const getMessage = () => {
    if (isSuccess) {
      return 'Thank you for your generous donation! Your contribution helps us continue our mission and make a positive impact in our community.';
    } else {
      return paymentResponse?.error || 'We encountered an issue processing your donation. Please try again or contact support if the problem persists.';
    }
  };

  const getIcon = () => {
    if (isSuccess) {
      return (
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <div className="p-6 text-center">
        {getIcon()}

        <h2 className="text-2xl font-bold mb-4">
          {getTitle()}
        </h2>

        <p className="text-gray-600 mb-6">
          {getMessage()}
        </p>

        {/* Payment Details for Success */}
        {isSuccess && paymentResponse && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium mb-3">Donation Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">{amount?.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">{paymentMethod || 'Mobile Money'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-xs">{paymentResponse.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600">{paymentResponse.status}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Details for Failure */}
        {!isSuccess && paymentResponse?.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-red-900 mb-2">Error Details</h3>
            <p className="text-sm text-red-800">{paymentResponse.error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {isSuccess ? (
            <div className="space-y-2">
              {onViewReceipt && (
                <Button
                  onClick={onViewReceipt}
                  variant="outline"
                  className="w-full"
                >
                  View Receipt
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="primary"
                className="w-full"
              >
                Continue
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {onRetry && (
                <Button
                  onClick={onRetry}
                  variant="primary"
                  className="w-full"
                >
                  Try Again
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Contact us at{' '}
            <a
              href={`tel:${import.meta.env.VITE_CONTACT_PHONE || '+250788529611'}`}
              className="text-blue-600 hover:underline"
            >
              {import.meta.env.VITE_CONTACT_PHONE || '+250788529611'}
            </a>
            {' '}or{' '}
            <a
              href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL || 'info@benirage.org'}`}
              className="text-blue-600 hover:underline"
            >
              {import.meta.env.VITE_CONTACT_EMAIL || 'info@benirage.org'}
            </a>
          </p>
        </div>
      </div>
    </Card>
  );
};

export default DonationResult;