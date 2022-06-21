import Constants from "../../src/Common/Constants";
import { LoggingSanitizer } from "../../src/Utils/LoggingSanitizer";

describe("LoggingSanitized unit tests", () => {
  describe("Test removal of sensitive properties from error object", () => {
    it("Error object should remove sensitive properties from logging details", (done) => {
        const data = {
          preChatResponse: {
            Type: "InputSubmit",
            foo: "foo",
            bar: "bar",
          },
          customContextData: {
            contextKey: {
              value: "value",
              isDisplayable: true
            },
          }
        };
        const errorObject = {
            message: "Request failed with status code 401",
            name: "Error",
            config: {
                method: "get",
                headers: {
                  Accept: "application/json, text/plain, */*",
                  AuthenticatedUserToken: "ew0KIsfqYWxnIjogIlJTMjU2IiwNCiAgInR5cCI6ICJKV1QiLA0KICAia2lkIjogIlpTdS8zcG1LWjJpSStmQmN6STkzU002Mm9VWmkvbkV5Zys4a0ZWaWkyVWs9Ig0KfQ.ew0KICAiaXNzIjogIjYzN2ZjYzlmLTRhOWItNGFhYS04NzEzLWEyYTNjZmRhMTUwNSIsDQogICJpYXQiOiAxNjI0ODcxMjA0LA0KICAibmJmIjogMTYyNDg3MTIwNCwNCiAgImV4cCI6IDE2MjQ5NTc2MDQsDQogICJzdWIiOiAiYjYyNTIyYjktNzI3ZC00MGE3LWI1ODgtOTk3OWQxM2Q3Mzc2IiwNCiAgIm9pZCI6ICJiNjI1MjJiOS03MjdkLTQwYTctYjU4OC05OTc5ZDEzZDczNzYiLA0KICAidGlkIjogImQ2OWUxZTkwLWZiZTUtNGI3YS1iNGI0LTVjZDM3NzdlMmVhMyIsDQogICJ1cG4iOiAiVENTQWRtaW5AVElQQWRtaW5BUEkub25taWNyb3NvZnQuY29tIiwNCiAgIkZpcnN0TmFtZSI6ICJBZG1pbiIsDQogICJMYXN0TmFtZSI6ICJUQ1MiLA0KICAibHdpY29udGV4dHMiOiB7DQogICAgIkNhc2VOdW1iZXIiOiB7DQogICAgICAidmFsdWUiOiAiMjEwNjI4MDA1MDAwMDkxOCIsDQogICAgICAiaXNEaXNwbGF5YWJsZSI6IHRydWUNCiAgICB9LA0KICAgICJDYXNlVGl0bGUiOiB7DQogICAgICAidmFsdWUiOiAiVGhpcyBpcyBhIHRlc3QgY2FzZSBjcmVhdGVkIGJ5IE1pY3Jvc29mdCBpbnRlcm5hbCB0ZXN0aW5nLiBQbGVhc2UgY2xvc2UgaW1tZWRpYXRlbHkgYW5kIG1ha2Ugc3VyZSB0byBzZXQgdGhlIGNsb3NlIHN0YXR1cyBhcyBEdXBsaWNhdGUiLA0KICAgICAgImlzRGlzcGxheWFibGUiOiB0cnVlDQogICAgfSwNCiAgICAiQWN0aXZlU3lzdGVtIjogew0KICAgICAgInZhbHVlIjogIkR5bmFtaWNzIiwNCiAgICAgICJpc0Rpc3BsYXlhYmxlIjogdHJ1ZQ0KICAgIH0sDQogICAgIkZpcnN0TmFtZSI6IHsNCiAgICAgICJ2YWx1ZSI6ICJBZG1pbiIsDQogICAgICAiaXNEaXNwbGF5YWJsZSI6IHRydWUNCiAgICB9LA0KICAgICJMYXN0TmFtZSI6IHsNCiAgICAgICJ2YWx1ZSI6ICJUQ1MiLA0KICAgICAgImlzRGlzcGxheWFibGUiOiB0cnVlDQogICAgfSwNCiAgICAiQ3VycmVudFVzZXJFbWFpbCI6IHsNCiAgICAgICJ2YWx1ZSI6ICJ2LWFrZGhvdUBtaWNyb3NvZnQuY29tIiwNCiAgICAgICJpc0Rpc3BsYXlhYmxlIjogdHJ1ZQ0KICAgIH0sDQogICAgIlByb2R1Y3ROYW1lIjogew0KICAgICAgInZhbHVlIjogIlBvd2VyIEF1dG9tYXRlIiwNCiAgICAgICJpc0Rpc3BsYXlhYmxlIjogdHJ1ZQ0KICAgIH0sDQogICAgIkNhdGVnb3J5Ijogew0KICAgICAgInZhbHVlIjogIkFwcHJvdmFscyIsDQogICAgICAiaXNEaXNwbGF5YWJsZSI6IHRydWUNCiAgICB9LA0KICAgICJTdWJDYXRlZ29yeSI6IHsNCiAgICAgICJ2YWx1ZSI6ICJXb3JraW5nIHdpdGggYXBwcm92YWwgZmxvd3MiLA0KICAgICAgImlzRGlzcGxheWFibGUiOiB0cnVlDQogICAgfSwNCiAgICAiU2V2ZXJpdHkiOiB7DQogICAgICAidmFsdWUiOiAiU2V2ZXJpdHlDIiwNCiAgICAgICJpc0Rpc3BsYXlhYmxlIjogdHJ1ZQ0KICAgIH0sDQogICAgIlNlcnZpY2VMZXZlbCI6IHsNCiAgICAgICJ2YWx1ZSI6ICJQcm9mZXNzaW9uYWwiLA0KICAgICAgImlzRGlzcGxheWFibGUiOiB0cnVlDQogICAgfSwNCiAgICAiTGFuZ3VhZ2UiOiB7DQogICAgICAidmFsdWUiOiAiZW4tVVMiLA0KICAgICAgImlzRGlzcGxheWFibGUiOiB0cnVlDQogICAgfSwNCiAgICAiTG9jYXRpb24iOiB7DQogICAgICAidmFsdWUiOiAiVVMiLA0KICAgICAgImlzRGlzcGxheWFibGUiOiB0cnVlDQogICAgfQ0KICB9DQp9.PPEtQu9Q5ZfPPXJKdkbm2s6y71sXaHKXect602--Ow2sLUtt6rzkUngmSyVCIRe-Vn39k5N5jDyNqhB21PeqXbBM2JrVBZEB59c98wM-6TUUJYfJkdWeCRBqW_35UhosMlzijYcL3yxacFxh2I0TMQnwpzYrh3QTtwAam1mnUsXJ2J8IeZrNSutSc34c7_g4u94mmW3gG7xjw22ARscOsqLiYINXeVBzj-DCdt3L9IY6xsjDl3ihGan2X6ECLoy6KMMIxsBfbGWAsBhZjwUTH3fZL6n5sb9Z60gKf_q2oI6tyrnCJAfG8WkyfrYukYpOUZZMxJE_l2liiRhInbMsJg"
                },
                data: JSON.stringify(data)
            }
        }

        LoggingSanitizer.stripErrorSensitiveProperties(errorObject);
        expect(errorObject["config"]["headers"]["AuthenticatedUserToken"]).toBeUndefined();
        expect(JSON.parse(errorObject["config"]["data"])["preChatResponse"]["Type"]).toEqual(data["preChatResponse"]["Type"]);
        expect(JSON.parse(errorObject["config"]["data"])["preChatResponse"]["foo"]).toEqual(Constants.hiddenContentPlaceholder);
        expect(JSON.parse(errorObject["config"]["data"])["preChatResponse"]["bar"]).toEqual(Constants.hiddenContentPlaceholder);
        expect(JSON.parse(errorObject["config"]["data"])["customContextData"]["contextKey"]["value"]).toEqual(Constants.hiddenContentPlaceholder);
        done();
    });

    it("Test when authentication token is an object", (done) => {
        const errorObject = {
            "message": "Request failed with status code 401",
            "name": "Error",
            "config": {
                "method": "get",
                "headers": {
                "Accept": "application/json, text/plain, */*",
                "AuthenticatedUserToken": {}
                },
            }
        }
        LoggingSanitizer.stripErrorSensitiveProperties(errorObject);
        expect(errorObject["config"]["headers"]["AuthenticatedUserToken"]).toBeUndefined();
        done();
    });

    it("Test process error object when error is null", (done) => {
        const errorObject = null
        LoggingSanitizer.stripErrorSensitiveProperties(errorObject);
        expect(errorObject).toEqual(null);
        done();
    });
  });

  describe("Test removal of custom context data values", () => {
    it("Custom context data values should be removed", (done) => {
      const customContextData = {
        contextKeyOne: {
          value: "value",
          isDisplayable: true
        },
        contextKeyTwo: {
          value: "value"
        },
        contextKeyThree: {
          isDisplayable: false
        }
      };

      LoggingSanitizer.stripCustomContextDataValues(customContextData);
      expect(customContextData.contextKeyOne.value).toEqual(Constants.hiddenContentPlaceholder);
      expect(customContextData.contextKeyTwo.value).toEqual(Constants.hiddenContentPlaceholder);
      expect(('value' in customContextData.contextKeyThree)).toBe(false);
      done();
    });
  });

  describe("Test removal of pre-chat survey response data values", () => {
    it("Pre-chat survey response data values should be removed", (done) => {
      const prechatResponse = {
        Type: "InputSubmit",
        foo: "foo",
        bar: "bar",
      }

      LoggingSanitizer.stripPreChatResponse(prechatResponse);
      expect(prechatResponse.Type).toEqual(prechatResponse.Type);
      expect(prechatResponse.foo).toEqual(Constants.hiddenContentPlaceholder);
      expect(prechatResponse.bar).toEqual(Constants.hiddenContentPlaceholder);
      done();
    });
  });
});
