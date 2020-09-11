import { ChannelId } from "./Enums";

export default class Constants {
  public static readonly requiredOmnichannelConfigurationParameters = ["orgUrl", "orgId", "widgetId"];
  public static readonly defaultHeaders = {
    "Content-Type": "application/json"
  };
  public static readonly defaultChannelId = ChannelId.LCW;
  public static readonly defaultLocale = "en-us";
  public static readonly noContentStatusCode = 204;
  public static readonly transactionid = "transaction-id";
}
