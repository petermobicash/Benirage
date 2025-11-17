#!/usr/bin/env node

/**
 * Direct admin user creation - bypasses server startup
 */

import { createUsers } from '../../backend/create-admin-user.js';

async function main() {
  console.log('========================================');
  console.log('🚀 CREATING ADMIN USERS DIRECTLY');
  console.log('========================================');

  try {
    const results = await createUsers();

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log('');
    console.log('📊 RESULTS:');
    console.log(`✅ ${successful} users created successfully`);
    if (failed > 0) {
      console.log(`❌ ${failed} users failed`);
    }

    console.log('');
    console.log('📋 User Details:');
    results.forEach(result => {
      if (result.success) {
        console.log(`✅ ${result.email}: ${result.message}`);
      } else {
        console.log(`❌ ${result.email}: ${result.error}`);
      }
    });

    console.log('');
    console.log('🔑 CREDENTIALS:');
    console.log('admin@benirage.org / password123 (Super Admin)');
    console.log('editor@benirage.org / password123 (Editor)');
    console.log('author@benirage.org / password123 (Author)');
    console.log('reviewer@benirage.org / password123 (Reviewer)');
    console.log('user@benirage.org / password123 (Regular User)');

    console.log('');
    console.log('🎉 Admin user creation completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();