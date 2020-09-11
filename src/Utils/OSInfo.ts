import { OperatingSystem } from "../Common/Enums";

// Ported from https://dev.azure.com/dynamicscrm/OneCRM/_git/CRM.OmniChannel.LiveChatWidget?path=/src/LiveChatLoader/Utility/OSInfo.ts&version=GBrelease

export class OSInfo {
  public static getOsType(): OperatingSystem {
    const win = /(windows|win32)/i;
    const winrt = / arm;/i;
    const winphone = /windows\sphone\s\d+\.\d+/i;
    const osx = /(macintosh|mac os x)/i;
    const ios = /(iPad|iPhone|iPod)(?=.*like Mac OS X)/i;
    const linux = /(linux|joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|cros)/i;
    const android = /android/i;

    const userAgent = () => window.navigator.userAgent;

    if (userAgent().match(winphone)) {
      return OperatingSystem.WINDOWS_PHONE;
    }

    if (userAgent().match(winrt)) {
      return OperatingSystem.WINDOWS_RT;
    }

    if (userAgent().match(ios)) {
      return OperatingSystem.IOS;
    }

    if (userAgent().match(android)) {
      return OperatingSystem.ANDROID;
    }

    if (userAgent().match(linux)) {
      return OperatingSystem.LINUX;
    }

    if (userAgent().match(osx)) {
      return OperatingSystem.MACOSX;
    }

    if (userAgent().match(win)) {
      return OperatingSystem.WINDOWS;
    }

    return OperatingSystem.UNKNOWN;
  }
}
