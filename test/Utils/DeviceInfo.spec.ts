import { DeviceType } from "../../src/Common/Enums";
import { DeviceInfo } from "../../src/Utils/DeviceInfo";

describe("DeviceInfo unit tests", () => {

    describe("Test getDeviceType method", () => {

        it("Should return Mobile type", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: "mobile type" }
            });
            const type = DeviceInfo.getDeviceType();
            expect(type).toEqual(DeviceType.Mobile);
        });

        it("Should return Tablet type", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: "tablet type" }
            });
            const type = DeviceInfo.getDeviceType();
            expect(type).toEqual(DeviceType.Tablet);
        });

        it("Should return Desctop type", () => {
            Object.defineProperty(window, "navigator", {
                value: { userAgent: "some another type" }
            });
            const type = DeviceInfo.getDeviceType();
            expect(type).toEqual(DeviceType.Desktop);
        });
    });
});
