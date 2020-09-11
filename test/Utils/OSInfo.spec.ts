import { OperatingSystem } from "../../src/Common/Enums";
import { OSInfo } from "../../src/Utils/OSInfo";

describe("OSInfo unit tests", () => {

    describe("Test getOsType method", () => {
        it("Should return WindowsPhone type", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: "windows phone 7.1" }
            });
            const type = OSInfo.getOsType();
            expect(type).toEqual(OperatingSystem.WINDOWS_PHONE);
        });

        it("Should return WindowsRT type", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: " arm;" }
            });
            const type = OSInfo.getOsType();
            expect(type).toEqual(OperatingSystem.WINDOWS_RT);
        });

        it("Should return IOS type", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: "iPhone OS 6_1_3 like Mac OS X" }
            });
            const type = OSInfo.getOsType();
            expect(type).toEqual(OperatingSystem.IOS);
        });

        it("Should return Android type", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: "android" }
            });
            const type = OSInfo.getOsType();
            expect(type).toEqual(OperatingSystem.ANDROID);
        });

        it("Should return Linux type", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: "linux" }
            });
            const type = OSInfo.getOsType();
            expect(type).toEqual(OperatingSystem.LINUX);
        });

        it("Should return MacOsx type", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: "mac os x" }
            });
            const type = OSInfo.getOsType();
            expect(type).toEqual(OperatingSystem.MACOSX);
        });

        it("Should return Windows type", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: "windows" }
            });
            const type = OSInfo.getOsType();
            expect(type).toEqual(OperatingSystem.WINDOWS);
        });

        it("Should return Unknown type", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: "some strange platform" }
            });
            const type = OSInfo.getOsType();
            expect(type).toEqual(OperatingSystem.UNKNOWN);
        });
    });
});
