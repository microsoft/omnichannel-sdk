# Omnichannel SDK

[![npm version](https://badge.fury.io/js/%40microsoft%2Focsdk.svg)](https://badge.fury.io/js/%40microsoft%2Focsdk)
![Release CI](https://github.com/microsoft/omnichannel-sdk/workflows/Release%20CI/badge.svg)

This repo contains the source code for getting up and running with the Omnichannel SDK on the web using standard web technologies and on mobile using React Native.

# Getting Started
## Prerequisites
- [Node v12.13.0](https://nodejs.org/en/) (or equivalent)
- [npm](https://www.npmjs.com/)

## Installation

```
npm install
```

## Build

### Load SDK in memory and watches the changes for development
```
npm run watch
```

### Build SDK for development
```
npm run build:dev
```

### Build SDK for production
```
npm run build:prod
```

### Check lint rules
```
npm run lint
```
Lint checks is enabled by default in watch mode.

# Examples

### Initialize SDK
```js
const params = {
	orgUrl: '',
	orgId: '',
	widgetId: '',
}

const ocsdk = Microsoft.CRM.Omnichannel.SDK.SDKProvider.getSDK(params);
window.ocsdk = ocsdk;
```

### Initialize SDK with custom configuration
```js
const params = {
	orgUrl: '',
	orgId: '',
	widgetId: '',
}

const configuration = {
  getChatTokenRetryCount: 35,
  getChatTokenTimeBetweenRetriesOnFailure: 10000,
  maxRequestRetriesOnFailure: 3
};

const ocsdk = Microsoft.CRM.Omnichannel.SDK.SDKProvider.getSDK(params, configuration);
window.ocsdk = ocsdk;
```

### Get Chat Config
```js
// Manually generate request id
const requestId = Microsoft.CRM.Omnichannel.SDK.Util.uuidv4();
try {
	const config = await window.ocsdk.getChatConfig(requestId);
	// success
} catch {
	// failure
}

// Auto generate request id
try {
	const config = await window.ocsdk.getChatConfig();
	// success
} catch {
	// failure
}
```

### Get Chat Token
```js
// Manually generate request id
const requestId = Microsoft.CRM.Omnichannel.SDK.Util.uuidv4();
try {
	const chatToken = await window.ocsdk.getChatToken(requestId);
	// success
} catch {
	// failure
}

// Auto generate request id
try {
  const chatToken = await window.ocsdk.getChatToken();
  const {requestId} = chatToken; // Request ID auto generated used to getChatToken
  // success
} catch {
  // failure
}

```

### Session Init
```js
const requestId = Microsoft.CRM.Omnichannel.SDK.Util.uuidv4();
const optionalParams = {
  authenticatedUserToken: '',
  getContext: true, // Automically gets browser, device, location & os info
  initContext: { // Optional init context to pass
    locale: '', // 'en-us' by default if not set
    originalurl: '', // window.href.location by default
    os: '',
    browser: '',
    device: '',
    longitude: '',
    latitiude: '',
    preChatResponse: {}
  }
};

try {
	await window.ocsdk.sessionInit(requestId, optionalParams);
	// success
} catch {
	// failure
}
```

### Session Close
```js
const requestId = Microsoft.CRM.Omnichannel.SDK.Util.uuidv4();
const optionalParams = {
  authenticatedUserToken: '',
};

try {
	await window.ocsdk.sessionClose(requestId, optionalParams);
	// success
} catch {
	// failure
}
```

### Submit PostChat Response
```js
const requestId = Microsoft.CRM.Omnichannel.SDK.Util.uuidv4();
const postChatResponse = {};
const optionalParams = {
  authenticatedUserToken: '',
};

try {
	await window.ocsdk.submitPostChatResponse(requestId, postChatResponse, optionalParams);
	// success
} catch {
	// failure
}
```

### Get Chat Transcripts
```js
const requestId = Microsoft.CRM.Omnichannel.SDK.Util.uuidv4();
const chatId = ''; // Chat thread ID
const token = ''; // Skype token
const optionalParams = {
  authenticatedUserToken: '',
};

try {
	const response = await window.ocsdk.getChatTranscripts(requestId, chatId, token, optionalParams);
	// success
} catch {
	// failure
}
```

### Email Transcript
```js
const requestId = Microsoft.CRM.Omnichannel.SDK.Util.uuidv4();
const token = ''; // Skype token
const emailRequestBody = { // Email body
  ChatId: '', // Chat thread ID
  EmailAddress: 'contoso@microsoft.com',
  DefaultAttachmentMessage: '',
  CustomerLocale: 'en-us'
};
const optionalParams = {
  authenticatedUserToken: '',
};

try {
	await window.ocsdk.emailTranscript(requestId, token, emailRequestBody, optionalParams);
	// success
} catch {
	// failure
}
```

### Fetch Data Masking Info
```js
// Manually generate request id
const requestId = Microsoft.CRM.Omnichannel.SDK.Util.uuidv4();
try {
  const response = await window.ocsdk.fetchDataMaskingInfo(requestId);
  // success
} catch {
  // failure
}

// Auto generate request id
try {
  const response = await window.ocsdk.fetchDataMaskingInfo();
  // success
} catch {
  // failure
}
```
## SDK Configuration
These are the available config options with its default values for the SDK.
```js
{
  /**
   * Number of times a getchattoken request is retried.
   */
  getChatTokenRetryCount: 35,
  /**
   * Time in milliseconds between two successive getchattoken retry requests.
   */
  getChatTokenTimeBetweenRetriesOnFailure: 10000,
  /**
   * Maximum number of request retries before failing.
   */
  maxRequestRetriesOnFailure: 3,
}
```

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
