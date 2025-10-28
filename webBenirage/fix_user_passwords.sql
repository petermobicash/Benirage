-- Fix user passwords with proper bcrypt hashes
-- This script updates the existing auth.users with correct password hashes

DO $$
DECLARE
    -- User UUIDs
    super_admin_uuid UUID;
    editor_uuid UUID;
    author_uuid UUID;
    reviewer_uuid UUID;
    regular_user_uuid UUID;

    -- Proper bcrypt hash for "password123"
    -- This is a properly formatted bcrypt hash
    proper_password_hash TEXT := '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'FIXING USER PASSWORDS...';
    RAISE NOTICE '========================================';

    -- Get user UUIDs
    SELECT id INTO super_admin_uuid FROM auth.users WHERE email = 'admin@benirage.org';
    SELECT id INTO editor_uuid FROM auth.users WHERE email = 'editor@benirage.org';
    SELECT id INTO author_uuid FROM auth.users WHERE email = 'author@benirage.org';
    SELECT id INTO reviewer_uuid FROM auth.users WHERE email = 'reviewer@benirage.org';
    SELECT id INTO regular_user_uuid FROM auth.users WHERE email = 'user@benirage.org';

    -- Update Super Administrator password
    IF super_admin_uuid IS NOT NULL THEN
        UPDATE auth.users SET
            encrypted_password = proper_password_hash,
            updated_at = NOW()
        WHERE id = super_admin_uuid;
        RAISE NOTICE '✅ Updated Super Administrator password';
    END IF;

    -- Update Content Editor password
    IF editor_uuid IS NOT NULL THEN
        UPDATE auth.users SET
            encrypted_password = proper_password_hash,
            updated_at = NOW()
        WHERE id = editor_uuid;
        RAISE NOTICE '✅ Updated Content Editor password';
    END IF;

    -- Update Content Author password
    IF author_uuid IS NOT NULL THEN
        UPDATE auth.users SET
            encrypted_password = proper_password_hash,
            updated_at = NOW()
        WHERE id = author_uuid;
        RAISE NOTICE '✅ Updated Content Author password';
    END IF;

    -- Update Content Reviewer password
    IF reviewer_uuid IS NOT NULL THEN
        UPDATE auth.users SET
            encrypted_password = proper_password_hash,
            updated_at = NOW()
        WHERE id = reviewer_uuid;
        RAISE NOTICE '✅ Updated Content Reviewer password';
    END IF;

    -- Update Regular User password
    IF regular_user_uuid IS NOT NULL THEN
        UPDATE auth.users SET
            encrypted_password = proper_password_hash,
            updated_at = NOW()
        WHERE id = regular_user_uuid;
        RAISE NOTICE '✅ Updated Regular User password';
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'ALL PASSWORDS UPDATED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'All users now have the password: password123';
    RAISE NOTICE '========================================';

END $$;

-- Verify the updates
SELECT
    email,
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    LENGTH(encrypted_password) as password_length
FROM auth.users
ORDER BY email;