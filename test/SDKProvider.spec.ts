/* eslint-disable @typescript-eslint/no-explicit-any */

import SDKProvider from "../src/SDKProvider";

describe("SDKProvider unit tests", () => {

    const omniConfig = {
        orgId: "NotBadId",
        orgUrl: "SomeUrl",
        widgetId: "IdId"
    };

    it("getSDK should return valid SDK object", () => {
        const result = SDKProvider.getSDK(omniConfig as any, {} as any, {} as any);
        expect(result).not.toBeUndefined();
    });
});
