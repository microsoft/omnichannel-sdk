# omnichannel-sdk - Claude Code Instructions

## Repository Ecosystem

**This workspace may contain up to 6 related repositories.** Not all teams have all repos. Always be aware of which repository you're in when making changes.

| Repository | Type | Purpose | Typical Location |
|------------|------|---------|------------------|
| **CRM.Omnichannel** | Monorepo (Backend) | 20+ microservices for Omnichannel platform | `<workspace-root>/CRM.Omnichannel/` |
| **ConversationControl** | Frontend (Agent UI) | Agent experience and conversation management UI | `<workspace-root>/CRM.OmniChannel.ConversationControl/` |
| **LiveChatWidget** | Frontend (Customer) | Customer-facing chat widget | `<workspace-root>/CRM.OmniChannel.LiveChatWidget/` |
| **omnichannel-chat-sdk** | Public SDK | TypeScript SDK for chat integration | `<workspace-root>/omnichannel-chat-sdk/` |
| **omnichannel-chat-widget** | Public Components | React component library | `<workspace-root>/omnichannel-chat-widget/` |
| **omnichannel-amsclient** | Shared Library | File upload/download client | `<workspace-root>/omnichannel-amsclient/` |

---

## Quick Context
- **Purpose:** Low-level HTTP client for Omnichannel REST APIs (session lifecycle, chat config, tokens, transcripts)
- **npm Name:** `@microsoft/ocsdk`
- **Version:** 0.5.21
- **Type:** TypeScript Library
- **Tech Stack:** TypeScript 4.9, Axios + axios-retry, crypto-js, Webpack 5, Karma + Jasmine
- **Distribution:** npm registry (`@microsoft/ocsdk`), UMD bundle (`dist/SDK.min.js`), CJS (`lib/`)
- **Consumers:** `@microsoft/omnichannel-chat-sdk` (primary consumer), `CRM.OmniChannel.LiveChatWidget`

## Architecture Overview

**What is omnichannel-sdk (@microsoft/ocsdk)?**

This is the lowest-level HTTP client in the Omnichannel frontend stack. It provides typed wrappers around the Omnichannel `livechatconnector` REST APIs, handling request construction, retry logic, timeout management, authentication headers, and telemetry logging. It does **not** manage WebSocket connections, message rendering, or conversation adapters — those are handled by higher-level packages (chat-sdk, chat-widget).

**Key Responsibilities:**
- REST API calls to Omnichannel backend (`livechatconnector/*` endpoints)
- Automatic retry with exponential backoff via `axios-retry` (retries on 5xx, network errors, optionally 429)
- Per-endpoint configurable request timeouts
- Authentication header management (`AuthenticatedUserToken`, `AuthCodeNonce` rotation)
- Browser/device/OS detection for session context
- Data masking and PII sanitization in telemetry logs
- Cache key generation via SHA-256 hashing (crypto-js)
- UMD bundle for script-tag usage (`window.Microsoft.CRM.Omnichannel.SDK`)

**What This Package Does NOT Do:**
- No WebSocket/real-time messaging (ACS handles this)
- No message rendering or UI (chat-widget handles this)
- No conversation adapter management (chat-sdk handles this)
- No file uploads (amsclient handles this)

---

## Source Code Structure

```
omnichannel-sdk/
├── src/
│   ├── index.ts                    # Entry point, UMD global setup
│   ├── SDK.ts                      # Main SDK class (implements ISDK) — all API methods
│   ├── SDKProvider.ts              # Factory: SDKProvider.getSDK() creates SDK instances
│   ├── Common/
│   │   ├── Constants.ts            # Default headers, status codes, config params
│   │   ├── Enums.ts                # ChannelId, LiveChatVersion, OCSDKTelemetryEvent, SDKError
│   │   ├── EventNames.ts           # Custom DOM event names
│   │   ├── Locales.ts              # Supported locale list
│   │   ├── Mappings.ts             # StringMap type alias
│   │   ├── OCSDKLogger.ts          # Logger wrapper
│   │   ├── OmnichannelEndpoints.ts # All REST endpoint path constants
│   │   ├── OmnichannelHTTPHeaders.ts # HTTP header name constants
│   │   └── RequestTimeoutConfig.ts # Per-endpoint timeout type
│   ├── Interfaces/
│   │   ├── ISDK.ts                 # SDK public interface (all API method signatures)
│   │   ├── IOmnichannelConfiguration.ts # { orgUrl, orgId, widgetId, channelId }
│   │   ├── ISDKConfiguration.ts    # Retry counts, timeouts, nonce, ocUserAgent
│   │   ├── IAxiosRetryOptions.ts   # Retry handler config
│   │   └── I*OptionalParams.ts     # Per-method optional parameter interfaces
│   ├── Model/
│   │   ├── FetchChatTokenResponse.ts
│   │   ├── InitContext.ts          # Session init payload shape
│   │   ├── ILogger.ts / LogLevel.ts
│   │   ├── QueueAvailability.ts / ReconnectAvailability.ts / ReconnectMappingRecord.ts
│   │   └── Location.ts
│   └── Utils/
│       ├── axiosRetryHandler.ts    # Core retry logic (exponential backoff, 429 handling, header overwrites)
│       ├── BrowserInfo.ts / DeviceInfo.ts / OSInfo.ts  # User agent detection
│       ├── endpointsCreators.ts    # Dynamic endpoint path builders (version-aware)
│       ├── EventManager.ts         # Custom DOM event dispatch
│       ├── httpHeadersUtils.ts     # OC-User-Agent header builder
│       ├── LoggingSanitizer.ts     # PII stripping for telemetry
│       ├── SessionInitRetryHandler.ts
│       ├── uuid.ts                 # UUID v4 generator
│       └── Timer.ts / sleep.ts / ...
├── test/
│   ├── index.ts                    # Test entry point
│   ├── SDK.spec.ts                 # Main SDK tests
│   ├── SDKProvider.spec.ts
│   ├── Common/OCSDKLogger.spec.ts
│   └── Utils/*.spec.ts             # Utility tests
├── lib/                            # TSC + Babel output (CJS, published to npm)
├── dist/                           # Webpack output (UMD bundle)
├── karma.conf.js                   # Test runner config (Karma + Jasmine + ChromeHeadless)
├── webpack.config.js               # Webpack entry (merges common + dev/prod)
├── webpack.common.js               # Shared webpack config (entry, resolve, output)
├── webpack.prod.js                 # Production webpack config (minified SDK.min.js)
└── webpack.dev.js                  # Development webpack config
```

### Key Files

| File | Purpose |
|------|---------|
| `src/SDK.ts` | **Core file** — all 18+ API methods (getChatConfig, getChatToken, sessionInit, sessionClose, etc.) |
| `src/SDKProvider.ts` | Factory pattern — `SDKProvider.getSDK(config, sdkConfig, logger)` |
| `src/Interfaces/ISDK.ts` | Public contract — all method signatures |
| `src/Interfaces/IOmnichannelConfiguration.ts` | Required config: `{ orgUrl, orgId, widgetId, channelId }` |
| `src/Interfaces/ISDKConfiguration.ts` | Optional config: retry counts, timeouts, nonce, ocUserAgent |
| `src/Common/OmnichannelEndpoints.ts` | All REST API path constants (39 endpoints) |
| `src/Common/Enums.ts` | `ChannelId`, `LiveChatVersion` (V1=IC3, V2=ACS, V3), `OCSDKTelemetryEvent` |
| `src/Utils/axiosRetryHandler.ts` | Retry logic: exponential backoff, 429 handling, retry-after header |

---

## SDK API Methods

The `SDK` class (`src/SDK.ts`) implements `ISDK` with these methods:

| Method | HTTP | Purpose |
|--------|------|---------|
| `getLcwFcsDetails()` | GET | Fetch LCW FCS details for the org |
| `getChatConfig(requestId, bypassCache?)` | GET | Fetch widget configuration (sets `liveChatVersion`) |
| `getLWIDetails(requestId, opts?)` | GET | Get live work item details (anon or auth) |
| `getChatToken(requestId, opts?, retryCount?)` | GET | Get chat token to join ACS thread (with retry) |
| `getReconnectableChats(params)` | GET | Fetch reconnectable chats for authenticated user |
| `getReconnectAvailability(reconnectId, opts?)` | GET | Check reconnect availability |
| `getAgentAvailability(requestId, opts?)` | POST | Check agent/queue availability |
| `sessionInit(requestId, opts?)` | POST | Start a chat session (sends browser/device context) |
| `createConversation(requestId, opts?)` | POST | Create conversation via connector path |
| `sessionClose(requestId, opts?)` | POST | Close a chat session |
| `validateAuthChatRecord(requestId, opts)` | GET | Validate authenticated chat record exists |
| `submitPostChatResponse(requestId, response, opts?)` | POST | Submit post-chat survey response |
| `getSurveyInviteLink(ownerId, body, opts?)` | POST | Get survey invite link |
| `getChatTranscripts(requestId, chatId, token, opts?)` | GET | Get chat transcripts (V1 and V2 paths) |
| `getPersistentChatHistory(requestId, opts?)` | GET | Get persistent chat history (auth required) |
| `emailTranscript(requestId, token, body, opts?)` | POST | Email transcript to customer |
| `fetchDataMaskingInfo(requestId)` | GET | Fetch org data masking rules |
| `makeSecondaryChannelEventRequest(requestId, body, opts?)` | POST | Send secondary channel event |
| `sendTypingIndicator(requestId, version, opts?)` | POST | Send typing indicator (V2 only) |

### Method Pattern

Every method follows the same structure:

```typescript
public async methodName(requestId: string, optionalParams: IMethodOptionalParams = {}): Promise<ReturnType> {
    // 1. Start timer + log telemetry start event
    const timer = Timer.TIMER();
    this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.METHOD_STARTED, "...", requestId);

    // 2. Build request path (auth vs anon endpoint, version-aware)
    let requestPath = authenticatedUserToken
        ? `/${OmnichannelEndpoints.AuthPath}/...`
        : `/${OmnichannelEndpoints.AnonPath}/...`;

    // 3. Create axios instance with retry handler
    const axiosInstance = axios.create();
    axiosRetryHandler(axiosInstance, { retries: ..., waitTimeInMsBetweenRetries: ... });

    // 4. Build headers (Content-Type, auth token, nonce, session ID, user agent, correlation ID)
    const requestHeaders: StringMap = { ...Constants.defaultHeaders };
    if (authenticatedUserToken) {
        requestHeaders[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
        requestHeaders[OmnichannelHTTPHeaders.authCodeNonce] = this.configuration.authCodeNonce;
    }
    this.addDefaultHeaders(requestId, requestHeaders);

    // 5. Execute request with configurable timeout
    try {
        const response = await axiosInstance(options);
        this.setAuthCodeNonce(response.headers); // Rotate nonce from response
        this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.METHOD_SUCCEEDED, ...);
        return response.data;
    } catch (error) {
        this.logWithLogger(LogLevel.ERROR, OCSDKTelemetryEvent.METHOD_FAILED, ...);
        if (isExpectedAxiosError(error, Constants.axiosTimeoutErrorCode)) {
            throw new Error(this.HTTPTimeOutErrorMessage);
        }
        throw error;
    }
}
```

---

## Build & Test Workflow

### Prerequisites
- Node.js (v12+ per README, but modern versions work)
- npm package manager
- `NODE_OPTIONS=--openssl-legacy-provider` is required for the production build

### Setup
```bash
cd omnichannel-sdk
npm install
```

### Common Commands

**Build (3-stage pipeline: TSC -> Babel -> Webpack):**
- **Full production build:** `npm run build:prod` — runs all 3 stages, outputs `lib/` (CJS) and `dist/SDK.min.js` (UMD)
- **TypeScript only:** `npm run build:tsc` — outputs to `lib/` with declarations
- **Babel only:** `npm run build:babel` — transpiles `src/` to `lib/` (ES5)
- **Webpack dev:** `npm run build:dev` — outputs `dist/SDK.js` (unminified UMD)
- **Watch mode:** `npm run watch` — Webpack in watch mode

**Test:**
- **Unit tests:** `npm test` — Karma + Jasmine in headless Chrome
- **Lint:** `npm run lint` — ESLint
- **Format:** `npm run format` — Prettier

### Build Pipeline Detail

```
Source (src/*.ts)
    │
    ├─ TSC ──────────→ lib/*.js + lib/*.d.ts   (CJS + declarations, published to npm)
    │                    target: ES5, strict: true
    │
    ├─ Babel ────────→ lib/*.js                 (overwritten, ES5 with polyfills)
    │                    presets: @babel/env, @babel/typescript
    │
    └─ Webpack ──────→ dist/SDK.min.js          (UMD bundle, libraryTarget: window)
                         entry: lib/index.js (prod) or src/index.ts (dev)
```

**Why 3 stages?** TSC generates type declarations. Babel handles the actual transpilation to ES5 with runtime polyfills. Webpack bundles everything into a single UMD file for `<script>` tag usage.

### Test Infrastructure

- **Runner:** Karma
- **Framework:** Jasmine
- **Browser:** ChromeHeadless (ChromeHeadlessCI with `--no-sandbox` in CI)
- **Coverage:** Istanbul via `@jsdevtools/coverage-istanbul-loader`
- **Mocking:** `axios-mock-adapter` for HTTP mocking
- **CI Reporter:** `@dhigroup/karma-vsts-reporter` for Azure DevOps

---

## Coding Standards

### TypeScript Best Practices

- **Strict mode enabled** in `tsconfig.json`
- **Avoid `any` type** — use proper interfaces (existing `any` casts are marked with `eslint-disable` comments)
- **Explicit return types** — all public methods have return types
- **Async/await** — preferred over `.then()` chains
- **Use `const`** unless the pointer will mutate, then `let`

### SDK-Specific Patterns

**Always use the timer + telemetry pattern:**
```typescript
const timer = Timer.TIMER();
this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.STARTED, "Description", requestId);
try {
    // ... operation
    const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
    this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.SUCCEEDED, "Description", requestId, response, elapsedTimeInMilliseconds, ...);
} catch (error) {
    const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
    this.logWithLogger(LogLevel.ERROR, OCSDKTelemetryEvent.FAILED, "Description", requestId, undefined, elapsedTimeInMilliseconds, ...);
}
```

**Always check for timeout errors and wrap them:**
```typescript
if (isExpectedAxiosError(error, Constants.axiosTimeoutErrorCode)) {
    reject(new Error(this.HTTPTimeOutErrorMessage));
}
```

**Always rotate AuthCodeNonce from response headers:**
```typescript
const { headers } = response;
this.setAuthCodeNonce(headers); // Updates this.configuration.authCodeNonce
```

**Always add default headers:**
```typescript
this.addDefaultHeaders(requestId, requestHeaders);
// Adds: Oc-Sessionid, Ms-Oc-User-Agent, correlation ID
```

**Auth vs Anonymous endpoints:** Most methods have two endpoint paths — anonymous and authenticated. Switch based on the presence of `authenticatedUserToken`:
```typescript
const basePath = authenticatedUserToken
    ? OmnichannelEndpoints.LiveChatAuthSessionInitPath
    : OmnichannelEndpoints.LiveChatSessionInitPath;
```

**Reconnect ID handling:** There are two modes for passing reconnect IDs — as a URL path segment or as a `sig` query parameter, controlled by `useUnauthReconnectIdSigQueryParam`:
```typescript
const shouldUseSigQueryParam = !authenticatedUserToken && this.configuration.useUnauthReconnectIdSigQueryParam;
if (reconnectId) {
    if (shouldUseSigQueryParam) {
        params.sig = reconnectId;
    } else {
        requestPath += `/${reconnectId}`;
    }
}
```

---

## Retry & Timeout Configuration

### Default Retry Config
- **Max retries on failure:** 5 (`maxRequestRetriesOnFailure`)
- **getChatToken retry count:** 10 (`getChatTokenRetryCount`)
- **getChatToken retry interval:** 10,000ms (`getChatTokenTimeBetweenRetriesOnFailure`)
- **Retry on 429:** true for getChatToken, false by default for others
- **Retry strategy:** Exponential backoff (`2^retryCount * waitTime`), respects `retry-after` header
- **Retryable conditions:** 5xx status, network errors, no response, optionally 429

### Default Timeouts (per endpoint)
| Endpoint | Timeout |
|----------|---------|
| getChatConfig | 120,000ms |
| getChatTranscripts | 30,000ms |
| getChatToken, sessionInit, sessionClose, getLWIDetails, getReconnectableChats, getReconnectAvailability, submitPostChatResponse, getSurveyInviteLink, getAgentAvailability, validateAuthChatRecord, getPersistentChatHistory | 15,000ms |
| emailTranscript, fetchDataMaskingInfo, sendTypingIndicator | 5,000ms |

---

## Integration with Other Repos

**This SDK integrates with:**
- **CRM.Omnichannel (Backend):** All `livechatconnector/*` REST APIs in the Omnichannel gateway

**Consumed by:**
- **omnichannel-chat-sdk** (`@microsoft/omnichannel-chat-sdk`) — Primary consumer. Wraps ocsdk methods and adds conversation lifecycle management, adapter handling, and WebSocket coordination.
- **CRM.OmniChannel.LiveChatWidget** — Indirect consumer via chat-sdk

**Dependency direction:**
```
LiveChatWidget → chat-widget → chat-sdk → ocsdk (this package)
                                         → amsclient
```

**When changing public APIs:**
- This is consumed by `omnichannel-chat-sdk` — breaking changes require coordinated releases
- The `ISDK` interface (`src/Interfaces/ISDK.ts`) is the public contract
- Update `CHANGELOG.md` under `[Unreleased]` with all changes
- Use semantic versioning: major version for breaking changes

---

## Testing Strategy

**Unit Tests (Karma + Jasmine):**
- **Location:** `test/` directory
- **Run:** `npm test`
- **Mocking:** `axios-mock-adapter` for HTTP call mocking

**Test files:**
- `test/SDK.spec.ts` — Tests for all SDK API methods
- `test/SDKProvider.spec.ts` — Factory tests
- `test/Common/OCSDKLogger.spec.ts` — Logger tests
- `test/Utils/*.spec.ts` — Utility function tests

**Test Best Practices:**
- Mock axios responses using `axios-mock-adapter`
- Include `headers` in all response mocks (required since Webpack 5 migration)
- Use async/await patterns (not mixing `done` callbacks with promises)
- Test both success and error paths for every API method
- Test timeout handling (verify `ClientHTTPTimeoutError` is thrown)
- Test auth vs anonymous endpoint selection

---

## Common Issues & Troubleshooting

**Build Issues:**
- **`NODE_OPTIONS=--openssl-legacy-provider` required** for production build — the build script includes `cross-env` to set this
- **3-stage build is slow** — TSC, then Babel, then Webpack. For development, use `npm run build:dev` (Webpack only from source)
- Clear node_modules: `rm -rf node_modules && npm install`

**Test Issues:**
- Tests run in ChromeHeadless via Karma — ensure Chrome/Chromium is installed
- In CI, use `ChromeHeadlessCI` launcher (set `CI=true` env var) for `--no-sandbox` flags
- Test mocks must include `headers` property on response objects

**Authentication Issues:**
- `vsts-npm-auth -config .npmrc` if internal dependency resolution fails

**Runtime Issues:**
- `process is not defined` in browser — Webpack 5 removed Node.js polyfills; `webpack.common.js` uses `ProvidePlugin` to polyfill `process`
- AuthCodeNonce rotation — if requests fail with auth errors, verify the nonce is being properly rotated from response headers via `setAuthCodeNonce()`

---

## Documentation

- **[README.md](README.md)** — SDK usage examples, initialization, API calls
- **[CHANGELOG.md](CHANGELOG.md)** — Release history from v0.1.0 to v0.5.21
- **[SECURITY.md](SECURITY.md)** — Security policies
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** — Microsoft Open Source Code of Conduct

---

## Pull Request Guidelines

1. **Code standards:** Follow TypeScript strict mode, avoid `any` types
2. **Testing:** All Karma tests must pass, add tests for new API methods
3. **Telemetry:** Every API method must log start/succeed/fail events with timers
4. **Error handling:** Wrap timeout errors as `ClientHTTPTimeoutError`, propagate others
5. **CHANGELOG:** Update `CHANGELOG.md` under `[Unreleased]` section
6. **Auth parity:** If adding a new endpoint, provide both authenticated and anonymous paths
7. **Retry configuration:** Add per-endpoint timeout and wait-time-between-retries configs

---

**Summary:** This is the lowest-level HTTP client (`@microsoft/ocsdk`) in the Omnichannel frontend stack. It wraps `livechatconnector` REST APIs with axios + retry logic, per-endpoint timeouts, auth header management, and telemetry logging. Uses a 3-stage build (TSC -> Babel -> Webpack). Consumed primarily by `@microsoft/omnichannel-chat-sdk`. Always follow the timer + telemetry + retry pattern for new methods.
