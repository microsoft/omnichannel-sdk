// Entry point

import EventManager from "./Utils/EventManager";
import EventNames from "./Common/EventNames";
import SDKProvider from "./SDKProvider";
import { uuidv4 } from "./Utils/uuid";

declare global {
  interface Window {
    Microsoft: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  namespace NodeJS { // eslint-disable-line @typescript-eslint/no-namespace
    interface Global {
      window: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  }
}

export {
  SDKProvider,
  uuidv4
};

(() => {

  // Declares window object for NodeJS environment
  if (global.window === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window = global;
  }

  if (!window) {
    throw new Error(`window object not found`);
  }

  // Check existence of global objects to avoid overwrite/clashing
  if (!("Microsoft" in window)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Microsoft = {};
  }

  if (!("CRM" in window.Microsoft)) {
    window.Microsoft.CRM = {};
  }

  if (!("Omnichannel" in window.Microsoft.CRM)) {
    window.Microsoft.CRM.Omnichannel = {};
  }

  if (!("SDK" in window.Microsoft.CRM.Omnichannel)) {
    window.Microsoft.CRM.Omnichannel.SDK = {
      SDKProvider,
      Util: {
        uuidv4
      }
    };
  }

  window.document && EventManager.raiseCustomEvent(EventNames.OCSDKLOAD);
})();
