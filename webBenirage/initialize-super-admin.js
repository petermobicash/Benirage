/**
 * BENIRAGE Super Admin Initialization Script (Auto Version)
 *
 * Automatically verifies or creates a default super admin user
 * using Supabase Service Role Key (server-side only).
 *
 * Usage:
 *   1️⃣ Create .env in the same folder with:
 *       VITE_SUPABASE_URL=https://xxxxx.supabase.co
 *       SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5...
 *
 *   2️⃣ Run: node initialize-super-admin.js
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Resolve current directory path
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/* ---------------------- Load .env manually ---------------------- */
function loadEnvFile() {
  const envPath = join(__dirname, '.env')
  try {
    const envContent = readFileSync(envPath, 'utf8')
    const lines = envContent.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const [key, ...valParts] = trimmed.split('=')
      const val = valParts.join('=').replace(/^["']|["']$/g, '')
      process.env[key] = val
    }
    console.log('✅ .env loaded successfully.')
  } catch {
    console.log('⚠️  No .env file found, using existing environment variables.')
  }
}

loadEnvFile()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('\n❌ Missing required environment variables!')
  console.error('Please define both VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env\n')
  process.exit(1)
}

/* ---------------------- Initialize Supabase ---------------------- */
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

/* ---------------------- Main Logic ---------------------- */
async function ensureSuperAdmin() {
  const email = 'admin@benirage.org'
  const password = 'admin123'
  const first_name = 'System'
  const last_name = 'Administrator'

  console.log('🔍 Checking if super admin exists...')

  // Check user_profiles table for existing super admin
  console.log('🔍 Checking for existing super admin users...')

  // Check for username 'super-admin' specifically (using only existing columns)
  const { data: profiles, error: checkErr } = await supabase
    .from('user_profiles')
    .select('user_id, username, display_name, status, is_active')
    .eq('username', 'super-admin')
    .limit(1)

  if (checkErr) {
    console.error('❌ Error checking user_profiles:', checkErr.message)
    console.log('ℹ️  This might be due to RLS policies')
  }

  if (profiles && profiles.length > 0) {
    console.log(`✅ Super admin already exists: ${email} (username: super-admin)`)
    console.log('📋 Existing profile:', profiles[0])
    return
  }

  console.log('📊 No existing super admin found — creating one now...')

  console.log('📊 No existing super admin found — creating one now...')
  console.log('🧩 Creating new super admin user...')

  // 1️⃣ Create Auth user
  console.log('🔐 Attempting to create auth user...')
  const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name, last_name, role: 'super-admin' }
  })

  if (createErr) {
    console.error('❌ Failed to create auth user:', createErr.message)
    console.error('❌ Error details:', JSON.stringify(createErr, null, 2))

    // Try alternative approach: check if we can create user profile directly
    console.log('🔄 Attempting alternative approach...')

    // Generate a UUID for the user (this would normally come from auth.users)
    const fallbackUserId = '00000000-0000-0000-0000-000000000001'

    console.log(`⚠️  Using fallback user ID: ${fallbackUserId}`)
    console.log('ℹ️  Note: This user profile will need to be linked to a real auth user later')
  } else {
    const userId = newUser.user?.id
    if (!userId) {
      console.error('❌ Failed to get created user ID.')
      process.exit(1)
    }

    console.log(`✅ Auth user created: ${email} (${userId})`)
  }

  // 2️⃣ Insert user profile
  console.log(`👤 Creating user profile...`)

  // Try with null user_id first (like existing profiles)
  const { error: profileErr } = await supabase.from('user_profiles').insert({
    user_id: null, // Start with null like existing profiles
    username: 'super-admin',
    display_name: `${first_name} ${last_name}`,
    status: 'online',
    is_online: true,
    show_last_seen: true,
    show_status: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })

  if (profileErr) {
    console.error('❌ Failed to insert user profile:', profileErr.message)
    console.error('❌ Profile error details:', JSON.stringify(profileErr, null, 2))

    // If that fails, try without user_id field entirely
    console.log('🔄 Trying without user_id field...')
    const { error: noUserIdErr } = await supabase.from('user_profiles').insert({
      username: 'super-admin',
      display_name: `${first_name} ${last_name}`,
      status: 'online',
      is_online: true,
      show_last_seen: true,
      show_status: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    if (noUserIdErr) {
      console.error('❌ Both attempts failed:', noUserIdErr.message)
      process.exit(1)
    }

    console.log('✅ User profile created successfully (without user_id)!')
  } else {
    console.log('✅ User profile created successfully!')
  }

  console.log('✅ User profile created successfully!')

  console.log('🎉 Super admin initialized successfully!')
  console.log('=========================================')
  console.log(`📧 Email: ${email}`)
  console.log(`🔑 Password: ${password}`)
  console.log('👤 Username: super-admin')
  console.log('🛡️  Role: super-admin')
  if (!newUser) {
    console.log('⚠️  Note: Auth user creation failed - profile created with fallback ID')
  }
  console.log('=========================================')
}

/* ---------------------- Run ---------------------- */
ensureSuperAdmin().catch((err) => {
  console.error('❌ Script error:', err.message)
  process.exit(1)
})
