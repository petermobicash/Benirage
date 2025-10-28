import {
  MtnPaymentData,
  MtnPaymentResponse,
  MtnPaymentStatus,
  MtnWebhookPayload,
  PaymentStatus
} from '../types/payment';

// MTN Payment Service Configuration
interface MtnConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  merchantId: string;
  currency: string;
  callbackUrl: string;
  webhookUrl: string;
  sandbox: boolean;
}

class MtnPaymentService {
  private config: MtnConfig;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_MTN_API_KEY || '',
      apiSecret: import.meta.env.VITE_MTN_API_SECRET || '',
      baseUrl: import.meta.env.VITE_MTN_SANDBOX_BASE_URL || 'https://sandbox.mtn.com',
      merchantId: import.meta.env.VITE_MTN_MERCHANT_ID || '',
      currency: import.meta.env.VITE_MTN_CURRENCY || 'RWF',
      callbackUrl: import.meta.env.VITE_MTN_CALLBACK_URL || '',
      webhookUrl: import.meta.env.VITE_MTN_WEBHOOK_URL || '',
      sandbox: true // Always use sandbox for development
    };
  }

  /**
   * Generate access token for MTN API
   */
  private async getAccessToken(): Promise<string> {
    try {
      const auth = btoa(`${this.config.apiKey}:${this.config.apiSecret}`);

      const response = await fetch(`${this.config.baseUrl}/collection/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`,
          'Ocp-Apim-Subscription-Key': this.config.apiKey
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error getting MTN access token:', error);
      throw error;
    }
  }

  /**
   * Initiate MTN payment request
   */
  async initiatePayment(paymentData: MtnPaymentData): Promise<MtnPaymentResponse> {
    try {
      const accessToken = await this.getAccessToken();

      const payload = {
        amount: paymentData.amount.toString(),
        currency: paymentData.currency,
        externalId: paymentData.externalId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: paymentData.phoneNumber
        },
        payerMessage: paymentData.payerMessage || 'Donation payment',
        payeeNote: paymentData.payeeNote || 'Thank you for your donation'
      };

      const response = await fetch(`${this.config.baseUrl}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Reference-Id': paymentData.externalId,
          'X-Target-Environment': this.config.sandbox ? 'sandbox' : 'production',
          'Ocp-Apim-Subscription-Key': this.config.apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          status: 'failed',
          error: errorData.message || `Payment initiation failed: ${response.statusText}`
        };
      }

      return {
        success: true,
        paymentId: paymentData.externalId,
        status: 'processing',
        externalId: paymentData.externalId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        metadata: {
          provider: 'mtn',
          sandbox: this.config.sandbox,
          phoneNumber: paymentData.phoneNumber
        }
      };
    } catch (error) {
      console.error('Error initiating MTN payment:', error);
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment initiation failed'
      };
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(paymentId: string): Promise<MtnPaymentResponse> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.config.baseUrl}/collection/v1_0/requesttopay/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Target-Environment': this.config.sandbox ? 'sandbox' : 'production',
          'Ocp-Apim-Subscription-Key': this.config.apiKey
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            status: 'pending',
            error: 'Payment not found'
          };
        }
        throw new Error(`Failed to check payment status: ${response.statusText}`);
      }

      const data = await response.json();

      let status: PaymentStatus = 'pending';
      switch (data.status) {
        case 'SUCCESSFUL':
          status = 'completed';
          break;
        case 'FAILED':
          status = 'failed';
          break;
        case 'PENDING':
          status = 'processing';
          break;
        case 'CANCELLED':
        case 'TIMEOUT':
          status = 'cancelled';
          break;
        default:
          status = 'pending';
      }

      return {
        success: data.status === 'SUCCESSFUL',
        paymentId,
        status,
        financialTransactionId: data.financialTransactionId,
        externalId: data.externalId,
        amount: data.amount ? parseFloat(data.amount) : undefined,
        currency: data.currency,
        metadata: {
          provider: 'mtn',
          sandbox: this.config.sandbox,
          reason: data.reason
        }
      };
    } catch (error) {
      console.error('Error checking MTN payment status:', error);
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to check payment status'
      };
    }
  }

  /**
   * Process MTN webhook
   */
  async processWebhook(payload: MtnWebhookPayload): Promise<void> {
    try {
      console.log('Processing MTN webhook:', payload);

      // Here you would typically:
      // 1. Verify the webhook signature
      // 2. Update payment status in database
      // 3. Send confirmation email to donor
      // 4. Update donation records

      // For now, we'll just log the webhook and status
      const status = this.mapMtnStatusToPaymentStatus(payload.status);
      console.log('MTN webhook processed - Payment status:', status, 'External ID:', payload.externalId);

      // TODO: Add webhook processing logic here
      // await this.updatePaymentInDatabase(payload.externalId, status, payload);

    } catch (error) {
      console.error('Error processing MTN webhook:', error);
      throw error;
    }
  }

  /**
   * Map MTN status to internal payment status
   */
  private mapMtnStatusToPaymentStatus(mtnStatus: MtnPaymentStatus): PaymentStatus {
    switch (mtnStatus) {
      case 'SUCCESSFUL':
        return 'completed';
      case 'FAILED':
        return 'failed';
      case 'PENDING':
        return 'processing';
      case 'CANCELLED':
      case 'TIMEOUT':
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  /**
   * Generate unique external ID for payment
   */
  generateExternalId(): string {
    return `MTN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate phone number format for MTN
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Check if it starts with country code (250 for Rwanda)
    if (cleaned.startsWith('250')) {
      return cleaned.length === 12; // 250 + 9 digits
    }

    // Check if it's a local number (9 digits for Rwanda)
    if (cleaned.length === 9) {
      return true;
    }

    return false;
  }

  /**
   * Format phone number for MTN API
   */
  formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Add country code if not present
    if (cleaned.length === 9) {
      return `250${cleaned}`;
    }

    return cleaned;
  }
}

export const mtnPaymentService = new MtnPaymentService();
export default mtnPaymentService;