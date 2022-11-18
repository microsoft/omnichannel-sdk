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
import OCSDKLogger from "../src/Common/OCSDKLogger";
import { OSInfo } from "../src/Utils/OSInfo";
import SDK from "../src/SDK";
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
        axiosInstMockWithError = jasmine.createSpy("axiosInstance").and.throwError(AxiosError);
    });

    describe("Test constructor", () => {

        it("Ctor with valid parameters", () => {
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
            const result = sdk.getAgentAvailability(requestId, getQueueAvailabilityOpt as IGetQueueAvailabilityOptionalParams);
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

    describe("Test timeout for all requests", () => {
        let defaultOpt: any;
        let sdk: any;
        let requestBody: any;

        beforeEach(() => {
            process.env.testTimeout = "60000";   //set the environment variable
            defaultOpt = {
                authenticatedUserToken: "token",
                initContext: {},
                getContext: true,
                chatId: "chatId"
            };
            sdk = new SDK(ochannelConfig as IOmnichannelConfiguration);
            requestBody = { body: "dummy" }
        });

        it("getChatConfig timeout test", async () => {
            spyOn<any>(axios, "create").and.returnValue({ async get(endpoint: any) { return dataMock; }});
            try {
                await sdk.getChatConfig("");
            } catch (error) {
                expect(error.code).toEqual("ECONNABORTED ");
                expect(error.message).toContain("timeout");
            }
        });

        it("getChatToken timeout test", async () => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            try {
                await sdk.getChatToken(requestId, {}, 0);
            } catch (error) {
                expect(error.code).toEqual("ECONNABORTED ");
                expect(error.message).toContain("timeout");
            }
        });

        it("getReconnectableChats timeout test", async () => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            try {
                await sdk.getReconnectableChats({ authenticatedUserToken : "Token"} as IReconnectableChatsParams);
            } catch (error) {
                expect(error.code).toEqual("ECONNABORTED ");
                expect(error.message).toContain("timeout");
            }
        });

        it("getReconnectAvailability timeout test", async () => {
            spyOn<any>(axios, "create").and.returnValue(axiosInstMock);
            try {
                await sdk.getReconnectAvailability("reconnectId");
            } catch (error) {
                expect(error.code).toEqual("ECONNABORTED ");
                expect(error.message).toContain("timeout");
            }
        });

        it("sessionInit timeout test", async () => {
            spyOn<any>(axios, "create").and.returnValue({ async get(endpoint: any) { return dataMock; }});
            try {
                sdk.sessionInit(requestId, defaultOpt as ISessionInitOptionalParams);
            } catch (error) {
                expect(error.code).toEqual("ECONNABORTED ");
                expect(error.message).toContain("timeout");
            }
        });

        it("getAgentAvailability timeout test", async () => {
            spyOn<any>(axios, "create").and.returnValue({ async get(endpoint: any) { return dataMock; }});
            try {
                sdk.getAgentAvailability(requestId, defaultOpt as ISessionInitOptionalParams);
            } catch (error) {
                expect(error.code).toEqual("ECONNABORTED ");
                expect(error.message).toContain("timeout");
            }
        });

        it("sessionClose timeout test", async () => {
            spyOn<any>(axios, "create").and.returnValue({ async get(endpoint: any) { return dataMock; }});
            try {
                sdk.sessionClose(requestId, defaultOpt as ISessionCloseOptionalParams);
            } catch (error) {
                expect(error.code).toEqual("ECONNABORTED ");
                expect(error.message).toContain("timeout");
            }
        });

        it("submitPostChatResponse timeout test", async () => {
            spyOn<any>(axios, "create").and.returnValue({ async get(endpoint: any) { return dataMock; }});
            try {
                sdk.submitPostChatResponse(requestId, defaultOpt as ISubmitPostChatResponseOptionalParams);
            } catch (error) {
                expect(error.code).toEqual("ECONNABORTED ");
                expect(error.message).toContain("timeout");
            }
        });

        it("getSurveyInviteLink timeout test", async () => {
            spyOn<any>(axios, "create").and.returnValue({ async get(endpoint: any) { return dataMock; }});
            try {
                sdk.getSurveyInviteLink(requestId, defaultOpt as IGetSurveyInviteLinkOptionalParams);
            } catch (error) {
                expect(error.code).toEqual("ECONNABORTED ");
                expect(error.message).toContain("timeout");
            }
        });

        it("getChatTranscripts timeout test", async () => {
            spyOn<any>(axios, "create").and.returnValue({ async get(endpoint: any) { return dataMock; }});
            try {
                sdk.getChatTranscripts(requestId, "coolId", "coolId", defaultOpt as IGetChatTranscriptsOptionalParams);
            } catch (error) {
                expect(error.code).toEqual("ECONNABORTED ");
                expect(error.message).toContain("timeout");
            }
        });

        it("makeSecondaryChannelEventRequest timeout test", async () => {
            spyOn<any>(axios, "create").and.returnValue({ async get(endpoint: any) { return dataMock; }});
            try {
                sdk.makeSecondaryChannelEventRequest(requestId, requestBody, defaultOpt as ISecondaryChannelEventOptionalParams);
            } catch (error) {
                expect(error.code).toEqual("ECONNABORTED ");
                expect(error.message).toContain("timeout");
            }
        });

        it("validateAuthChatRecord timeout test", async () => {
            spyOn<any>(axios, "create").and.returnValue({ async get(endpoint: any) { return dataMock; }});
            try {
                sdk.validateAuthChatRecord(requestId, defaultOpt as IValidateAuthChatRecordOptionalParams);
            } catch (error) {
                expect(error.code).toEqual("ECONNABORTED ");
                expect(error.message).toContain("timeout");
            }
        });

        afterEach(() => {
            process.env.testTimeout = undefined   //remove environment variable 
        });
    });
});
