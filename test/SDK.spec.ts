/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import axios from "axios";
import IGetChatTranscriptsOptionalParams from "../src/Interfaces/IGetChatTranscriptsOptionalParams";
import IOmnichannelConfiguration from "../src/Interfaces/IOmnichannelConfiguration";
import IReconnectableChatsParams from "../src/Interfaces/IReconnectableChatsParams";
import ISDKConfiguration from "../src/Interfaces/ISDKConfiguration";
import ISessionCloseOptionalParams from "../src/Interfaces/ISessionCloseOptionalParams";
import ISessionInitOptionalParams from "../src/Interfaces/ISessionInitOptionalParams";
import ISubmitPostChatResponseOptionalParams from "../src/Interfaces/ISubmitPostChatResponseOptionalParams";
import SDK from "../src/SDK";
import * as axiosRetry from "../src/Utils/axiosRetry";
import { BrowserInfo } from "../src/Utils/BrowserInfo";
import { DeviceInfo } from "../src/Utils/DeviceInfo";
import { LocationInfo } from "../src/Utils/LocationInfo";
import { OSInfo } from "../src/Utils/OSInfo";
import * as uuidvModule from "../src/Utils/uuid";
import ISecondaryChannelEventOptionalParams from "../src/Interfaces/ISecondaryChannelEventOptionalParams";
import { LogLevel } from "../src/Model/LogLevel";
import IOCSDKLogData from "../src/Model/IOCSDKLogData";
import ILogger from "../src/Model/ILogger";
import OCSDKLogger from "../src/Common/OCSDKLogger";
import IGetSurveyInviteLinkOptionalParams from "../src/Interfaces/IGetSurveyInviteLinkOptionalParams";

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
});
