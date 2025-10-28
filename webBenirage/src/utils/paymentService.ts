import {
  PaymentData,
  PaymentResponse,
  PaymentMethod,
  PaymentStatus,
  Currency,
  DonationPaymentData,
  PaymentVerification,
  MtnPaymentData
} from '../types/payment';
import mtnPaymentService from './mtnPaymentService';

// Payment provider configurations
const PAYMENT_PROVIDERS = {
  stripe: {
    name: 'Stripe',
    sandbox: true,
    publicKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_sandbox_key',
    secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY || 'sk_test_sandbox_key',
    supportedMethods: ['card'] as PaymentMethod[],
    supportedCurrencies: ['USD', 'EUR'] as Currency[]
  },
  flutterwave: {
    name: 'Flutterwave',
    sandbox: true,
    publicKey: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-sandbox_key',
    secretKey: import.meta.env.VITE_FLUTTERWAVE_SECRET_KEY || 'FLWSECK_TEST-sandbox_key',
    supportedMethods: ['card', 'mobile-money', 'bank-transfer'] as PaymentMethod[],
    supportedCurrencies: ['USD', 'EUR', 'RWF', 'KES', 'UGX', 'TZS'] as Currency[]
  },
  paystack: {
    name: 'Paystack',
    sandbox: true,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_sandbox_key',
    secretKey: import.meta.env.VITE_PAYSTACK_SECRET_KEY || 'sk_test_sandbox_key',
    supportedMethods: ['card', 'mobile-money', 'bank-transfer'] as PaymentMethod[],
    supportedCurrencies: ['USD', 'RWF', 'KES', 'UGX', 'TZS'] as Currency[]
  },
  mtn: {
    name: 'MTN Mobile Money',
    sandbox: true,
    apiKey: import.meta.env.VITE_MTN_API_KEY || 'mtn_sandbox_key',
    merchantId: import.meta.env.VITE_MTN_MERCHANT_ID || 'mtn_merchant_id',
    supportedMethods: ['mobile-money'] as PaymentMethod[],
    supportedCurrencies: ['RWF'] as Currency[]
  }
};

class PaymentService {
  private providers = PAYMENT_PROVIDERS;

  /**
   * Get supported payment providers for a specific method and currency
   */
  getSupportedProviders(method: PaymentMethod, currency: Currency) {
    return Object.entries(this.providers).filter(([, config]) =>
      config.sandbox &&
      config.supportedMethods.includes(method) &&
      config.supportedCurrencies.includes(currency)
    );
  }

  /**
   * Process card payment using Stripe
   */
  async processCardPayment(paymentData: PaymentData, donationId: string): Promise<PaymentResponse> {
    try {
      // In sandbox environment, simulate payment processing
      if (this.providers.stripe.sandbox) {
        return this.simulateCardPayment(paymentData);
      }

      // Real Stripe integration would go here
       if (!paymentData.cardData) {
         return {
           success: false,
           status: 'failed' as PaymentStatus,
           error: 'Card data is required for card payments'
         };
       }

       const response = await fetch('/api/payments/stripe/charge', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${this.providers.stripe.secretKey}`
         },
         body: JSON.stringify({
           amount: paymentData.amount * 100, // Convert to cents
           currency: paymentData.currency.toLowerCase(),
           source: paymentData.cardData,
           metadata: { donationId }
         })
       });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          paymentId: result.id,
          status: 'completed' as PaymentStatus,
          metadata: result
        };
      } else {
        return {
          success: false,
          status: 'failed' as PaymentStatus,
          error: result.error.message
        };
      }
    } catch (error) {
      console.error('Card payment error:', error);
      return {
        success: false,
        status: 'failed' as PaymentStatus,
        error: 'Payment processing failed'
      };
    }
  }

  /**
   * Process mobile money payment using Flutterwave
   */
  async processMobileMoneyPayment(paymentData: PaymentData, donationId: string): Promise<PaymentResponse> {
    try {
      if (this.providers.flutterwave.sandbox) {
        return this.simulateMobileMoneyPayment(paymentData, donationId);
      }

      const response = await fetch('/api/payments/flutterwave/mobile-money', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.providers.flutterwave.secretKey}`
        },
        body: JSON.stringify({
          amount: paymentData.amount,
          currency: paymentData.currency,
          phone_number: paymentData.mobileMoneyData?.phoneNumber,
          network: paymentData.mobileMoneyData?.provider,
          email: paymentData.cardData?.holderName || 'donor@example.com',
          tx_ref: donationId
        })
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          paymentId: result.data.id,
          status: result.data.status === 'successful' ? 'completed' : 'processing',
          redirectUrl: result.data.link,
          metadata: result.data
        };
      } else {
        return {
          success: false,
          status: 'failed' as PaymentStatus,
          error: result.message
        };
      }
    } catch (error) {
      console.error('Mobile money payment error:', error);
      return {
        success: false,
        status: 'failed' as PaymentStatus,
        error: 'Mobile money payment failed'
      };
    }
  }

  /**
   * Process bank transfer payment
   */
  async processBankTransferPayment(paymentData: PaymentData, donationId: string): Promise<PaymentResponse> {
    try {
      if (this.providers.flutterwave.sandbox) {
        return this.simulateBankTransferPayment(paymentData);
      }

      const response = await fetch('/api/payments/flutterwave/bank-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.providers.flutterwave.secretKey}`
        },
        body: JSON.stringify({
          amount: paymentData.amount,
          currency: paymentData.currency,
          account_bank: paymentData.bankTransferData?.bankName,
          account_number: paymentData.bankTransferData?.accountNumber,
          email: paymentData.cardData?.holderName || 'donor@example.com',
          tx_ref: donationId
        })
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          paymentId: result.data.id,
          status: 'processing' as PaymentStatus,
          metadata: result.data
        };
      } else {
        return {
          success: false,
          status: 'failed' as PaymentStatus,
          error: result.message
        };
      }
    } catch (error) {
      console.error('Bank transfer payment error:', error);
      return {
        success: false,
        status: 'failed' as PaymentStatus,
        error: 'Bank transfer setup failed'
      };
    }
  }

  /**
   * Process PayPal payment
   */
  async processPayPalPayment(paymentData: PaymentData, donationId: string): Promise<PaymentResponse> {
    try {
      // PayPal sandbox integration
      const response = await fetch('/api/payments/paypal/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: paymentData.amount,
          currency: paymentData.currency,
          email: paymentData.paypalData?.email,
          donationId
        })
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          paymentId: result.id,
          status: 'processing' as PaymentStatus,
          redirectUrl: result.links?.find((link: unknown) => (link as { rel: string }).rel === 'approval_url')?.href,
          metadata: result
        };
      } else {
        return {
          success: false,
          status: 'failed' as PaymentStatus,
          error: result.message
        };
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      return {
        success: false,
        status: 'failed' as PaymentStatus,
        error: 'PayPal payment failed'
      };
    }
  }

  /**
    * Simulate card payment for sandbox testing
    */
   private simulateCardPayment(paymentData: PaymentData): PaymentResponse {
    // Simulate different card scenarios for testing
    const cardNumber = paymentData.cardData?.cardNumber || '';

    if (cardNumber.endsWith('0000')) {
      // Simulate failure
      return {
        success: false,
        status: 'failed',
        error: 'Card declined - insufficient funds'
      };
    }

    return {
      success: true,
      paymentId: `sim_card_${Date.now()}`,
      status: 'completed',
      metadata: {
        provider: 'stripe',
        sandbox: true,
        amount: paymentData.amount,
        currency: paymentData.currency
      }
    };
  }

  /**
    * Simulate mobile money payment for sandbox testing
    */
   private simulateMobileMoneyPayment(paymentData: PaymentData, donationId: string): PaymentResponse {
    return {
      success: true,
      paymentId: `sim_mm_${Date.now()}`,
      status: 'processing',
      redirectUrl: `https://sandbox.flutterwave.com/pay/${donationId}`,
      metadata: {
        provider: 'flutterwave',
        sandbox: true,
        phoneNumber: paymentData.mobileMoneyData?.phoneNumber,
        mobileProvider: paymentData.mobileMoneyData?.provider
      }
    };
  }

  /**
    * Simulate MTN payment for sandbox testing
    */
   private simulateMtnPayment(paymentData: PaymentData, donationId: string): PaymentResponse {
     // Simulate different scenarios for testing
     const phoneNumber = paymentData.mobileMoneyData?.phoneNumber || '';

     // Simulate failure for specific test numbers
     if (phoneNumber.endsWith('0000')) {
       return {
         success: false,
         status: 'failed',
         error: 'Insufficient funds (sandbox simulation)'
       };
     }

     // Simulate timeout for specific test numbers
     if (phoneNumber.endsWith('9999')) {
       return {
         success: false,
         status: 'cancelled',
         error: 'Payment timeout (sandbox simulation)'
       };
     }

     return {
       success: true,
       paymentId: `sim_mtn_${Date.now()}`,
       status: 'processing',
       metadata: {
         provider: 'mtn',
         sandbox: true,
         phoneNumber: phoneNumber,
         amount: paymentData.amount,
         currency: paymentData.currency,
         donationId: donationId,
         message: 'MTN payment initiated successfully (sandbox mode)'
       }
     };
   }

  /**
    * Simulate bank transfer payment for sandbox testing
    */
   private simulateBankTransferPayment(paymentData: PaymentData): PaymentResponse {
    return {
      success: true,
      paymentId: `sim_bt_${Date.now()}`,
      status: 'processing',
      metadata: {
        provider: 'flutterwave',
        sandbox: true,
        bankName: paymentData.bankTransferData?.bankName,
        accountNumber: paymentData.bankTransferData?.accountNumber
      }
    };
  }

  /**
   * Verify payment status
   */
  async verifyPayment(verification: PaymentVerification): Promise<PaymentStatus> {
    try {
      // In sandbox, simulate verification
      if (verification.paymentId.startsWith('sim_')) {
        return 'completed';
      }

      // Real verification logic would go here
      const response = await fetch(`/api/payments/verify/${verification.paymentId}`);

      if (!response.ok) {
        console.error('Payment verification failed:', response.status, response.statusText);
        return 'failed';
      }

      const result = await response.json();

      return result.status || 'pending';
    } catch (error) {
      console.error('Payment verification error:', error);
      return 'failed';
    }
  }

  /**
   * Process MTN mobile money payment
   */
  async processMtnPayment(paymentData: PaymentData, donationId: string): Promise<PaymentResponse> {
    try {
      if (!paymentData.mobileMoneyData?.phoneNumber) {
        return {
          success: false,
          status: 'failed' as PaymentStatus,
          error: 'Phone number is required for MTN payments'
        };
      }

      // Validate phone number
      if (!mtnPaymentService.validatePhoneNumber(paymentData.mobileMoneyData.phoneNumber)) {
        return {
          success: false,
          status: 'failed' as PaymentStatus,
          error: 'Invalid phone number format'
        };
      }

      // Check if we're in sandbox mode
      if (this.providers.mtn.sandbox) {
        return this.simulateMtnPayment(paymentData, donationId);
      }

      const formattedPhone = mtnPaymentService.formatPhoneNumber(paymentData.mobileMoneyData.phoneNumber);
      const externalId = mtnPaymentService.generateExternalId();

      const mtnPaymentData: MtnPaymentData = {
        phoneNumber: formattedPhone,
        amount: paymentData.amount,
        currency: paymentData.currency,
        externalId,
        payerMessage: `Donation payment - ${donationId}`,
        payeeNote: 'Thank you for your generous donation'
      };

      const mtnResponse = await mtnPaymentService.initiatePayment(mtnPaymentData);

      if (mtnResponse.success) {
        return {
          success: true,
          paymentId: mtnResponse.paymentId,
          status: mtnResponse.status,
          metadata: {
            provider: 'mtn',
            externalId,
            phoneNumber: formattedPhone,
            sandbox: this.providers.mtn.sandbox
          }
        };
      } else {
        return {
          success: false,
          status: 'failed' as PaymentStatus,
          error: mtnResponse.error || 'MTN payment failed'
        };
      }
    } catch (error) {
      console.error('MTN payment error:', error);
      return {
        success: false,
        status: 'failed' as PaymentStatus,
        error: 'MTN payment processing failed'
      };
    }
  }

  /**
   * Main payment processing method
   */
  async processPayment(donationPaymentData: DonationPaymentData): Promise<PaymentResponse> {
    const { paymentData, donationId } = donationPaymentData;

    switch (paymentData.method) {
      case 'card':
        return this.processCardPayment(paymentData, donationId);
      case 'mobile-money':
        // Check if it's specifically MTN mobile money
        if (paymentData.mobileMoneyData?.provider === 'mtn') {
          return this.processMtnPayment(paymentData, donationId);
        } else {
          return this.processMobileMoneyPayment(paymentData, donationId);
        }
      case 'bank-transfer':
        return this.processBankTransferPayment(paymentData, donationId);
      case 'paypal':
        return this.processPayPalPayment(paymentData, donationId);
      case 'cash':
      case 'check':
        return {
          success: true,
          paymentId: `manual_${Date.now()}`,
          status: 'pending',
          metadata: { method: paymentData.method }
        };
      default:
        return {
          success: false,
          status: 'failed',
          error: 'Unsupported payment method'
        };
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;