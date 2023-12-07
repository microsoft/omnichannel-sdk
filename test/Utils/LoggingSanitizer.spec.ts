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
          },
          longitude: "",
          latitude: ""
        };

        const configObject = {
          method: "get",
          headers: {
            Accept: "application/json, text/plain, */*",
            AuthenticatedUserToken: "authenticatedUserToken",
            AuthCodeNonce: "authCodeNonce"
          },
          data: JSON.stringify(data)
        };

        const errorObject = {
            message: "Request failed with status code 401",
            name: "Error",
            config: configObject,
            response: {
              config: configObject
            },
            isAxiosError: true
        }

        LoggingSanitizer.stripErrorSensitiveProperties(errorObject);
        expect(errorObject["config"]["headers"]["AuthenticatedUserToken"]).toEqual(Constants.hiddenContentPlaceholder);
        expect(errorObject["config"]["headers"]["AuthCodeNonce"]).toEqual(Constants.hiddenContentPlaceholder);
        expect(JSON.parse(errorObject["config"]["data"])["preChatResponse"]["Type"]).toEqual(data["preChatResponse"]["Type"]);
        expect(JSON.parse(errorObject["config"]["data"])["preChatResponse"]["foo"]).toEqual(Constants.hiddenContentPlaceholder);
        expect(JSON.parse(errorObject["config"]["data"])["preChatResponse"]["bar"]).toEqual(Constants.hiddenContentPlaceholder);
        expect(JSON.parse(errorObject["config"]["data"])["customContextData"]["contextKey"]["value"]).toEqual(Constants.hiddenContentPlaceholder);
        expect(JSON.parse(errorObject["config"]["data"])["longitude"]).toEqual(Constants.hiddenContentPlaceholder);
        expect(JSON.parse(errorObject["config"]["data"])["longitude"]).toEqual(Constants.hiddenContentPlaceholder);

        expect(errorObject["response"]["config"]["headers"]["AuthenticatedUserToken"]).toEqual(Constants.hiddenContentPlaceholder);
        expect(errorObject["response"]["config"]["headers"]["AuthCodeNonce"]).toEqual(Constants.hiddenContentPlaceholder);
        expect(JSON.parse(errorObject["response"]["config"]["data"])["preChatResponse"]["Type"]).toEqual(data["preChatResponse"]["Type"]);
        expect(JSON.parse(errorObject["response"]["config"]["data"])["preChatResponse"]["foo"]).toEqual(Constants.hiddenContentPlaceholder);
        expect(JSON.parse(errorObject["response"]["config"]["data"])["preChatResponse"]["bar"]).toEqual(Constants.hiddenContentPlaceholder);
        expect(JSON.parse(errorObject["response"]["config"]["data"])["customContextData"]["contextKey"]["value"]).toEqual(Constants.hiddenContentPlaceholder);
        expect(JSON.parse(errorObject["response"]["config"]["data"])["longitude"]).toEqual(Constants.hiddenContentPlaceholder);
        expect(JSON.parse(errorObject["response"]["config"]["data"])["longitude"]).toEqual(Constants.hiddenContentPlaceholder);
        done();
    });

    it("Test when authentication token is an object", (done) => {
        const configObject = {
          "method": "get",
          "headers": {
            "Accept": "application/json, text/plain, */*",
            "AuthenticatedUserToken": {}
          },
        };

        const errorObject = {
            message: "Request failed with status code 401",
            name: "Error",
            config: configObject,
            response: {
              config: configObject
            },
            isAxiosError: true
        }
        LoggingSanitizer.stripErrorSensitiveProperties(errorObject);
        expect(errorObject["config"]["headers"]["AuthenticatedUserToken"]).toEqual(Constants.hiddenContentPlaceholder);
        expect(errorObject["response"]["config"]["headers"]["AuthenticatedUserToken"]).toEqual(Constants.hiddenContentPlaceholder);
        done();
    });

    it("Test process error object when error is null", (done) => {
        const errorObject = null
        LoggingSanitizer.stripErrorSensitiveProperties(errorObject);
        expect(errorObject).toEqual(null);
        done();
    });

    it("Test process error object when headers is undefined", (done) => {
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
        },
        longitude: "",
        latitude: ""
      };

      const configObject = {
        method: "get",
        data: JSON.stringify(data)
      };

      const errorObject = {
          message: "Request failed with status code 401",
          name: "Error",
          config: configObject,
          response: {
            config: configObject
          },
          isAxiosError: true
      }

      LoggingSanitizer.stripErrorSensitiveProperties(errorObject);

      expect(errorObject["config"]["headers"]).toBeUndefined();
      expect(JSON.parse(errorObject["config"]["data"])["preChatResponse"]["Type"]).toEqual(data["preChatResponse"]["Type"]);
      expect(JSON.parse(errorObject["config"]["data"])["preChatResponse"]["foo"]).toEqual(Constants.hiddenContentPlaceholder);
      expect(JSON.parse(errorObject["config"]["data"])["preChatResponse"]["bar"]).toEqual(Constants.hiddenContentPlaceholder);
      expect(JSON.parse(errorObject["config"]["data"])["customContextData"]["contextKey"]["value"]).toEqual(Constants.hiddenContentPlaceholder);
      expect(JSON.parse(errorObject["config"]["data"])["longitude"]).toEqual(Constants.hiddenContentPlaceholder);
      expect(JSON.parse(errorObject["config"]["data"])["longitude"]).toEqual(Constants.hiddenContentPlaceholder);

      expect(errorObject["response"]["config"]["headers"]).toBeUndefined();
      expect(JSON.parse(errorObject["response"]["config"]["data"])["preChatResponse"]["Type"]).toEqual(data["preChatResponse"]["Type"]);
      expect(JSON.parse(errorObject["response"]["config"]["data"])["preChatResponse"]["foo"]).toEqual(Constants.hiddenContentPlaceholder);
      expect(JSON.parse(errorObject["response"]["config"]["data"])["preChatResponse"]["bar"]).toEqual(Constants.hiddenContentPlaceholder);
      expect(JSON.parse(errorObject["response"]["config"]["data"])["customContextData"]["contextKey"]["value"]).toEqual(Constants.hiddenContentPlaceholder);
      expect(JSON.parse(errorObject["response"]["config"]["data"])["longitude"]).toEqual(Constants.hiddenContentPlaceholder);
      expect(JSON.parse(errorObject["response"]["config"]["data"])["longitude"]).toEqual(Constants.hiddenContentPlaceholder);
      done();
    });

    it("Test process error object when payload is undefined", (done) => {
      const configObject = {
        method: "get",
        headers: {
          Accept: "application/json, text/plain, */*",
          AuthenticatedUserToken: "authenticatedUserToken",
          AuthCodeNonce: "authCodeNonce"
        },
      };

      const errorObject = {
          message: "Request failed with status code 401",
          name: "Error",
          config: configObject,
          response: {
            config: configObject
          },
          isAxiosError: true
      }

      LoggingSanitizer.stripErrorSensitiveProperties(errorObject);
      expect(errorObject["config"]["headers"]["AuthenticatedUserToken"]).toEqual(Constants.hiddenContentPlaceholder);
      expect(errorObject["config"]["headers"]["AuthCodeNonce"]).toEqual(Constants.hiddenContentPlaceholder);

      expect(errorObject["response"]["config"]["headers"]["AuthenticatedUserToken"]).toEqual(Constants.hiddenContentPlaceholder);
      expect(errorObject["response"]["config"]["headers"]["AuthCodeNonce"]).toEqual(Constants.hiddenContentPlaceholder);
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

  describe("Test removal of geolocation data values", () => {
    it("Geolocation data values should be removed", (done) => {
      const data = {
        longitude: "",
        latitude: ""
      };

      LoggingSanitizer.stripGeolocation(data);
      expect(data.longitude).toEqual(Constants.hiddenContentPlaceholder);
      expect(data.latitude).toEqual(Constants.hiddenContentPlaceholder);
      done();
    });
  });
});
