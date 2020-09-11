import IOCSDKLogData from "../Model/IOCSDKLogData";
import { LogLevel } from "../Model/LogLevel";

export default interface IOCSDKLogger {
  log(loglevel: LogLevel, telemetryEvent: string, customData?: any, description?: string): void; // eslint-disable-line @typescript-eslint/no-explicit-any
  logEvent(logLevel: LogLevel, logData: IOCSDKLogData): void;
  isLoggingEnabled(): boolean;
  isNullOrUndefined(obj: object): boolean;
}
