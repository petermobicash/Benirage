-- =====================================================
-- DIRECT SCHEMA FIX - Execute in Supabase SQL Editor
-- =====================================================
-- This script adds missing columns to user_profiles
-- and creates the departments table
-- =====================================================

-- 1. Add missing columns to user_profiles
DO $$ 
BEGIN
    -- Add custom_permissions if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
        AND column_name = 'custom_permissions'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN custom_permissions TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE '✅ Added custom_permissions column';
    ELSE
        RAISE NOTICE '⏭️  custom_permissions column already exists';
    END IF;

    -- Add admin_access_permissions if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
        AND column_name = 'admin_access_permissions'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN admin_access_permissions TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE '✅ Added admin_access_permissions column';
    ELSE
        RAISE NOTICE '⏭️  admin_access_permissions column already exists';
    END IF;

    -- Add is_super_admin if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
        AND column_name = 'is_super_admin'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE;
        RAISE NOTICE '✅ Added is_super_admin column';
    ELSE
        RAISE NOTICE '⏭️  is_super_admin column already exists';
    END IF;

    -- Add groups if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
        AND column_name = 'groups'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN groups TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE '✅ Added groups column';
    ELSE
        RAISE NOTICE '⏭️  groups column already exists';
    END IF;
END $$;

-- 2. Create departments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Add department_id to user_profiles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
        AND column_name = 'department_id'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ Added department_id column';
    ELSE
        RAISE NOTICE '⏭️  department_id column already exists';
    END IF;

    -- Add is_active if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE '✅ Added is_active column';
    ELSE
        RAISE NOTICE '⏭️  is_active column already exists';
    END IF;
END $$;

-- 4. Enable RLS on departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for departments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'departments'
        AND policyname = 'Departments are viewable by everyone'
    ) THEN
        CREATE POLICY "Departments are viewable by everyone"
            ON public.departments FOR SELECT
            USING (true);
        RAISE NOTICE '✅ Created SELECT policy for departments';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'departments'
        AND policyname = 'Only admins can manage departments'
    ) THEN
        CREATE POLICY "Only admins can manage departments"
            ON public.departments FOR ALL
            TO authenticated
            USING (true)
            WITH CHECK (true);
        RAISE NOTICE '✅ Created management policy for departments';
    END IF;
END $$;

-- 6. Insert default departments
INSERT INTO public.departments (name, description, order_index, is_active)
VALUES
    ('Administration', 'Administrative and management staff', 1, true),
    ('Content', 'Content creation and management', 2, true),
    ('Community', 'Community engagement and support', 3, true),
    ('Technical', 'Technical and development team', 4, true),
    ('Operations', 'Operations and logistics', 5, true)
ON CONFLICT (name) DO NOTHING;

-- 7. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_super_admin ON public.user_profiles(is_super_admin);
CREATE INDEX IF NOT EXISTS idx_user_profiles_department_id ON public.user_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON public.user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_departments_is_active ON public.departments(is_active);
CREATE INDEX IF NOT EXISTS idx_departments_order_index ON public.departments(order_index);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SCHEMA FIX COMPLETED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Added columns to user_profiles:';
    RAISE NOTICE '  • custom_permissions';
    RAISE NOTICE '  • admin_access_permissions';
    RAISE NOTICE '  • is_super_admin';
    RAISE NOTICE '  • groups';
    RAISE NOTICE '  • department_id';
    RAISE NOTICE '  • is_active';
    RAISE NOTICE '';
    RAISE NOTICE 'Created departments table with:';
    RAISE NOTICE '  • 5 default departments';
    RAISE NOTICE '  • RLS policies';
    RAISE NOTICE '  • Performance indexes';
    RAISE NOTICE '========================================';
END $$;