import Constants from "./Common/Constants";
import OCSDKLogger from "./Common/OCSDKLogger";
import IOmnichannelConfiguration from "./Interfaces/IOmnichannelConfiguration";
import ISDK from "./Interfaces/ISDK";
import ISDKConfiguration from "./Interfaces/ISDKConfiguration";
import ILogger from "./Model/ILogger";
import SDK from "./SDK";

export default class SDKProvider {
  public static getSDK(omnichannelConfiguration: IOmnichannelConfiguration, configuration: ISDKConfiguration, logger: ILogger): ISDK {
    const ilogger = new OCSDKLogger(logger);
    return new SDK({
        channelId: omnichannelConfiguration.channelId || Constants.defaultChannelId,
        orgId: omnichannelConfiguration.orgId,
        orgUrl: omnichannelConfiguration.orgUrl,
        widgetId: omnichannelConfiguration.widgetId
      },
      configuration || {},
      ilogger
    );
  }
}
