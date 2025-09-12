# Omnichannel SDK Examples

This directory contains practical examples and real-world usage patterns for the Omnichannel SDK. These examples help developers understand how to integrate and test the SDK in various environments.

## 📁 Directory Structure

```
examples/
├── real-world-testing/          # Integration tests with real API calls
│   ├── browser/                 # Browser-based testing examples
│   ├── nodejs/                  # Node.js testing examples
│   └── README.md               # Detailed testing documentation
└── README.md                   # This file
```

## 🎯 What's Here

### 🔍 Real World Testing
**Location**: `real-world-testing/`

Complete integration testing examples that make actual API calls to Omnichannel endpoints. Perfect for:

- **Validating your configuration** with real backends
- **Debugging network issues** with detailed logging
- **Testing pagination behavior** with actual data
- **Learning the SDK** through working examples
- **Creating your own tests** using our templates

**Available Examples**:
- ✅ `getPersistentChatHistory` - Browser & Node.js versions
- 🔄 More examples coming soon...

## 🚀 Quick Start

1. **Choose your environment**:
   - 🌐 **Browser**: Great for debugging network requests with DevTools
   - 🖥️ **Node.js**: Perfect for automated testing and CI/CD

2. **Build the SDK**:
   ```bash
   # For Node.js examples
   npm run build:tsc
   
   # For browser examples  
   npm run build:dev
   ```

3. **Navigate to the example**:
   ```bash
   cd examples/real-world-testing
   ```

4. **Follow the specific README** for detailed instructions

## 🔧 Before You Start

Make sure you have:

- ✅ **Organization ID**: Your Omnichannel organization identifier
- ✅ **Organization URL**: Your Omnichannel service URL
- ✅ **Widget ID**: Your chat widget identifier  
- ✅ **Authentication Token**: Valid JWT token for API access

## 📖 Example Categories

### Integration Testing
Learn how to test the SDK with real API endpoints, validate responses, and handle errors gracefully.

### Performance Testing
Understand response times, pagination behavior, and optimization techniques.

### Error Handling
See comprehensive error handling patterns and debugging techniques.

### Configuration Management
Learn best practices for managing configuration across different environments.

## 🎓 Learning Path

1. **Start with Real World Testing** - Get familiar with basic API calls
2. **Try Both Environments** - Understand browser vs Node.js differences
3. **Experiment with Configuration** - Test different parameters
4. **Handle Edge Cases** - Learn from error scenarios
5. **Build Your Own** - Use examples as templates

## 🤝 Contributing Examples

We welcome new examples! When contributing:

1. **Follow the established structure** in existing examples
2. **Include comprehensive documentation** and comments
3. **Add error handling** for common scenarios
4. **Provide both success and failure cases**
5. **Update README files** to include your example

### 🤖 Need Help Creating New Tests?

Want to create a real-world test for another SDK method? Check out the **AI Prompt Template** in [`real-world-testing/README.md`](real-world-testing/README.md#-ai-prompt-for-creating-new-test-examples) - it provides a comprehensive prompt you can use with GitHub Copilot or any AI assistant to generate professional test examples following our established patterns.

### Example Naming Convention
- Use descriptive, action-based names: `getFeature-environment-test`
- Include the environment: `browser`, `nodejs`, or `universal`
- Add the purpose: `test`, `example`, `demo`

## 🔒 Security Best Practices

⚠️ **Important Security Notes**:

- **Never commit real tokens** - Use placeholders in examples
- **Use environment variables** for sensitive configuration
- **Test with non-production data** when possible
- **Rotate tokens regularly** in real implementations

## 📞 Support

- **General SDK Questions**: See main [README](../README.md)
- **API Documentation**: Check [docs/](../docs/) folder
- **Bug Reports**: Use GitHub issues
- **Example-specific Issues**: Include which example and environment

---

**Ready to start?** Head to [`real-world-testing/`](real-world-testing/) for hands-on examples!