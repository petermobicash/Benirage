#!/usr/bin/env node

/**
 * Test script to validate admin user creation setup
 * This script checks if all files are in place and validates the configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 TESTING ADMIN USER CREATION SETUP');
console.log('=====================================');
console.log('');

// Check if required files exist
const requiredFiles = [
  'create-admin-user.js',
  'backend/create-admin-user.js',
  '.env.example',
  'ADMIN_USER_SETUP.md'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - Found`);
  } else {
    console.log(`❌ ${file} - Missing`);
    allFilesExist = false;
  }
});

// Check file permissions
console.log('');
console.log('📋 Checking file permissions...');

requiredFiles.slice(0, 2).forEach(file => { // Only check .js files
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    try {
      fs.accessSync(filePath, fs.constants.X_OK);
      console.log(`✅ ${file} - Executable`);
    } catch (error) {
      console.log(`⚠️  ${file} - Not executable (this is usually fine)`);
    }
  }
});

// Validate script content
console.log('');
console.log('🔍 Validating script content...');

try {
  const scriptContent = fs.readFileSync('create-admin-user.js', 'utf8');

  const hasRequiredElements = [
    'SUPABASE_URL',
    'SERVICE_ROLE_KEY',
    'admin@benirage.org',
    'editor@benirage.org',
    'author@benirage.org',
    'reviewer@benirage.org',
    'user@benirage.org',
    'password123',
    'createUsers'
  ].every(element => scriptContent.includes(element));

  if (hasRequiredElements) {
    console.log('✅ Script contains all required elements');
  } else {
    console.log('❌ Script is missing some required elements');
    allFilesExist = false;
  }
} catch (error) {
  console.log('❌ Could not read script file');
  allFilesExist = false;
}

// Check environment setup
console.log('');
console.log('🌍 Checking environment setup...');

const envExample = fs.readFileSync('.env.example', 'utf8');
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const envSetupComplete = requiredEnvVars.every(envVar =>
  envExample.includes(envVar)
);

if (envSetupComplete) {
  console.log('✅ Environment variables template is complete');
} else {
  console.log('❌ Environment variables template is incomplete');
  allFilesExist = false;
}

// Summary
console.log('');
console.log('=====================================');
console.log('📊 SETUP VALIDATION SUMMARY');
console.log('=====================================');

if (allFilesExist) {
  console.log('🎉 All files are in place and setup looks good!');
  console.log('');
  console.log('🚀 Next steps:');
  console.log('1. Set your environment variables:');
  console.log('   export VITE_SUPABASE_URL="your_supabase_url"');
  console.log('   export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"');
  console.log('');
  console.log('2. Run the admin user creation script:');
  console.log('   node create-admin-user.js');
  console.log('');
  console.log('3. Or start the API server:');
  console.log('   node backend/create-admin-user.js');
  console.log('');
  console.log('4. Test login with:');
  console.log('   Email: admin@benirage.org');
  console.log('   Password: admin123');
} else {
  console.log('❌ Some files are missing or incomplete.');
  console.log('Please check the errors above and fix them.');
}

console.log('');
console.log('📖 For detailed instructions, see: ADMIN_USER_SETUP.md');