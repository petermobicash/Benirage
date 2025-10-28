import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env manually
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
  } catch {
    console.log('⚠️  No .env file found, using existing environment variables.')
  }
}

loadEnvFile()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Testing Supabase connection...')
console.log('📍 URL:', SUPABASE_URL)
console.log('🔑 Key prefix:', SERVICE_ROLE_KEY.substring(0, 20) + '...')

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables!')
  process.exit(1)
}

// Create client with service role key
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testConnection() {
  try {
    // Test basic connection
    console.log('🔍 Testing basic connection...')
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1)

    if (error) {
      console.error('❌ Connection test failed:', error.message)
      console.error('Error details:', error)
    } else {
      console.log('✅ Basic connection successful!')
      console.log('📊 Data received:', data)
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
  }
}

testConnection().catch(console.error)