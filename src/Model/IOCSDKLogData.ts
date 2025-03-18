export default interface IOCSDKLogData {
  RequestId: string;
  ElapsedTimeInMilliseconds?: number;
  Event?: string;
  Region?: string;
  TransactionId?: string;
  ExceptionDetails?: object;
  Description?: string;
  RequestPayload?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  RequestPath?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  RequestMethod?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  RequestHeaders?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  ResponseErrorCode?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  AuthTokenDetails?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
