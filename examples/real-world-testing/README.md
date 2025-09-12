# Real World Testing Examples

This directory contains practical examples and integration tests for the Omnichannel SDK. These examples help developers understand how to use the SDK in real-world scenarios and test against actual API endpoints.

## ⚡ TL;DR - Quick Commands

**Want to test `getPersistentChatHistory` right now?**

```bash
# Browser test (with network monitoring)
npm run build:dev
cd examples/real-world-testing && npx http-server . -p 8080
# Open: http://localhost:8080/browser/getPersistentChatHistory-browser-test.html

# Node.js test (command line)
npm run build:tsc
node examples/real-world-testing/nodejs/getPersistentChatHistory-nodejs-test.js
```

⚠️ **Don't forget to update the configuration with your real values before running!**

## 📁 Directory Structure

```
examples/
└── real-world-testing/
    ├── browser/
    │   └── getPersistentChatHistory-browser-test.html
    ├── nodejs/
    │   └── getPersistentChatHistory-nodejs-test.js
    └── README.md (this file)
```

## 🎯 Purpose

These examples are designed to:

- **Demonstrate real API integration** with actual Omnichannel endpoints
- **Help debug network issues** by providing detailed logging and error handling
- **Validate API responses** and message count accuracy
- **Test pagination behavior** with real data
- **Provide templates** for your own integration tests
- **Show best practices** for error handling and configuration

## 🚀 Getting Started

### Prerequisites

1. **Build the SDK**:
   ```bash
   npm run build:tsc    # For Node.js examples
   npm run build:dev    # For browser examples
   ```

2. **Gather your configuration**:
   - Organization ID
   - Organization URL
   - Widget ID
   - Valid authenticated user token (JWT)

### Quick Start

**Browser Testing:**
```bash
# 1. Build for browser
npm run build:dev

# 2. Serve the test page
cd examples/real-world-testing
npx http-server . -p 8080

# 3. Open: http://localhost:8080/browser/getPersistentChatHistory-browser-test.html
# 4. Update config in the form and click "Run Test"
```

**Node.js Testing:**
```bash
# 1. Build for Node.js
npm run build:tsc

# 2. Edit configuration
code examples/real-world-testing/nodejs/getPersistentChatHistory-nodejs-test.js

# 3. Run the test
node examples/real-world-testing/nodejs/getPersistentChatHistory-nodejs-test.js
```

## 🌐 Browser Testing

### File: `browser/getPersistentChatHistory-browser-test.html`

**Use this when you want to:**
- See network requests in browser DevTools
- Test CORS behavior
- Debug authentication issues
- Validate request/response headers
- Test in a real browser environment

**How to use:**
1. Open the HTML file in your browser:
   ```bash
   # Option 1: Open directly in browser
   start browser/getPersistentChatHistory-browser-test.html
   
   # Option 2: Serve via local server (recommended for CORS)
   cd examples/real-world-testing
   npx http-server . -p 8080
   # Then open: http://localhost:8080/browser/getPersistentChatHistory-browser-test.html
   ```
2. Update the configuration form with your values
3. Open Developer Tools (F12) → Network tab
4. Click "Run Test"
5. Inspect network requests and responses

**Features:**
- ✅ Interactive configuration form
- ✅ Real-time console output
- ✅ Network request monitoring
- ✅ Export test results
- ✅ Detailed error handling
- ✅ Message count validation
- ✅ Pagination testing

## 🖥️ Node.js Testing

### File: `nodejs/getPersistentChatHistory-nodejs-test.js`

**Use this when you want to:**
- Integrate into automated testing pipelines
- Test server-side implementations
- Avoid browser-specific issues
- Run programmatic tests
- Test in CI/CD environments

**How to use:**
1. Update configuration in the file:
   ```bash
   # Edit the TEST_CONFIG object in the file
   code nodejs/getPersistentChatHistory-nodejs-test.js
   ```
2. Run the test:
   ```bash
   # From the project root
   node examples/real-world-testing/nodejs/getPersistentChatHistory-nodejs-test.js
   
   # Or from the examples directory
   cd examples/real-world-testing
   node nodejs/getPersistentChatHistory-nodejs-test.js
   ```
3. Review the console output for results and any errors

**Features:**
- ✅ Comprehensive configuration validation
- ✅ Colored console output
- ✅ Performance timing
- ✅ Message count analysis
- ✅ Pagination testing
- ✅ Detailed error diagnostics
- ✅ Modular design for reuse

## 🔧 Configuration Guide

### Required Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `orgId` | Your organization ID | `caf979e3-887e-f011-b4c0-000d3a340b7a` |
| `orgUrl` | Your organization URL | `https://yourorg.crm.dynamics.com` |
| `widgetId` | Your widget/app ID | `aa93b293-99e2-4f5e-a98b-159123b5a12a` |
| `authenticatedUserToken` | Valid JWT token for authentication | `eyJhbGciOiJSUzI1NiIs...` |

### Optional Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `pageSize` | Number of messages per page | `5` |
| `requestId` | Custom request ID | Auto-generated |
| `pageToken` | For pagination | `undefined` |

## 🔍 Testing Guide

### What to Test

1. **Basic Functionality**
   - ✅ API endpoint accessibility
   - ✅ Authentication token validity
   - ✅ Response format correctness

2. **Message Count Validation**
   - ✅ Requested vs received message count
   - ✅ Page size behavior
   - ✅ Empty result handling

3. **Pagination**
   - ✅ `nextPageToken` presence
   - ✅ Second page retrieval
   - ✅ Consistent page sizes

4. **Error Handling**
   - ✅ Invalid tokens
   - ✅ Network timeouts
   - ✅ Invalid configuration
   - ✅ CORS issues (browser only)

### Expected Results

**Successful Response Structure:**
```json
{
  "messages": [...],           // or "conversations" or "chatMessages"
  "nextPageToken": "...",      // Optional, for pagination
  "totalCount": 123,           // Optional
  "hasMore": true              // Optional
}
```

**Message Count Analysis:**
- ✅ **PASS**: Received count matches requested page size
- ⚠️ **WARNING**: Received count differs (may be valid if fewer messages available)
- ❌ **FAIL**: API error or invalid configuration

## 🐛 Troubleshooting

### Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| `SDK not loaded` | Build not completed | Run `npm run build:dev` |
| `Authenticated user token is required` | Missing/empty token | Provide valid JWT token |
| `404 Not Found` | Wrong configuration | Check orgId, orgUrl, widgetId |
| `401/403 Unauthorized` | Invalid token | Check token validity and permissions |
| `CORS error` | Browser security | Use localhost or whitelisted domain |
| `ENOTFOUND` | Network issue | Check orgUrl and connectivity |
| `Timeout` | Slow network | Check network or increase timeout |

### Debugging Tips

1. **Browser Testing**:
   - Open DevTools Network tab
   - Look for red/failed requests
   - Check request/response headers
   - Verify request URL formation

2. **Node.js Testing**:
   - Enable verbose mode in configuration
   - Check console output for detailed errors
   - Verify file paths and imports

3. **Authentication Issues**:
   - Ensure token is not expired
   - Check token format (should be JWT)
   - Verify token has required permissions

## 📊 Performance Benchmarks

Typical response times (can vary based on network and data):

- **First page**: 100-500ms
- **Pagination**: 50-300ms
- **Large page sizes**: May be slower

## 🔒 Security Notes

⚠️ **Important**: Never commit real authentication tokens to version control!

- Use environment variables for sensitive data
- Consider token rotation policies
- Test with non-production environments when possible
- Remove or obfuscate tokens before sharing code

## 🤝 Contributing

When adding new examples:

1. Follow the established naming convention
2. Include comprehensive documentation
3. Add error handling and validation
4. Provide both success and failure scenarios
5. Update this README with new examples

### 🤖 AI Prompt for Creating New Test Examples

If you want to create real-world tests for other SDK methods, you can use this prompt with GitHub Copilot or any AI assistant:

```
Create a real-world integration test for the [METHOD_NAME] method in the Omnichannel SDK. 

Requirements:
- Create both browser (HTML) and Node.js versions
- Follow the same structure as examples/real-world-testing/
- Include comprehensive error handling and validation
- Add message count analysis if applicable
- Add pagination testing if the method supports it
- Include configuration validation
- Add detailed logging and console output
- Follow the same naming convention: [methodName]-[environment]-test.[ext]
- Include setup instructions and troubleshooting
- Add security best practices for handling tokens
- Include performance timing analysis
- Add export/copy functionality for browser version
- Make it educational with helpful comments

The method signature is:
[PASTE_METHOD_SIGNATURE_HERE]

Required configuration parameters:
[LIST_REQUIRED_CONFIG_HERE]

Optional parameters:
[LIST_OPTIONAL_PARAMS_HERE]

Please follow the same professional structure and documentation standards as the getPersistentChatHistory examples.
```

**Example usage:**
```
Create a real-world integration test for the getChatTranscripts method in the Omnichannel SDK.

Requirements: [same as above]

The method signature is:
async getChatTranscripts(requestId: string, chatId: string, token: string, getChatTranscriptsOptionalParams?: IGetChatTranscriptsOptionalParams): Promise<string>

Required configuration parameters:
- requestId: string
- chatId: string  
- token: string (Skype token)
- orgId, orgUrl, widgetId (from omnichannelConfig)

Optional parameters:
- authenticatedUserToken: string
- currentLiveChatVersion: LiveChatVersion

Please follow the same professional structure and documentation standards as the getPersistentChatHistory examples.
```

### 📋 Checklist for New Test Examples

When creating a new test, ensure you include:

**Files Structure:**
- [ ] `browser/[methodName]-browser-test.html`
- [ ] `nodejs/[methodName]-nodejs-test.js`
- [ ] Update this README with the new example

**Features:**
- [ ] Configuration validation with helpful error messages
- [ ] Real-time console output with color coding
- [ ] Network request monitoring instructions
- [ ] Error handling with common scenarios
- [ ] Performance timing analysis
- [ ] Export/copy functionality (browser)
- [ ] Modular design for reuse (Node.js)
- [ ] Comprehensive documentation and comments

**Testing Scenarios:**
- [ ] Success case with valid configuration
- [ ] Error cases (invalid tokens, network issues, etc.)
- [ ] Edge cases (empty responses, timeouts, etc.)
- [ ] Parameter validation
- [ ] Response format validation

**Documentation:**
- [ ] Clear setup instructions
- [ ] Configuration guide with examples
- [ ] Troubleshooting section
- [ ] Security considerations
- [ ] Usage examples

## 📚 Additional Resources

- [Omnichannel SDK Documentation](../../../README.md)
- [API Reference](../../../docs/)
- [Unit Tests](../../../test/)
- [Development Guide](../../../docs/DEVELOPMENT_GUIDE.md)

---

**Need help?** Check the troubleshooting section above or refer to the main SDK documentation.