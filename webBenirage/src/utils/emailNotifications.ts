import { supabase } from '../lib/supabase';

interface Message {
  message_text: string;
  sender_name: string;
}

interface EmailNotificationData {
  to: string;
  guestName: string;
  adminName: string;
  message: string;
  roomName: string;
  replyUrl?: string;
}

export const sendEmailNotification = async (data: EmailNotificationData) => {
  try {
    // In a real application, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Resend
    // - Or your own SMTP server

    // For now, we'll log the email that would be sent and store it in the database
    console.log('📧 Email notification would be sent:', {
      to: data.to,
      subject: `New reply from ${data.adminName} in ${data.roomName}`,
      html: generateEmailHTML(data),
      text: generateEmailText(data)
    });

    // Store notification in database for tracking
    await supabase
      .from('email_notifications')
      .insert([{
        recipient_email: data.to,
        guest_name: data.guestName,
        admin_name: data.adminName,
        message_preview: data.message.substring(0, 100),
        room_name: data.roomName,
        notification_type: 'admin_reply',
        status: 'pending',
        metadata: {
          replyUrl: data.replyUrl
        }
      }]);

    return { success: true };
  } catch (error) {
    console.error('Error sending email notification:', error);
    return { success: false, error };
  }
};

const generateEmailHTML = (data: EmailNotificationData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New reply from ${data.adminName}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h1 style="color: #1e40af; margin-bottom: 20px; text-align: center;">
          New Reply from BENIRAGE Support
        </h1>

        <div style="background-color: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; margin-bottom: 20px;">
            Hi <strong>${data.guestName}</strong>,
          </p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            <strong>${data.adminName}</strong> has replied to your message in <strong>${data.roomName}</strong>:
          </p>

          <div style="background-color: #f1f5f9; padding: 15px; border-left: 4px solid #1e40af; margin: 20px 0;">
            <p style="font-size: 14px; color: #475569; margin: 0;">
              "${data.message}"
            </p>
          </div>

          ${data.replyUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.replyUrl}"
                 style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Continue Chat
              </a>
            </div>
          ` : ''}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 14px; color: #64748b; margin-bottom: 10px;">
              <strong>What to expect:</strong>
            </p>
            <ul style="font-size: 14px; color: #64748b; padding-left: 20px;">
              <li>Get instant notifications for new replies</li>
              <li>Your conversation history is saved</li>
              <li>Multiple support agents can help you</li>
              <li>All conversations are kept private and secure</li>
            </ul>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <p style="font-size: 12px; color: #94a3b8;">
            This email was sent because you have an active conversation in our support chat.
            <br>
            If you didn't initiate this conversation, please ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateEmailText = (data: EmailNotificationData) => {
  return `
New Reply from BENIRAGE Support

Hi ${data.guestName},

${data.adminName} has replied to your message in ${data.roomName}:

"${data.message}"

${data.replyUrl ? `Continue the conversation: ${data.replyUrl}` : ''}

What to expect:
- Get instant notifications for new replies
- Your conversation history is saved
- Multiple support agents can help you
- All conversations are kept private and secure

---
This email was sent because you have an active conversation in our support chat.
If you didn't initiate this conversation, please ignore this email.
  `;
};

// Hook to automatically send notifications when admins reply to guest users
export const useAutoEmailNotifications = (roomId: string) => {
  const sendNotificationForReply = async (message: Message, guestEmail: string) => {
    if (!message || !guestEmail) return;

    // Check if this is a reply to a guest user
    const isReplyToGuest = message.message_text.includes('@') ||
                          message.sender_name !== 'System';

    if (isReplyToGuest) {
      await sendEmailNotification({
        to: guestEmail,
        guestName: 'Valued Guest', // You might want to store guest name in message metadata
        adminName: message.sender_name,
        message: message.message_text,
        roomName: 'Support Chat',
        replyUrl: `${window.location.origin}/chat?room=${roomId}`
      });
    }
  };

  return { sendNotificationForReply };
};