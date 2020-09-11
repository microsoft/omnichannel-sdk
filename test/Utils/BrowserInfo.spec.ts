import { BrowserVendor } from "../../src/Common/Enums";
import { BrowserInfo } from "../../src/Utils/BrowserInfo";

describe("BrowserInfo unit tests", () => {

    const EDGE_VERSION = "18.18363";
    const EDGE_USER_AGENT = "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/" + EDGE_VERSION;

    const EDGE_CHROMIUM_VERSION = "80.0.361.54";
    const EDGE_CHROMIUM_USER_AGENT = "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36 Edg/" + EDGE_CHROMIUM_VERSION;

    const OPERA_VERSION = "66.0.3515.95";
    const OPERA_USER_AGENT = "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 OPR/" + OPERA_VERSION;

    const CHROME_VERSION = "80.0.3987.106";
    const CHROME_USER_AGENT = "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/" + CHROME_VERSION + " Safari/537.36";

    const FIREFOX_VERSION = "73.0";
    const FIREFOX_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:73.0) Gecko/20100101 Firefox/" + FIREFOX_VERSION;

    const SAFARI_VERSION = "13.0";
    const SAFARI_USER_AGENT = "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/" + SAFARI_VERSION + " Safari/605.1.15";

    const IE_11_VERSION = "11.0";
    const IE_11_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:" + IE_11_VERSION + ") like Gecko";

    const IE_10_VERSION = "10.0";
    const IE_10_USER_AGENT = "Mozilla/5.0 (compatible; MSIE " + IE_10_VERSION + "; Windows NT 6.2; WOW64; Trident/6.0)";

    describe("Test getBrowserName method", () => {

        it("Should return Edge", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: EDGE_USER_AGENT }
            });
            const browser = BrowserInfo.getBrowserName();
            expect(browser).toEqual(BrowserVendor.EDGE);
        });

        it("Should return Edge (Chromium)", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: EDGE_CHROMIUM_USER_AGENT }
            });
            const browser = BrowserInfo.getBrowserName();
            expect(browser).toEqual(BrowserVendor.EDGE);
        });

        it("Should return Opera", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: OPERA_USER_AGENT }
            });
            const browser = BrowserInfo.getBrowserName();
            expect(browser).toEqual(BrowserVendor.OPERA);
        });

        it("Should return Chrome", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: CHROME_USER_AGENT }
            });
            const browser = BrowserInfo.getBrowserName();
            expect(browser).toEqual(BrowserVendor.CHROME);
        });

        it("Should return Firefox", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: FIREFOX_USER_AGENT }
            });
            const browser = BrowserInfo.getBrowserName();
            expect(browser).toEqual(BrowserVendor.FIREFOX);
        });

        it("Should return Safari", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: SAFARI_USER_AGENT }
            });
            const browser = BrowserInfo.getBrowserName();
            expect(browser).toEqual(BrowserVendor.SAFARI);
        });

        it("Should return IE", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: IE_11_USER_AGENT }
            });
            const browser = BrowserInfo.getBrowserName();
            expect(browser).toEqual(BrowserVendor.IE);
        });

        it("Should return IE (classic)", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: IE_10_USER_AGENT }
            });
            const browser = BrowserInfo.getBrowserName();
            expect(browser).toEqual(BrowserVendor.IE);
        });

        it("Should return Unknown", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: "some new browser" }
            });
            const browser = BrowserInfo.getBrowserName();
            expect(browser).toEqual(BrowserVendor.UNKNOWN);
        });
    });

    describe("Test getBrowserVersion", () => {

        it("Should return version of IE browser", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: IE_11_USER_AGENT }
            });
            const version = BrowserInfo.getBrowserVersion();
            expect(version).toEqual(IE_11_VERSION);
        });

        it("Should return undefined", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: "Trident/7.0; some strange" }
            });
            const version = BrowserInfo.getBrowserVersion();
            expect(version).toEqual(undefined);
        });

        it("Should return classic version of IE browser", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: IE_10_USER_AGENT }
            });
            const version = BrowserInfo.getBrowserVersion();
            expect(version).toEqual(IE_10_VERSION);
        });

        it("Should return version of Safari browser", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: SAFARI_USER_AGENT }
            });
            const version = BrowserInfo.getBrowserVersion();
            expect(version).toEqual(SAFARI_VERSION);
        });

        it("Should return version of Chrome browser", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: CHROME_USER_AGENT }
            });
            const version = BrowserInfo.getBrowserVersion();
            expect(version).toEqual(CHROME_VERSION);
        });

        it("Should return version of Opera browser", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: OPERA_USER_AGENT }
            });
            const version = BrowserInfo.getBrowserVersion();
            expect(version).toEqual(OPERA_VERSION);
        });

        it("Should return version of Edge browser", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: EDGE_USER_AGENT }
            });
            const version = BrowserInfo.getBrowserVersion();
            expect(version).toEqual(EDGE_VERSION);
        });

        it("Should return version of Edge browser (chromium)", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: EDGE_CHROMIUM_USER_AGENT }
            });
            const version = BrowserInfo.getBrowserVersion();
            expect(version).toEqual(EDGE_CHROMIUM_VERSION);
        });

        it("Should return version of other browsers", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: "someBrowser 11.0" }
            });
            const version = BrowserInfo.getBrowserVersion();
            expect(version).toEqual("U");
        });
    });
});
