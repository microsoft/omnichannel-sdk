/**
 * Real World Integration Test: getPersistentChatHistory (Node.js)
 * 
 * This script demonstrates how to test the getPersistentChatHistory API
 * in a Node.js environment with real API calls.
 * 
 * Use this test for:
 * - Integration testing with real backends
 * - Debugging API responses
 * - Performance testing
 * - Validation of message count accuracy
 * - Testing pagination behavior
 * 
 * Setup:
 * 1. npm run build:tsc (build the SDK)
 * 2. Update the configuration below with your actual values
 * 3. Run: node examples/real-world-testing/nodejs/getPersistentChatHistory-nodejs-test.js
 */

const SDK = require('../../../lib/SDK').default;

// Configuration - Update these with your actual values
const TEST_CONFIG = {
    // Required: Your organization configuration
    omnichannelConfig: {
        orgId: 'YOUR_ORG_ID',           // Replace with your actual Org ID
        orgUrl: 'https://YOUR_ORG.crm.dynamics.com',  // Replace with your actual Org URL
        widgetId: 'YOUR_WIDGET_ID',     // Replace with your actual Widget ID
        channelId: 'lcw'
    },
    
    // Required: Authentication token
    authenticatedUserToken: 'YOUR_VALID_AUTH_TOKEN',  // Replace with valid JWT token
    
    // Test parameters
    pageSize: 5,
    requestId: null, // Will be auto-generated if null
    
    // Test options
    testPagination: true,
    verbose: true
};

/**
 * Validates the test configuration
 */
function validateConfiguration() {
    const errors = [];
    
    if (!TEST_CONFIG.omnichannelConfig.orgId || TEST_CONFIG.omnichannelConfig.orgId === 'YOUR_ORG_ID') {
        errors.push('orgId must be updated from placeholder value');
    }
    
    if (!TEST_CONFIG.omnichannelConfig.orgUrl || TEST_CONFIG.omnichannelConfig.orgUrl === 'https://YOUR_ORG.crm.dynamics.com') {
        errors.push('orgUrl must be updated from placeholder value');
    }
    
    if (!TEST_CONFIG.omnichannelConfig.widgetId || TEST_CONFIG.omnichannelConfig.widgetId === 'YOUR_WIDGET_ID') {
        errors.push('widgetId must be updated from placeholder value');
    }
    
    if (!TEST_CONFIG.authenticatedUserToken || TEST_CONFIG.authenticatedUserToken === 'YOUR_VALID_AUTH_TOKEN') {
        errors.push('authenticatedUserToken must be updated from placeholder value');
    }
    
    return errors;
}

/**
 * Logs a message with timestamp and optional color (for terminals that support it)
 */
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
        info: '\x1b[36m',     // Cyan
        success: '\x1b[32m',  // Green
        warning: '\x1b[33m',  // Yellow
        error: '\x1b[31m',    // Red
        reset: '\x1b[0m'      // Reset
    };
    
    const color = colors[type] || colors.info;
    console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

/**
 * Analyzes message count and logs results
 */
function analyzeMessageCount(requestedCount, actualMessages, label = '') {
    const actualCount = Array.isArray(actualMessages) ? actualMessages.length : 0;
    const match = actualCount === requestedCount;
    const difference = actualCount - requestedCount;
    
    log(`📊 ${label}Message Count Analysis:`, 'info');
    log(`   Requested: ${requestedCount} messages`, 'info');
    log(`   Received: ${actualCount} messages`, 'info');
    log(`   Match: ${match ? '✅ YES' : `❌ NO (difference: ${difference})`}`, match ? 'success' : 'warning');
    
    return { actualCount, match, difference };
}

/**
 * Main test function
 */
async function testGetPersistentChatHistory() {
    try {
        log('🚀 Starting real call test for getPersistentChatHistory...', 'info');
        
        // Validate configuration
        const configErrors = validateConfiguration();
        if (configErrors.length > 0) {
            log('❌ Configuration errors found:', 'error');
            configErrors.forEach(error => log(`   - ${error}`, 'error'));
            log('💡 Please update the TEST_CONFIG object with your actual values', 'warning');
            process.exit(1);
        }
        
        // Display configuration
        log('📋 Configuration:', 'info');
        log(`   Org ID: ${TEST_CONFIG.omnichannelConfig.orgId}`, 'info');
        log(`   Org URL: ${TEST_CONFIG.omnichannelConfig.orgUrl}`, 'info');
        log(`   Widget ID: ${TEST_CONFIG.omnichannelConfig.widgetId}`, 'info');
        log(`   Channel ID: ${TEST_CONFIG.omnichannelConfig.channelId}`, 'info');
        log(`   Page Size: ${TEST_CONFIG.pageSize}`, 'info');
        log(`   Auth Token Length: ${TEST_CONFIG.authenticatedUserToken.length} chars`, 'info');
        
        // Initialize SDK
        const sdk = new SDK(TEST_CONFIG.omnichannelConfig);
        const requestId = TEST_CONFIG.requestId || 'test-request-' + Date.now();
        
        log(`   Request ID: ${requestId}`, 'info');
        log('', 'info'); // Empty line for readability
        
        // Test parameters
        const params = {
            authenticatedUserToken: TEST_CONFIG.authenticatedUserToken,
            pageSize: TEST_CONFIG.pageSize,
            pageToken: undefined
        };

        log('🌐 Making API call...', 'info');
        log(`   Request ID: ${requestId}`, 'info');
        log(`   Page Size: ${params.pageSize}`, 'info');
        log(`   Has Auth Token: ${!!params.authenticatedUserToken}`, 'info');
        
        // First page test
        const startTime = Date.now();
        const result = await sdk.getPersistentChatHistory(requestId, params);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        log(`⏱️ Response Time: ${duration}ms`, 'info');
        log('', 'info');
        
        // Analyze message count
        const receivedMessages = result.messages || result.conversations || result.chatMessages || [];
        const analysis = analyzeMessageCount(TEST_CONFIG.pageSize, receivedMessages);
        
        log('', 'info');
        log('✅ First Page Success! Response structure:', 'success');
        log(`   Keys: ${Object.keys(result).join(', ')}`, 'info');
        
        if (TEST_CONFIG.verbose) {
            log('📄 Full Response:', 'info');
            log(JSON.stringify(result, null, 2), 'info');
        }
        
        // Test pagination if enabled and nextPageToken exists
        if (TEST_CONFIG.testPagination && result.nextPageToken) {
            log('', 'info');
            log('📄 Testing pagination...', 'info');
            
            const nextPageParams = {
                ...params,
                pageToken: result.nextPageToken
            };
            
            const nextPageStartTime = Date.now();
            const nextPageResult = await sdk.getPersistentChatHistory(requestId, nextPageParams);
            const nextPageEndTime = Date.now();
            const nextPageDuration = nextPageEndTime - nextPageStartTime;
            
            log(`⏱️ Pagination Response Time: ${nextPageDuration}ms`, 'info');
            
            // Analyze next page message count
            const nextPageMessages = nextPageResult.messages || nextPageResult.conversations || nextPageResult.chatMessages || [];
            const nextPageAnalysis = analyzeMessageCount(TEST_CONFIG.pageSize, nextPageMessages, 'Next Page ');
            
            log('', 'info');
            log('✅ Pagination Success!', 'success');
            
            if (TEST_CONFIG.verbose) {
                log('📄 Next Page Response:', 'info');
                log(JSON.stringify(nextPageResult, null, 2), 'info');
            }
            
            // Summary
            log('', 'info');
            log('📊 Test Summary:', 'info');
            log(`   First page: ${analysis.actualCount}/${TEST_CONFIG.pageSize} messages (${analysis.match ? 'PASS' : 'FAIL'})`, analysis.match ? 'success' : 'warning');
            log(`   Second page: ${nextPageAnalysis.actualCount}/${TEST_CONFIG.pageSize} messages (${nextPageAnalysis.match ? 'PASS' : 'FAIL'})`, nextPageAnalysis.match ? 'success' : 'warning');
            log(`   Total messages: ${analysis.actualCount + nextPageAnalysis.actualCount}`, 'info');
            log(`   Average response time: ${Math.round((duration + nextPageDuration) / 2)}ms`, 'info');
            
        } else if (TEST_CONFIG.testPagination && !result.nextPageToken) {
            log('', 'info');
            log('📄 No nextPageToken found - pagination test skipped', 'warning');
            log('💡 This means there are no more pages available', 'info');
        }
        
        log('', 'info');
        log('🎉 Test completed successfully!', 'success');
        log('💡 If you see network errors, check your configuration and network connectivity', 'info');

    } catch (error) {
        log('', 'info');
        log('❌ Test failed with error:', 'error');
        log(`   Message: ${error.message}`, 'error');
        
        if (TEST_CONFIG.verbose && error.stack) {
            log('   Stack trace:', 'error');
            log(error.stack, 'error');
        }
        
        log('', 'info');
        log('🔍 Common error scenarios:', 'warning');
        
        if (error.message.includes('Authenticated user token is required')) {
            log('💡 You need to provide a valid authenticatedUserToken', 'warning');
        }
        if (error.message.includes('timeout')) {
            log('💡 The request timed out - check network connectivity', 'warning');
        }
        if (error.message.includes('404')) {
            log('💡 Check your orgId, orgUrl, and widgetId configuration', 'warning');
        }
        if (error.message.includes('401') || error.message.includes('403')) {
            log('💡 Check your authenticatedUserToken - it may be invalid or expired', 'warning');
        }
        if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
            log('💡 Network error - check your orgUrl and internet connectivity', 'warning');
        }
        
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testGetPersistentChatHistory();
}

module.exports = {
    testGetPersistentChatHistory,
    TEST_CONFIG,
    validateConfiguration,
    analyzeMessageCount
};