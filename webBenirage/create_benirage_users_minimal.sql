-- BENIRAGE Test Users Creation Script (Minimal Version)
-- Insert only into auth.users without transactions

-- Create user: Super Administrator
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'superadmin@benirage.org',
  crypt('SuperAdmin123!', gen_salt('bf')),
  NOW(),
  '{"full_name": "Super Administrator", "role": "super-admin"}',
  FALSE,
  NOW(),
  NOW()
);

-- Create user: Editor
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'editor@benirage.org',
  crypt('Editor123!', gen_salt('bf')),
  NOW(),
  '{"full_name": "Editor", "role": "editor"}',
  FALSE,
  NOW(),
  NOW()
);

-- Create user: Author
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'author@benirage.org',
  crypt('Author123!', gen_salt('bf')),
  NOW(),
  '{"full_name": "Author", "role": "author"}',
  FALSE,
  NOW(),
  NOW()
);

-- Create user: Contributor
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'contributor@benirage.org',
  crypt('Contributor123!', gen_salt('bf')),
  NOW(),
  '{"full_name": "Contributor", "role": "contributor"}',
  FALSE,
  NOW(),
  NOW()
);

-- Create user: Moderator
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'moderator@benirage.org',
  crypt('Moderator123!', gen_salt('bf')),
  NOW(),
  '{"full_name": "Moderator", "role": "moderator"}',
  FALSE,
  NOW(),
  NOW()
);

-- Create user: SEO Specialist
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'seo@benirage.org',
  crypt('Seo123!', gen_salt('bf')),
  NOW(),
  '{"full_name": "SEO Specialist", "role": "seo-specialist"}',
  FALSE,
  NOW(),
  NOW()
);

-- Create user: Designer
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'designer@benirage.org',
  crypt('Designer123!', gen_salt('bf')),
  NOW(),
  '{"full_name": "Designer", "role": "designer"}',
  FALSE,
  NOW(),
  NOW()
);

-- Create user: Developer
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'developer@benirage.org',
  crypt('Developer123!', gen_salt('bf')),
  NOW(),
  '{"full_name": "Developer", "role": "developer"}',
  FALSE,
  NOW(),
  NOW()
);

-- Create user: Viewer
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'viewer@benirage.org',
  crypt('Viewer123!', gen_salt('bf')),
  NOW(),
  '{"full_name": "Viewer", "role": "subscriber"}',
  FALSE,
  NOW(),
  NOW()
);

-- Verification query
SELECT email, raw_user_meta_data->>'full_name' as name, created_at
FROM auth.users
WHERE email LIKE '%@benirage.org'
ORDER BY created_at DESC;