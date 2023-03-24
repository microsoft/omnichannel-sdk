# Changelog
All notable changes to this project will be documented in this file.

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
