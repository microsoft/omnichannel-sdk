/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import { LogLevel } from "../../src/Model/LogLevel";
import IOCSDKLogData from "../../src/Model/IOCSDKLogData";
import ILogger from "../../src/Model/ILogger";
import OCSDKLogger from "../../src/Common/OCSDKLogger";
import TelemetryHelper from "../../src/Utils/TelemetryHelper";

describe("Test Common OCSDKLogger", () => {
    let ocsdkLogger: any;
    const logger = {
        logClientSdkTelemetryEvent: (loglevel: LogLevel,
            logData: IOCSDKLogData): void => { }
    } as ILogger;

    const logEvent = {
        Event: "Test Event",
        ElapsedTimeInMilliseconds: 200,
        ExceptionDetails: {ErrorDetails: "test Error"},
        Region: "Test Region",
        RequestId: "Test RequestId",
        TransactionId: "Test TransactionId",
        Description: "Test Description"
    } as IOCSDKLogData;

    const telemetryEvent = "event";

    beforeEach(() => {
        ocsdkLogger = new OCSDKLogger(logger);
    });

    it("Logging should be enabled", () => {
        ocsdkLogger = new OCSDKLogger(logger);
        spyOn(ocsdkLogger, "isNullOrUndefined").and.callFake(() => {
            return false;
        });
        const result: boolean = ocsdkLogger.isLoggingEnabled();
        expect(result).toBeDefined();
        expect(result).toEqual(true);
        expect(ocsdkLogger.isNullOrUndefined).toHaveBeenCalledWith(logger);
    });

    it("Logging should be disabled", () => {
        spyOn(ocsdkLogger, "isNullOrUndefined").and.callFake(() => {
            return true;
        });
        const result: boolean = ocsdkLogger.isLoggingEnabled();
        expect(result).toBeDefined();
        expect(result).toEqual(false);
        expect(ocsdkLogger.isNullOrUndefined).toHaveBeenCalledWith(logger);
    });

    it("LogEvent should call logger.logClientSdkTelemetryEvent", () => {
        jasmine.clock().install();
        spyOn(logger, "logClientSdkTelemetryEvent").and.callFake((loglevel, event) => { });
        spyOn(ocsdkLogger, "isNullOrUndefined").and.callFake(() => {
            return false;
        });
        ocsdkLogger.logEvent(LogLevel.INFO, logEvent);
        jasmine.clock().tick(1);
        expect(logger.logClientSdkTelemetryEvent).toHaveBeenCalled();
        expect(logger.logClientSdkTelemetryEvent).toHaveBeenCalledWith(LogLevel.INFO, logEvent);
        jasmine.clock().uninstall();
    });

    it("LogEvent should do nothing when logger doesn't exist", () => {
        spyOn(ocsdkLogger, "isNullOrUndefined").and.callFake(() => {
            return true;
        });
        spyOn(logger, "logClientSdkTelemetryEvent").and.callFake((loglevel, event) => { });
        ocsdkLogger.logEvent(LogLevel.INFO, logEvent);
        expect(logger.logClientSdkTelemetryEvent).not.toHaveBeenCalled();
    });

    it("Log method should get telemetry data and call logEvent", () => {
        spyOn(ocsdkLogger, "isNullOrUndefined").and.callFake(() => {
            return false;
        });
        spyOn(TelemetryHelper, "GETTELEMETRYEVENTDATA").and.callFake(() => {
            return logEvent;
        });
        spyOn(ocsdkLogger, "logEvent").and.callFake(() => { });
        ocsdkLogger.log(LogLevel.INFO, telemetryEvent, "", "");
        expect(TelemetryHelper.GETTELEMETRYEVENTDATA).toHaveBeenCalled();
        expect(TelemetryHelper.GETTELEMETRYEVENTDATA).toHaveBeenCalledWith(telemetryEvent, "", "");
        expect(ocsdkLogger.logEvent).toHaveBeenCalled();
        expect(ocsdkLogger.logEvent).toHaveBeenCalledWith(LogLevel.INFO, logEvent);
    });

    it("Log method should do nothing when logger doesn't exist", () => {
        spyOn(ocsdkLogger, "isNullOrUndefined").and.callFake(() => {
            return true;
        });
        spyOn(TelemetryHelper, "GETTELEMETRYEVENTDATA").and.callFake(() => {
            return logEvent;
        });
        spyOn(ocsdkLogger, "logEvent").and.callFake(() => { });
        ocsdkLogger.log(LogLevel.INFO, telemetryEvent, "", "");
        expect(TelemetryHelper.GETTELEMETRYEVENTDATA).not.toHaveBeenCalled();
        expect(ocsdkLogger.logEvent).not.toHaveBeenCalled();
    });
});
