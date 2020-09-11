export default interface IOCSDKLogData {
  RequestId: string;
  ElapsedTimeInMilliseconds?: number;
  Event?: string;
  Region?: string;
  TransactionId?: string;
  ExceptionDetails?: object;
  Description?: string;
}
