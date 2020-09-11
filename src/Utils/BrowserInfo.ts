import { BrowserVendor } from "../Common/Enums";

// Ported from https://dev.azure.com/dynamicscrm/OneCRM/_git/CRM.OmniChannel.LiveChatWidget?path=/src/LiveChatLoader/Utility/BrowserInfo.ts

const REGEX_VERSION = "([\\d,.]+)";

export const UNKNOWN_VERSION = "U";

export class BrowserInfo {

  private static userAgent: () => string = () => window.navigator.userAgent;

  private static getUserAgent(): string {
    return this.userAgent();
  }
  private static userAgentContainsString(searchString: string): boolean {
    return this.getUserAgent().indexOf(searchString) > -1;
  }

  public static isChrome(): boolean {
    return this.userAgentContainsString(BrowserVendor.CHROME) &&
      !this.userAgentContainsString(BrowserVendor.EDGE) &&
      !this.userAgentContainsString(BrowserVendor.EDGE_CHROMIUM);
  }

  public static isIe(): boolean {
    return this.userAgentContainsString("Trident");
  }

  public static isEdge(): boolean {
    return this.userAgentContainsString(BrowserVendor.EDGE) ||
      this.userAgentContainsString(BrowserVendor.EDGE_CHROMIUM);
  }

  public static isOpera(): boolean {
    return this.userAgentContainsString("OPR/");
  }

  public static getBrowserName(): BrowserVendor {
    if (this.isOpera()) {
      return BrowserVendor.OPERA;
    }

    if (this.isEdge()) {
      return BrowserVendor.EDGE;
    }

    if (this.isChrome()) {
      return BrowserVendor.CHROME;
    }

    if (this.userAgentContainsString(BrowserVendor.FIREFOX)) {
      return BrowserVendor.FIREFOX;
    }

    if (this.userAgentContainsString(BrowserVendor.SAFARI)) {
      return BrowserVendor.SAFARI;
    }

    if (this.isIe()) {
      return BrowserVendor.IE;
    }

    return BrowserVendor.UNKNOWN;
  }

  public static getBrowserVersion(): string | undefined {
    const getIeVersion = () => {
      const userAgent = this.getUserAgent();
      const classicIeVersionMatches = userAgent.match(new RegExp(BrowserVendor.IE + " " + REGEX_VERSION));

      if (classicIeVersionMatches) {
        return classicIeVersionMatches[1];
      }

      const ieVersionMatches: RegExpMatchArray | null = userAgent.match(new RegExp("rv:" + REGEX_VERSION));
      if (ieVersionMatches) {
        return ieVersionMatches[1];
      }

      return undefined;
    };

    const getOtherVersion = (browserString: string) => {
      if (browserString === BrowserVendor.SAFARI) {
        browserString = "Version";
      }

      if (browserString === BrowserVendor.OPERA) {
        browserString = "OPR";
      }

      if (browserString === BrowserVendor.EDGE) {
        browserString = "Edge?";
      }

      const matches: RegExpMatchArray | null = this.getUserAgent().match(new RegExp(browserString + "/" + REGEX_VERSION));

      if (matches) {
        return matches[1];
      }

      return UNKNOWN_VERSION;
    };

    if (this.isIe()) {
      return getIeVersion();
    }

    return getOtherVersion(this.getBrowserName());
  }
}
