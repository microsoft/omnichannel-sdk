import IOCSDKLogData from "../Model/IOCSDKLogData";
import { LogLevel } from "../Model/LogLevel";

export default interface ILogger {
  logClientSdkTelemetryEvent(loglevel: LogLevel, event: IOCSDKLogData): void;
}
