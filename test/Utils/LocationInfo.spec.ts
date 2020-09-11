/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { LocationInfo } from "../../src/Utils/LocationInfo";

describe("LocationInfo unit tests", () => {

    const coordsMock = {
        latitude: "1",
        longitude: "1"
    };
    const getPosition = (success: any, error: any) => {
        success({
            coords: coordsMock
        });
    };

    const getPositionWithError = (success: any, error: any) => {
        error();
    };

    it("Test getLocation method onSuccess", (done) => {
        Object.defineProperty(window, "navigator", {
                value: { geolocation: { getCurrentPosition: getPosition } }
        });
        const promise = LocationInfo.getLocation();
        promise.then((location) => {
            expect(location.latitude).toEqual(coordsMock.latitude);
            expect(location.longitude).toEqual(coordsMock.longitude);
            done();
        }, () => {
            throw new Error("Promise should call resolve");
        });
    });

    it("Test getLocation method onError", (done) => {
        Object.defineProperty(window, "navigator", {
                value: { geolocation: { getCurrentPosition: getPositionWithError } }
        });
        const promise = LocationInfo.getLocation();
        promise.then((location) => {
            expect(location.latitude).toEqual("");
            expect(location.longitude).toEqual("");
            done();
        }, () => {
            throw new Error("Promise should call resolve");
        });
    });

    it("Test getLocationInfo method when geolocation exists", (done) => {
        Object.defineProperty(window, "navigator", {
            value: { geolocation: undefined }
        });
        const promise = LocationInfo.getLocationInfo();
        promise.then((location) => {
            expect(location.latitude).toEqual("");
            expect(location.longitude).toEqual("");
            done();
        }, () => {
            throw new Error("Promise should call resolve");
        });
    });

    it("Test getLocationInfo method when geolocation doesn't exist", (done) => {
        Object.defineProperty(window, "navigator", {
            value: { geolocation: { getCurrentPosition: getPosition } }
        });
        spyOn<any>(LocationInfo, "getLocation").and.returnValue(Promise.resolve(coordsMock));
        const promise = LocationInfo.getLocationInfo();
        promise.then((location) => {
            expect(location.latitude).toEqual(coordsMock.latitude);
            expect(location.longitude).toEqual(coordsMock.longitude);
            done();
        }, () => {
            throw new Error("Promise should call resolve");
        });
    });
});
