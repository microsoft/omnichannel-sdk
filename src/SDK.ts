import * as hash from "crypto";

import { ChannelId, LiveChatVersion, OCSDKTelemetryEvent } from "./Common/Enums";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

import { BrowserInfo } from "./Utils/BrowserInfo";
import Constants from "./Common/Constants";
import { CustomContextData } from "./Utils/CustomContextData";
import { DeviceInfo } from "./Utils/DeviceInfo";
import FetchChatTokenResponse from "./Model/FetchChatTokenResponse";
import IDataMaskingInfo from "./Interfaces/IDataMaskingInfo";
import IEmailTranscriptOptionalParams from "./Interfaces/IEmailTranscriptOptionalParams";
import IGetChatTokenOptionalParams from "./Interfaces/IGetChatTokenOptionalParams";
import IGetChatTranscriptsOptionalParams from "./Interfaces/IGetChatTranscriptsOptionalParams";
import IGetLWIDetailsOptionalParams from "./Interfaces/IGetLWIDetailsOptionalParams";
import IGetQueueAvailabilityOptionalParams from "./Interfaces/IGetQueueAvailabilityOptionalParams";
import IGetSurveyInviteLinkOptionalParams from "./Interfaces/IGetSurveyInviteLinkOptionalParams";
import IOmnichannelConfiguration from "./Interfaces/IOmnichannelConfiguration";
import IReconnectableChatsParams from "./Interfaces/IReconnectableChatsParams";
import ISDK from "./Interfaces/ISDK";
import ISDKConfiguration from "./Interfaces/ISDKConfiguration";
import ISecondaryChannelEventOptionalParams from "./Interfaces/ISecondaryChannelEventOptionalParams";
import ISendTypingIndicatorOptionalParams from "./Interfaces/ISendTypingIndicatorOptionalParams"
import ISessionCloseOptionalParams from "./Interfaces/ISessionCloseOptionalParams";
import ISessionInitOptionalParams from "./Interfaces/ISessionInitOptionalParams";
import ISubmitPostChatResponseOptionalParams from "./Interfaces/ISubmitPostChatResponseOptionalParams";
import IValidateAuthChatRecordOptionalParams from "./Interfaces/IValidateAuthChatRecordOptionalParams";
import InitContext from "./Model/InitContext";
import Locales from "./Common/Locales";
import { LogLevel } from "./Model/LogLevel";
import { LoggingSanitizer } from "./Utils/LoggingSanitizer";
import OCSDKLogger from "./Common/OCSDKLogger";
import { OSInfo } from "./Utils/OSInfo";
import OmnichannelEndpoints from "./Common/OmnichannelEndpoints";
import OmnichannelHTTPHeaders from "./Common/OmnichannelHTTPHeaders";
import OmnichannelQueryParameter from "./Interfaces/OmnichannelQueryParameter";
import QueueAvailability from "./Model/QueueAvailability";
import ReconnectAvailability from "./Model/ReconnectAvailability";
import ReconnectMappingRecord from "./Model/ReconnectMappingRecord";
import { RequestTimeoutConfig } from "./Common/RequestTimeoutConfig";
import { StringMap } from "./Common/Mappings";
import { Timer } from "./Utils/Timer";
import axiosRetry from "./Utils/axiosRetry";
import { createGetChatTokenEndpoint } from "./Utils/endpointsCreators";
import isExpectedAxiosError from "./Utils/isExpectedAxiosError";
import sessionInitRetryHandler from "./Utils/SessionInitRetryHandler";
import throwClientHTTPTimeoutError from "./Utils/throwClientHTTPError";
import { uuidv4 } from "./Utils/uuid";
import { waitTimeBetweenRetriesConfigs } from "./Utils/waitTimeBetweenRetriesConfigs";

export default class SDK implements ISDK {
  private static defaultRequestTimeoutConfig: RequestTimeoutConfig = {
    getChatConfig: 30000,
    getLWIDetails: 15000,
    getChatToken: 15000,
    sessionInit: 15000,
    sessionClose: 15000,
    getReconnectableChats: 15000,
    getReconnectAvailability: 15000,
    submitPostChatResponse: 15000,
    getSurveyInviteLink: 15000,
    getChatTranscripts: 30000,
    emailTranscript: 5000,
    fetchDataMaskingInfo: 5000,
    makeSecondaryChannelEventRequest: 15000,
    getAgentAvailability: 15000,
    sendTypingIndicator: 5000,
    validateAuthChatRecordTimeout: 15000
  };

  private static defaultConfiguration: ISDKConfiguration = {
    authCodeNonce: uuidv4().substring(0, 8),
    getChatTokenRetryCount: 10,
    getChatTokenTimeBetweenRetriesOnFailure: 10000,
    getChatTokenRetryOn429: false,
    maxRequestRetriesOnFailure: 3,
    defaultRequestTimeout: undefined,
    requestTimeoutConfig: SDK.defaultRequestTimeoutConfig,
    useUnauthReconnectIdSigQueryParam: false,
    waitTimeBetweenRetriesConfig: waitTimeBetweenRetriesConfigs
  };

  liveChatVersion: number;
  sessionId?: string;

  public constructor(private omnichannelConfiguration: IOmnichannelConfiguration, private configuration: ISDKConfiguration = SDK.defaultConfiguration, private logger?: OCSDKLogger) {
    // Sets to default configuration if passed configuration is empty or is not an object
    if (!Object.keys(this.configuration).length || typeof (configuration) !== "object") {
      this.configuration = SDK.defaultConfiguration;
    }

    // Validate SDK config
    for (const key of Object.keys(SDK.defaultConfiguration)) {
      if (!this.configuration.hasOwnProperty(key)) { // eslint-disable-line no-prototype-builtins
        this.configuration[`${key}`] = SDK.defaultConfiguration[`${key}`];
      }
    }

    // Validate individual endpointTimeout config
    for (const key of Object.keys(SDK.defaultConfiguration["requestTimeoutConfig"])) {
      if (!this.configuration["requestTimeoutConfig"].hasOwnProperty(key)) { // eslint-disable-line no-prototype-builtins
        this.configuration["requestTimeoutConfig"][`${key}`] = SDK.defaultConfiguration["requestTimeoutConfig"][`${key}`];
      }
    }

    // Validate channelId
    const { channelId } = omnichannelConfiguration;
    if (!Object.values(ChannelId).includes(channelId as ChannelId)) {
      throw new Error(`Invalid channelId`);
    }

    // Validate OC config
    const currentOmnichannelConfigurationParameters = Object.keys(omnichannelConfiguration);
    for (const key of Constants.requiredOmnichannelConfigurationParameters) {
      if (!currentOmnichannelConfigurationParameters.includes(key)) {
        throw new Error(`Missing '${key}' in OmnichannelConfiguration`);
      }
    }

    this.liveChatVersion = LiveChatVersion.V2;
  }

  /**
   * Fetches chat config.
   * @param requestId: RequestId to use to get chat config (Optional).
   */
  public async getChatConfig(requestId: string, bypassCache = false): Promise<object | void> {
    const timer = Timer.TIMER();
    this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.GETCHATCONFIGFSTARTED, "Get Chat config started", requestId);
    if (!requestId) {
      requestId = uuidv4();
    }

    const requestPath = `/${OmnichannelEndpoints.LiveChatConfigPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}?requestId=${requestId}&channelId=${this.omnichannelConfiguration.channelId}`;
    const method = "GET";
    const url = `${this.omnichannelConfiguration.orgUrl}${requestPath}`;
    const axiosInstance = axios.create();
    
    axiosRetry(axiosInstance, { 
      retries: this.configuration.maxRequestRetriesOnFailure,
      waitTimeInMsBetweenRetries: this.configuration.waitTimeBetweenRetriesConfig.getChatConfig
     });

    let headers = {};
    if (bypassCache) {
      headers = { ...Constants.bypassCacheHeaders, ...headers };
    }

    try {
      const response = await axiosInstance.get(url, {
        headers,
        timeout: this.configuration.defaultRequestTimeout ?? this.configuration.requestTimeoutConfig.getChatConfig
      });
      const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
      const { data } = response;

      if (data.LiveChatVersion) {
        this.liveChatVersion = data.LiveChatVersion;
      }

      data.headers = {};
      if (response.headers && response.headers["date"]) {
        data.headers["date"] = response.headers["date"];
      }
      this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.GETCHATCONFIGSUCCEEDED, "Get Chat config succeeded", requestId, response, elapsedTimeInMilliseconds,
        requestPath, method);

      return data;
    } catch (error) {
      const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
      this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.GETCHATCONFIGFAILED, "Get Chat config failed", requestId, undefined, elapsedTimeInMilliseconds,
        requestPath, method, error);
      return Promise.reject(error);
    }
  }

  /**
   * Fetches LWI details.
   * @param requestId: RequestId to use to get chat config (Optional).
   * @param getLWIDetailsOptionalParams: Optional parameters for get LWI Details.
   */
  public async getLWIDetails(requestId: string, getLWIDetailsOptionalParams: IGetLWIDetailsOptionalParams = {}): Promise<object> {
    const timer = Timer.TIMER();
    this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.GETLWISTATUSSTARTED, "Get LWI Details Started", requestId);

    if (!requestId) {
      requestId = uuidv4();
    }

    // construct a endpoint for anonymous chats to get LWI Details
    let requestPath = `/${OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}`;
    const axiosInstance = axios.create();
    
    axiosRetry(axiosInstance, { headerOverwrites: [OmnichannelHTTPHeaders.authCodeNonce], 
      retries: this.configuration.maxRequestRetriesOnFailure,
      waitTimeInMsBetweenRetries: this.configuration.waitTimeBetweenRetriesConfig.getLWIDetails
    });

    // Extract auth token and reconnect id from optional param
    const { authenticatedUserToken, reconnectId } = getLWIDetailsOptionalParams;
    const headers: StringMap = Constants.defaultHeaders;

    // updated auth endpoint for authenticated chats and add auth token in header
    if (authenticatedUserToken) {
      requestPath = `/${OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}`;
      headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
      headers[OmnichannelHTTPHeaders.authCodeNonce] = this.configuration.authCodeNonce;
    }

    this.setSessionIdHeader(this.sessionId, headers);

    if (!this.configuration.useUnauthReconnectIdSigQueryParam) {
      // Append reconnect id on the endpoint if vailable
      if (reconnectId) {
        requestPath += `/${reconnectId}`;
      }
    }

    const params: OmnichannelQueryParameter = {
      channelId: this.omnichannelConfiguration.channelId
    };

    if (this.configuration.useUnauthReconnectIdSigQueryParam) {
      if (reconnectId) {
        params.sig = reconnectId;
      }
    }

    const url = `${this.omnichannelConfiguration.orgUrl}${requestPath}`;
    const method = "GET";
    const options: AxiosRequestConfig = {
      headers,
      method,
      url,
      params,
      timeout: this.configuration.defaultRequestTimeout ?? this.configuration.requestTimeoutConfig.getLWIDetails
    };

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        const { data, headers } = response;
        this.setAuthCodeNonce(headers);

        this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.GETLWISTATUSSUCCEEDED, "Get LWI Details succeeded", requestId, response, elapsedTimeInMilliseconds, requestPath, method);
        resolve(data);

      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        this.logWithLogger(LogLevel.ERROR, OCSDKTelemetryEvent.GETLWISTATUSFAILED, "Get LWI Details failed", requestId, undefined, elapsedTimeInMilliseconds, requestPath, method, error);
        if (isExpectedAxiosError(error, Constants.axiosTimeoutErrorCode)) {
          throwClientHTTPTimeoutError();
        }
        reject(error);
      }
    });
  }
  /**
   * Fetches the chat token from Omnichannel to join T1 thread.
   * @param requestId: RequestId to use for getchattoken (Optional).
   * @param getChatTokenOptionalParams: Optional parameters for get chat token.
   */
  public async getChatToken(requestId: string, getChatTokenOptionalParams: IGetChatTokenOptionalParams = {}, currentRetryCount: number = 0): Promise<FetchChatTokenResponse> { // eslint-disable-line @typescript-eslint/no-inferrable-types
    const timer = Timer.TIMER();
    const { reconnectId, authenticatedUserToken, currentLiveChatVersion, refreshToken } = getChatTokenOptionalParams;
    this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.GETCHATTOKENSTARTED, "Get Chat Token Started", requestId);

    if (currentRetryCount < 0) {
      throw new Error(`Invalid currentRetryCount`);
    }

    if (!requestId) {
      requestId = uuidv4();
    }

    const headers: StringMap = Constants.defaultHeaders;

    const endpoint = createGetChatTokenEndpoint(currentLiveChatVersion as LiveChatVersion || this.liveChatVersion, authenticatedUserToken ? true : false);

    if (authenticatedUserToken) {
      headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
      headers[OmnichannelHTTPHeaders.authCodeNonce] = this.configuration.authCodeNonce;
    }

    let requestPath = `/${endpoint}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}`;

    if (!this.configuration.useUnauthReconnectIdSigQueryParam) {
      if (reconnectId) {
        requestPath += `/${reconnectId}`;
      }
    }

    const params: OmnichannelQueryParameter = {
      channelId: this.omnichannelConfiguration.channelId
    }

    if (refreshToken) {
      params.refreshToken = 'true'
    }

    if (this.configuration.useUnauthReconnectIdSigQueryParam) {
      if (reconnectId) {
        params.sig = reconnectId;
      }
    }

    const url = `${this.omnichannelConfiguration.orgUrl}${requestPath}`;
    const method = "GET";
    const options: AxiosRequestConfig = {
      headers,
      method,
      url,
      params,
      timeout: this.configuration.defaultRequestTimeout ?? this.configuration.requestTimeoutConfig.getChatToken
    };

    const axiosInstance = axios.create();

    axiosRetry(axiosInstance, {
      headerOverwrites: [OmnichannelHTTPHeaders.authCodeNonce],
      retries: this.configuration.maxRequestRetriesOnFailure, 
      retryOn429: this.configuration.getChatTokenRetryOn429,
      waitTimeInMsBetweenRetries: this.configuration.waitTimeBetweenRetriesConfig.getChatToken
    });

    return new Promise(async (resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let getChatTokenError:any = undefined;
      try {
        const response = await axiosInstance(options);
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        const { data, headers } = response;
        this.setAuthCodeNonce(headers);

        if (headers) {
          if (headers[OmnichannelHTTPHeaders.ocSessionId.toLowerCase()]) {
            this.sessionId = headers[OmnichannelHTTPHeaders.ocSessionId.toLowerCase()];
          }
        }

        // Resolves only if it contains chat token response which only happens on status 200
        if (data) {
          data.requestId = requestId;
          this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.GETCHATTOKENSUCCEEDED, "Get Chat Token succeeded", requestId, response, elapsedTimeInMilliseconds, requestPath, method);
          resolve(data);
          return;
        }

        // No content for reconnect chat case shouldn't be retried.
        if (reconnectId && response.status === Constants.noContentStatusCode) {
          reject(response);
          return;
        }

      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        this.logWithLogger(LogLevel.ERROR, OCSDKTelemetryEvent.GETCHATTOKENFAILED, "Get Chat Token failed", requestId, undefined, elapsedTimeInMilliseconds, requestPath, method, error);
        getChatTokenError = error;

        // Stop retry on 429
        if ((error as any).response?.status === Constants.tooManyRequestsStatusCode && !this.configuration.getChatTokenRetryOn429) { // eslint-disable-line @typescript-eslint/no-explicit-any
          reject(error);
          return;
        }

        // No return/reject to recursively retry on failures up to chat token retry count limit
      }

      // Base case
      if (currentRetryCount + 1 >= this.configuration.getChatTokenRetryCount) {
        if (getChatTokenError && getChatTokenError.code == Constants.axiosTimeoutErrorCode) {
          throwClientHTTPTimeoutError();
        } else {
          reject(getChatTokenError);
        }
        return;
      }

      // Retries until it reaches its limit
      setTimeout(() => {
        this.getChatToken(requestId, getChatTokenOptionalParams, currentRetryCount + 1).then((response) => resolve(response)).catch((error) => reject(error));
      }, this.configuration.getChatTokenTimeBetweenRetriesOnFailure);
    });
  }

  /**
   * Fetches the reconnectable chats from omnichannel from the given user information in JWT token(claim name: sub).
   * @param reconnectableChatsParams Mandate parameters for get reconnectable chats.
   */
  public async getReconnectableChats(reconnectableChatsParams: IReconnectableChatsParams): Promise<ReconnectMappingRecord | void> {
    const timer = Timer.TIMER();
    const { authenticatedUserToken } = reconnectableChatsParams;
    this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.GETRECONNECTABLECHATS, "Get Reconnectable chat Started");

    const requestPath = `/${OmnichannelEndpoints.LiveChatGetReconnectableChatsPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${this.omnichannelConfiguration.orgId}?channelId=${this.omnichannelConfiguration.channelId}`;
    const headers: StringMap = Constants.defaultHeaders;
    headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
    headers[OmnichannelHTTPHeaders.authCodeNonce] = this.configuration.authCodeNonce;

    this.setSessionIdHeader(this.sessionId, headers);

    const url = `${this.omnichannelConfiguration.orgUrl}${requestPath}`;
    const method = "GET";
    const options: AxiosRequestConfig = {
      headers,
      method,
      url,
      timeout: this.configuration.defaultRequestTimeout ?? this.configuration.requestTimeoutConfig.getReconnectableChats
    };

    const axiosInstance = axios.create();

    const requestId = this.omnichannelConfiguration.orgId;

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        const { data, headers } = response;
        this.setAuthCodeNonce(headers);

        // Resolves only if it contains reconnectable chats response which only happens on status 200
        if (data) {
          this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.GETRECONNECTABLECHATS, "Get Reconnectable Chats Succeeded and old session returned", requestId, response, elapsedTimeInMilliseconds, requestPath, method);

          resolve(data);
          return;
        }
        // No data found in the old sessions so returning null
        resolve();
        return;
      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        this.logWithLogger(LogLevel.ERROR, OCSDKTelemetryEvent.GETRECONNECTABLECHATS, "Get Reconnectable Chats failed", requestId, undefined, elapsedTimeInMilliseconds, requestPath, method, error);
        if (isExpectedAxiosError(error, Constants.axiosTimeoutErrorCode)) {
          throwClientHTTPTimeoutError();
        }
        reject(error);
        return;
      }
    });
  }

  /**
 * Fetches the reconnectable chats from omnichannel from the given user information in JWT token(claim name: sub).
 * @param reconnectableChatsParams Mandate parameters for get reconnectable chats.
 */
  public async getReconnectAvailability(reconnectId: string): Promise<ReconnectAvailability | void> {
    const timer = Timer.TIMER();
    this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.GETRECONNECTAVAILABILITY, "Get Reconnectable availability Started");

    const requestPath = `/${OmnichannelEndpoints.LiveChatReconnectAvailabilityPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${reconnectId}`;
    const headers: StringMap = Constants.defaultHeaders;

    this.setSessionIdHeader(this.sessionId, headers);

    const url = `${this.omnichannelConfiguration.orgUrl}${requestPath}`;
    const method = "GET";
    const options: AxiosRequestConfig = {
      headers,
      method,
      url,
      timeout: this.configuration.defaultRequestTimeout ?? this.configuration.requestTimeoutConfig.getReconnectAvailability
    };

    const axiosInstance = axios.create();
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        const { data } = response;
        if (data) {
          this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.GETRECONNECTAVAILABILITY, "Get Reconnect availability succeeded", undefined, response, elapsedTimeInMilliseconds, requestPath, method);

          resolve(data);
          return;
        }
        // No data found so returning null
        this.logWithLogger(LogLevel.WARN, OCSDKTelemetryEvent.GETRECONNECTAVAILABILITY, "Get Reconnect availability didn't send any valid data", undefined, response, elapsedTimeInMilliseconds, requestPath, method);

        resolve();
        return;
      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        this.logWithLogger(LogLevel.ERROR, OCSDKTelemetryEvent.GETRECONNECTAVAILABILITY, "Get Reconnect Availability failed", undefined, undefined, elapsedTimeInMilliseconds, requestPath, method, error);
        if (isExpectedAxiosError(error, Constants.axiosTimeoutErrorCode)) {
          throwClientHTTPTimeoutError();
        }
        reject(error);
        return;
      }
    });
  }

  /**
   *
   * @param requestId: RequestId to use for session init.
   * @param queueAvailabilityOptionalParams: Optional parameters for session init.
   */
  public async getAgentAvailability(requestId: string, queueAvailabilityOptionalParams: IGetQueueAvailabilityOptionalParams = {}): Promise<QueueAvailability> {
    const timer = Timer.TIMER();
    this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.GETAGENTAVAILABILITYSTARTED, "Get agent availability Started", requestId);

    const requestPath = `/${OmnichannelEndpoints.GetAgentAvailabilityPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}?channelId=lcw`;
    const axiosInstance = axios.create();
    axiosRetry(axiosInstance, {
      headerOverwrites: [OmnichannelHTTPHeaders.authCodeNonce],
      retries: this.configuration.maxRequestRetriesOnFailure,
      waitTimeInMsBetweenRetries: this.configuration.waitTimeBetweenRetriesConfig.getAgentAvailability
    });

    const { authenticatedUserToken, initContext, getContext } = queueAvailabilityOptionalParams;

    const headers: StringMap = Constants.defaultHeaders;

    if (authenticatedUserToken) {
      headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
      headers[OmnichannelHTTPHeaders.authCodeNonce] = this.configuration.authCodeNonce;
    }

    this.setSessionIdHeader(this.sessionId, headers);

    const data: InitContext = initContext || {};

    const cachObj = {
      "orgId": this.omnichannelConfiguration.orgId,
      "widgetId": this.omnichannelConfiguration.widgetId
    }

    if (data && data.customContextData) {
      const tempArr = CustomContextData.sort(data.customContextData);
      Object.assign(cachObj, { "customContext": tempArr });
    }

    if (data.portalcontactid) {
      Object.assign(cachObj, { "portalcontactid": data.portalcontactid });
    }

    data.cacheKey = hash.createHash('sha256').update(JSON.stringify(cachObj)).digest('hex').toString();

    if (getContext && !window.document) {
      return Promise.reject(new Error(`getContext is only supported on web browsers`));
    }

    if (getContext) {
      data.browser = BrowserInfo.getBrowserName();
      data.device = DeviceInfo.getDeviceType();
      data.originurl = window.location.href;
      data.os = OSInfo.getOsType();
    }

    if (!data.locale) {
      data.locale = Constants.defaultLocale;
    }

    // Validate locale
    if (data.locale && !Locales.supportedLocales.includes(data.locale)) {
      return Promise.reject(new Error(`Unsupported locale: '${data.locale}'`));
    }

    const url = `${this.omnichannelConfiguration.orgUrl}${requestPath}`;
    const method = "POST";

    const options: AxiosRequestConfig = {
      data,
      headers,
      method,
      url,
      timeout: this.configuration.defaultRequestTimeout ?? this.configuration.requestTimeoutConfig.getAgentAvailability
    };

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        const { data, headers } = response;
        this.setAuthCodeNonce(headers);

        if (data) {
          this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.GETAGENTAVAILABILITYSUCCEEDED, "Get agent availability succeeded", requestId, response, elapsedTimeInMilliseconds, requestPath, method);

          resolve(data);
        }
      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        this.logWithLogger(LogLevel.ERROR, OCSDKTelemetryEvent.GETAGENTAVAILABILITYFAILED, "Get agent availability failed", requestId, undefined, elapsedTimeInMilliseconds, requestPath, method, error);

        if (isExpectedAxiosError(error,  Constants.axiosTimeoutErrorCode)) {
          throwClientHTTPTimeoutError();
        }
        reject(error);
      }
    });
  }

  /**
   * Starts a session to omnichannel.
   * @param requestId: RequestId to use for session init.
   * @param sessionInitOptionalParams: Optional parameters for session init.
   */
  public async sessionInit(requestId: string, sessionInitOptionalParams: ISessionInitOptionalParams = {}): Promise<void> {
    const timer = Timer.TIMER();
    this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.SESSIONINITSTARTED, "Session Init Started", requestId);
    const axiosInstance = axios.create();

    axiosRetry(axiosInstance, {
      retries: this.configuration.maxRequestRetriesOnFailure,
      waitTimeInMsBetweenRetries: this.configuration.waitTimeBetweenRetriesConfig.sessionInit,
      shouldRetry: sessionInitRetryHandler,
      headerOverwrites: [OmnichannelHTTPHeaders.authCodeNonce]
    });

    const { reconnectId, authenticatedUserToken, initContext, getContext } = sessionInitOptionalParams;
    const headers: StringMap = Constants.defaultHeaders;
    let requestPath = `/${OmnichannelEndpoints.LiveChatSessionInitPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}`;
    if (authenticatedUserToken) {
      requestPath = `/${OmnichannelEndpoints.LiveChatAuthSessionInitPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}`;
      headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
      headers[OmnichannelHTTPHeaders.authCodeNonce] = this.configuration.authCodeNonce;
    }

    this.setSessionIdHeader(this.sessionId, headers);

    if (!this.configuration.useUnauthReconnectIdSigQueryParam) {
      if (reconnectId) {
        requestPath += `/${reconnectId}`;
      }
    }

    const params: OmnichannelQueryParameter = {
      channelId: this.omnichannelConfiguration.channelId
    }

    if (this.configuration.useUnauthReconnectIdSigQueryParam) {
      if (reconnectId) {
        params.sig = reconnectId
      }
    }

    const data: InitContext = initContext || {};

    if (getContext && !window.document) {
      return Promise.reject(new Error(`getContext is only supported on web browsers`));
    }

    if (getContext) {
      data.browser = BrowserInfo.getBrowserName();
      data.device = DeviceInfo.getDeviceType();
      data.originurl = window.location.href;
      data.os = OSInfo.getOsType();
    }

    // Set default locale if locale is empty
    if (!data.locale) {
      data.locale = Constants.defaultLocale;
    }

    // Validate locale
    if (data.locale && !Locales.supportedLocales.includes(data.locale)) {
      return Promise.reject(new Error(`Unsupported locale: '${data.locale}'`));
    }

    const url = `${this.omnichannelConfiguration.orgUrl}${requestPath}`;
    const method = "POST";
    const options: AxiosRequestConfig = {
      data,
      headers,
      method,
      url,
      params,
      timeout: this.configuration.defaultRequestTimeout ?? this.configuration.requestTimeoutConfig.sessionInit
    };

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        const { headers } = response;
        this.setAuthCodeNonce(headers);

        this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.SESSIONINITSUCCEEDED, "Session Init Succeeded", requestId, response, elapsedTimeInMilliseconds, requestPath, method, undefined, data);
        resolve();
      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        this.logWithLogger(LogLevel.ERROR, OCSDKTelemetryEvent.SESSIONINITFAILED, "Session Init failed", requestId, undefined, elapsedTimeInMilliseconds, requestPath, method, error, data);
        if (isExpectedAxiosError(error, Constants.axiosTimeoutErrorCode)) {
          throwClientHTTPTimeoutError();
        }
        reject(error);
      }
    });
  }

  /**
   * Closes the omnichannel session.
   * @param requestId: RequestId to use for session close (same request id for session init).
   * @param sessionCloseOptionalParams: Optional parameters for session close.
   */
  public async sessionClose(requestId: string, sessionCloseOptionalParams: ISessionCloseOptionalParams = {}): Promise<void> {
    const timer = Timer.TIMER();
    this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.SESSIONCLOSESTARTED, "Session Close Started", requestId);

    let requestPath = `/${OmnichannelEndpoints.LiveChatSessionClosePath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}?channelId=${this.omnichannelConfiguration.channelId}`;
    const axiosInstance = axios.create();
    axiosRetry(axiosInstance, {
      headerOverwrites: [OmnichannelHTTPHeaders.authCodeNonce],
      retries: this.configuration.maxRequestRetriesOnFailure,
      waitTimeInMsBetweenRetries: this.configuration.waitTimeBetweenRetriesConfig.sessionClose
    });

    const { authenticatedUserToken, isReconnectChat, isPersistentChat, chatId } = sessionCloseOptionalParams;

    const headers: StringMap = Constants.defaultHeaders;
    const data: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
    data.chatId = chatId;

    if (authenticatedUserToken) {
      requestPath = `/${OmnichannelEndpoints.LiveChatAuthSessionClosePath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}?channelId=${this.omnichannelConfiguration.channelId}`;
      headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
      headers[OmnichannelHTTPHeaders.authCodeNonce] = this.configuration.authCodeNonce;
    }

    this.setSessionIdHeader(this.sessionId, headers);

    if (isReconnectChat) {
      requestPath += `&isReconnectChat=true`;
    }

    if (isPersistentChat) {
      requestPath += `&isPersistentChat=true`;
    }

    const url = `${this.omnichannelConfiguration.orgUrl}${requestPath}`;
    const method = "POST";
    const options: AxiosRequestConfig = {
      data,
      headers,
      method,
      url,
      timeout: this.configuration.defaultRequestTimeout ?? this.configuration.requestTimeoutConfig.sessionClose
    };

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const { headers } = response;
        this.setAuthCodeNonce(headers);

        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.SESSIONCLOSESUCCEEDED, "Session Close succeeded", requestId, response, elapsedTimeInMilliseconds, requestPath, method);

        resolve();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error : any) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        this.logWithLogger(LogLevel.ERROR, OCSDKTelemetryEvent.SESSIONCLOSEFAILED, "Session close failed", requestId, undefined, elapsedTimeInMilliseconds, requestPath, method, error);
        if (error.code === Constants.axiosTimeoutErrorCode) {
          throwClientHTTPTimeoutError();
        }
        reject(error);
      }
    });
  }

  /**
   * Validate the auth chat record exists in database.
   * @param requestId: RequestId for validateAuthChatRecord (same request id for session init).
   * @param validateAuthChatRecordOptionalParams: Optional parameters for validateAuthChatRecord.
   */
  public async validateAuthChatRecord(requestId: string, validateAuthChatRecordOptionalParams: IValidateAuthChatRecordOptionalParams): Promise<object> {
    const timer = Timer.TIMER();
    this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.VALIDATEAUTHCHATRECORDSTARTED, "Validate Auth Chat Record Started", requestId);

    const { authenticatedUserToken, chatId } = validateAuthChatRecordOptionalParams;
    const requestPath = `/${OmnichannelEndpoints.LiveChatValidateAuthChatMapRecordPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${chatId}/${requestId}?channelId=${this.omnichannelConfiguration.channelId}`;
    const axiosInstance = axios.create();
    
    axiosRetry(axiosInstance, {
      headerOverwrites: [OmnichannelHTTPHeaders.authCodeNonce],
      retries: this.configuration.maxRequestRetriesOnFailure,
      waitTimeInMsBetweenRetries: this.configuration.waitTimeBetweenRetriesConfig.validateAuthChatRecord
    });

    const headers: StringMap = Constants.defaultHeaders;
    if (authenticatedUserToken) {
      headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
      headers[OmnichannelHTTPHeaders.authCodeNonce] = this.configuration.authCodeNonce;
    }

    this.setSessionIdHeader(this.sessionId, headers);

    const url = `${this.omnichannelConfiguration.orgUrl}${requestPath}`;
    const method = "GET";
    const options: AxiosRequestConfig = {
      headers,
      method,
      url,
      timeout: this.configuration.defaultRequestTimeout ?? this.configuration.requestTimeoutConfig.validateAuthChatRecordTimeout
    };

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const { headers } = response;
        this.setAuthCodeNonce(headers);

        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        if (response.data?.authChatExist === true) {
          this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.VALIDATEAUTHCHATRECORDSUCCEEDED, "Validate Auth Chat Record succeeded", requestId, response, elapsedTimeInMilliseconds, requestPath, method);

          resolve(response.data);
        } else {
          this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.VALIDATEAUTHCHATRECORDFAILED, "Validate Auth Chat Record Failed. Record is not found or request is not authorized", requestId, response, elapsedTimeInMilliseconds, requestPath, method);

          reject(new Error("Validate Auth Chat Record Failed. Record is not found or request is not authorized"));
        }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error : any) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;

        this.logWithLogger(LogLevel.ERROR, OCSDKTelemetryEvent.VALIDATEAUTHCHATRECORDFAILED, "Validate Auth Chat Record failed", requestId, undefined, elapsedTimeInMilliseconds, requestPath, method, error);

        if (isExpectedAxiosError(error, Constants.axiosTimeoutErrorCode)) {
          throwClientHTTPTimeoutError();
        }

        if (error.toString() === "Error: Request failed with status code 404") { // backward compatibility
          resolve({});
        } else {
          reject(error);
        }
      }
    });
  }

  /**
   * Submits post chat response.
   * @param requestId RequestId of the omnichannel session.
   * @param postChatResponse Post chat response to submit.
   * @param submitPostChatResponseOptionalParams: Optional parameters for submit post chat response.
   */
  public async submitPostChatResponse(requestId: string, postChatResponse: object, submitPostChatResponseOptionalParams: ISubmitPostChatResponseOptionalParams = {}): Promise<void> {
    const timer = Timer.TIMER();
    this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.SUBMITPOSTCHATSTARTED, "Submit Post Chat Started", requestId);

    let requestPath = `/${OmnichannelEndpoints.LiveChatSubmitPostChatPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}?channelId=${this.omnichannelConfiguration.channelId}`;
    const axiosInstance = axios.create();

    axiosRetry(axiosInstance, { headerOverwrites: [OmnichannelHTTPHeaders.authCodeNonce], 
      retries: this.configuration.maxRequestRetriesOnFailure,
      waitTimeInMsBetweenRetries: this.configuration.waitTimeBetweenRetriesConfig.submitPostChatResponse
     });

    const { authenticatedUserToken } = submitPostChatResponseOptionalParams;
    const headers: StringMap = Constants.defaultHeaders;

    if (authenticatedUserToken) {
      requestPath = `/${OmnichannelEndpoints.LiveChatAuthSubmitPostChatPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}?channelId=${this.omnichannelConfiguration.channelId}`;
      headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
      headers[OmnichannelHTTPHeaders.authCodeNonce] = this.configuration.authCodeNonce;
    }

    const url = `${this.omnichannelConfiguration.orgUrl}${requestPath}`;
    const method = "POST";
    const options: AxiosRequestConfig = {
      data: JSON.stringify(postChatResponse),
      headers,
      method,
      url,
      timeout: this.configuration.defaultRequestTimeout ?? this.configuration.requestTimeoutConfig.submitPostChatResponse
    };

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const { headers } = response;
        this.setAuthCodeNonce(headers);

        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.SUBMITPOSTCHATSUCCEEDED, "Submit Post Chat succeeded", requestId, response, elapsedTimeInMilliseconds, requestPath, method);

        resolve();

      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        this.logWithLogger(LogLevel.ERROR, OCSDKTelemetryEvent.SUBMITPOSTCHATFAILED, "Submit Post Chat Failed", requestId, undefined, elapsedTimeInMilliseconds, requestPath, method, error);
        if (isExpectedAxiosError(error, Constants.axiosTimeoutErrorCode)) {
          throwClientHTTPTimeoutError();
        }
        reject(error);
      }
    });
  }

  /**
   * Submits post chat response.
   * @param requestId RequestId of the omnichannel session.
   * @param postChatResponse Post chat response to submit.
   * @param submitPostChatResponseOptionalParams: Optional parameters for submit post chat response.
   */
  public async getSurveyInviteLink(surveyOwnerId: string, surveyInviteAPIRequestBody: object, getsurveyInviteLinkOptionalParams: IGetSurveyInviteLinkOptionalParams = {}): Promise<object> {
    const timer = Timer.TIMER();
    if (this.logger) {
      this.logger.log(LogLevel.INFO,
        OCSDKTelemetryEvent.GETSURVEYINVITELINKSTARTED,
        { SurveyOwnerId: surveyOwnerId },
        "Get Survey Invite Link Started");
    }
    let requestPath = `/${OmnichannelEndpoints.LiveChatGetSurveyInviteLinkPath}/${this.omnichannelConfiguration.orgId}/${surveyOwnerId}`;
    const axiosInstance = axios.create();
    axiosRetry(axiosInstance, { headerOverwrites: [OmnichannelHTTPHeaders.authCodeNonce], 
      retries: this.configuration.maxRequestRetriesOnFailure,
      waitTimeInMsBetweenRetries: this.configuration.waitTimeBetweenRetriesConfig.getSurveyInviteLink
    });

    const { authenticatedUserToken, requestId } = getsurveyInviteLinkOptionalParams;

    const headers: StringMap = Constants.defaultHeaders;

    if (authenticatedUserToken) {
      requestPath = `/${OmnichannelEndpoints.LiveChatAuthGetSurveyInviteLinkPath}/${this.omnichannelConfiguration.orgId}/${surveyOwnerId}`;
      headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
      headers[OmnichannelHTTPHeaders.authCodeNonce] = this.configuration.authCodeNonce;
      headers[OmnichannelHTTPHeaders.widgetAppId] = this.omnichannelConfiguration.widgetId;
    }

    this.setSessionIdHeader(this.sessionId, headers);

    if (requestId) {
      headers[OmnichannelHTTPHeaders.requestId] = requestId;
    }

    const url = `${this.omnichannelConfiguration.orgUrl}${requestPath}`;
    const method = "POST";
    const options: AxiosRequestConfig = {
      data: JSON.stringify(surveyInviteAPIRequestBody),
      headers,
      method,
      url,
      timeout: this.configuration.defaultRequestTimeout ?? this.configuration.requestTimeoutConfig.getSurveyInviteLink
    };

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const { data, headers } = response;
        this.setAuthCodeNonce(headers);

        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.GETSURVEYINVITELINKSUCCEEDED, "Get Survey Invite Link Succeeded", requestId, response, elapsedTimeInMilliseconds, requestPath, method);

        resolve(data);

      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        this.logWithLogger(LogLevel.ERROR, OCSDKTelemetryEvent.GETSURVEYINVITELINKFAILED, "Get Survey Invite Link failed", requestId, undefined, elapsedTimeInMilliseconds, requestPath, method, error);
        if (isExpectedAxiosError(error, Constants.axiosTimeoutErrorCode)) {
          throwClientHTTPTimeoutError();
        }
        reject(error);
      }
    });
  }

  /**
   * Get chat transcripts for customer.
   * @param requestId RequestId of the omnichannel session.
   * @param chatId Chat thread Id.
   * @param token Skype token.
   * @param getChatTranscriptsOptionalParams Optional parameters for get chat transcripts.
   */
  public async getChatTranscripts(requestId: string, chatId: string, token: string, getChatTranscriptsOptionalParams: IGetChatTranscriptsOptionalParams = {}): Promise<string> {
    const timer = Timer.TIMER();
    this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.GETCHATTRANSCRIPTSTARTED, "Get Chat Transcript Started", requestId);

    let requestPath = `/${OmnichannelEndpoints.LiveChatGetChatTranscriptPath}/${chatId}/${requestId}?channelId=${this.omnichannelConfiguration.channelId}`;
    const axiosInstance = axios.create();
    
    axiosRetry(axiosInstance, {
      headerOverwrites: [OmnichannelHTTPHeaders.authCodeNonce],
      retries: this.configuration.maxRequestRetriesOnFailure,
      waitTimeInMsBetweenRetries: this.configuration.waitTimeBetweenRetriesConfig.getChatTranscripts
    });

    const { authenticatedUserToken, currentLiveChatVersion } = getChatTranscriptsOptionalParams;
    const headers: StringMap = Constants.defaultHeaders;
    headers[OmnichannelHTTPHeaders.organizationId] = this.omnichannelConfiguration.orgId;
    headers[OmnichannelHTTPHeaders.widgetAppId] = this.omnichannelConfiguration.widgetId;
    headers[OmnichannelHTTPHeaders.authorization] = token;

    if (this.liveChatVersion === LiveChatVersion.V2 || (currentLiveChatVersion && currentLiveChatVersion === LiveChatVersion.V2)) {
      requestPath = `/${OmnichannelEndpoints.LiveChatv2GetChatTranscriptPath}/${chatId}/${requestId}?channelId=${this.omnichannelConfiguration.channelId}`;
      if (authenticatedUserToken) {
        headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
        headers[OmnichannelHTTPHeaders.authCodeNonce] = this.configuration.authCodeNonce;
        requestPath = `/${OmnichannelEndpoints.LiveChatv2AuthGetChatTranscriptPath}/${chatId}/${requestId}?channelId=${this.omnichannelConfiguration.channelId}`;
      }
    }
    else if (authenticatedUserToken) {
      headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
      headers[OmnichannelHTTPHeaders.authCodeNonce] = this.configuration.authCodeNonce;
      requestPath = `/${OmnichannelEndpoints.LiveChatAuthGetChatTranscriptPath}/${chatId}/${requestId}?channelId=${this.omnichannelConfiguration.channelId}`;
    }

    this.setSessionIdHeader(this.sessionId, headers);

    const url = `${this.omnichannelConfiguration.orgUrl}${requestPath}`;
    const method = "GET";
    const options: AxiosRequestConfig = {
      headers,
      method,
      url,
      timeout: this.configuration.defaultRequestTimeout ?? this.configuration.requestTimeoutConfig.getChatTranscripts
    };

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        const { data, headers } = response;
        this.setAuthCodeNonce(headers);

        this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.GETCHATTRANSCRIPTSUCCEEDED, "Get Chat Transcript succeeded", requestId, response, elapsedTimeInMilliseconds, requestPath, method);

        resolve(data);

      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        this.logWithLogger(LogLevel.ERROR, OCSDKTelemetryEvent.GETCHATTRANSCRIPTFAILED, "Get Chat Transcript failed", requestId, undefined, elapsedTimeInMilliseconds, requestPath, method, error);
        if (isExpectedAxiosError(error, Constants.axiosTimeoutErrorCode)) {
          throwClientHTTPTimeoutError();
        }
        reject(error);
      }
    });
  }

  /**
   * Email transcript to customer.
   * @param requestId RequestId of the omnichannel session.
   * @param token Skype token.
   * @param emailRequestBody Email request body.
   * @param emailTranscriptOptionalParams Optional parameters for email transcript.
   */
  public async emailTranscript(requestId: string, token: string, emailRequestBody: object, emailTranscriptOptionalParams: IEmailTranscriptOptionalParams = {}): Promise<void> {
    const timer = Timer.TIMER();
    this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.EMAILTRANSCRIPTSTARTED, "Email Transcript Started", requestId);

    let requestPath = `/${OmnichannelEndpoints.LiveChatTranscriptEmailRequestPath}/${requestId}?channelId=${this.omnichannelConfiguration.channelId}`;
    const axiosInstance = axios.create();
    
    axiosRetry(axiosInstance, {
      headerOverwrites: [OmnichannelHTTPHeaders.authCodeNonce],
      retries: this.configuration.maxRequestRetriesOnFailure,
      waitTimeInMsBetweenRetries: this.configuration.waitTimeBetweenRetriesConfig.emailTranscript
    });

    const { authenticatedUserToken } = emailTranscriptOptionalParams;
    const headers: StringMap = Constants.defaultHeaders;
    headers[OmnichannelHTTPHeaders.organizationId] = this.omnichannelConfiguration.orgId;
    headers[OmnichannelHTTPHeaders.widgetAppId] = this.omnichannelConfiguration.widgetId;
    headers[OmnichannelHTTPHeaders.authorization] = token;

    if (authenticatedUserToken) {
      headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
      headers[OmnichannelHTTPHeaders.authCodeNonce] = this.configuration.authCodeNonce;
      requestPath = `/${OmnichannelEndpoints.LiveChatAuthTranscriptEmailRequestPath}/${requestId}?channelId=${this.omnichannelConfiguration.channelId}`;
    }

    this.setSessionIdHeader(this.sessionId, headers);

    const url = `${this.omnichannelConfiguration.orgUrl}${requestPath}`;
    const method = "POST";
    const options: AxiosRequestConfig = {
      data: JSON.stringify(emailRequestBody),
      headers,
      method,
      url,
      timeout: this.configuration.defaultRequestTimeout ?? this.configuration.requestTimeoutConfig.emailTranscript
    };

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const { headers } = response;
        this.setAuthCodeNonce(headers);

        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.EMAILTRANSCRIPTSUCCEEDED, "Email Transcript succeeded", requestId, response, elapsedTimeInMilliseconds, requestPath, method);

        resolve();

      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        this.logWithLogger(LogLevel.ERROR, OCSDKTelemetryEvent.EMAILTRANSCRIPTFAILED, "Email Transcript Failed", requestId, undefined, elapsedTimeInMilliseconds, requestPath, method, error);
        if (isExpectedAxiosError(error, Constants.axiosTimeoutErrorCode)) {
          throwClientHTTPTimeoutError();
        }
        reject(error);
      }
    });
  }

  /**
   * Fetch data masking info of the org.
   * @param requestId RequestId of the omnichannel session (Optional).
   */
  public async fetchDataMaskingInfo(requestId: string): Promise<IDataMaskingInfo> {
    const timer = Timer.TIMER();
    this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.FETCHDATAMASKINGSTARTED, "Fetch Data Masking Started", requestId);
    if (!requestId) {
      requestId = uuidv4();
    }

    const requestPath = `/${OmnichannelEndpoints.LiveChatFetchDataMaskingInfoPath}/${this.omnichannelConfiguration.orgId}`;
    const axiosInstance = axios.create();
    
    axiosRetry(axiosInstance, {
      retries: this.configuration.maxRequestRetriesOnFailure,
      waitTimeInMsBetweenRetries: this.configuration.waitTimeBetweenRetriesConfig.fetchDataMaskingInfo
    });

    const headers: StringMap = Constants.defaultHeaders;
    headers[OmnichannelHTTPHeaders.organizationId] = this.omnichannelConfiguration.orgId;
    headers[OmnichannelHTTPHeaders.requestId] = requestId;

    this.setSessionIdHeader(this.sessionId, headers);

    const url = `${this.omnichannelConfiguration.orgUrl}${requestPath}`;
    const method = "GET";
    const options: AxiosRequestConfig = {
      headers,
      method,
      url,
      timeout: this.configuration.defaultRequestTimeout ?? this.configuration.requestTimeoutConfig.fetchDataMaskingInfo
    };

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        const { data } = response;
        this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.FETCHDATAMASKINGSUCCEEDED, "Fetch Data Masking succeeded", requestId, response, elapsedTimeInMilliseconds, requestPath, method);

        resolve(data);

      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        this.logWithLogger(LogLevel.ERROR, OCSDKTelemetryEvent.FETCHDATAMASKINGFAILED, "Fetch Data Masking Failed", requestId, undefined, elapsedTimeInMilliseconds, requestPath, method, error);
        if (isExpectedAxiosError(error, Constants.axiosTimeoutErrorCode)) {
          throwClientHTTPTimeoutError();
        }
        reject(error);
      }
    });
  }

  /**
   * Makes a secondary channel event network call to Omnichannel.
   * @param requestId RequestId to use for secondary channel event
   * @param secondaryChannelEventRequestBody secondaryChannel event request body
   * @param secondaryChannelEventOptionalParams Optional parameters for secondary channel events.
   */
  public async makeSecondaryChannelEventRequest(requestId: string, secondaryChannelEventRequestBody: object, secondaryChannelEventOptionalParams: ISecondaryChannelEventOptionalParams = {}): Promise<void> {
    const timer = Timer.TIMER();
    this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.SECONDARYCHANNELEVENTREQUESTSTARTED, "Secondary Channel Event Request Started", requestId);

    let requestPath = `/${OmnichannelEndpoints.LiveChatSecondaryChannelEventPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}`;
    const axiosInstance = axios.create();
    
    axiosRetry(axiosInstance, {
      headerOverwrites: [OmnichannelHTTPHeaders.authCodeNonce],
      retries: this.configuration.maxRequestRetriesOnFailure,
      waitTimeInMsBetweenRetries: this.configuration.waitTimeBetweenRetriesConfig.makeSecondaryChannelEventRequest
    });

    const { authenticatedUserToken } = secondaryChannelEventOptionalParams;
    const headers: StringMap = Constants.defaultHeaders;
    headers[OmnichannelHTTPHeaders.organizationId] = this.omnichannelConfiguration.orgId;

    if (authenticatedUserToken) {
      headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
      headers[OmnichannelHTTPHeaders.authCodeNonce] = this.configuration.authCodeNonce;
      requestPath = `/${OmnichannelEndpoints.LiveChatAuthSecondaryChannelEventPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}`;
    }

    this.setSessionIdHeader(this.sessionId, headers);

    requestPath += "?channelId=" + Constants.defaultChannelId;

    const url = `${this.omnichannelConfiguration.orgUrl}${requestPath}`;
    const method = "POST";
    const options: AxiosRequestConfig = {
      data: JSON.stringify(secondaryChannelEventRequestBody),
      headers,
      method,
      url,
      timeout: this.configuration.defaultRequestTimeout ?? this.configuration.requestTimeoutConfig.makeSecondaryChannelEventRequest
    };

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const { headers } = response;
        this.setAuthCodeNonce(headers);

        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.SECONDARYCHANNELEVENTREQUESTSUCCEEDED, "Secondary Channel Event Request Succeeded", requestId, response, elapsedTimeInMilliseconds, requestPath, method);
        resolve();

      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        this.logWithLogger(LogLevel.ERROR, OCSDKTelemetryEvent.SECONDARYCHANNELEVENTREQUESTFAILED, "Secondary Channel Event Request Failed", requestId, undefined, elapsedTimeInMilliseconds, requestPath, method, error);
        if (isExpectedAxiosError(error,  Constants.axiosTimeoutErrorCode)) {
          throwClientHTTPTimeoutError();
        }
        reject(error);
      }
    });
  }

  /** Send typing indicator
   * @param requestId RequestId of the omnichannel session.
   */
  public async sendTypingIndicator(requestId: string, currentLiveChatVersion: number, sendTypingIndicatorOptionalParams: ISendTypingIndicatorOptionalParams = {}): Promise<void> {
    // avoiding logging Info for typingindicator to reduce log traffic
    if (!currentLiveChatVersion || currentLiveChatVersion !== LiveChatVersion.V2) {
      return Promise.resolve();
    }
    const timer = Timer.TIMER();
    const { customerDisplayName } = sendTypingIndicatorOptionalParams;
    if (!currentLiveChatVersion || currentLiveChatVersion !== LiveChatVersion.V2) { throw new Error('Typing indicator is only supported on v2') }
    const requestPath = `/${OmnichannelEndpoints.SendTypingIndicatorPath}/${requestId}`;
    const axiosInstance = axios.create();

    const headers: StringMap = Constants.defaultHeaders;
    headers[OmnichannelHTTPHeaders.organizationId] = this.omnichannelConfiguration.orgId;
    if (customerDisplayName) {
      headers[Constants.customerDisplayName] = customerDisplayName;
    }

    this.setSessionIdHeader(this.sessionId, headers);

    const url = `${this.omnichannelConfiguration.orgUrl}${requestPath}`;
    const method = "POST";
    const options: AxiosRequestConfig = {
      headers,
      method,
      url,
      timeout: this.configuration.defaultRequestTimeout ?? this.configuration.requestTimeoutConfig.sendTypingIndicator
    };

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        this.logWithLogger(LogLevel.INFO, OCSDKTelemetryEvent.SENDTYPINGINDICATORSUCCEEDED, "Send Typing Indicator Succeeded", requestId, response, elapsedTimeInMilliseconds, requestPath, method);

        resolve();

      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;

        this.logWithLogger(LogLevel.ERROR, OCSDKTelemetryEvent.SENDTYPINGINDICATORFAILED, "Send Typing Indicator Failed", requestId, undefined, elapsedTimeInMilliseconds, requestPath, method, error);

        if (isExpectedAxiosError(error, Constants.axiosTimeoutErrorCode)) {
          throwClientHTTPTimeoutError();
        }
        reject(error);
      }
    });
  }

  /**
   * Helper function for logging.
   *
   * @param logLevel Log level for logging.
   * @param telemetryEventType Telemetry event type in which event will be logged.
   * @param description Description of the event.
   * @param requestId Request ID
   * @param response Response
   * @param elapsedTimeInMilliseconds Elapsed time in ms
   * @param requestPath Request path
   * @param method Method
   * @param error Error
   * @param data Data
   */
  private logWithLogger(logLevel: LogLevel, telemetryEventType: OCSDKTelemetryEvent, description: string, requestId?: string, response?: AxiosResponse<any>, elapsedTimeInMilliseconds?: number, requestPath?: string, method?: string, error?: unknown, requestPayload?: any): void { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!this.logger) {
      return;
    }
    if (error) {
      LoggingSanitizer.stripErrorSensitiveProperties(error);
    }

    let sanitizedRequestPayload = undefined;
    if (requestPayload) {
      sanitizedRequestPayload = { ...requestPayload };
      if (sanitizedRequestPayload.customContextData) {
        LoggingSanitizer.stripCustomContextDataValues(sanitizedRequestPayload.customContextData);
      }
      if (sanitizedRequestPayload.preChatResponse) {
        LoggingSanitizer.stripPreChatResponse(sanitizedRequestPayload.preChatResponse);
      }
      LoggingSanitizer.stripGeolocation(sanitizedRequestPayload);
    }

    const customData = {
      RequestId: requestId,
      Region: response?.data.Region,
      ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds,
      TransactionId: response?.headers[Constants.transactionid],
      RequestPath: requestPath,
      RequestMethod: method,
      ResponseStatusCode: response ? response.status : error ? (error as any).response?.status : undefined, // eslint-disable-line @typescript-eslint/no-explicit-any
      ExceptionDetails: error,
      RequestPayload: sanitizedRequestPayload
    };
    this.logger.log(logLevel, telemetryEventType, customData, description);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private setAuthCodeNonce = (headers: any) => {
    if (headers?.authcodenonce) {
      this.configuration.authCodeNonce = headers?.authcodenonce;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private setSessionIdHeader = (sessionId: string | undefined, headers: any) => {
    if (sessionId) {
      headers[OmnichannelHTTPHeaders.ocSessionId] = sessionId;
    }
  }
}
