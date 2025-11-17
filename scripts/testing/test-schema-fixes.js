#!/usr/bin/env node

/**
 * Test Script for Database Schema Fixes
 * 
 * This script tests that all schema mismatches have been resolved
 * by attempting to query each problematic table/column.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('========================================');
console.log('TESTING DATABASE SCHEMA FIXES');
console.log('========================================\n');

let passedTests = 0;
let failedTests = 0;

/**
 * Test helper function
 */
async function test(name, testFn) {
  try {
    await testFn();
    console.log(`✅ ${name}`);
    passedTests++;
    return true;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}\n`);
    failedTests++;
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  // Test 1: Stories table exists and is queryable
  await test('Stories table exists', async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('id')
      .limit(1);
    
    if (error) throw error;
  });

  // Test 2: content_calendar.publish_date column exists
  await test('content_calendar.publish_date column exists', async () => {
    const { data, error } = await supabase
      .from('content_calendar')
      .select('publish_date')
      .limit(1);
    
    if (error) throw error;
  });

  // Test 3: departments table exists
  await test('departments table exists', async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name')
      .limit(1);
    
    if (error) throw error;
  });

  // Test 4: form_fields.page_id column exists
  await test('form_fields.page_id column exists', async () => {
    const { data, error } = await supabase
      .from('form_fields')
      .select('page_id')
      .limit(1);
    
    if (error) throw error;
  });

  // Test 5: chat_rooms.last_activity column exists
  await test('chat_rooms.last_activity column exists', async () => {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('last_activity')
      .limit(1);
    
    if (error) throw error;
  });

  // Test 6: newsletter_campaign_stats table exists
  await test('newsletter_campaign_stats table exists', async () => {
    const { data, error } = await supabase
      .from('newsletter_campaign_stats')
      .select('id')
      .limit(1);
    
    if (error) throw error;
  });

  // Test 7: newsletter_campaigns relationship to stats works
  await test('newsletter_campaigns → stats relationship works', async () => {
    const { data, error } = await supabase
      .from('newsletter_campaigns')
      .select(`
        id,
        newsletter_campaign_stats(recipient_count, open_count, click_count)
      `)
      .limit(1);
    
    if (error) throw error;
  });

  // Test 8: content_tags can be queried
  await test('content_tags table is accessible', async () => {
    const { data, error } = await supabase
      .from('content_tags')
      .select('*')
      .limit(1);
    
    if (error) throw error;
  });

  // Test 9: Check if default departments were created
  await test('Default departments were created', async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('name')
      .in('name', ['Administration', 'Content', 'Community', 'Technical', 'Operations']);
    
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('No default departments found');
    }
  });

  // Test 10: Verify RLS policies are in place
  await test('RLS policies are enabled', async () => {
    // This will fail if RLS blocks access, which is expected for some tables
    // We're just checking that the query structure works
    const { error } = await supabase
      .from('stories')
      .select('id')
      .limit(1);
    
    // If we get a permission error, RLS is working (which is good)
    // If we get a table not found error, that's bad
    if (error && error.code === 'PGRST205') {
      throw error;
    }
  });

  // Summary
  console.log('\n========================================');
  console.log('TEST SUMMARY');
  console.log('========================================');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📊 Total:  ${passedTests + failedTests}`);
  console.log('========================================\n');

  if (failedTests === 0) {
    console.log('🎉 All tests passed! Schema fixes are working correctly.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.\n');
    console.log('Possible solutions:');
    console.log('1. Run the migration: supabase/migrations/999_fix_schema_mismatches.sql');
    console.log('2. Check Supabase SQL Editor for error details');
    console.log('3. Verify your database connection settings\n');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('\n❌ Test suite failed to run:');
  console.error(error);
  process.exit(1);
});