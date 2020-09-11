import { DeviceType } from "../Common/Enums";

// Ported from https://dev.azure.com/dynamicscrm/OneCRM/_git/CRM.OmniChannel.LiveChatWidget?path=/src/LiveChatLoader/Utility/DeviceInfo.ts&version=GBrelease

export class DeviceInfo {
  public static getDeviceType(): string {
    const mobile = /(android|ipod|windows phone|wpdesktop|windows ce|blackberry\w*|meego|webos|palm|symbian|pda|\w*?mobile\w*?|\w*?phone\w*?)/i;
    const tablet = /tablet|ipad/i;

    if (window.navigator.userAgent.match(mobile)) {
      return DeviceType.Mobile;
    }

    if (window.navigator.userAgent.match(tablet)) {
      return DeviceType.Tablet;
    }

    return DeviceType.Desktop;
  }
}
