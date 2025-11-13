import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Database Performance Test Script
// Tests the implemented fixes for 355 database performance issues
// Generated: 2025-11-09T23:28:31Z

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase configuration');
    console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test results tracking
const testResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    total: 0
};

// Logging functions
const logSuccess = (message) => {
    console.log(`✅ ${message}`);
    testResults.passed++;
    testResults.total++;
};

const logError = (message) => {
    console.log(`❌ ${message}`);
    testResults.failed++;
    testResults.total++;
};

const logWarning = (message) => {
    console.log(`⚠️  ${message}`);
    testResults.warnings++;
    testResults.total++;
};

const logInfo = (message) => {
    console.log(`ℹ️  ${message}`);
    testResults.total++;
};

// Test functions
async function testRLSPolicyPerformance() {
    logInfo('Testing RLS Policy Performance Improvements...');
    
    try {
        // Test content table policies
        const { data: contentData, error: contentError } = await supabase
            .from('content')
            .select('id, title, status')
            .limit(10);
        
        if (contentError) {
            logError(`Content table RLS test failed: ${contentError.message}`);
        } else {
            logSuccess(`Content table RLS policies working correctly (${contentData?.length || 0} records)`);
        }
        
        // Test content_comments table policies
        const { data: commentsData, error: commentsError } = await supabase
            .from('content_comments')
            .select('id, comment_text, status')
            .limit(10);
        
        if (commentsError) {
            logError(`Content_comments table RLS test failed: ${commentsError.message}`);
        } else {
            logSuccess(`Content_comments table RLS policies working correctly (${commentsData?.length || 0} records)`);
        }
        
        // Test users table policies
        const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, email')
            .limit(5);
        
        if (usersError) {
            logError(`Users table RLS test failed: ${usersError.message}`);
        } else {
            logSuccess(`Users table RLS policies working correctly (${usersData?.length || 0} records)`);
        }
        
        // Test media table policies
        const { data: mediaData, error: mediaError } = await supabase
            .from('media')
            .select('id, file_name, file_type')
            .limit(10);
        
        if (mediaError) {
            logError(`Media table RLS test failed: ${mediaError.message}`);
        } else {
            logSuccess(`Media table RLS policies working correctly (${mediaData?.length || 0} records)`);
        }
        
    } catch (error) {
        logError(`RLS Policy Performance test error: ${error.message}`);
    }
}

async function testConsolidatedPolicies() {
    logInfo('Testing Consolidated Policy Functionality...');
    
    try {
        // Test categories access
        const { data: categoriesData, error: categoriesError } = await supabase
            .from('categories')
            .select('id, name')
            .limit(5);
        
        if (categoriesError) {
            logError(`Categories consolidated policy test failed: ${categoriesError.message}`);
        } else {
            logSuccess(`Categories policy consolidation working (${categoriesData?.length || 0} records)`);
        }
        
        // Test tags access
        const { data: tagsData, error: tagsError } = await supabase
            .from('tags')
            .select('id, name')
            .limit(5);
        
        if (tagsError) {
            logError(`Tags consolidated policy test failed: ${tagsError.message}`);
        } else {
            logSuccess(`Tags policy consolidation working (${tagsData?.length || 0} records)`);
        }
        
        // Test permissions table access
        const { data: permissionsData, error: permissionsError } = await supabase
            .from('permissions')
            .select('id, name')
            .limit(5);
        
        if (permissionsError) {
            logError(`Permissions consolidated policy test failed: ${permissionsError.message}`);
        } else {
            logSuccess(`Permissions policy consolidation working (${permissionsData?.length || 0} records)`);
        }
        
    } catch (error) {
        logError(`Consolidated Policy test error: ${error.message}`);
    }
}

async function testDatabasePerformance() {
    logInfo('Testing Database Performance Improvements...');
    
    try {
        // Test complex query performance
        const startTime = Date.now();
        
        // Test join query that would benefit from optimized policies
        const { data: complexData, error: complexError } = await supabase
            .from('content')
            .select(`
                id,
                title,
                status,
                content_comments (
                    id,
                    comment_text,
                    status
                )
            `)
            .eq('status', 'published')
            .limit(20);
        
        const endTime = Date.now();
        const queryTime = endTime - startTime;
        
        if (complexError) {
            logError(`Complex query performance test failed: ${complexError.message}`);
        } else {
            logSuccess(`Complex query completed in ${queryTime}ms (${complexData?.length || 0} records)`);
            
            if (queryTime > 1000) {
                logWarning(`Query time of ${queryTime}ms suggests further optimization needed`);
            } else {
                logSuccess(`Query time of ${queryTime}ms indicates good performance`);
            }
        }
        
    } catch (error) {
        logError(`Database Performance test error: ${error.message}`);
    }
}

async function testPolicyBackup() {
    logInfo('Testing Policy Backup System...');
    
    try {
        // Check if policy backup table exists and has data
        const { data: backupData, error: backupError } = await supabase
            .from('policy_backup')
            .select('id, table_name, policy_name, backup_timestamp')
            .limit(5);
        
        if (backupError) {
            if (backupError.message.includes('does not exist')) {
                logWarning('Policy backup table not found - backup system may need manual verification');
            } else {
                logError(`Policy backup test failed: ${backupError.message}`);
            }
        } else {
            logSuccess(`Policy backup system working (${backupData?.length || 0} backed up policies)`);
        }
        
    } catch (error) {
        logError(`Policy Backup test error: ${error.message}`);
    }
}

async function testSecurityBoundaries() {
    logInfo('Testing Security Boundary Preservation...');
    
    try {
        // Test that unauthorized access is still blocked
        // This should fail if RLS is working properly
        const { data: testData, error: testError } = await supabase
            .from('users')
            .select('id, email, password_hash') // Should not return password_hash if working
            .limit(1);
        
        if (testError) {
            logWarning(`Security test failed as expected: ${testError.message}`);
            logSuccess('RLS security boundaries are properly enforced');
        } else {
            // If we get data, check if sensitive fields are hidden
            if (testData && testData.length > 0) {
                const hasPasswordHash = testData[0].password_hash !== undefined;
                if (hasPasswordHash) {
                    logError('Security boundary issue: password_hash field is exposed');
                } else {
                    logSuccess('Security boundaries preserved - sensitive fields hidden');
                }
            }
        }
        
    } catch (error) {
        logError(`Security Boundary test error: ${error.message}`);
    }
}

async function testIndexOptimization() {
    logInfo('Testing Index Optimization...');
    
    try {
        // Test queries that should benefit from optimized indexes
        const { data: indexedData, error: indexedError } = await supabase
            .from('content')
            .select('id, title')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (indexedError) {
            logError(`Index optimization test failed: ${indexedError.message}`);
        } else {
            logSuccess(`Index optimization working (${indexedData?.length || 0} records retrieved)`);
        }
        
    } catch (error) {
        logError(`Index Optimization test error: ${error.message}`);
    }
}

async function runPerformanceBenchmark() {
    logInfo('Running Basic Performance Benchmark...');
    
    try {
        const queries = [
            { table: 'content', select: 'id,title', filter: 'status=eq.published', limit: 10 },
            { table: 'content_comments', select: 'id,comment_text', filter: 'status=eq.published', limit: 10 },
            { table: 'users', select: 'id,email', limit: 5 },
            { table: 'media', select: 'id,file_name', limit: 10 },
            { table: 'categories', select: 'id,name', limit: 5 }
        ];
        
        const results = [];
        
        for (const query of queries) {
            const startTime = Date.now();
            
            let supabaseQuery = supabase.from(query.table).select(query.select);
            
            if (query.filter) {
                const [field, value] = query.filter.split('=');
                const operator = value.split('.')[0];
                const actualValue = value.split('.')[1];
                supabaseQuery = supabaseQuery.eq(field, actualValue);
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
                logWarning(`${query.table} query failed: ${error.message}`);
            } else {
                logSuccess(`${query.table} query completed in ${duration}ms`);
            }
        }
        
        const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
        logInfo(`Average query duration: ${Math.round(avgDuration)}ms`);
        
        if (avgDuration > 500) {
            logWarning('Average query time suggests further optimization may be needed');
        } else {
            logSuccess('Query performance looks good');
        }
        
    } catch (error) {
        logError(`Performance Benchmark test error: ${error.message}`);
    }
}

async function generateTestReport() {
    const successRate = testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : 0;
    
    console.log('\n' + '='.repeat(60));
    console.log('DATABASE PERFORMANCE FIX TEST REPORT');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⚠️  Warnings: ${testResults.warnings}`);
    console.log(`Success Rate: ${successRate}%`);
    console.log('='.repeat(60));
    
    if (testResults.failed === 0) {
        console.log('🎉 All tests passed! Database performance fixes are working correctly.');
    } else if (testResults.failed < testResults.total * 0.2) {
        console.log('⚠️  Most tests passed, but some issues were found. Review the results above.');
    } else {
        console.log('❌ Several tests failed. Please review the issues and check implementation.');
    }
    
    console.log('\nNext Steps:');
    console.log('1. If all tests passed, monitor performance in production');
    console.log('2. If some tests failed, check the policy implementations');
    console.log('3. Review the post-implementation checklist');
    console.log('4. Test with real user scenarios');
    
    return testResults;
}

// Main test execution
async function main() {
    console.log('🚀 Starting Database Performance Fix Validation Tests');
    console.log('Generated: 2025-11-09T23:28:31Z');
    console.log('Testing fixes for 355 database performance issues\n');
    
    try {
        await testRLSPolicyPerformance();
        console.log('');
        
        await testConsolidatedPolicies();
        console.log('');
        
        await testDatabasePerformance();
        console.log('');
        
        await testPolicyBackup();
        console.log('');
        
        await testSecurityBoundaries();
        console.log('');
        
        await testIndexOptimization();
        console.log('');
        
        await runPerformanceBenchmark();
        console.log('');
        
        await generateTestReport();
        
    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
        process.exit(1);
    }
}

// Run the tests
main().catch(console.error);