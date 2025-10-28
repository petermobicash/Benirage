import React, { useState, useEffect, useCallback } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { MtnPaymentResponse } from '../../types/payment';
import { mtnPaymentService } from '../../utils/mtnPaymentService';

interface MtnPaymentStatusProps {
  paymentId: string;
  phoneNumber: string;
  amount: number;
  onPaymentComplete?: () => void;
  onPaymentFailed?: (error: string) => void;
  onCancel?: () => void;
}

export const MtnPaymentStatus: React.FC<MtnPaymentStatusProps> = ({
  paymentId,
  phoneNumber,
  amount,
  onPaymentComplete,
  onPaymentFailed,
  onCancel
}) => {
  const [status, setStatus] = useState<'checking' | 'pending' | 'completed' | 'failed'>('checking');
  const [error, setError] = useState<string>('');
  const [checkCount, setCheckCount] = useState(0);

  const checkPaymentStatus = useCallback(async () => {
    try {
      const response: MtnPaymentResponse = await mtnPaymentService.checkPaymentStatus(paymentId);

      if (response.success && response.status === 'completed') {
        setStatus('completed');
        onPaymentComplete?.();
      } else if (response.status === 'failed') {
        setStatus('failed');
        setError(response.error || 'Payment failed');
        onPaymentFailed?.(response.error || 'Payment failed');
      } else {
        setStatus('pending');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setStatus('failed');
      setError('Failed to check payment status');
      onPaymentFailed?.('Failed to check payment status');
    }
  }, [paymentId, onPaymentComplete, onPaymentFailed]);

  useEffect(() => {
    checkPaymentStatus();

    // Check payment status every 5 seconds for up to 2 minutes
    const interval = setInterval(() => {
      if (checkCount < 24) { // 24 * 5 seconds = 2 minutes
        checkPaymentStatus();
        setCheckCount(prev => prev + 1);
      } else {
        clearInterval(interval);
        setStatus('failed');
        setError('Payment timeout. Please try again.');
        onPaymentFailed?.('Payment timeout');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentId, checkCount, checkPaymentStatus, onPaymentFailed, onPaymentComplete]);

  const getStatusMessage = () => {
    switch (status) {
      case 'checking':
        return 'Checking payment status...';
      case 'pending':
        return 'Payment is being processed. Please check your MTN phone for the payment prompt.';
      case 'completed':
        return 'Payment completed successfully! Thank you for your donation.';
      case 'failed':
        return error || 'Payment failed. Please try again.';
      default:
        return 'Unknown status';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        );
      case 'pending':
        return (
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
            <div className="w-4 h-4 bg-yellow-600 rounded-full animate-pulse"></div>
          </div>
        );
      case 'completed':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'failed':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="p-6 text-center">
        {/* Status Icon */}
        <div className="mb-4">
          {getStatusIcon()}
        </div>

        {/* Status Message */}
        <h3 className="text-lg font-semibold mb-2">
          {status === 'completed' ? 'Payment Successful!' :
           status === 'failed' ? 'Payment Failed' : 'Processing Payment'}
        </h3>

        <p className="text-gray-600 mb-4">
          {getStatusMessage()}
        </p>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">{amount.toLocaleString()} RWF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{phoneNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment ID:</span>
              <span className="font-mono text-xs">{paymentId}</span>
            </div>
          </div>
        </div>

        {/* Instructions for pending status */}
        {status === 'pending' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
            <h4 className="font-medium text-blue-900 mb-2">Complete your payment:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Check your MTN phone for a payment prompt</li>
              <li>2. Enter your MTN Mobile Money PIN</li>
              <li>3. Confirm the payment</li>
              <li>4. Wait for confirmation</li>
            </ol>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {status === 'pending' && (
            <Button
              onClick={checkPaymentStatus}
              variant="outline"
              className="w-full"
            >
              Check Status Again
            </Button>
          )}

          {status === 'failed' && (
            <Button
              onClick={onCancel}
              variant="primary"
              className="w-full"
            >
              Try Again
            </Button>
          )}

          {status === 'completed' && (
            <Button
              onClick={onPaymentComplete}
              variant="primary"
              className="w-full"
            >
              Continue
            </Button>
          )}

          {(status === 'pending' || status === 'checking') && (
            <Button
              onClick={onCancel}
              variant="ghost"
              className="w-full text-gray-500"
            >
              Cancel Payment
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-4 text-xs text-gray-500">
          Need help? Contact us at {import.meta.env.VITE_CONTACT_PHONE || '+250788529611'}
        </div>
      </div>
    </Card>
  );
};

export default MtnPaymentStatus;