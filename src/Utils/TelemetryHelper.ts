/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import IOCSDKLogData from "../Model/IOCSDKLogData";

export default class TelemetryHelper {
  public static GETTELEMETRYEVENTDATA(telemetryEvent: string, customData?: any, description?: string): IOCSDKLogData {
    const logData = {
      Description: description,
      ElapsedTimeInMilliseconds: customData.ElapsedTimeInMilliseconds,
      HttpRequestResponseTime: customData.HttpRequestResponseTime,
      Event: telemetryEvent,
      ExceptionDetails: customData.ExceptionDetails,
      Region: customData.Region,
      RequestId: customData.RequestId,
      TransactionId: customData.TransactionId,
      RequestHeaders: customData.RequestHeaders,
      RequestPayload: customData.RequestPayload,
      RequestPath: customData.RequestPath,
      RequestMethod: customData.RequestMethod,
      ResponseStatusCode: customData.ResponseStatusCode,
      ResponseErrorcode: customData.ResponseErrorcode,
      AuthTokenDetails: customData.AuthTokenDetails
    };

    return logData;
  }
}
