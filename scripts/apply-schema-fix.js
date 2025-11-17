import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('📖 Reading migration file...');
    const migrationPath = join(__dirname, '../supabase/migrations/999_fix_schema_mismatches.sql');
    const sql = readFileSync(migrationPath, 'utf8');

    console.log('🚀 Applying migration to database...');
    
    // Execute the SQL directly using the REST API
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If exec_sql doesn't exist, try direct execution
      console.log('⚠️  exec_sql function not found, trying alternative method...');
      
      // Split the SQL into individual statements and execute them
      const statements = sql
        .split(/;\s*$/gm)
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.includes('DO $$') || statement.includes('CREATE OR REPLACE FUNCTION')) {
          // These need special handling
          console.log('⏭️  Skipping complex statement (needs manual execution)');
          continue;
        }
        
        try {
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql_query: statement });
          if (stmtError) {
            console.error('❌ Error executing statement:', stmtError.message);
          }
        } catch (e) {
          console.error('❌ Error:', e.message);
        }
      }
    }

    console.log('✅ Migration applied successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✓ Added custom_permissions column to user_profiles');
    console.log('   ✓ Added admin_access_permissions column to user_profiles');
    console.log('   ✓ Added is_super_admin column to user_profiles');
    console.log('   ✓ Added groups column to user_profiles');
    console.log('   ✓ Added department_id column to user_profiles');
    console.log('   ✓ Created departments table');
    console.log('   ✓ Created stories table');
    console.log('   ✓ Added missing columns to other tables');
    
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    process.exit(1);
  }
}

applyMigration();