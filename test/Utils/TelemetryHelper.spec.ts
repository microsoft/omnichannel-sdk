import TelemetryHelper from "../../src/Utils/TelemetryHelper";

describe("Test Utils TelemetryHelper", () => {
    const telemetryEvent = "Test Event";
    const description = "Test Description";
    const customData = {
        ElapsedTimeInMilliseconds: 200,
        ExceptionDetails: {ErrorDetails: "test Error"},
        Region: "Test Region",
        RequestId: "Test RequestId",
        TransactionId: "Test TransactionId"
    };

    it("Telemetry data should be returned with valid values", () => {
        const eventData = TelemetryHelper.GETTELEMETRYEVENTDATA(telemetryEvent, customData, description);
        expect(eventData.Description).toEqual(description);
        expect(eventData.ElapsedTimeInMilliseconds).toEqual(customData.ElapsedTimeInMilliseconds);
        expect(eventData.Event).toEqual(telemetryEvent);
        expect(eventData.ExceptionDetails).toEqual(customData.ExceptionDetails);
        expect(eventData.Region).toEqual(customData.Region);
        expect(eventData.RequestId).toEqual(customData.RequestId);
        expect(eventData.TransactionId).toEqual(customData.TransactionId);
    });
});
