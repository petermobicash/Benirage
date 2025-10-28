-- Add message_status column to chat_messages table
-- This fixes the PGRST204 error when inserting messages

-- Add the message_status column to chat_messages table
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS message_status TEXT CHECK (message_status IN ('sent', 'delivered', 'seen')) DEFAULT 'sent';

-- Create an index for message_status for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_message_status ON chat_messages(message_status);

-- Update existing messages to have 'sent' status
UPDATE chat_messages
SET message_status = 'sent'
WHERE message_status IS NULL;

-- Make message_status NOT NULL after setting default values
ALTER TABLE chat_messages
ALTER COLUMN message_status SET NOT NULL;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MESSAGE STATUS COLUMN ADDED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Added message_status column to chat_messages';
    RAISE NOTICE '✅ Created performance index';
    RAISE NOTICE '✅ Set default values for existing messages';
    RAISE NOTICE '';
    RAISE NOTICE 'The chat_messages table now supports message status tracking!';
    RAISE NOTICE '========================================';
END $$;