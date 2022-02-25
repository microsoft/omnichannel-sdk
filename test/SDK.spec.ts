/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import * as axiosRetry from "../src/Utils/axiosRetry";
import * as uuidvModule from "../src/Utils/uuid";

import { BrowserInfo } from "../src/Utils/BrowserInfo";
import { DeviceInfo } from "../src/Utils/DeviceInfo";
import IGetChatTranscriptsOptionalParams from "../src/Interfaces/IGetChatTranscriptsOptionalParams";
import IGetQueueAvailabilityOptionalParams from "../src/Interfaces/IGetQueueAvailabilityOptionalParams";
import IGetSurveyInviteLinkOptionalParams from "../src/Interfaces/IGetSurveyInviteLinkOptionalParams";
import ILogger from "../src/Model/ILogger";
import IOCSDKLogData from "../src/Model/IOCSDKLogData";
import IOmnichannelConfiguration from "../src/Interfaces/IOmnichannelConfiguration";
import IReconnectableChatsParams from "../src/Interfaces/IReconnectableChatsParams";
import ISDKConfiguration from "../src/Interfaces/ISDKConfiguration";
import ISecondaryChannelEventOptionalParams from "../src/Interfaces/ISecondaryChannelEventOptionalParams";
import ISessionCloseOptionalParams from "../src/Interfaces/ISessionCloseOptionalParams";
import ISessionInitOptionalParams from "../src/Interfaces/ISessionInitOptionalParams";
import ISubmitPostChatResponseOptionalParams from "../src/Interfaces/ISubmitPostChatResponseOptionalParams";
import IValidateAuthChatRecordOptionalParams from "../src/Interfaces/IValidateAuthChatRecordOptionalParams";
import { LocationInfo } from "../src/Utils/LocationInfo";
import { LogLevel } from "../src/Model/LogLevel";
import { LoggingSanitizer } from "../src/Utils/LoggingSanitizer";
import OCSDKLogger from "../src/Common/OCSDKLogger";
import { OSInfo } from "../src/Utils/OSInfo";
import SDK from "../src/SDK";
import axios from "axios";

describe("SDK unit tests", () => {

    const requestId = "requestId";
    const errorWithAxiosMessage = "Error with axios";
    let ochannelConfig: any;
    let dataMock: any;
    let uuidvSpy: any;
    let axiosInstMock: any;
    let axiosInstMockWithError: any;
    let ocsdkLogger: any;
    const logger = {
        logClientSdkTelemetryEvent: (loglevel: LogLevel,
            logData: IOCSDKLogData): void => { }
    } as ILogger;

    const telemetryEvent = "Test Event";
    const description = "Test Description";
    const customData = {
        ElapsedTimeInMilliseconds: 200,
        ExceptionDetails: {ErrorDetails: "test Error"},
        Region: "Test Region",
        RequestId: "Test RequestId",
        TransactionId: "Test TransactionId"
    };
    const logEvent = {
        Event: "Test Event",
        ElapsedTimeInMilliseconds: 200,
        ExceptionDetails: {ErrorDetails: "test Error"},
        Region: "Test Region",
        RequestId: "Test RequestId",
        TransactionId: "Test TransactionId",
        Description: "Test Description"
    } as IOCSDKLogData;

    beforeEach(() => {
        ochannelConfig = {
            channelId: "lcw",
            orgId: "NotBadId",
            orgUrl: "SomeUrl",
            widgetId: "IdId"
        };
        ocsdkLogger = new OCSDKLogger(logger);
        dataMock = { data: { requestId: "someId" } };
        uuidvSpy = spyOn(uuidvModule, "uuidv4").and.returnValue("reqId");
        spyOn(axiosRetry, "default").and.callFake(() => {});
        axiosInstMock = jasmine.createSpy("axiosInstance").and.returnValue(dataMock);
        axiosInstMockWithError = jasmine.createSpy("axiosInstance").and.throwError(errorWithAxiosMessage);
    });

    describe("Test constructor", () => {

        it("Ctor with valid parameters", () => {
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            expect(sdk).not.toBeUndefined();
        });

        it("Should throw exception about missing SDK config key", () => {
            const sdkConfig = {
                getChatTokenTimeBetweenRetriesOnFailure: 10000,
                maxRequestRetriesOnFailure: 3
            };
            expect(() => new SDK(ochannelConfig as IOmnichannelConfiguration, sdkConfig as ISDKConfiguration))
            .toThrowError("Missing 'getChatTokenRetryCount' in SDKConfiguration");
        });

        it("Should throw exception about incorrect channel id", () => {
            ochannelConfig.channelId = "channel";
            expect(() => new SDK(ochannelConfig as IOmnichannelConfiguration)).toThrowError("Invalid channelId");
        });

        it("Should throw exception about missing Omnichannel config key", () => {
            const config = {
                channelId: "lcw",
                orgId: "NotBadId",
                orgUrl: "SomeUrl"
            };
            expect(() => new SDK(config as IOmnichannelConfiguration)).toThrowError("Missing 'widgetId' in OmnichannelConfiguration");
        });
    });

    it("Test getChatConfig method with pluggable telemetry", () => {
        spyOn<any>(axios, "create").and.returnValue({ async get(endpoint: any) { return dataMock; }});
        spyOn(ocsdkLogger, "log").and.callFake(() => { });
        const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
        const config = sdk.getChatConfig("");
        expect(uuidvSpy).toHaveBeenCalled();
        expect(axios.create).toHaveBeenCalled();
        expect(axiosRetry.default).toHaveBeenCalled();
        expect(ocsdkLogger.log).toHaveBeenCalled();
    });

    it("Test getChatConfig method without pluggable telemetry", () => {
        spyOn<any>(axios, "create").and.returnValue({ async get(endpoint: any) { return dataMock; }});
        spyOn(ocsdkLogger, "log").and.callFake(() => { });
        const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
        const config = sdk.getChatConfig("");
        expect(uuidvSpy).toHaveBeenCalled();
        expect(axios.create).toHaveBeenCalled();
        expect(axiosRetry.default).toHaveBeenCalled();
        expect(ocsdkLogger.log).not.toHaveBeenCalled();
    });
    
    it("Test getChatConfig method to set LiveChatVersion", () => {
        let configmock = {data: { requestId: "someId", LiveChatVersion: 2 }}; 
        spyOn<any>(axios, "create").and.returnValue({ async get(endpoint: any) { return configmock;}});        
        const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
        axiosInstMock = jasmine.createSpy("axiosInstance").and.returnValue(configmock);
        const config = sdk.getChatConfig("");       
        expect(axios.create).toHaveBeenCalled();
        config.then(function(result: any){
            expect(result.LiveChatVersion).toEqual(sdk.liveChatVersion);
        });
    });

    it("Test getLWIDetails method with pluggable telemetry", () => {
        spyOn<any>(axios, "create").and.returnValue({ async get(endpoint: any) { return dataMock; } });
        spyOn(ocsdkLogger, "log").and.callFake(() => { });
        const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
        const config = sdk.getLWIDetails("");
        expect(uuidvSpy).toHaveBeenCalled();
        expect(axios.create).toHaveBeenCalled();
        expect(axiosRetry.default).toHaveBeenCalled();
        expect(ocsdkLogger.log).toHaveBeenCalled();
    });

    it("Test getLWIDetails method without pluggable telemetry", () => {
      spyOn<any>(axios, "create").and.returnValue({ async get(endpoint: any) { return dataMock; } });
      spyOn(ocsdkLogger, "log").and.callFake(() => { });
      const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
      const config = sdk.getLWIDetails("");
      expect(uuidvSpy).toHaveBeenCalled();
      expect(axios.create).toHaveBeenCalled();
      expect(axiosRetry.default).toHaveBeenCalled();
      expect(ocsdkLogger.log).not.toHaveBeenCalled();
    });

    describe("Test getChatToken method", () => {

        it("Should throw error when retryCount is invalid value", async () => {
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            try {
                const result = await sdk.getChatToken(requestId, {}, -1);
                throw new Error("Should throw an error");
            } catch (error) {
                expect(error.message).toEqual("Invalid currentRetryCount");
                expect(ocsdkLogger.log).toHaveBeenCalled();
            }
        });

        it("Should return promise", async () => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            const result = await sdk.getChatToken(requestId, {}, 0);
            expect(result).not.toBeUndefined();
            expect(uuidvSpy).not.toHaveBeenCalled();
            expect(axios.create).toHaveBeenCalled();
            expect(axiosRetry.default).toHaveBeenCalled();
        });
    });


    describe("Test getReconnectableChats method", () => {

        it("Should reject when axiosInstance throws an error", (done) => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMockWithError);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            const result = sdk.getReconnectableChats({ authenticatedUserToken : "Token" } as IReconnectableChatsParams);
            result.then(() => {}, () => {
                expect(ocsdkLogger.log).toHaveBeenCalled();
                done();
            });
        });

        it("Should return promise", async () => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            const result = await sdk.getReconnectableChats({ authenticatedUserToken : "Token"} as IReconnectableChatsParams);
            expect(result).not.toBeUndefined();
            expect(uuidvSpy).not.toHaveBeenCalled();
            expect(axios.create).toHaveBeenCalled();
        });
    });

    describe("Test getReconnectAvailability method", () => {

        it("Should reject when axiosInstance throws an error", (done) => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMockWithError);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            const result = sdk.getReconnectAvailability("reconnectId");
            result.then(() => {}, () => {
                expect(ocsdkLogger.log).toHaveBeenCalled();
                done();
            });
        });

        it("Should return promise", async () => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            const result = await sdk.getReconnectAvailability("reconnectId");
            expect(result).not.toBeUndefined();
            expect(uuidvSpy).not.toHaveBeenCalled();
            expect(axios.create).toHaveBeenCalled();
        });
    });

    describe("Test sessionInit method", () => {

        let sessionInitOpt: any;
        let locationInfo: any;
        let browserName: any;
        let deviceType: any;
        let osType: any;

        beforeEach(() => {
            locationInfo = { latitude: "1", longitude: "2" };
            browserName = "browser";
            deviceType = "devicetype";
            osType = "ostype";
            sessionInitOpt = {
                authenticatedUserToken: "token",
                initContext: {},
                getContext: true
            };
            spyOn<any>(LocationInfo, "getLocationInfo").and.returnValue(locationInfo);
            spyOn<any>(BrowserInfo, "getBrowserName").and.returnValue(browserName);
            spyOn<any>(DeviceInfo, "getDeviceType").and.returnValue(deviceType);
            spyOn<any>(OSInfo, "getOsType").and.returnValue(osType);
        });

        it("Should reject when locale is not valid", (done) => {
            sessionInitOpt.initContext = { locale: "asxasxsax" };
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            const result = sdk.sessionInit(requestId, sessionInitOpt as ISessionInitOptionalParams);
            expect(axios.create).toHaveBeenCalled();
            result.then(() => {}, (error) => {
                expect(OSInfo.getOsType).toHaveBeenCalled();
                expect(DeviceInfo.getDeviceType).toHaveBeenCalled();
                expect(axiosRetry.default).toHaveBeenCalled();
                expect(BrowserInfo.getBrowserName).toHaveBeenCalled();
                expect(axiosRetry.default).toHaveBeenCalled();
                expect(ocsdkLogger.log).toHaveBeenCalled();
                done();
            });
        });

        it("Should return promise resolve", (done) => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            const result = sdk.sessionInit(requestId, sessionInitOpt as ISessionInitOptionalParams);
            result.then(() => {
                expect(axiosInstMock).toHaveBeenCalled();
                done();
            });
        });

        it("Should reject when axiosInstance throws an error", (done) => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMockWithError);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            const result = sdk.sessionInit(requestId, sessionInitOpt as ISessionInitOptionalParams);
            result.then(() => {}, () => {
                expect(ocsdkLogger.log).toHaveBeenCalled();
                done();
            });
        });
    });

    describe("Get Agent Availabilty method", ()=> {

        let getQueueAvailabilityOpt: any;
        let locationInfo: any;
        let browserName: any;
        let deviceType: any;
        let osType: any;

        beforeEach(() => {
            locationInfo = { latitude: "1", longitude: "2" };
            browserName = "browser";
            deviceType = "devicetype";
            osType = "ostype";
            getQueueAvailabilityOpt = {
                authenticatedUserToken: "token",
                initContext: {},
                getContext: true
            };
            spyOn<any>(LocationInfo, "getLocationInfo").and.returnValue(locationInfo);
            spyOn<any>(BrowserInfo, "getBrowserName").and.returnValue(browserName);
            spyOn<any>(DeviceInfo, "getDeviceType").and.returnValue(deviceType);
            spyOn<any>(OSInfo, "getOsType").and.returnValue(osType);
        });

        it("Should reject when locale is not valid", (done) => {
            getQueueAvailabilityOpt.initContext = { locale: "asxasxsax" };
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            const result = sdk.sessionInit(requestId, getQueueAvailabilityOpt as IGetQueueAvailabilityOptionalParams);
            expect(axios.create).toHaveBeenCalled();
            result.then(() => {}, (error) => {
                expect(OSInfo.getOsType).toHaveBeenCalled();
                expect(DeviceInfo.getDeviceType).toHaveBeenCalled();
                expect(axiosRetry.default).toHaveBeenCalled();
                expect(BrowserInfo.getBrowserName).toHaveBeenCalled();
                expect(axiosRetry.default).toHaveBeenCalled();
                expect(ocsdkLogger.log).toHaveBeenCalled();
                done();
            });
        });

        it("Should return promise resolve", (done) => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            const result = sdk.sessionInit(requestId, getQueueAvailabilityOpt as ISessionInitOptionalParams);
            result.then(() => {
                expect(axiosInstMock).toHaveBeenCalled();
                done();
            });
        });

        it("Should reject when axiosInstance throws an error", (done) => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMockWithError);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            const result = sdk.sessionInit(requestId, getQueueAvailabilityOpt as ISessionInitOptionalParams);
            result.then(() => {}, () => {
                expect(ocsdkLogger.log).toHaveBeenCalled();
                done();
            });
        });
    })

    describe("Test sessionClose method", () => {

        const sessionInitOpt = {
            authenticatedUserToken: "asdas"
        };

        it("Should return promise", () => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            const result = sdk.sessionClose(requestId, sessionInitOpt as ISessionCloseOptionalParams);
            expect(axios.create).toHaveBeenCalled();
            expect(axiosRetry.default).toHaveBeenCalled();
            expect(result).not.toBeUndefined();
            expect(ocsdkLogger.log).toHaveBeenCalled();
        });

        it("Should return promise resolve", (done) => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            const result = sdk.sessionClose(requestId, sessionInitOpt as ISessionCloseOptionalParams);
            result.then(() => {
                expect(axiosInstMock).toHaveBeenCalled();
                done();
            });
        });

        it("Should reject when axiosInstance throws an error", (done) => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMockWithError);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            const result = sdk.sessionClose(requestId, sessionInitOpt as ISessionCloseOptionalParams);
            result.then(() => {}, () => {
                expect(ocsdkLogger.log).toHaveBeenCalled();
                done();
            });
        });
    });

    describe("Test submitPostChatResponse method", () => {

        const sessionInitOpt = {
            authenticatedUserToken: "asdas"
        };

        it("Should return promise", () => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            const result = sdk.submitPostChatResponse(requestId, sessionInitOpt as ISubmitPostChatResponseOptionalParams);
            expect(axios.create).toHaveBeenCalled();
            expect(axiosRetry.default).toHaveBeenCalled();
            expect(result).not.toBeUndefined();
            expect(ocsdkLogger.log).toHaveBeenCalled();
        });

        it("Should return promise resolve", (done) => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            const result = sdk.submitPostChatResponse(requestId, sessionInitOpt as ISubmitPostChatResponseOptionalParams);
            result.then(() => {
                expect(axiosInstMock).toHaveBeenCalled();
                done();
            });
        });

        it("Should reject when axiosInstance throws an error", (done) => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMockWithError);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            const result = sdk.submitPostChatResponse(requestId, sessionInitOpt as ISubmitPostChatResponseOptionalParams);
            result.then(() => {}, () => {
                expect(ocsdkLogger.log).toHaveBeenCalled();
                done();
            });
        });
    });

  describe("Test GetSurveyInviteLink method", () => {

    const sessionInitOpt = {
      authenticatedUserToken: "asdas"
    };

    it("Should return promise", () => {
      spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
      spyOn(ocsdkLogger, "log").and.callFake(() => { });
      const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
      const result = sdk.getSurveyInviteLink(requestId, sessionInitOpt as IGetSurveyInviteLinkOptionalParams);
      expect(axios.create).toHaveBeenCalled();
      expect(axiosRetry.default).toHaveBeenCalled();
      expect(result).not.toBeUndefined();
      expect(ocsdkLogger.log).toHaveBeenCalled();
    });

    it("Should return promise resolve", (done) => {
      spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
      const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
      const result = sdk.getSurveyInviteLink(requestId, sessionInitOpt as IGetSurveyInviteLinkOptionalParams);
      result.then(() => {
        expect(axiosInstMock).toHaveBeenCalled();
        done();
      });
    });

    it("Should reject when axiosInstance throws an error", (done) => {
      spyOn<any>(axios, "create").and.returnValue(axiosInstMockWithError);
      spyOn(ocsdkLogger, "log").and.callFake(() => { });
      const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
      const result = sdk.getSurveyInviteLink(requestId, sessionInitOpt as IGetSurveyInviteLinkOptionalParams);
      result.then(() => { }, () => {
        expect(ocsdkLogger.log).toHaveBeenCalled();
        done();
      });
    });
  });

    describe("Test getChatTranscripts method", () => {

        const coolId = "coolId";

        const sessionInitOpt = {
            authenticatedUserToken: "asdas"
        };

        it("Should return promise", () => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            const result = sdk.getChatTranscripts(requestId, coolId, coolId, sessionInitOpt as IGetChatTranscriptsOptionalParams);
            expect(axios.create).toHaveBeenCalled();
            expect(axiosRetry.default).toHaveBeenCalled();
            expect(result).not.toBeUndefined();
            expect(ocsdkLogger.log).toHaveBeenCalled();
        });

        it("Should return promise resolve", (done) => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            const result = sdk.getChatTranscripts(requestId, coolId, coolId, sessionInitOpt as IGetChatTranscriptsOptionalParams);
            result.then((response: any) => {
                expect(axiosInstMock).toHaveBeenCalled();
                expect(response).toEqual(dataMock.data);
                done();
            });
        });

        it("Should reject when axiosInstance throws an error", (done) => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMockWithError);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            const result = sdk.getChatTranscripts(requestId, coolId, coolId, sessionInitOpt as IGetChatTranscriptsOptionalParams);
            result.then(() => {}, (error) => {
                expect(error).toEqual(new Error(errorWithAxiosMessage));
                expect(ocsdkLogger.log).toHaveBeenCalled();
                done();
            });
        });
    });

    describe("Test makeSecondaryChannelEventRequests method", () => {

        const secondaryChannelEventOpt = {
            authenticatedUserToken: "asdas"
        };

        const requestBody = { body: "dummy" }

        it("Should return promise", () => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            const result = sdk.makeSecondaryChannelEventRequest(requestId, requestBody, secondaryChannelEventOpt as ISecondaryChannelEventOptionalParams);
            expect(axios.create).toHaveBeenCalled();
            expect(axiosRetry.default).toHaveBeenCalled();
            expect(result).not.toBeUndefined();
            expect(ocsdkLogger.log).toHaveBeenCalled();
        });

        it("Should return promise resolve", (done) => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            const result = sdk.makeSecondaryChannelEventRequest(requestId, requestBody, secondaryChannelEventOpt as ISecondaryChannelEventOptionalParams);
            result.then(() => {
                expect(axiosInstMock).toHaveBeenCalled();
                done();
            });
        });

        it("Should reject when axiosInstance throws an error", (done) => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMockWithError);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            const result = sdk.makeSecondaryChannelEventRequest(requestId, requestBody, secondaryChannelEventOpt as ISecondaryChannelEventOptionalParams);
            result.then(() => {}, () => {
                expect(ocsdkLogger.log).toHaveBeenCalled();
                done();
            });
        });
    });

    describe("Test validateAuthChatRecord method", () => {

        const validateAuthChatRecordOptionalParams = {
            authenticatedUserToken: "asdas",
            chatId: "chatId"
        };

        it("Should return promise when auth chat exists", (done) => {
            const dataMockValid = { data: { authChatExist: true }, headers: {"transaction-id": "tid"} };
            const axiosInstMockValid = jasmine.createSpy("axiosInstance").and.returnValue(dataMockValid);
            spyOn<any>(axios, "create").and.returnValue(axiosInstMockValid);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            const result = sdk.validateAuthChatRecord(requestId, validateAuthChatRecordOptionalParams as IValidateAuthChatRecordOptionalParams);
            result.then(() => {
                expect(axiosInstMockValid).toHaveBeenCalled();
                done();
            }).catch(() => {
                throw Error("Promise should resolve");
            });
        });

        it("Should return promise reject when auth chat does not exist", (done) => {
            const dataMockInvalid = { data: { authChatExist: false }, headers: {"transaction-id": "tid"} };
            const axiosInstMockInvalid = jasmine.createSpy("axiosInstance").and.returnValue(dataMockInvalid);
            spyOn<any>(axios, "create").and.returnValue(axiosInstMockInvalid);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            const result = sdk.validateAuthChatRecord(requestId, validateAuthChatRecordOptionalParams as IValidateAuthChatRecordOptionalParams);
            result.then(() => {
                throw Error("Promise should reject");
            }).catch(() => {
                expect(axiosInstMockInvalid).toHaveBeenCalled();
                done();
            });
        });

        it("Should reject when axiosInstance throws an error", (done) => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMockWithError);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            const result = sdk.validateAuthChatRecord(requestId, validateAuthChatRecordOptionalParams as IValidateAuthChatRecordOptionalParams);
            result.then(() => {}, () => {
                expect(ocsdkLogger.log).toHaveBeenCalled();
                done();
            });
        });
    });

    describe("Test sendtypingindicator method", () => {
        it("Should return promise resolve", (done) => {
            let currentLiveChatVersion = 2;
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            const result = sdk.sendTypingIndicator(requestId, currentLiveChatVersion);
            result.then(() => {
                expect(axiosInstMock).toHaveBeenCalled();
                done();
            });
        });

        it("Should reject when axiosInstance throws an error", (done) => {
            let currentLiveChatVersion = 2;
            spyOn<any>(axios, "create").and.returnValue(axiosInstMockWithError);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            const result = sdk.sendTypingIndicator(requestId, currentLiveChatVersion);
            result.then(() => {}, () => {
                expect(ocsdkLogger.log).toHaveBeenCalled();
                done();
            });
        });
    });

    describe("Test removal of sensitive properties from error object", () => {
        it("Error object should remove sensitive properties from logging details", (done) => {
            const errorObject = {
                "message": "Request failed with status code 401",
                "name": "Error",
                "config": {
                    "method": "get",
                    "headers": {
                    "Accept": "application/json, text/plain, */*",
                    "AuthenticatedUserToken": "ew0KIsfqYWxnIjogIlJTMjU2IiwNCiAgInR5cCI6ICJKV1QiLA0KICAia2lkIjogIlpTdS8zcG1LWjJpSStmQmN6STkzU002Mm9VWmkvbkV5Zys4a0ZWaWkyVWs9Ig0KfQ.ew0KICAiaXNzIjogIjYzN2ZjYzlmLTRhOWItNGFhYS04NzEzLWEyYTNjZmRhMTUwNSIsDQogICJpYXQiOiAxNjI0ODcxMjA0LA0KICAibmJmIjogMTYyNDg3MTIwNCwNCiAgImV4cCI6IDE2MjQ5NTc2MDQsDQogICJzdWIiOiAiYjYyNTIyYjktNzI3ZC00MGE3LWI1ODgtOTk3OWQxM2Q3Mzc2IiwNCiAgIm9pZCI6ICJiNjI1MjJiOS03MjdkLTQwYTctYjU4OC05OTc5ZDEzZDczNzYiLA0KICAidGlkIjogImQ2OWUxZTkwLWZiZTUtNGI3YS1iNGI0LTVjZDM3NzdlMmVhMyIsDQogICJ1cG4iOiAiVENTQWRtaW5AVElQQWRtaW5BUEkub25taWNyb3NvZnQuY29tIiwNCiAgIkZpcnN0TmFtZSI6ICJBZG1pbiIsDQogICJMYXN0TmFtZSI6ICJUQ1MiLA0KICAibHdpY29udGV4dHMiOiB7DQogICAgIkNhc2VOdW1iZXIiOiB7DQogICAgICAidmFsdWUiOiAiMjEwNjI4MDA1MDAwMDkxOCIsDQogICAgICAiaXNEaXNwbGF5YWJsZSI6IHRydWUNCiAgICB9LA0KICAgICJDYXNlVGl0bGUiOiB7DQogICAgICAidmFsdWUiOiAiVGhpcyBpcyBhIHRlc3QgY2FzZSBjcmVhdGVkIGJ5IE1pY3Jvc29mdCBpbnRlcm5hbCB0ZXN0aW5nLiBQbGVhc2UgY2xvc2UgaW1tZWRpYXRlbHkgYW5kIG1ha2Ugc3VyZSB0byBzZXQgdGhlIGNsb3NlIHN0YXR1cyBhcyBEdXBsaWNhdGUiLA0KICAgICAgImlzRGlzcGxheWFibGUiOiB0cnVlDQogICAgfSwNCiAgICAiQWN0aXZlU3lzdGVtIjogew0KICAgICAgInZhbHVlIjogIkR5bmFtaWNzIiwNCiAgICAgICJpc0Rpc3BsYXlhYmxlIjogdHJ1ZQ0KICAgIH0sDQogICAgIkZpcnN0TmFtZSI6IHsNCiAgICAgICJ2YWx1ZSI6ICJBZG1pbiIsDQogICAgICAiaXNEaXNwbGF5YWJsZSI6IHRydWUNCiAgICB9LA0KICAgICJMYXN0TmFtZSI6IHsNCiAgICAgICJ2YWx1ZSI6ICJUQ1MiLA0KICAgICAgImlzRGlzcGxheWFibGUiOiB0cnVlDQogICAgfSwNCiAgICAiQ3VycmVudFVzZXJFbWFpbCI6IHsNCiAgICAgICJ2YWx1ZSI6ICJ2LWFrZGhvdUBtaWNyb3NvZnQuY29tIiwNCiAgICAgICJpc0Rpc3BsYXlhYmxlIjogdHJ1ZQ0KICAgIH0sDQogICAgIlByb2R1Y3ROYW1lIjogew0KICAgICAgInZhbHVlIjogIlBvd2VyIEF1dG9tYXRlIiwNCiAgICAgICJpc0Rpc3BsYXlhYmxlIjogdHJ1ZQ0KICAgIH0sDQogICAgIkNhdGVnb3J5Ijogew0KICAgICAgInZhbHVlIjogIkFwcHJvdmFscyIsDQogICAgICAiaXNEaXNwbGF5YWJsZSI6IHRydWUNCiAgICB9LA0KICAgICJTdWJDYXRlZ29yeSI6IHsNCiAgICAgICJ2YWx1ZSI6ICJXb3JraW5nIHdpdGggYXBwcm92YWwgZmxvd3MiLA0KICAgICAgImlzRGlzcGxheWFibGUiOiB0cnVlDQogICAgfSwNCiAgICAiU2V2ZXJpdHkiOiB7DQogICAgICAidmFsdWUiOiAiU2V2ZXJpdHlDIiwNCiAgICAgICJpc0Rpc3BsYXlhYmxlIjogdHJ1ZQ0KICAgIH0sDQogICAgIlNlcnZpY2VMZXZlbCI6IHsNCiAgICAgICJ2YWx1ZSI6ICJQcm9mZXNzaW9uYWwiLA0KICAgICAgImlzRGlzcGxheWFibGUiOiB0cnVlDQogICAgfSwNCiAgICAiTGFuZ3VhZ2UiOiB7DQogICAgICAidmFsdWUiOiAiZW4tVVMiLA0KICAgICAgImlzRGlzcGxheWFibGUiOiB0cnVlDQogICAgfSwNCiAgICAiTG9jYXRpb24iOiB7DQogICAgICAidmFsdWUiOiAiVVMiLA0KICAgICAgImlzRGlzcGxheWFibGUiOiB0cnVlDQogICAgfQ0KICB9DQp9.PPEtQu9Q5ZfPPXJKdkbm2s6y71sXaHKXect602--Ow2sLUtt6rzkUngmSyVCIRe-Vn39k5N5jDyNqhB21PeqXbBM2JrVBZEB59c98wM-6TUUJYfJkdWeCRBqW_35UhosMlzijYcL3yxacFxh2I0TMQnwpzYrh3QTtwAam1mnUsXJ2J8IeZrNSutSc34c7_g4u94mmW3gG7xjw22ARscOsqLiYINXeVBzj-DCdt3L9IY6xsjDl3ihGan2X6ECLoy6KMMIxsBfbGWAsBhZjwUTH3fZL6n5sb9Z60gKf_q2oI6tyrnCJAfG8WkyfrYukYpOUZZMxJE_l2liiRhInbMsJg"
                    },
                }
            }

            LoggingSanitizer.stripErrorSensitiveProperties(errorObject);
            expect(errorObject["config"]["headers"]["AuthenticatedUserToken"]).toBeUndefined();
            done();
        });

        it("Test when authentication token is an object", (done) => {
            const errorObject = {
                "message": "Request failed with status code 401",
                "name": "Error",
                "config": {
                    "method": "get",
                    "headers": {
                    "Accept": "application/json, text/plain, */*",
                    "AuthenticatedUserToken": {}
                    },
                }
            }
            LoggingSanitizer.stripErrorSensitiveProperties(errorObject);
            expect(errorObject["config"]["headers"]["AuthenticatedUserToken"]).toBeUndefined();
            done();
        });

        it("Test process error object when error is null", (done) => {
            const errorObject = null
            LoggingSanitizer.stripErrorSensitiveProperties(errorObject);
            expect(errorObject).toEqual(null);
            done();
        });
    });
});
