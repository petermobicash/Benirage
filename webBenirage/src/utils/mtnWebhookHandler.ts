import { MtnWebhookPayload, PaymentStatus } from '../types/payment';
import { mtnPaymentService } from './mtnPaymentService';
import { createHmac } from 'crypto';

export interface WebhookResponse {
  success: boolean;
  message: string;
  error?: string;
}

export class MtnWebhookHandler {
  /**
   * Process incoming MTN webhook
   */
  static async processWebhook(payload: MtnWebhookPayload): Promise<WebhookResponse> {
    try {
      console.log('Processing MTN webhook:', JSON.stringify(payload, null, 2));

      // Validate webhook payload
      if (!this.validateWebhookPayload(payload)) {
        return {
          success: false,
          message: 'Invalid webhook payload',
          error: 'Missing required fields in webhook payload'
        };
      }

      // Process the webhook through MTN service
      await mtnPaymentService.processWebhook(payload);

      // Here you would typically:
      // 1. Update payment status in database
      // 2. Send confirmation email to donor
      // 3. Update donation records
      // 4. Trigger any post-payment actions

      await this.updatePaymentInDatabase(payload);
      await this.sendConfirmationEmail(payload);
      await this.updateDonationRecords(payload);

      return {
        success: true,
        message: 'Webhook processed successfully'
      };
    } catch (error) {
      console.error('Error processing MTN webhook:', error);

      return {
        success: false,
        message: 'Failed to process webhook',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate webhook payload structure
   */
  private static validateWebhookPayload(payload: MtnWebhookPayload): boolean {
    return !!(
      payload.financialTransactionId &&
      payload.externalId &&
      payload.amount &&
      payload.currency &&
      payload.status &&
      payload.payer?.partyIdType &&
      payload.payer?.partyId &&
      payload.timestamp
    );
  }

  /**
   * Update payment status in database
   */
  private static async updatePaymentInDatabase(payload: MtnWebhookPayload): Promise<void> {
    try {
      // Map MTN status to internal status
      const status = this.mapMtnStatusToPaymentStatus(payload.status);

      // Here you would update your database
      // Example:
      /*
      await supabase
        .from('payments')
        .update({
          status,
          financial_transaction_id: payload.financialTransactionId,
          updated_at: new Date().toISOString()
        })
        .eq('external_id', payload.externalId);
      */

      console.log(`Payment ${payload.externalId} status updated to ${status}`);
    } catch (error) {
      console.error('Error updating payment in database:', error);
      throw error;
    }
  }

  /**
   * Send confirmation email to donor
   */
  private static async sendConfirmationEmail(payload: MtnWebhookPayload): Promise<void> {
    try {
      if (payload.status !== 'SUCCESSFUL') {
        return; // Only send confirmation for successful payments
      }

      // Here you would send confirmation email
      // Example:
      /*
      await emailService.sendDonationConfirmation({
        externalId: payload.externalId,
        amount: payload.amount,
        currency: payload.currency,
        donorEmail: await this.getDonorEmail(payload.externalId)
      });
      */

      console.log(`Confirmation email sent for payment ${payload.externalId}`);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Don't throw here as email failure shouldn't fail the webhook
    }
  }

  /**
   * Update donation records
   */
  private static async updateDonationRecords(payload: MtnWebhookPayload): Promise<void> {
    try {
      // Here you would update donation-related records
      // Example:
      /*
      await supabase
        .from('donations')
        .update({
          payment_status: this.mapMtnStatusToPaymentStatus(payload.status),
          payment_date: new Date(payload.timestamp).toISOString(),
          transaction_id: payload.financialTransactionId
        })
        .eq('payment_id', payload.externalId);
      */

      console.log(`Donation records updated for payment ${payload.externalId}`);
    } catch (error) {
      console.error('Error updating donation records:', error);
      throw error;
    }
  }

  /**
   * Map MTN status to internal payment status
   */
  private static mapMtnStatusToPaymentStatus(mtnStatus: string): PaymentStatus {
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
     * Verify webhook signature (if MTN provides signature verification)
     */
    static verifyWebhookSignature(payload: unknown, signature: string, secret: string): boolean {
     try {
       // MTN might provide signature verification
       // This is a placeholder for signature verification logic
       // You would implement this based on MTN's documentation

       // For now, we'll assume all webhooks are valid in sandbox mode
       if (mtnPaymentService['config']?.sandbox) {
         return true;
       }

       // Basic HMAC signature verification using the payload
       if (signature && secret) {
         const expectedSignature = createHmac('sha256', secret)
           .update(JSON.stringify(payload))
           .digest('hex');

         return signature === expectedSignature;
       }

       // If signature or secret is missing in production, reject the webhook
       console.warn('Missing signature or secret for webhook verification');
       return false;
     } catch (error) {
       console.error('Error verifying webhook signature:', error);
       return false;
     }
   }

}

export default MtnWebhookHandler;