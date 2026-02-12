/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import * as axiosRetryHandler from "../src/Utils/axiosRetryHandler";
import * as uuidvModule from "../src/Utils/uuid";

import { BrowserInfo } from "../src/Utils/BrowserInfo";
import { DeviceInfo } from "../src/Utils/DeviceInfo";
import IGetChatTranscriptsOptionalParams from "../src/Interfaces/IGetChatTranscriptsOptionalParams";
import IGetPersistentChatHistoryOptionalParams from "../src/Interfaces/IGetPersistentChatHistoryOptionalParams";
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
import MockAdapter from 'axios-mock-adapter';
import OCSDKLogger from "../src/Common/OCSDKLogger";
import { OSInfo } from "../src/Utils/OSInfo";
import SDK from "../src/SDK";
import { SDKError } from "../src/Common/Enums";
import axios from "axios";

describe("SDK unit tests", () => {

    const requestId = "requestId";
    const errorWithAxiosMessage = "Error with axios";
    const AxiosError = new Error(errorWithAxiosMessage);
    (AxiosError as any).response = {
      status: 0
    };
    let ochannelConfig: any;
    let dataMock: any;
    let uuidvSpy: any;
    let axiosInstMock: any;
    let axiosInstEmptyMock:any;
    let axiosInstMockWithError: any;
    let ocsdkLogger: any;
    const logger = {
        logClientSdkTelemetryEvent: (loglevel: LogLevel,
            logData: IOCSDKLogData): void => { }
    } as ILogger;
   
    beforeEach(() => {
        ochannelConfig = {
            channelId: "lcw",
            orgId: "NotBadId",
            orgUrl: "SomeUrl",
            widgetId: "IdId"
        };
        ocsdkLogger = new OCSDKLogger(logger);
        dataMock = { data: { requestId: "someId" }, headers: {} };
        uuidvSpy = spyOn(uuidvModule, "uuidv4").and.returnValue("reqId");
        spyOn(axiosRetryHandler, "default").and.callFake(() => {});
        spyOn(axiosRetryHandler, "axiosRetryHandlerWithNotFound").and.callFake(() => {});
        axiosInstMock = jasmine.createSpy("axiosInstance").and.callFake(() => Promise.resolve(dataMock));
        axiosInstMockWithError = jasmine.createSpy("axiosInstance").and.callFake(() => Promise.reject(AxiosError));
        axiosInstEmptyMock = jasmine.createSpy("axiosInstance").and.callFake(() => Promise.resolve({data: {}, headers: {}}));
    });

    describe("Test constructor", () => {

        it("Constructor with valid parameters", () => {
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            expect(sdk).not.toBeUndefined();
        });

        it("Should use default configuration if not set", () => {
          const sdkConfig = {
              getChatTokenTimeBetweenRetriesOnFailure: 8000,
              maxRequestRetriesOnFailure: 2
          };

          const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, sdkConfig as ISDKConfiguration);
          expect((sdk as any).configuration.getChatTokenTimeBetweenRetriesOnFailure).toEqual(sdkConfig.getChatTokenTimeBetweenRetriesOnFailure);
          expect((sdk as any).configuration.maxRequestRetriesOnFailure).toEqual(sdkConfig.maxRequestRetriesOnFailure);
          expect((sdk as any).configuration.getChatTokenRetryOn429).toEqual((SDK as any).defaultConfiguration.getChatTokenRetryOn429);
          expect((sdk as any).configuration.getChatTokenRetryCount).toEqual((SDK as any).defaultConfiguration.getChatTokenRetryCount);
          expect((sdk as any).configuration.defaultRequestTimeout).toEqual((SDK as any).defaultConfiguration.defaultRequestTimeout);
          expect((sdk as any).configuration.requestTimeoutConfig).toEqual((SDK as any).defaultConfiguration.requestTimeoutConfig);

          for (const key in Object.keys((SDK as any).defaultConfiguration.requestTimeoutConfig)) {
            expect((sdk as any).configuration.requestTimeoutConfig[`${key}`]).toEqual((SDK as any).defaultConfiguration.requestTimeoutConfig[`${key}`]);
          }
        });

        it("Should use individual default endpoint timeout configurations if not set", () => {
            const sdkConfig = {
                requestTimeoutConfig: {
                    getChatConfig: 60000
                }
            };
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, sdkConfig as ISDKConfiguration);
            for (const key in Object.keys((SDK as any).defaultConfiguration.requestTimeoutConfig)) {
                if (key === "getChatConfig") {
                    expect((sdk as any).configuration.requestTimeoutConfig[`${key}`]).toBeGreaterThan((SDK as any).defaultConfiguration.requestTimeoutConfig[`${key}`]);
                } else {
                    expect((sdk as any).configuration.requestTimeoutConfig[`${key}`]).toEqual((SDK as any).defaultConfiguration.requestTimeoutConfig[`${key}`]);
                }
            }
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

    describe("Test getChatConfig method", () => {

        it("Test getChatConfig method with pluggable telemetry", async () => {
            spyOn<any>(axios, "create").and.returnValue({ get: jasmine.createSpy("get").and.callFake(() => Promise.resolve(dataMock)) });
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            await sdk.getChatConfig("");
            expect(uuidvSpy).toHaveBeenCalled();
            expect(axios.create).toHaveBeenCalled();
            expect(axiosRetryHandler.default).toHaveBeenCalled();
            expect(ocsdkLogger.log).toHaveBeenCalled();
        });

        it("Test getChatConfig method without pluggable telemetry", async () => {
            spyOn<any>(axios, "create").and.returnValue({ get: jasmine.createSpy("get").and.callFake(() => Promise.resolve(dataMock)) });
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            await sdk.getChatConfig("");
            expect(uuidvSpy).toHaveBeenCalled();
            expect(axios.create).toHaveBeenCalled();
            expect(axiosRetryHandler.default).toHaveBeenCalled();
            expect(ocsdkLogger.log).not.toHaveBeenCalled();
        });

        it("Test getChatConfig method to set LiveChatVersion", async () => {
            const configmock = {data: { requestId: "someId", LiveChatVersion: 2 }, headers: {}};
            spyOn<any>(axios, "create").and.returnValue({ get: jasmine.createSpy("get").and.callFake(() => Promise.resolve(configmock)) });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            const result = await sdk.getChatConfig("") as any;
            expect(axios.create).toHaveBeenCalled();
            expect(result.LiveChatVersion).toEqual(sdk.liveChatVersion);
        });

        it("Test getLWIDetails method with pluggable telemetry", async () => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            await sdk.getLWIDetails("");
            expect(uuidvSpy).toHaveBeenCalled();
            expect(axios.create).toHaveBeenCalled();
            expect(axiosRetryHandler.axiosRetryHandlerWithNotFound).toHaveBeenCalled();
            expect(ocsdkLogger.log).toHaveBeenCalled();
        });

        it("Test getLWIDetails method without pluggable telemetry", async () => {
        spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
        spyOn(ocsdkLogger, "log").and.callFake(() => { });
        const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
        await sdk.getLWIDetails("");
        expect(uuidvSpy).toHaveBeenCalled();
        expect(axios.create).toHaveBeenCalled();

        expect(axiosRetryHandler.axiosRetryHandlerWithNotFound).toHaveBeenCalled();
        expect(ocsdkLogger.log).not.toHaveBeenCalled();
        });
    });

    describe("Test getLcwFcsDetails method", () => {
        it("Should return promise", async () => {
            spyOn<any>(axios, "create").and.returnValue({ get: jasmine.createSpy("get").and.callFake(() => Promise.resolve(dataMock)) });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            const result = await sdk.getLcwFcsDetails();
            expect(result).not.toBeUndefined();
            expect(axios.create).toHaveBeenCalled();
            expect(axiosRetryHandler.default).toHaveBeenCalled();
        });

        it("Should throw error when axiosInstance throws and error" , async () => {
            const axiosGetMockWithError = jasmine.createSpy("get").and.callFake(() => Promise.reject(AxiosError));
            spyOn<any>(axios, "create").and.returnValue({ get: axiosGetMockWithError });
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            try {
                await sdk.getLcwFcsDetails();
                fail("Should have thrown an error");
            } catch (error) {
                expect(ocsdkLogger.log).toHaveBeenCalled();
            }
        });
    });

    describe("Test getChatToken method", () => {

        it("Should throw error when retryCount is invalid value", async () => {
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            try {
                await sdk.getChatToken(requestId, {}, -1);
                fail("Should throw an error");
            } catch (error: any) {
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
            expect(axiosRetryHandler.default).toHaveBeenCalled();
        });

        it("Should return promise with botId passed", async () => {

           const  ochannelConfigBot = {
                channelId: "lcw",
                orgId: "678",
                orgUrl: "SomeUrl",
                widgetId: "456",
            };
            
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            const sdk = new SDK(ochannelConfigBot as IOmnichannelConfiguration);
            const result = await sdk.getChatToken("123", {
                MsOcBotApplicationId: "botId"
            }, 0);
            expect(result).not.toBeUndefined();
            expect(uuidvSpy).not.toHaveBeenCalled();
            expect(axios.create).toHaveBeenCalled();
            expect(axiosRetryHandler.default).toHaveBeenCalled();
        });


        it("Should fail due to empty response", async () => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstEmptyMock);
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            try {
                await sdk.getChatToken(requestId, {}, 0);
                fail("Should throw an error");
            } catch (error:any) {
                expect(error.message).toEqual("Empty data received from getChatToken");
            }
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
        const HTTPTimeOutErrorMessage = SDKError.ClientHTTPTimeoutErrorName + ": " + SDKError.ClientHTTPTimeoutErrorMessage;


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
                expect(axiosRetryHandler.default).toHaveBeenCalled();
                expect(BrowserInfo.getBrowserName).toHaveBeenCalled();
                expect(axiosRetryHandler.default).toHaveBeenCalled();
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


    describe("Test create conversation method", () => {

        let sessionInitOpt: any;
        let locationInfo: any;
        let browserName: any;
        let deviceType: any;
        let osType: any;
        const HTTPTimeOutErrorMessage = SDKError.ClientHTTPTimeoutErrorName + ": " + SDKError.ClientHTTPTimeoutErrorMessage;


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
            const result = sdk.createConversation(requestId, sessionInitOpt as ISessionInitOptionalParams);
            expect(axios.create).toHaveBeenCalled();
            result.then(() => {}, (error) => {
                expect(OSInfo.getOsType).toHaveBeenCalled();
                expect(DeviceInfo.getDeviceType).toHaveBeenCalled();
                expect(axiosRetryHandler.default).toHaveBeenCalled();
                expect(BrowserInfo.getBrowserName).toHaveBeenCalled();
                expect(axiosRetryHandler.default).toHaveBeenCalled();
                expect(ocsdkLogger.log).toHaveBeenCalled();
                done();
            });
        });

        it("Should return promise resolve", (done) => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            const result = sdk.createConversation(requestId, sessionInitOpt as ISessionInitOptionalParams);
            result.then(() => {
                expect(axiosInstMock).toHaveBeenCalled();
                done();
            });
        });

        it("Should reject when axiosInstance throws an error", (done) => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMockWithError);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            const result = sdk.createConversation(requestId, sessionInitOpt as ISessionInitOptionalParams);
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
            const result = sdk.getAgentAvailability(requestId, getQueueAvailabilityOpt as IGetQueueAvailabilityOptionalParams);
            expect(axios.create).toHaveBeenCalled();
            result.then(() => {}, (error) => {
                expect(OSInfo.getOsType).toHaveBeenCalled();
                expect(DeviceInfo.getDeviceType).toHaveBeenCalled();
                expect(axiosRetryHandler.default).toHaveBeenCalled();
                expect(BrowserInfo.getBrowserName).toHaveBeenCalled();
                expect(axiosRetryHandler.default).toHaveBeenCalled();
                expect(ocsdkLogger.log).toHaveBeenCalled();
                done();
            });
        });

        it("Should return promise resolve", (done) => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            const result = sdk.getAgentAvailability(requestId, getQueueAvailabilityOpt as ISessionInitOptionalParams);
            result.then(() => {
                expect(axiosInstMock).toHaveBeenCalled();
                done();
            });
        });

        it("Should reject when axiosInstance throws an error", (done) => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMockWithError);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            const result = sdk.getAgentAvailability(requestId, getQueueAvailabilityOpt as ISessionInitOptionalParams);
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
            expect(axiosRetryHandler.default).toHaveBeenCalled();
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
            expect(axiosRetryHandler.default).toHaveBeenCalled();
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
      expect(axiosRetryHandler.default).toHaveBeenCalled();
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
            expect(axiosRetryHandler.default).toHaveBeenCalled();
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
                expect(error).toEqual(AxiosError);
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
            expect(axiosRetryHandler.default).toHaveBeenCalled();
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
            const axiosInstMockValid = jasmine.createSpy("axiosInstance").and.callFake(() => Promise.resolve(dataMockValid));
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
            const axiosInstMockInvalid = jasmine.createSpy("axiosInstance").and.callFake(() => Promise.resolve(dataMockInvalid));
            spyOn<any>(axios, "create").and.returnValue(axiosInstMockInvalid);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            const result = sdk.validateAuthChatRecord(requestId, validateAuthChatRecordOptionalParams as IValidateAuthChatRecordOptionalParams);
            result.then(() => {
                fail("Promise should reject");
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
            const currentLiveChatVersion = 2;
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            const result = sdk.sendTypingIndicator(requestId, currentLiveChatVersion);
            result.then(() => {
                expect(axiosInstMock).toHaveBeenCalled();
                done();
            });
        });

        it("Should reject when axiosInstance throws an error", (done) => {
            const currentLiveChatVersion = 2;
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

    describe("Test getPersistentChatHistory method", () => {

        const getPersistentChatHistoryOptionalParams = {
            authenticatedUserToken: "validToken",
            pageSize: 10,
            pageToken: "nextPageToken"
        };

        it("Should return promise with chat history data", (done) => {
            const mockHistoryData = {
                conversations: [
                    { id: "conv1", messages: ["msg1", "msg2"] },
                    { id: "conv2", messages: ["msg3", "msg4"] }
                ],
                nextPageToken: "nextToken"
            };
            const dataMockValid = {
                data: mockHistoryData,
                headers: { "transaction-id": "tid" }
            };
            const axiosInstMockValid = jasmine.createSpy("axiosInstance").and.callFake(() => Promise.resolve(dataMockValid));
            spyOn<any>(axios, "create").and.returnValue(axiosInstMockValid);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);

            const result = sdk.getPersistentChatHistory(requestId, getPersistentChatHistoryOptionalParams);
            result.then((data) => {
                expect(axiosInstMockValid).toHaveBeenCalled();
                expect(data).toEqual(mockHistoryData);
                expect(ocsdkLogger.log).toHaveBeenCalled();
                done();
            }).catch(() => {
                fail("Promise should resolve");
            });
        });

        it("Should reject when authenticatedUserToken is missing", (done) => {
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            
            const result = sdk.getPersistentChatHistory(requestId, {});
            result.then(() => {
                fail("Promise should reject");
            }).catch((error) => {
                expect(error.message).toContain("Authenticated user token is required");
                done();
            });
        });

        it("Should include pageSize in query parameters when provided", (done) => {
            const dataMockValid = {
                data: { conversations: [] },
                headers: { "transaction-id": "tid" }
            };
            const axiosInstMockValid = jasmine.createSpy("axiosInstance").and.callFake(() => Promise.resolve(dataMockValid));
            spyOn<any>(axios, "create").and.returnValue(axiosInstMockValid);
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            
            const result = sdk.getPersistentChatHistory(requestId, {
                authenticatedUserToken: "token",
                pageSize: 25
            });
            
            result.then(() => {
                expect(axiosInstMockValid).toHaveBeenCalled();
                const callArgs = axiosInstMockValid.calls.mostRecent().args[0];
                expect(callArgs.params).toEqual({ pageSize: "25" });
                done();
            });
        });

        it("Should include PageToken in headers when provided", (done) => {
            const dataMockValid = {
                data: { conversations: [] },
                headers: { "transaction-id": "tid" }
            };
            const axiosInstMockValid = jasmine.createSpy("axiosInstance").and.returnValue(Promise.resolve(dataMockValid));
            spyOn<any>(axios, "create").and.returnValue(axiosInstMockValid);
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            
            const result = sdk.getPersistentChatHistory(requestId, {
                authenticatedUserToken: "token",
                pageToken: "myPageToken"
            });
            
            result.then(() => {
                expect(axiosInstMockValid).toHaveBeenCalled();
                const callArgs = axiosInstMockValid.calls.mostRecent().args[0];
                expect(callArgs.headers["PageToken"]).toBe("myPageToken");
                done();
            });
        });

        it("Should reject when axiosInstance throws an error", (done) => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMockWithError);
            spyOn(ocsdkLogger, "log").and.callFake(() => { });
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration, undefined, ocsdkLogger);
            
            const result = sdk.getPersistentChatHistory(requestId, getPersistentChatHistoryOptionalParams);
            result.then(() => {
                fail("Promise should reject");
            }, () => {
                expect(ocsdkLogger.log).toHaveBeenCalled();
                done();
            });
        });

        it("Should use correct endpoint path", (done) => {
            const dataMockValid = {
                data: { conversations: [] },
                headers: { "transaction-id": "tid" }
            };
            const axiosInstMockValid = jasmine.createSpy("axiosInstance").and.callFake(() => Promise.resolve(dataMockValid));
            spyOn<any>(axios, "create").and.returnValue(axiosInstMockValid);
            const sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            
            const result = sdk.getPersistentChatHistory(requestId, getPersistentChatHistoryOptionalParams);
            result.then(() => {
                expect(axiosInstMockValid).toHaveBeenCalled();
                const callArgs = axiosInstMockValid.calls.mostRecent().args[0];
                expect(callArgs.url).toContain("/livechatconnector/auth/organization/NotBadId/widgetapp/IdId/conversation/history");
                done();
            });
        });
    });

    describe("Test timeout for all requests", () => {
        let defaultOpt: any;
        let sdk: any;
        let requestBody: any;
        let originalTimeout:number;
        let mock: MockAdapter;
        const HTTPTimeOutErrorMessage = `${SDKError.ClientHTTPTimeoutErrorName}: ${SDKError.ClientHTTPTimeoutErrorMessage}`;

        beforeEach(() => {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;   //set the environment variable
            defaultOpt = {
                authenticatedUserToken: "token",
                initContext: {},
                getContext: true,
                chatId: "chatId"
            };
            sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            mock = new MockAdapter(axios);
            requestBody = { body: "dummy" }
        });

        it("getChatConfig timeout test", async () => {
            try {
                mock.onGet(/.*/).timeout();
                await sdk.getChatConfig("");
                fail("Should throw an error");
            } catch (error: any) {
                expect(error.code).toEqual("ECONNABORTED");
                expect(error.message).toContain("timeout");            }
        });

        it("getChatToken timeout test", async () => {
            try {
                mock.onGet(/.*/).timeout();
                await sdk.getChatToken(requestId, {}, 0);
                fail("Should throw an error");
            } catch (error: any) {
                expect(error.message).toEqual(HTTPTimeOutErrorMessage);
            }
        });

        it("getReconnectableChats timeout test", async () => {
            try {
                mock.onGet(/.*/).timeout();
                await sdk.getReconnectableChats({ authenticatedUserToken : "Token"} as IReconnectableChatsParams);
                fail("Should throw an error");
            } catch (error: any) {
                expect(error.message).toEqual(HTTPTimeOutErrorMessage);
            }
        });

        it("getReconnectAvailability timeout test", async () => {
            try {
                mock.onGet(/.*/).timeout();
                await sdk.getReconnectAvailability("reconnectId");
                fail("Should throw an error");
            } catch (error: any) {
                expect(error.message).toEqual(HTTPTimeOutErrorMessage);
            }
        });

        it("sessionInit timeout test", async () => {
            try {
                mock.onPost(/.*/).timeout();

                await sdk.sessionInit(requestId, defaultOpt as ISessionInitOptionalParams);
                fail("Should throw an error");
            } catch (error: any) {
                expect(error.message).toEqual(HTTPTimeOutErrorMessage);
            }
        });

        it("getAgentAvailability timeout test", async () => {
            try {
                mock.onPost(/.*/).timeout();
                await sdk.getAgentAvailability(requestId, defaultOpt as ISessionInitOptionalParams);
                fail("Should throw an error");
            } catch (error: any) {
                expect(error.message).toEqual(HTTPTimeOutErrorMessage);
            }
        });

        it("sessionClose timeout test", async () => {
            try {
                mock.onPost(/.*/).timeout();

                await sdk.sessionClose(requestId, defaultOpt as ISessionCloseOptionalParams);
                fail("Should throw an error");
            } catch (error: any) {
                expect(error.message).toEqual(HTTPTimeOutErrorMessage);
            }
        });

        it("submitPostChatResponse timeout test", async () => {
            try {
                mock.onPost(/.*/).timeout();

                await sdk.submitPostChatResponse(requestId, defaultOpt as ISubmitPostChatResponseOptionalParams);
                fail("Should throw an error");
            } catch (error: any) {
                expect(error.message).toEqual(HTTPTimeOutErrorMessage);
            }
        });

        it("getSurveyInviteLink timeout test", async () => {
            
            try {
                mock.onPost(/.*/).timeout();
                await sdk.getSurveyInviteLink(requestId, defaultOpt as IGetSurveyInviteLinkOptionalParams);
                fail("Should throw an error");
            } catch (error: any) {
                expect(error.message).toEqual(HTTPTimeOutErrorMessage);
            }
        });

        it("getChatTranscripts timeout test", async () => {
            try {
                mock.onGet(/.*/).timeout();
                await sdk.getChatTranscripts(requestId, "coolId", "coolId", defaultOpt as IGetChatTranscriptsOptionalParams);
                fail("Should throw an error");
            } catch (error: any) {
                expect(error.message).toEqual(HTTPTimeOutErrorMessage);
            }
        });

        it("makeSecondaryChannelEventRequest timeout test", async () => {
            try {
                mock.onPost(/.*/).timeout();
                await sdk.makeSecondaryChannelEventRequest(requestId, requestBody, defaultOpt as ISecondaryChannelEventOptionalParams);
                fail("Should throw an error");
            } catch (error: any) {
                expect(error.message).toEqual(HTTPTimeOutErrorMessage);
            }
        });

        it("validateAuthChatRecord timeout test", async () => {
            try {
                mock.onGet(/.*/).timeout();
                await sdk.validateAuthChatRecord(requestId, defaultOpt as IValidateAuthChatRecordOptionalParams);
                fail("Should throw an error");
            } catch (error: any) {
                expect(error.message).toEqual(HTTPTimeOutErrorMessage);
            }
        });

        it("getPersistentChatHistory timeout test", async () => {
            try {
                mock.onGet(/.*/).timeout();
                await sdk.getPersistentChatHistory(requestId, defaultOpt as IGetPersistentChatHistoryOptionalParams);
                fail("Should throw an error");
            } catch (error: any) {
                expect(error.message).toEqual(HTTPTimeOutErrorMessage);
            }
        });

        afterEach(() => {
            mock.restore();
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;   //remove environment variable 
        });
    });
});
