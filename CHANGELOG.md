# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
### Changed
- Increase of timeout limit time for GetChatConfig, from 30 secs to 120 secs.

## [0.5.7] - 2024-10-25

### Added
- set open ssl to legacy 
- logging response errorCode into telemetry logs
- Improve telemetry to uniformly log all errors for reconnectable chat and reconnect availability

### Fixed
- Add `requestId` as optional parameters for `getReconnectableChats()`

## [0.5.6]

### Fixed

- Fix error propagation when a call to an endpoint timesout
- Fix unit tests

### Added

- Error propagation when getchattoken returns an empty dashboard

## [0.5.5]

### Security

- Uptake [axios@1.7.4](https://www.npmjs.com/package/axios/v/1.7.4)

## [0.5.3] - 2024-06-18

### Added

- added axios-retry library support

## [0.5.2] - 2024-05-20

### Fixed

- Fix `Authenticated Chat Reconnect` APIs using `sig` as query paramater

## [0.5.1] - 2024-05-15

### Fixed

- Remove console logs from `LoggingSanitizer.stripRequestHeadersSensitiveProperties()`

## [0.5.0] - 2024-05-14

### Added

- Add `livechatconnector/v2/lcwfcsdetails` endpoint
- Add `Ms-Oc-User-Agent` as default request headers
- Log `RequestHeaders`

## [0.4.5] - 2024-03-18

### Changed

- Remove telemetry lane, which was duplicating events for GetLWI

## [0.4.4] - 2024-03-18

### Added

- Add configurable wait time between retries componenets, and set to 3 secnds for getLWI, and 1 second for all other requests

## [0.4.3] - 2024-02-28

### Added

- Add `useUnauthReconnectIdSigQueryParam` configuration to use `sig` as query parameter to pass `reconnectId` for `Unauthenticated Chat Reconnect` APIs
- Add `Oc-Sessionid` as part of request headers if exists
- Add configurable wait time between retries componenets, and set to 3 secnds for getLWI, and 1 second for all other requests


## [0.4.2] - 2023-12-06

### Added

- Add `GetChatConfigFailed` telemetry event

### Changed

- Removal of `recursive call` in `LoggingSanitizer` as preventive measure for `stack overflow`

## [0.4.1] - 2023-11-10

### Added

- including changes to handle new library versions.

### Security

- Uptake [axios@1.6.1](https://www.npmjs.com/package/axios/v/1.6.1)
- Uptake [ts-loader@8.4.0](https://www.npmjs.com/package/ts-loader/v/8.4.0)
- Uptake [typescript@4.9.5](https://www.npmjs.com/package/typescript/v/4.9.5)

## [0.4.0] - 2023-07-05

### Added

- `refreshToken` optional query parameter to `getchattoken` endpoint

## [0.3.4] - 2023-03-24

### Added

- `livechatconnector/v3/getchattoken` endpoint
- `livechatconnector/v3/auth/getchattoken` endpoint
- Stop retry when the error is related to out of office hours.
- Send and receive `AuthCodeNonce` header in order to be compliant with Omnichannel's OAuth 2.0 requirement
- Increasing request timeout and add error handling for OAuth 2.0

## [0.3.3] - 2023-01-09

### Fix

- Added `requestTimeoutConfig` and `defaultRequestTimeout` to set timeouts on endpoints.
- Throw `ClientHTTPTimeoutError` exception in case of timeouts.
- Update `InitContext` to include `isProactiveChat`.

## [0.3.2] - 2022-11-03

### Changed

- Update methods to log `RequestPath`, `RequestMethod` and `ResponseStatusCode`

### Fix

- Update `getChatToken`'s `error.response` to be optional

### Security

## [0.3.1] - 2022-07-06

### Added

- Add `RequestPayload`, `RequestPath`, `RequestMethod` and `ResponseStatusCode` as log data
- Strip `Geolocation` log data

### Fix

- Stop `getchattoken` retry calls on `429`
- Fix `axiosRetry` counter

### Changed

- Rename `getQueueAvailability` to `getAgentAvailability`

## [0.3.0] - 2021-09-23

### Added

- Remove sensitive properties from `Error` object
- Return `date` field on `getChatConfig` response
- Add `customerDisplayName` as optional parameter in `sendTypingIndicator`

### Security

- Uptake [@babel/runtime@7.15.4](https://www.npmjs.com/package/@babel/runtime/v/7.15.4)
- Uptake [@types/node@12.20.26](https://www.npmjs.com/package/@types/node/v/12.20.26)
- Uptake [axios@0.21.4](https://www.npmjs.com/package/axios/v/0.21.4)
- Uptake [@babel/cli@7.15.7](https://www.npmjs.com/package/@babel/cli/v/7.15.7)
- Uptake [@babel/core@7.15.5](https://www.npmjs.com/package/@babel/core/v/7.15.5)
- Uptake [@babel/plugin-proposal-class-properties@7.14.5](https://www.npmjs.com/package/@babel/plugin-proposal-class-properties/v/7.14.5)
- Uptake [@babel/plugin-transform-runtime@7.15.0](https://www.npmjs.com/package/@babel/plugin-transform-runtime/v/7.15.0)
- Uptake [@babel/preset-env@7.15.6](https://www.npmjs.com/package/@babel/preset-env/v/7.15.6)
- Uptake [@babel/preset-typescript@7.15.0](https://www.npmjs.com/package/@babel/preset-typescript/v/7.15.0)
- Uptake [@types/jasmine@3.9.1](https://www.npmjs.com/package/@types/jasmine/v/3.9.1)
- Uptake [@typescript-eslint/eslint-plugin@3.10.1](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin/v/3.10.1)
- Uptake [@typescript-eslint/parser@3.10.1](https://www.npmjs.com/package/@typescript-eslint/parser/v/3.10.1)
- Uptake [eslint@7.32.0](https://www.npmjs.com/package/eslint/v/7.32.0)
- Uptake [jasmine@3.9.0](https://www.npmjs.com/package/jasmine/v/3.9.0)
- Uptake [prettier@1.19.1](https://www.npmjs.com/package/prettier/v/1.19.1)
- Uptake [ts-loader@6.2.2](https://www.npmjs.com/package/ts-loader/v/6.2.2)
- Uptake [typescript@3.9.10](https://www.npmjs.com/package/typescript/v/3.9.10)
- Uptake [webpack@4.46.0](https://www.npmjs.com/package/webpack/v/4.46.0)
- Uptake [webpack-cli@3.3.12](https://www.npmjs.com/package/webpack-cli/v/3.3.12)
- Uptake [webpack-dev-server@3.11.2](https://www.npmjs.com/package/webpack-dev-server/v/3.11.2)

## [0.2.0] - 2021-05-05

### Added

- `livechatconnector/v2/auth/getchattoken` endpoint
- `inbound/typingindicator/livechat/sendtypingindicator` endpoint
- `livechatconnector/v2/getchattranscripts` endpoint
- `livechatconnector/v2/auth/getchattranscripts` endpoint

## [0.1.1] - 2021-02-16

### Added

- `livechatconnector/v2/getchattoken` endpoint

### Security

- Uptake [@babel/cli@7.12.1](https://www.npmjs.com/package/@babel/cli/v/7.12.1)
- Uptake [karma@5.2.3](https://www.npmjs.com/package/karma/v/5.2.3)
- Uptake [webpack-dev-server@3.11.0](https://www.npmjs.com/package/webpack-dev-server/v/3.11.0)
- Fix eslint errors
- Uptake [axios@0.21.1](https://www.npmjs.com/package/axios/v/0.21.1)

## [0.1.0] - 2020-09-21

### Added

- Initial release of Omnichannel SDK v0.1.0
