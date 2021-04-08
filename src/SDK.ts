import { ChannelId, LiveChatVersion } from "./Common/Enums";
import axios, { AxiosRequestConfig } from "axios";

import { BrowserInfo } from "./Utils/BrowserInfo";
import Constants from "./Common/Constants";
import { DeviceInfo } from "./Utils/DeviceInfo";
import FetchChatTokenResponse from "./Model/FetchChatTokenResponse";
import IDataMaskingInfo from "./Interfaces/IDataMaskingInfo";
import IEmailTranscriptOptionalParams from "./Interfaces/IEmailTranscriptOptionalParams";
import IGetChatTokenOptionalParams from "./Interfaces/IGetChatTokenOptionalParams";
import IGetChatTranscriptsOptionalParams from "./Interfaces/IGetChatTranscriptsOptionalParams";
import IGetLWIDetailsOptionalParams from "./Interfaces/IGetLWIDetailsOptionalParams";
import IGetSurveyInviteLinkOptionalParams from "./Interfaces/IGetSurveyInviteLinkOptionalParams";
import IOmnichannelConfiguration from "./Interfaces/IOmnichannelConfiguration";
import IReconnectableChatsParams from "./Interfaces/IReconnectableChatsParams";
import ISDK from "./Interfaces/ISDK";
import ISDKConfiguration from "./Interfaces/ISDKConfiguration";
import ISecondaryChannelEventOptionalParams from "./Interfaces/ISecondaryChannelEventOptionalParams";
import ISessionCloseOptionalParams from "./Interfaces/ISessionCloseOptionalParams";
import ISessionInitOptionalParams from "./Interfaces/ISessionInitOptionalParams";
import ISubmitPostChatResponseOptionalParams from "./Interfaces/ISubmitPostChatResponseOptionalParams";
import IValidateAuthChatRecordOptionalParams from "./Interfaces/IValidateAuthChatRecordOptionalParams";
import InitContext from "./Model/InitContext";
import Locales from "./Common/Locales";
import { LogLevel } from "./Model/LogLevel";
import OCSDKLogger from "./Common/OCSDKLogger";
import { OCSDKTelemetryEvent } from "./Common/Enums";
import { OSInfo } from "./Utils/OSInfo";
import OmnichannelEndpoints from "./Common/OmnichannelEndpoints";
import OmnichannelHTTPHeaders from "./Common/OmnichannelHTTPHeaders";
import ReconnectAvailability from "./Model/ReconnectAvailability";
import ReconnectMappingRecord from "./Model/ReconnectMappingRecord";
import { StringMap } from "./Common/Mappings";
import { Timer } from "./Utils/Timer";
import axiosRetry from "./Utils/axiosRetry";
import { uuidv4 } from "./Utils/uuid";

export default class SDK implements ISDK {
  private static defaultConfiguration: ISDKConfiguration = {
    getChatTokenRetryCount: 35,
    getChatTokenTimeBetweenRetriesOnFailure: 10000,
    maxRequestRetriesOnFailure: 3
  };
  
  liveChatVersion: number;

  public constructor(private omnichannelConfiguration: IOmnichannelConfiguration, private configuration: ISDKConfiguration = SDK.defaultConfiguration, private logger?: OCSDKLogger) {
    // Sets to default configuration if passed configuration is empty or is not an object
    if (!Object.keys(this.configuration).length || typeof (configuration) !== "object") {
      this.configuration = SDK.defaultConfiguration;
    }

    // Validate SDK config
    for (const key of Object.keys(SDK.defaultConfiguration)) {
      if (!this.configuration.hasOwnProperty(key)) { // eslint-disable-line no-prototype-builtins
        throw new Error(`Missing '${key}' in SDKConfiguration`);
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
    
    this.liveChatVersion = LiveChatVersion.V1;
  }

  /**
   * Fetches chat config.
   * @param requestId: RequestId to use to get chat config (Optional).
   */
  public async getChatConfig(requestId: string, bypassCache = false): Promise<object> {
    const timer = Timer.TIMER();
    if (this.logger) {
      this.logger.log(LogLevel.INFO,
        OCSDKTelemetryEvent.GETCHATCONFIG,
        { RequestId: requestId},
        "Get Chat Config Started");
    }
    if (!requestId) {
      requestId = uuidv4();
    }

    const endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatConfigPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}?requestId=${requestId}&channelId=${this.omnichannelConfiguration.channelId}`;
    const axiosInstance = axios.create();
    axiosRetry(axiosInstance, { retries: this.configuration.maxRequestRetriesOnFailure });

    let headers = {};
    if (bypassCache) {
      headers = { ...Constants.bypassCacheHeaders, ...headers };
    }
    const response = await axiosInstance.get(endpoint, {
      headers,
    });
    const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
    const { data } = response;
    if (data.LiveChatVersion && data.LiveChatVersion === LiveChatVersion.V2) {
      this.liveChatVersion = data.LiveChatVersion;
    }
    if (this.logger) {
      this.logger.log(LogLevel.INFO,
        OCSDKTelemetryEvent.GETCHATCONFIGSUCCESS,
        { RequestId: requestId, Region: response.data.Region, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds, TransactionId: response.headers["transaction-id"] },
        "Get Chat config succeeded");
    }
    return data;
  }

  /**
   * Fetches LWI details.
   * @param requestId: RequestId to use to get chat config (Optional).
   * @param getLWIDetailsOptionalParams: Optional parameters for get LWI Details.
   */
  public async getLWIDetails(requestId: string, getLWIDetailsOptionalParams: IGetLWIDetailsOptionalParams = {}): Promise<object> {
    const timer = Timer.TIMER();
    if (this.logger) {
      this.logger.log(LogLevel.INFO,
        OCSDKTelemetryEvent.GETLWISTATUSSTARTED,
        { RequestId: requestId },
        "Get LWI Details Started");
    }
    if (!requestId) {
      requestId = uuidv4();
    }

    // construct a endpoint for anonymous chats to get LWI Details
    let endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatLiveWorkItemDetailsPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}`;
    const axiosInstance = axios.create();
    axiosRetry(axiosInstance, { retries: this.configuration.maxRequestRetriesOnFailure });

    // Extract auth token and reconnect id from optional param
    const { authenticatedUserToken, reconnectId } = getLWIDetailsOptionalParams;
    const headers: StringMap = Constants.defaultHeaders;

    // updated auth endpoint for authenticated chats and add auth token in header
    if (authenticatedUserToken) {
      endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatAuthLiveWorkItemDetailsPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}`;
      headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
    }

    // Append reconnect id on the endpoint if vailable
    if (reconnectId) {
      endpoint += `/${reconnectId}`;
    }
    endpoint += `?channelId=${this.omnichannelConfiguration.channelId}`;

    const options: AxiosRequestConfig = {
      headers,
      method: "GET",
      url: endpoint
    };

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        const { data } = response;
        if (this.logger) {
          this.logger.log(LogLevel.INFO,
            OCSDKTelemetryEvent.GETLWISTATUSSUCCEEDED,
            { RequestId: requestId, Region: response.data.Region, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds, TransactionId: response.headers["transaction-id"] },
            "Get LWI Details succeeded");
        }
        resolve(data);
      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        if (this.logger) {
          this.logger.log(LogLevel.ERROR,
            OCSDKTelemetryEvent.GETLWISTATUSFAILED,
            { RequestId: requestId, ExceptionDetails: error, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds },
            "Get LWI Details failed");
        }
        reject();
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
    const { reconnectId, authenticatedUserToken } = getChatTokenOptionalParams;
    if (this.logger) {
      this.logger.log(LogLevel.INFO,
        OCSDKTelemetryEvent.GETCHATTOKENSTARTED,
        { RequestId: requestId },
        "Get Chat Token Started");
    }
    if (currentRetryCount < 0) {
      throw new Error(`Invalid currentRetryCount`);
    }

    if (!requestId) {
      requestId = uuidv4();
    }
    const headers: StringMap = Constants.defaultHeaders;  
    let endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatGetChatTokenPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}`;

    if (this.liveChatVersion === LiveChatVersion.V2) {
      endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatv2GetChatTokenPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}`;
      if (authenticatedUserToken) {
        endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatv2AuthGetChatTokenPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}`;
        headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
      }
    } else {
      if (authenticatedUserToken) {
        endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatAuthGetChatTokenPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}`;
        headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
      }
    }
    
    if (reconnectId) {
      endpoint += `/${reconnectId}`;
    }
    endpoint += `?channelId=${this.omnichannelConfiguration.channelId}`;

    const options: AxiosRequestConfig = {
      headers,
      method: "GET",
      url: endpoint
    };
    const axiosInstance = axios.create();
    axiosRetry(axiosInstance, { retries: this.configuration.maxRequestRetriesOnFailure });
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        const { data } = response;
        // Resolves only if it contains chat token response which only happens on status 200
        if (data) {
          data.requestId = requestId;
          if (this.logger) {
            this.logger.log(LogLevel.INFO,
              OCSDKTelemetryEvent.GETCHATTOKENSUCCEEDED,
              { RequestId: requestId, Region: response.data.Region, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds, TransactionId: response.headers["transaction-id"] },
              "Get Chat Token Succeeded");
          }
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
        if (this.logger) {
          this.logger.log(LogLevel.ERROR,
            OCSDKTelemetryEvent.GETCHATTOKENFAILED,
            { RequestId: requestId, ExceptionDetails: error, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds},
            "Get Chat Token Failed");
        }
        reject(error);
        return;
      }

      // Base case
      if (currentRetryCount + 1 >= this.configuration.getChatTokenRetryCount) {
        reject(new Error(`The retry for getchattoken has exceeded its max value of ${this.configuration.getChatTokenRetryCount}`));
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
  public async getReconnectableChats(reconnectableChatsParams: IReconnectableChatsParams): Promise<ReconnectMappingRecord> {
    const timer = Timer.TIMER();
    const { authenticatedUserToken } = reconnectableChatsParams;
    if (this.logger) {
      this.logger.log(LogLevel.INFO,
        OCSDKTelemetryEvent.GETRECONNECTABLECHATS,
        "Get Reconnectable chat Started");
    }

    const endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatGetReconnectableChatsPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${this.omnichannelConfiguration.orgId}?channelId=${this.omnichannelConfiguration.channelId}`;
    const headers: StringMap = Constants.defaultHeaders;
    headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;

    const options: AxiosRequestConfig = {
      headers,
      method: "GET",
      url: endpoint
    };

    const axiosInstance = axios.create();
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        const { data } = response;

        // Resolves only if it contains reconnectable chats response which only happens on status 200
        if (data) {
          if (this.logger) {
            this.logger.log(LogLevel.INFO,
              OCSDKTelemetryEvent.GETRECONNECTABLECHATS,
              { Region: response.data.Region, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds, TransactionId: response.headers[Constants.transactionid] },
              "Get Reconnectable Chats Succeeded and old session returned");
          }
          resolve(data);
          return;
        }
        // No data found in the old sessions so returning null
        resolve();
        return;
      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        if (this.logger) {
          this.logger.log(LogLevel.ERROR,
            OCSDKTelemetryEvent.GETCHATTOKENFAILED,
            { ExceptionDetails: error, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds},
            "Get Reconnectable Chats Failed");
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
  public async getReconnectAvailability(reconnectId: string): Promise<ReconnectAvailability> {
    const timer = Timer.TIMER();
    if (this.logger) {
      this.logger.log(LogLevel.INFO,
        OCSDKTelemetryEvent.GETRECONNECTAVAILABILITY,
        "Get Reconnect availability started");
    }

    const endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatReconnectAvailabilityPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${reconnectId}`;
    const headers: StringMap = Constants.defaultHeaders;
    const options: AxiosRequestConfig = {
      headers,
      method: "GET",
      url: endpoint
    };

    const axiosInstance = axios.create();
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        const { data } = response;
        if (data) {
          if (this.logger) {
            this.logger.log(LogLevel.INFO,
              OCSDKTelemetryEvent.GETRECONNECTAVAILABILITY,
              { Region: response.data.Region, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds, TransactionId: response.headers[Constants.transactionid] },
              "Get Reconnect availability Succeeded");
          }
          resolve(data);
          return;
        }
        // No data found so returning null
        if (this.logger) {
          this.logger.log(LogLevel.WARN,
            OCSDKTelemetryEvent.GETRECONNECTAVAILABILITY,
            { Region: response.data.Region, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds, TransactionId: response.headers[Constants.transactionid] },
            "Get Reconnect availability didn't send any valid data.");
        }
        resolve();
        return;
      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        if (this.logger) {
          this.logger.log(LogLevel.ERROR,
            OCSDKTelemetryEvent.GETRECONNECTAVAILABILITY,
            { ExceptionDetails: error, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds},
            "Get Reconnect Availability Failed");
        }
        reject(error);
        return;
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
    if (this.logger) {
      this.logger.log(LogLevel.INFO,
        OCSDKTelemetryEvent.SESSIONINITSTARTED,
        { RequestId: requestId },
        "Session Init Started");
    }
    const axiosInstance = axios.create();
    axiosRetry(axiosInstance, { retries: this.configuration.maxRequestRetriesOnFailure });

    const { reconnectId, authenticatedUserToken, initContext, getContext } = sessionInitOptionalParams;

    const headers: StringMap = Constants.defaultHeaders;
    let endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatSessionInitPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}`;

    if (authenticatedUserToken) {
      endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatAuthSessionInitPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}`;
      headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
    }
    if (reconnectId) {
      endpoint += `/${reconnectId}`;
    }
    endpoint += `?channelId=${this.omnichannelConfiguration.channelId}`;

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

    const options: AxiosRequestConfig = {
      data,
      headers,
      method: "POST",
      url: endpoint
    };

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        if (this.logger) {
          this.logger.log(LogLevel.INFO,
            OCSDKTelemetryEvent.SESSIONINITSUCCEEDED,
            { RequestId: requestId, Region: response.data.Region, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds, TransactionId: response.headers["transaction-id"] },
            "Session Init Succeeded");
        }
        resolve();
      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        if (this.logger) {
          this.logger.log(LogLevel.ERROR,
            OCSDKTelemetryEvent.SESSIONINITFAILED,
            { RequestId: requestId, ExceptionDetails: error, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds},
            "Session Init Failed");
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
    if (this.logger) {
      this.logger.log(LogLevel.INFO,
        OCSDKTelemetryEvent.SESSIONCLOSESTARTED,
        { RequestId: requestId },
        "Session Close Started");
    }
    let endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatSessionClosePath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}?channelId=${this.omnichannelConfiguration.channelId}`;
    const axiosInstance = axios.create();
    axiosRetry(axiosInstance, { retries: this.configuration.maxRequestRetriesOnFailure });

    const { authenticatedUserToken, isReconnectChat, isPersistentChat, chatId} = sessionCloseOptionalParams;

    const headers: StringMap = Constants.defaultHeaders;
    const data: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
    data.chatId = chatId;

    if (authenticatedUserToken) {
      endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatAuthSessionClosePath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}?channelId=${this.omnichannelConfiguration.channelId}`;
      headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
    }

    if (isReconnectChat) {
      endpoint += `&isReconnectChat=true`;
    }

    if (isPersistentChat){
      endpoint += `&isPersistentChat=true`;
    }

    const options: AxiosRequestConfig = {
      data,
      headers,
      method: "POST",
      url: endpoint
    };

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        if (this.logger) {
          this.logger.log(LogLevel.INFO,
            OCSDKTelemetryEvent.SESSIONCLOSESUCCEEDED,
            { RequestId: requestId, Region: response.data.Region, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds, TransactionId: response.headers["transaction-id"] },
            "Session Close Succeeded");
        }
        resolve();
      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        if (this.logger) {
          this.logger.log(LogLevel.ERROR,
            OCSDKTelemetryEvent.SESSIONCLOSEFAILED,
            { RequestId: requestId, ExceptionDetails: error, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds },
            "Session Close Failed");
        }
        reject();
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
    if (this.logger) {
      this.logger.log(LogLevel.INFO,
        OCSDKTelemetryEvent.VALIDATEAUTHCHATRECORDSTARTED,
        { RequestId: requestId },
        "Validate Auth Chat Record Started");
    }
    const { authenticatedUserToken, chatId } = validateAuthChatRecordOptionalParams;
    const endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatValidateAuthChatMapRecordPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${chatId}/${requestId}?channelId=${this.omnichannelConfiguration.channelId}`;
    const axiosInstance = axios.create();
    axiosRetry(axiosInstance, { retries: this.configuration.maxRequestRetriesOnFailure });
    const headers: StringMap = Constants.defaultHeaders;
    if (authenticatedUserToken) {
      headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
    }
    const options: AxiosRequestConfig = {
      headers,
      method: "GET",
      url: endpoint
    };

    try {
      const response = await axiosInstance(options);
      const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
      if (response.data?.authChatExist === true) {
        this.logger?.log(LogLevel.INFO,
          OCSDKTelemetryEvent.VALIDATEAUTHCHATRECORDSUCCEEDED,
          { RequestId: requestId, Region: response.data.Region, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds, TransactionId: response.headers["transaction-id"] },
          "Validate Auth Chat Record Succeeded");
        return Promise.resolve(response.data);
      } else {
        this.logger?.log(LogLevel.INFO,
          OCSDKTelemetryEvent.VALIDATEAUTHCHATRECORDFAILED,
          { RequestId: requestId, Region: response.data.Region, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds, TransactionId: response.headers["transaction-id"], ErrorCode: response.status},
          "Validate Auth Chat Record Failed. Record is not found or request is not authorized");
        return Promise.reject(new Error("Validate Auth Chat Record Failed. Record is not found or request is not authorized"));
      }
    } catch (error) {
      const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
      this.logger?.log(LogLevel.ERROR,
        OCSDKTelemetryEvent.VALIDATEAUTHCHATRECORDFAILED,
        { RequestId: requestId, ExceptionDetails: error, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds },
        "Validate Auth Chat Record Failed");
        if (error.toString() === "Error: Request failed with status code 404") { // backward compatibility
          return Promise.resolve({});
        } else {
          return Promise.reject();
        }
    }
  }

  /**
   * Submits post chat response.
   * @param requestId RequestId of the omnichannel session.
   * @param postChatResponse Post chat response to submit.
   * @param submitPostChatResponseOptionalParams: Optional parameters for submit post chat response.
   */
  public async submitPostChatResponse(requestId: string, postChatResponse: object, submitPostChatResponseOptionalParams: ISubmitPostChatResponseOptionalParams = {}): Promise<void> {
    const timer = Timer.TIMER();
    if (this.logger) {
      this.logger.log(LogLevel.INFO,
        OCSDKTelemetryEvent.SUBMITPOSTCHATSTARTED,
        { RequestId: requestId },
        "Submit Post Chat Started");
    }
    let endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatSubmitPostChatPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}?channelId=${this.omnichannelConfiguration.channelId}`;
    const axiosInstance = axios.create();
    axiosRetry(axiosInstance, { retries: this.configuration.maxRequestRetriesOnFailure });

    const { authenticatedUserToken } = submitPostChatResponseOptionalParams;

    const headers: StringMap = Constants.defaultHeaders;

    if (authenticatedUserToken) {
      endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatAuthSubmitPostChatPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}?channelId=${this.omnichannelConfiguration.channelId}`;
      headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
    }

    const options: AxiosRequestConfig = {
      data: JSON.stringify(postChatResponse),
      headers,
      method: "POST",
      url: endpoint
    };

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        if (this.logger) {
          this.logger.log(LogLevel.INFO,
            OCSDKTelemetryEvent.SUBMITPOSTCHATSUCCEEDED,
            { RequestId: requestId, Region: response.data.Region, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds, TransactionId: response.headers["transaction-id"] },
            "Submit Post Chat Succeeded");
        }
        resolve();
      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        if (this.logger) {
          this.logger.log(LogLevel.ERROR,
            OCSDKTelemetryEvent.SUBMITPOSTCHATFAILED,
            { RequestId: requestId, ExceptionDetails: error, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds},
            "Submit Post Chat Failed");
        }
        reject();
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
    let endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatGetSurveyInviteLinkPath}/${this.omnichannelConfiguration.orgId}/${surveyOwnerId}`;
    const axiosInstance = axios.create();
    axiosRetry(axiosInstance, { retries: this.configuration.maxRequestRetriesOnFailure });

    const { authenticatedUserToken, requestId } = getsurveyInviteLinkOptionalParams;


    const headers: StringMap = Constants.defaultHeaders;

    if (authenticatedUserToken ) {
      endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatAuthGetSurveyInviteLinkPath}/${this.omnichannelConfiguration.orgId}/${surveyOwnerId}`;
      headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
      headers[OmnichannelHTTPHeaders.widgetAppId] = this.omnichannelConfiguration.widgetId;
    }

    if (requestId) {
      headers[OmnichannelHTTPHeaders.requestId] = requestId;
    }

    const options: AxiosRequestConfig = {
      data: JSON.stringify(surveyInviteAPIRequestBody),
      headers,
      method: "POST",
      url: endpoint
    };

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const { data } = response;
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        if (this.logger) {
          this.logger.log(LogLevel.INFO,
            OCSDKTelemetryEvent.GETSURVEYINVITELINKSUCCEEDED,
            { Region: response.data.Region, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds, TransactionId: response.headers["transaction-id"] },
            "Get Survey Invite Link Succeeded");
        }
        resolve(data);
      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        if (this.logger) {
          this.logger.log(LogLevel.ERROR,
            OCSDKTelemetryEvent.GETSURVEYINVITELINKFAILED,
            { ExceptionDetails: error, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds },
            "Get Survey Invite Link Failed");
        }
        reject();
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
    if (this.logger) {
      this.logger.log(LogLevel.INFO,
        OCSDKTelemetryEvent.GETCHATTRANSCRIPTSTARTED,
        { RequestId: requestId },
        "Get Chat Transcript Started");
    }
    let endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatGetChatTranscriptPath}/${chatId}/${requestId}?channelId=${this.omnichannelConfiguration.channelId}`;
    const axiosInstance = axios.create();
    axiosRetry(axiosInstance, { retries: this.configuration.maxRequestRetriesOnFailure });

    const { authenticatedUserToken } = getChatTranscriptsOptionalParams;

    const headers: StringMap = Constants.defaultHeaders;
    headers[OmnichannelHTTPHeaders.organizationId] = this.omnichannelConfiguration.orgId;
    headers[OmnichannelHTTPHeaders.widgetAppId] = this.omnichannelConfiguration.widgetId;
    headers[OmnichannelHTTPHeaders.authorization] = token;

    if (authenticatedUserToken) {
      endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatAuthGetChatTranscriptPath}/${chatId}/${requestId}?channelId=${this.omnichannelConfiguration.channelId}`;
    }

    const options: AxiosRequestConfig = {
      headers,
      method: "GET",
      url: endpoint
    };

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        const { data } = response;
        if (this.logger) {
          this.logger.log(LogLevel.INFO,
            OCSDKTelemetryEvent.GETCHATTRANSCRIPTSUCCEEDED,
            { RequestId: requestId, Region: response.data.Region, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds, TransactionId: response.headers["transaction-id"] },
            "Get Chat Transcript Succeeded");
        }
        resolve(data);
      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        if (this.logger) {
          this.logger.log(LogLevel.ERROR,
            OCSDKTelemetryEvent.GETCHATTRANSCRIPTFAILED,
            { RequestId: requestId, ExceptionDetails: error, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds},
            "Get Chat Transcript Failed");
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
    if (this.logger) {
      this.logger.log(LogLevel.INFO,
        OCSDKTelemetryEvent.EMAILTRANSCRIPTSTARTED,
        { RequestId: requestId },
        "Email Transcript Started");
    }
    let endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatTranscriptEmailRequestPath}/${requestId}?channelId=${this.omnichannelConfiguration.channelId}`;
    const axiosInstance = axios.create();
    axiosRetry(axiosInstance, { retries: this.configuration.maxRequestRetriesOnFailure });

    const { authenticatedUserToken } = emailTranscriptOptionalParams;

    const headers: StringMap = Constants.defaultHeaders;
    headers[OmnichannelHTTPHeaders.organizationId] = this.omnichannelConfiguration.orgId;
    headers[OmnichannelHTTPHeaders.widgetAppId] = this.omnichannelConfiguration.widgetId;
    headers[OmnichannelHTTPHeaders.authorization] = token;

    if (authenticatedUserToken) {
      endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatAuthTranscriptEmailRequestPath}/${requestId}?channelId=${this.omnichannelConfiguration.channelId}`;
    }

    const options: AxiosRequestConfig = {
      data: JSON.stringify(emailRequestBody),
      headers,
      method: "POST",
      url: endpoint
    };

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        if (this.logger) {
          this.logger.log(LogLevel.INFO,
            OCSDKTelemetryEvent.EMAILTRANSCRIPTSUCCEEDED,
            { RequestId: requestId, Region: response.data.Region, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds, TransactionId: response.headers["transaction-id"] },
            "Email Transcript Succeeded");
        }
        resolve();
      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        if (this.logger) {
          this.logger.log(LogLevel.ERROR,
            OCSDKTelemetryEvent.EMAILTRANSCRIPTFAILED,
            { RequestId: requestId, ExceptionDetails: error, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds},
            "Email Transcript Failed");
        }
        reject();
      }
    });
  }

  /**
   * Fetch data masking info of the org.
   * @param requestId RequestId of the omnichannel session (Optional).
   */
  public async fetchDataMaskingInfo(requestId: string): Promise<IDataMaskingInfo> {
    const timer = Timer.TIMER();
    if (this.logger) {
      this.logger.log(LogLevel.INFO,
        OCSDKTelemetryEvent.FETCHDATAMASKINGSTARTED,
        { RequestId: requestId },
        "Fetch Data Masking Started");
    }
    if (!requestId) {
      requestId = uuidv4();
    }

    const endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatFetchDataMaskingInfoPath}/${this.omnichannelConfiguration.orgId}`;
    const axiosInstance = axios.create();
    axiosRetry(axiosInstance, { retries: this.configuration.maxRequestRetriesOnFailure });

    const headers: StringMap = Constants.defaultHeaders;
    headers[OmnichannelHTTPHeaders.organizationId] = this.omnichannelConfiguration.orgId;
    headers[OmnichannelHTTPHeaders.requestId] = requestId;

    const options: AxiosRequestConfig = {
      headers,
      method: "GET",
      url: endpoint
    };

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axiosInstance(options);
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        const { data } = response;
        if (this.logger) {
          this.logger.log(LogLevel.INFO,
            OCSDKTelemetryEvent.FETCHDATAMASKINGSUCCEEDED,
            { RequestId: requestId, Region: response.data.Region, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds, TransactionId: response.headers["transaction-id"] },
            "Fetch Data Masking Succeeded");
        }
        resolve(data);
      } catch (error) {
        const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
        if (this.logger) {
          this.logger.log(LogLevel.ERROR,
            OCSDKTelemetryEvent.FETCHDATAMASKINGFAILED,
            { RequestId: requestId, ExceptionDetails: error, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds},
            "Fetch Data Masking Failed");
        }
        reject();
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
    if (this.logger) {
      this.logger.log(LogLevel.INFO,
        OCSDKTelemetryEvent.SECONDARYCHANNELEVENTREQUESTSTARTED,
        { RequestId: requestId },
        "Secondary Channel Event Request Started");
    }
    let endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatSecondaryChannelEventPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}`;
    const axiosInstance = axios.create();
    axiosRetry(axiosInstance, { retries: this.configuration.maxRequestRetriesOnFailure });

    const { authenticatedUserToken } = secondaryChannelEventOptionalParams;

    const headers: StringMap = Constants.defaultHeaders;
    headers[OmnichannelHTTPHeaders.organizationId] = this.omnichannelConfiguration.orgId;

    if (authenticatedUserToken) {
      headers[OmnichannelHTTPHeaders.authenticatedUserToken] = authenticatedUserToken;
      endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.LiveChatAuthSecondaryChannelEventPath}/${this.omnichannelConfiguration.orgId}/${this.omnichannelConfiguration.widgetId}/${requestId}`;
    }

    endpoint += "?channelId=" + Constants.defaultChannelId;

    const options: AxiosRequestConfig = {
      data: JSON.stringify(secondaryChannelEventRequestBody),
      headers,
      method: "POST",
      url: endpoint
    };

    try {
      const response = await axiosInstance(options);
      const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
      const { data } = response;
      if (this.logger) {
        this.logger.log(LogLevel.INFO,
          OCSDKTelemetryEvent.SECONDARYCHANNELEVENTREQUESTSUCCEEDED,
          { RequestId: requestId, Region: data.Region, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds, TransactionId: response.headers["transaction-id"] },
          "Secondary Channel Event Request Succeeded");
      }
    } catch (error) {
      const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
      if (this.logger) {
        this.logger.log(LogLevel.ERROR,
          OCSDKTelemetryEvent.SECONDARYCHANNELEVENTREQUESTFAILED,
          { RequestId: requestId, ExceptionDetails: error, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds},
          "Secondary Channel Event Request Failed");
      }
      throw error;
    }
  }
  
  /** Send typing indicator
   * @param requestId RequestId of the omnichannel session.
   */
  public async sendTypingIndicator(requestId: string, sendTypingIndicatorOptionalParams: ISendTypingIndicatorOptionalParams = {}): Promise<void> {   
    // avoiding logging Info for typingindicator to reduce log traffic
    const timer = Timer.TIMER();
    const { currentLiveChatVersion } = sendTypingIndicatorOptionalParams;
    if (this.liveChatVersion !== LiveChatVersion.V2 || (currentLiveChatVersion && currentLiveChatVersion !== LiveChatVersion.V2)) { throw new Error('Only supported on v2') }
    const endpoint = `${this.omnichannelConfiguration.orgUrl}/${OmnichannelEndpoints.SendTypingIndicatorPath}/${requestId}`;
    const axiosInstance = axios.create();

    const headers: StringMap = Constants.defaultHeaders;
    headers[OmnichannelHTTPHeaders.organizationId] = this.omnichannelConfiguration.orgId;

    const options: AxiosRequestConfig = {
      headers,
      method: "POST",
      url: endpoint
    };
    
    try {
      const response = await axiosInstance(options);
      const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
      const { data } = response;
      if (this.logger) {
        this.logger.log(LogLevel.INFO,
          OCSDKTelemetryEvent.SENDTYPINGINDICATORSUCCEEDED,
          { RequestId: requestId, Region: data.Region, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds, TransactionId: response.headers["transaction-id"] },
          "Send Typing Indicator Succeeded");
      }
    } catch (error) {
      const elapsedTimeInMilliseconds = timer.milliSecondsElapsed;
      if (this.logger) {
        this.logger.log(LogLevel.ERROR,
          OCSDKTelemetryEvent.SENDTYPINGINDICATORFAILED,
          { RequestId: requestId, ExceptionDetails: error, ElapsedTimeInMilliseconds: elapsedTimeInMilliseconds},
          "Send Typing Indicator Failed");
      }
      throw error;
    }
  }
}
