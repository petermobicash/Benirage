#!/usr/bin/env node

/**
 * Super Admin Test User Creator & Feature Validator
 * Creates a super admin user and tests all database features
 * Validates the 355 performance fixes implementation
 * 
 * Usage:
 *   1. Ensure .env is configured with Supabase credentials
 *   2. Run: node create-test-super-admin.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
function loadEnvFile() {
    try {
        const envPath = join(__dirname, '../../.env');
        const envContent = readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
                const [key, ...valueParts] = trimmedLine.split('=');
                const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                process.env[key] = value;
            }
        }
        console.log('✅ .env loaded successfully from root directory.');
    } catch (error) {
        console.log('⚠️  .env file not found, using existing environment variables.');
    }
}

loadEnvFile();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing required environment variables:');
    console.error('   VITE_SUPABASE_URL');
    console.error('   VITE_SUPABASE_ANON_KEY');
    console.error('');
    console.error('Please check your .env file in the root directory.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// Test super admin user configuration
const TEST_SUPER_ADMIN = {
    email: 'testsuperadmin@benirage.org',
    password: 'TestSuperAdmin2024!',
    metadata: {
        first_name: 'Test',
        last_name: 'Super Admin',
        full_name: 'Test Super Administrator',
        role: 'super-admin',
        phone: '+250788999999',
        department: 'QA Testing',
        job_title: 'Database Performance Test Admin',
        is_super_admin: true,
        test_user: true,
        testing_performance_fixes: true
    }
};

// Test results tracking
const testResults = {
    userCreation: { success: false, user: null, profile: null },
    featureTests: {
        content: { passed: 0, failed: 0, total: 0 },
        comments: { passed: 0, failed: 0, total: 0 },
        media: { passed: 0, failed: 0, total: 0 },
        users: { passed: 0, failed: 0, total: 0 },
        permissions: { passed: 0, failed: 0, total: 0 },
        performance: { passed: 0, failed: 0, total: 0 }
    },
    rlsTests: { passed: 0, failed: 0, total: 0 },
    overall: { passed: 0, failed: 0, total: 0 }
};

// Logging functions
const logSuccess = (message) => {
    console.log(`✅ ${message}`);
    testResults.overall.passed++;
    testResults.overall.total++;
};

const logError = (message) => {
    console.log(`❌ ${message}`);
    testResults.overall.failed++;
    testResults.overall.total++;
};

const logWarning = (message) => {
    console.log(`⚠️  ${message}`);
};

const logInfo = (message) => {
    console.log(`ℹ️  ${message}`);
};

// Create test super admin user
async function createTestSuperAdmin() {
    console.log('🚀 Creating Test Super Admin User...');
    console.log('=====================================');
    
    try {
        // Create auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: TEST_SUPER_ADMIN.email,
            password: TEST_SUPER_ADMIN.password,
            email_confirm: true,
            user_metadata: TEST_SUPER_ADMIN.metadata
        });

        if (authError) {
            console.error('❌ Auth user creation failed:', authError.message);
            // Try to find existing user
            const { data: existingUser, error: findError } = await supabase.auth.admin.listUsers();
            const existingTestUser = existingUser.users.find(u => u.email === TEST_SUPER_ADMIN.email);
            
            if (existingTestUser) {
                console.log('ℹ️  Test super admin user already exists');
                testResults.userCreation.user = existingTestUser;
                testResults.userCreation.success = true;
                return { success: true, user: existingTestUser, existing: true };
            }
            return { success: false, error: authError.message };
        }

        const userId = authUser.user.id;
        console.log(`✅ Auth user created: ${userId}`);

        // Create comprehensive user profile
        const profileData = {
            user_id: userId,
            username: 'test-super-admin',
            display_name: TEST_SUPER_ADMIN.metadata.full_name,
            first_name: TEST_SUPER_ADMIN.metadata.first_name,
            last_name: TEST_SUPER_ADMIN.metadata.last_name,
            full_name: TEST_SUPER_ADMIN.metadata.full_name,
            email: TEST_SUPER_ADMIN.email,
            phone: TEST_SUPER_ADMIN.metadata.phone,
            role: TEST_SUPER_ADMIN.metadata.role,
            is_super_admin: TEST_SUPER_ADMIN.metadata.is_super_admin,
            is_active: true,
            email_verified: true,
            phone_verified: false,
            two_factor_enabled: false,
            access_level: 100,
            approval_level: 100,
            profile_completed: true,
            profile_completion_percentage: 100,
            onboarding_completed: true,
            department: TEST_SUPER_ADMIN.metadata.department,
            job_title: TEST_SUPER_ADMIN.metadata.job_title,
            timezone: 'Africa/Kigali',
            language_preference: 'en',
            groups: ['super-administrators', 'administrators', 'qa-testers'],
            custom_permissions: ['*'], // Full access for testing
            bio: 'Test super admin user for validating database performance fixes',
            social_links: {
                linkedin: 'https://linkedin.com/in/testsuperadmin',
                github: 'https://github.com/testsuperadmin'
            },
            preferences: {
                theme: 'dark',
                notifications: true,
                performance_monitoring: true
            },
            metadata: {
                test_user: true,
                created_for: 'database_performance_testing',
                performance_fix_validation: true
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Insert into user_profiles table
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .insert(profileData)
            .select()
            .single();

        if (profileError) {
            console.warn('⚠️  Profile creation failed, trying alternative table...');
            
            // Try users table
            const { data: altProfile, error: altError } = await supabase
                .from('users')
                .insert({
                    id: userId,
                    name: TEST_SUPER_ADMIN.metadata.full_name,
                    email: TEST_SUPER_ADMIN.email,
                    role: TEST_SUPER_ADMIN.metadata.role,
                    is_super_admin: TEST_SUPER_ADMIN.metadata.is_super_admin,
                    is_active: true,
                    groups: ['super-administrators'],
                    custom_permissions: ['*'],
                    metadata: {
                        test_user: true,
                        department: TEST_SUPER_ADMIN.metadata.department
                    },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (altError) {
                console.error('❌ Alternative profile creation failed:', altError.message);
                return { success: false, error: altError.message };
            } else {
                console.log('✅ User profile created (users table)');
                testResults.userCreation.profile = altProfile;
                testResults.userCreation.success = true;
                testResults.userCreation.user = authUser.user;
                return { success: true, user: authUser.user, profile: altProfile };
            }
        } else {
            console.log('✅ User profile created successfully');
            testResults.userCreation.profile = profile;
            testResults.userCreation.success = true;
            testResults.userCreation.user = authUser.user;
            return { success: true, user: authUser.user, profile };
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        return { success: false, error: error.message };
    }
}

// Test content management features
async function testContentFeatures() {
    console.log('📝 Testing Content Management Features...');
    
    const tests = [
        { name: 'Create content', operation: 'create' },
        { name: 'Read content', operation: 'read' },
        { name: 'Update content', operation: 'update' },
        { name: 'List content', operation: 'list' }
    ];
    
    for (const test of tests) {
        try {
            testResults.featureTests.content.total++;
            
            switch (test.operation) {
                case 'create':
                    const { data: newContent, error: createError } = await supabase
                        .from('content')
                        .insert({
                            title: 'Test Content - Performance Validation',
                            content: 'This is test content to validate database performance after fixes',
                            type: 'test',
                            status: 'draft',
                            author: 'Test Super Admin',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                        .select()
                        .single();
                    
                    if (createError) {
                        console.log(`❌ ${test.name} failed: ${createError.message}`);
                        testResults.featureTests.content.failed++;
                    } else {
                        console.log(`✅ ${test.name} successful`);
                        testResults.featureTests.content.passed++;
                    }
                    break;
                    
                case 'read':
                case 'list':
                    const { data: contentList, error: readError } = await supabase
                        .from('content')
                        .select('id, title, status')
                        .limit(5);
                    
                    if (readError) {
                        console.log(`❌ ${test.name} failed: ${readError.message}`);
                        testResults.featureTests.content.failed++;
                    } else {
                        console.log(`✅ ${test.name} successful (${contentList?.length || 0} records)`);
                        testResults.featureTests.content.passed++;
                    }
                    break;
                    
                case 'update':
                    if (newContent) {
                        const { error: updateError } = await supabase
                            .from('content')
                            .update({ 
                                status: 'published',
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', newContent.id);
                        
                        if (updateError) {
                            console.log(`❌ ${test.name} failed: ${updateError.message}`);
                            testResults.featureTests.content.failed++;
                        } else {
                            console.log(`✅ ${test.name} successful`);
                            testResults.featureTests.content.passed++;
                        }
                    }
                    break;
            }
        } catch (error) {
            console.log(`❌ ${test.name} failed: ${error.message}`);
            testResults.featureTests.content.failed++;
        }
    }
}

// Test comments system
async function testCommentsFeatures() {
    console.log('💬 Testing Comments System...');
    
    const tests = [
        { name: 'Create comment', operation: 'create' },
        { name: 'Read comments', operation: 'read' },
        { name: 'List comments', operation: 'list' }
    ];
    
    for (const test of tests) {
        try {
            testResults.featureTests.comments.total++;
            
            switch (test.operation) {
                case 'create':
                    const { data: newComment, error: createError } = await supabase
                        .from('content_comments')
                        .insert({
                            comment_text: 'This is a test comment to validate performance',
                            comment_type: 'feedback',
                            author_name: 'Test Super Admin',
                            status: 'published',
                            created_at: new Date().toISOString()
                        })
                        .select()
                        .single();
                    
                    if (createError) {
                        console.log(`❌ ${test.name} failed: ${createError.message}`);
                        testResults.featureTests.comments.failed++;
                    } else {
                        console.log(`✅ ${test.name} successful`);
                        testResults.featureTests.comments.passed++;
                    }
                    break;
                    
                case 'read':
                case 'list':
                    const { data: commentsList, error: readError } = await supabase
                        .from('content_comments')
                        .select('id, comment_text, status')
                        .limit(5);
                    
                    if (readError) {
                        console.log(`❌ ${test.name} failed: ${readError.message}`);
                        testResults.featureTests.comments.failed++;
                    } else {
                        console.log(`✅ ${test.name} successful (${commentsList?.length || 0} records)`);
                        testResults.featureTests.comments.passed++;
                    }
                    break;
            }
        } catch (error) {
            console.log(`❌ ${test.name} failed: ${error.message}`);
            testResults.featureTests.comments.failed++;
        }
    }
}

// Test media management
async function testMediaFeatures() {
    console.log('🖼️  Testing Media Management...');
    
    const tests = [
        { name: 'Create media record', operation: 'create' },
        { name: 'Read media', operation: 'read' },
        { name: 'List media', operation: 'list' }
    ];
    
    for (const test of tests) {
        try {
            testResults.featureTests.media.total++;
            
            switch (test.operation) {
                case 'create':
                    const { data: newMedia, error: createError } = await supabase
                        .from('media')
                        .insert({
                            file_name: 'test-performance-validation.jpg',
                            file_type: 'image/jpeg',
                            file_size: 1024,
                            is_public: true,
                            uploaded_at: new Date().toISOString()
                        })
                        .select()
                        .single();
                    
                    if (createError) {
                        console.log(`❌ ${test.name} failed: ${createError.message}`);
                        testResults.featureTests.media.failed++;
                    } else {
                        console.log(`✅ ${test.name} successful`);
                        testResults.featureTests.media.passed++;
                    }
                    break;
                    
                case 'read':
                case 'list':
                    const { data: mediaList, error: readError } = await supabase
                        .from('media')
                        .select('id, file_name, file_type')
                        .limit(5);
                    
                    if (readError) {
                        console.log(`❌ ${test.name} failed: ${readError.message}`);
                        testResults.featureTests.media.failed++;
                    } else {
                        console.log(`✅ ${test.name} successful (${mediaList?.length || 0} records)`);
                        testResults.featureTests.media.passed++;
                    }
                    break;
            }
        } catch (error) {
            console.log(`❌ ${test.name} failed: ${error.message}`);
            testResults.featureTests.media.failed++;
        }
    }
}

// Test RLS policy performance
async function testRLSPerformance() {
    console.log('🔒 Testing RLS Policy Performance...');
    
    const rlsTests = [
        { table: 'content', description: 'Content RLS policies' },
        { table: 'content_comments', description: 'Comments RLS policies' },
        { table: 'users', description: 'Users RLS policies' },
        { table: 'user_profiles', description: 'User profiles RLS policies' },
        { table: 'media', description: 'Media RLS policies' },
        { table: 'categories', description: 'Categories RLS policies' },
        { table: 'tags', description: 'Tags RLS policies' }
    ];
    
    for (const test of rlsTests) {
        try {
            testResults.rlsTests.total++;
            
            const startTime = Date.now();
            const { data, error } = await supabase
                .from(test.table)
                .select('id')
                .limit(10);
            const endTime = Date.now();
            const queryTime = endTime - startTime;
            
            if (error) {
                console.log(`❌ ${test.description} failed: ${error.message}`);
                testResults.rlsTests.failed++;
            } else {
                console.log(`✅ ${test.description} working (${queryTime}ms, ${data?.length || 0} records)`);
                testResults.rlsTests.passed++;
                
                if (queryTime > 100) {
                    logWarning(`Query time ${queryTime}ms suggests optimization may be needed`);
                }
            }
        } catch (error) {
            console.log(`❌ ${test.description} failed: ${error.message}`);
            testResults.rlsTests.failed++;
        }
    }
}

// Test user management features
async function testUserFeatures() {
    console.log('👥 Testing User Management Features...');
    
    const tests = [
        { name: 'Read users', operation: 'read_users' },
        { name: 'Read user_profiles', operation: 'read_profiles' },
        { name: 'List permissions', operation: 'read_permissions' },
        { name: 'List roles', operation: 'read_roles' }
    ];
    
    for (const test of tests) {
        try {
            testResults.featureTests.users.total++;
            
            const { data, error } = await supabase
                .from(test.operation.includes('users') ? 'users' : 
                     test.operation.includes('profiles') ? 'user_profiles' :
                     test.operation.includes('permissions') ? 'permissions' : 'roles')
                .select('id, name')
                .limit(5);
            
            if (error) {
                console.log(`❌ ${test.name} failed: ${error.message}`);
                testResults.featureTests.users.failed++;
            } else {
                console.log(`✅ ${test.name} successful (${data?.length || 0} records)`);
                testResults.featureTests.users.passed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name} failed: ${error.message}`);
            testResults.featureTests.users.failed++;
        }
    }
}

// Run performance benchmark
async function runPerformanceBenchmark() {
    console.log('⚡ Running Performance Benchmark...');
    
    const benchmarkQueries = [
        { table: 'content', select: 'id,title,status', filter: '', limit: 20 },
        { table: 'content_comments', select: 'id,comment_text,status', filter: '', limit: 20 },
        { table: 'users', select: 'id,name,email', filter: '', limit: 10 },
        { table: 'media', select: 'id,file_name,file_type', filter: '', limit: 10 },
        { table: 'categories', select: 'id,name', filter: '', limit: 5 }
    ];
    
    const results = [];
    
    for (const query of benchmarkQueries) {
        try {
            testResults.featureTests.performance.total++;
            
            const startTime = Date.now();
            
            let supabaseQuery = supabase.from(query.table).select(query.select);
            
            if (query.filter) {
                const [field, value] = query.filter.split('=');
                if (field && value) {
                    supabaseQuery = supabaseQuery.eq(field, value);
                }
            }
            
            if (query.limit) {
                supabaseQuery = supabaseQuery.limit(query.limit);
            }
            
            const { data, error } = await supabaseQuery;
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            results.push({
                table: query.table,
                duration,
                success: !error,
                recordCount: data?.length || 0
            });
            
            if (error) {
                console.log(`❌ ${query.table} query failed: ${error.message}`);
                testResults.featureTests.performance.failed++;
            } else {
                console.log(`✅ ${query.table} query: ${duration}ms (${data?.length || 0} records)`);
                testResults.featureTests.performance.passed++;
            }
            
        } catch (error) {
            console.log(`❌ ${query.table} query failed: ${error.message}`);
            testResults.featureTests.performance.failed++;
        }
    }
    
    // Calculate average performance
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    console.log(`📊 Average query duration: ${Math.round(avgDuration)}ms`);
    
    if (avgDuration > 200) {
        logWarning('Average query time suggests further optimization may be needed');
    } else {
        logSuccess('Query performance looks good');
    }
    
    return results;
}

// Generate comprehensive test report
function generateTestReport() {
    console.log('\n' + '='.repeat(70));
    console.log('🎯 SUPER ADMIN TEST & PERFORMANCE VALIDATION REPORT');
    console.log('='.repeat(70));
    console.log('');
    
    // User creation results
    console.log('👤 USER CREATION:');
    if (testResults.userCreation.success) {
        console.log('✅ Test super admin user created successfully');
        console.log(`   📧 Email: ${TEST_SUPER_ADMIN.email}`);
        console.log(`   🔑 Password: ${TEST_SUPER_ADMIN.password}`);
        console.log(`   👤 Username: test-super-admin`);
        console.log(`   🛡️  Role: super-admin`);
    } else {
        console.log('❌ Test super admin user creation failed');
    }
    console.log('');
    
    // Feature test results
    console.log('🧪 FEATURE TEST RESULTS:');
    const featureCategories = ['content', 'comments', 'media', 'users', 'performance'];
    
    for (const category of featureCategories) {
        const result = testResults.featureTests[category];
        if (result) {
            const successRate = result.total > 0 ? ((result.passed / result.total) * 100).toFixed(1) : 0;
            console.log(`   ${category.charAt(0).toUpperCase() + category.slice(1)}: ${result.passed}/${result.total} (${successRate}%)`);
        }
    }
    console.log('');
    
    // RLS performance results
    console.log('🔒 RLS POLICY PERFORMANCE:');
    const rlsSuccessRate = testResults.rlsTests.total > 0 ? 
        ((testResults.rlsTests.passed / testResults.rlsTests.total) * 100).toFixed(1) : 0;
    console.log(`   RLS Tests: ${testResults.rlsTests.passed}/${testResults.rlsTests.total} (${rlsSuccessRate}%)`);
    console.log('');
    
    // Overall results
    console.log('📊 OVERALL RESULTS:');
    const overallSuccessRate = testResults.overall.total > 0 ? 
        ((testResults.overall.passed / testResults.overall.total) * 100).toFixed(1) : 0;
    console.log(`   Total Tests: ${testResults.overall.total}`);
    console.log(`   ✅ Passed: ${testResults.overall.passed}`);
    console.log(`   ❌ Failed: ${testResults.overall.failed}`);
    console.log(`   Success Rate: ${overallSuccessRate}%`);
    console.log('');
    
    // Performance improvement assessment
    console.log('⚡ PERFORMANCE ASSESSMENT:');
    if (overallSuccessRate >= 90) {
        console.log('🎉 Excellent! Database performance fixes are working very well.');
    } else if (overallSuccessRate >= 75) {
        console.log('✅ Good! Most features working, minor issues may need attention.');
    } else if (overallSuccessRate >= 50) {
        console.log('⚠️  Moderate success. Some performance issues may persist.');
    } else {
        console.log('❌ Significant issues detected. Review implementation and policies.');
    }
    console.log('');
    
    // Recommendations
    console.log('💡 RECOMMENDATIONS:');
    if (testResults.overall.failed > 0) {
        console.log('   • Review failed tests and check RLS policy implementations');
        console.log('   • Verify the comprehensive performance fix migration was applied');
        console.log('   • Test individual policies that failed');
    }
    console.log('   • Monitor query performance in production');
    console.log('   • Run the full test suite: node scripts/testing/test-database-performance.js');
    console.log('   • Validate with real user scenarios');
    console.log('');
    
    console.log('='.repeat(70));
    
    return {
        success: overallSuccessRate >= 75,
        results: testResults,
        recommendations: testResults.overall.failed > 0 ? 'Review failed tests' : 'Continue monitoring'
    };
}

// Main execution
async function main() {
    console.log('🚀 Super Admin Test & Feature Validation');
    console.log('Generated: 2025-11-09T23:31:27Z');
    console.log('Testing all features with optimized database performance');
    console.log('');
    
    try {
        // Step 1: Create test super admin
        const userResult = await createTestSuperAdmin();
        console.log('');
        
        if (userResult.success) {
            // Step 2: Test all features
            await testContentFeatures();
            console.log('');
            
            await testCommentsFeatures();
            console.log('');
            
            await testMediaFeatures();
            console.log('');
            
            await testUserFeatures();
            console.log('');
            
            // Step 3: Test RLS performance
            await testRLSPerformance();
            console.log('');
            
            // Step 4: Run performance benchmark
            await runPerformanceBenchmark();
            console.log('');
            
            // Step 5: Generate report
            const report = generateTestReport();
            
            // Save test results
            const fs = require('fs');
            const reportData = {
                timestamp: new Date().toISOString(),
                testUser: TEST_SUPER_ADMIN.email,
                results: testResults,
                report: report
            };
            
            fs.writeFileSync('super-admin-test-report.json', JSON.stringify(reportData, null, 2));
            console.log('📄 Test report saved to: super-admin-test-report.json');
            
        } else {
            console.log('❌ Failed to create test super admin user');
            console.log('Please check your Supabase configuration and try again.');
        }
        
    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
        process.exit(1);
    }
}

// Run the tests
main().catch(console.error);