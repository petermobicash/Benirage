// Payment method types
export type PaymentMethod = 'card' | 'bank-transfer' | 'mobile-money' | 'paypal' | 'check' | 'cash' | 'other';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

export type Currency = 'USD' | 'EUR' | 'RWF' | 'KES' | 'UGX' | 'TZS';

export type PaymentFrequency = 'one-time' | 'monthly' | 'quarterly' | 'annually';

// Payment provider types
export interface PaymentProvider {
  name: string;
  sandbox: boolean;
  supportedMethods: PaymentMethod[];
  supportedCurrencies: Currency[];
}

// Card payment details
export interface CardPaymentData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  holderName: string;
}

// Mobile money details
export interface MobileMoneyData {
  phoneNumber: string;
  provider: 'mtn' | 'airtel';
}

// MTN-specific payment data
export interface MtnPaymentData {
  phoneNumber: string;
  amount: number;
  currency: string;
  externalId: string;
  payerMessage?: string;
  payeeNote?: string;
}

// MTN payment response
export interface MtnPaymentResponse {
  success: boolean;
  paymentId?: string;
  status: PaymentStatus;
  financialTransactionId?: string;
  externalId?: string;
  amount?: number;
  currency?: string;
  payerMessage?: string;
  payeeNote?: string;
  error?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

// MTN payment status
export type MtnPaymentStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'CANCELLED' | 'TIMEOUT';

// MTN webhook payload
export interface MtnWebhookPayload {
  financialTransactionId: string;
  externalId: string;
  amount: number;
  currency: string;
  status: MtnPaymentStatus;
  reason?: string;
  payer: {
    partyIdType: string;
    partyId: string;
  };
  payeeNote?: string;
  payerMessage?: string;
  timestamp: string;
}

// Bank transfer details
export interface BankTransferData {
  accountNumber: string;
  bankName: string;
  accountHolder: string;
}

// PayPal details
export interface PayPalData {
  email: string;
}

// Generic payment data
export interface PaymentData {
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  cardData?: CardPaymentData;
  mobileMoneyData?: MobileMoneyData;
  bankTransferData?: BankTransferData;
  paypalData?: PayPalData;
}

// Payment response
export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  status: PaymentStatus;
  redirectUrl?: string;
  error?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

// Payment verification
export interface PaymentVerification {
  paymentId: string;
  expectedAmount: number;
  currency: Currency;
}

// Donation payment integration
export interface DonationPaymentData {
  donationId: string;
  donorEmail: string;
  paymentData: PaymentData;
  callbackUrl?: string;
  webhookUrl?: string;
}