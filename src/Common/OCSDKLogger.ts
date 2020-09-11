import IOCSDKLogger from "../Interfaces/IOCSDKLogger";
import ILogger from "../Model/ILogger";
import IOCSDKLogData from "../Model/IOCSDKLogData";
import { LogLevel } from "../Model/LogLevel";
import TelemetryHelper from "../Utils/TelemetryHelper";

export default class OCSDKLogger implements IOCSDKLogger {

  private logger: ILogger;

  public constructor(logger: ILogger) {
      this.logger = logger;
  }

  public log(loglevel: LogLevel, telemetryEvent: string, customData?: any, description?: string): void { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
      if (this.isLoggingEnabled()) {
          const logData = TelemetryHelper.GETTELEMETRYEVENTDATA(telemetryEvent, customData, description);
          this.logEvent(loglevel, logData);
      }
  }

  public logEvent(logLevel: LogLevel, logData: IOCSDKLogData): number | void {
    if (this.isLoggingEnabled()) {
        setTimeout(this.logger.logClientSdkTelemetryEvent.bind(this.logger), 0, logLevel, logData);
    }
  }

  public isLoggingEnabled(): boolean {
      return !this.isNullOrUndefined(this.logger);
  }

  public isNullOrUndefined(obj: object): boolean {
      return (obj === null || obj === undefined);
  }
}
