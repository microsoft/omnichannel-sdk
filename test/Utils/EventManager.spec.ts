/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import EventManager from "../../src/Utils/EventManager";

describe("EventManager unit tests", () => {

    const eventName = "SomeExcitingEvent";
    const payload = { someInfo: "info" };
    const mockEvent: any = {
        initCustomEvent: () => {}
    };
    const mockDocument: any = () => {
        return {
            createEvent: () => {}
        };
    };

    it("Should dispatch event", () => {
        const privateSpy = spyOn<any>(EventManager, "createCustomEvent").and.returnValue({eventName});
        spyOn<any>(window, "dispatchEvent").and.callFake(() => {});
        EventManager.raiseCustomEvent(eventName, payload);
        expect(privateSpy).toHaveBeenCalledWith(eventName, payload);
        expect(window.dispatchEvent).toHaveBeenCalled();
    });

    it("Should create custom event", () => {
        CustomEvent = class CustomEventMock{
            constructor(a: string, b: any){
                return mockEvent;
            }
        } as any;
        spyOn<any>(window, "dispatchEvent").and.callFake(() => {});
        EventManager.raiseCustomEvent("", null);
        expect(window.dispatchEvent).toHaveBeenCalled();
        expect(window.dispatchEvent).toHaveBeenCalledWith(mockEvent);
    });

    it("Should create event using document in case of exception", () => {
        CustomEvent = class CustomEventMockWithError{
            constructor(a: string, b: any) {
                throw Error("error");
            }
        } as any;
        spyOn<any>(window, "dispatchEvent").and.callFake(() => {});
        spyOn<any>(document, "createEvent").and.callFake(() => mockEvent);
        spyOn(mockEvent, "initCustomEvent").and.callFake(() => {});
        EventManager.raiseCustomEvent("", null);
        expect(mockEvent.initCustomEvent).toHaveBeenCalledWith("", true, true, undefined);
        expect(window.dispatchEvent).toHaveBeenCalled();
        expect(window.dispatchEvent).toHaveBeenCalledWith(mockEvent);
    });

    it("Should create event using document in case of exception with valid payload", () => {
        CustomEvent = class CustomEventMockWithError{
            constructor(a: string, b: any) {
                throw Error("error");
            }
        } as any;
        const eventDetails = { detail: payload };
        spyOn<any>(window, "dispatchEvent").and.callFake(() => {});
        spyOn<any>(document, "createEvent").and.callFake(() => mockEvent);
        spyOn(mockEvent, "initCustomEvent").and.callFake(() => {});
        EventManager.raiseCustomEvent(eventName, payload);
        expect(mockEvent.initCustomEvent).toHaveBeenCalledWith(eventName, true, true, eventDetails);
    });
});
