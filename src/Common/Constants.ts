import { ChannelId } from "./Enums";

export default class Constants {
  public static readonly requiredOmnichannelConfigurationParameters = ["orgUrl", "orgId", "widgetId"];
  public static readonly defaultHeaders = {
    "Content-Type": "application/json"
  };
  public static readonly bypassCacheHeaders = {
    "Cache-Control": "no-store, must-revalidate, no-cache",
    "X-Cache-Control": "no-store"
  };
  public static readonly defaultChannelId = ChannelId.LCW;
  public static readonly defaultLocale = "en-us";
  public static readonly noContentStatusCode = 204;
  public static readonly tooManyRequestsStatusCode = 429;
  public static readonly outOfOfficeErrorCode = 705;
  public static readonly sensitiveProperties = ["AuthenticatedUserToken"];
  public static readonly transactionid = "transaction-id";
  public static readonly customerDisplayName = "customerDisplayName";
  public static readonly hiddenContentPlaceholder = "*content hidden*";
  public static readonly axiosTimeoutErrorCode = "ECONNABORTED";
}
