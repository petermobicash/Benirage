-- Check what tables exist and recreate user_profiles if needed

DO $$
BEGIN
    RAISE NOTICE 'Checking existing tables...';

    -- List all tables in public schema
    RAISE NOTICE 'Tables in public schema:';
    
    -- Check if user_profiles table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        RAISE NOTICE 'user_profiles table does not exist. Creating it...';
        
        -- Create the user_profiles table with all necessary columns
        CREATE TABLE user_profiles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            username TEXT,
            display_name TEXT,
            bio TEXT,
            avatar_url TEXT,
            status TEXT CHECK (status IN ('online', 'offline', 'away', 'busy')) DEFAULT 'offline',
            custom_status TEXT,
            last_seen TIMESTAMPTZ DEFAULT NOW(),
            is_online BOOLEAN DEFAULT FALSE,
            phone_number TEXT,
            show_last_seen BOOLEAN DEFAULT TRUE,
            show_status BOOLEAN DEFAULT TRUE,
            -- Permission system columns
            role TEXT DEFAULT 'contributor',
            roles TEXT[] DEFAULT '{}',
            custom_permissions TEXT[] DEFAULT '{}',
            is_super_admin BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id)
        );
        
        RAISE NOTICE '✅ Created user_profiles table with all columns';
    ELSE
        RAISE NOTICE '✅ user_profiles table already exists';
        
        -- Check if it has the necessary columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
            RAISE NOTICE 'Adding missing permission columns...';
            
            -- Add missing columns
            ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'contributor';
            ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT '{}';
            ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS custom_permissions TEXT[] DEFAULT '{}';
            ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;
            ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
            
            RAISE NOTICE '✅ Added missing permission columns';
        END IF;
    END IF;

    -- Enable RLS
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public' AND c.relname = 'user_profiles' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ Enabled RLS on user_profiles table';
    END IF;

    -- Create simple RLS policies
    DROP POLICY IF EXISTS "Allow authenticated users to manage own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Allow super admins to manage all profiles" ON user_profiles;
    DROP POLICY IF EXISTS "Allow initial profile creation" ON user_profiles;

    CREATE POLICY "Allow authenticated users to manage own profile" ON user_profiles
        FOR ALL USING (auth.uid() = user_id);

    CREATE POLICY "Allow super admins to manage all profiles" ON user_profiles
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.user_id = auth.uid() 
                AND u.is_super_admin = true
            )
        );

    RAISE NOTICE '✅ Created RLS policies';

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
    CREATE INDEX IF NOT EXISTS idx_user_profiles_is_super_admin ON user_profiles(is_super_admin);

    RAISE NOTICE '✅ Created indexes';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'USER_PROFILES TABLE SETUP COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Table exists with all necessary columns';
    RAISE NOTICE '✅ RLS policies configured';
    RAISE NOTICE '✅ Indexes created for performance';
    RAISE NOTICE '========================================';

END $$;
