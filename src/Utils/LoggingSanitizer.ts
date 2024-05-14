import Constants from "../Common/Constants";
import OmnichannelHTTPHeaders from "../Common/OmnichannelHTTPHeaders";

export class LoggingSanitizer {
  public static stripCustomContextDataValues(customContextData: any): void { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    if (customContextData) {
      Object.keys(customContextData)?.forEach((contextKey: string) => {
        if (customContextData[`${contextKey}`]?.value) {
          customContextData[`${contextKey}`].value = Constants.hiddenContentPlaceholder;
        }
      });
    }
  }

  public static stripPreChatResponse(preChatResponse: any): void { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    if (preChatResponse) {
      Object.keys(preChatResponse).forEach((responseKey) => {
        if (preChatResponse[`${responseKey}`] && responseKey !== 'Type') {
          preChatResponse[`${responseKey}`] = Constants.hiddenContentPlaceholder;
        }
      });
    }
  }

  public static stripGeolocation(data: any): void { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    if (data) {
      if (Object.keys(data).includes('longitude')) {
        data['longitude'] = Constants.hiddenContentPlaceholder;
      }

      if (Object.keys(data).includes('latitude')) {
        data['latitude'] = Constants.hiddenContentPlaceholder;
      }
    }
  }

  public static stripAuthenticationUserToken(headers: any): void { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    if (headers) {
      if (Object.keys(headers).includes(OmnichannelHTTPHeaders.authenticatedUserToken)) {
        headers[OmnichannelHTTPHeaders.authenticatedUserToken] = Constants.hiddenContentPlaceholder;
      }

      if (Object.keys(headers).includes(OmnichannelHTTPHeaders.authCodeNonce)) {
        headers[OmnichannelHTTPHeaders.authCodeNonce] = Constants.hiddenContentPlaceholder;
      }
    }
  }

  public static stripRequestHeadersSensitiveProperties(headers: any): void { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    console.log("[stripRequestHeadersSensitiveProperties]");
    console.log(headers);
    LoggingSanitizer.stripAuthenticationUserToken(headers);

    if (Object.keys(headers).includes(OmnichannelHTTPHeaders.authorization)) {
      headers[OmnichannelHTTPHeaders.authorization] = Constants.hiddenContentPlaceholder;
    }
  }

  public static stripRequestPayloadData(configObject: any): void {  // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    if (configObject?.data) {
      let data;
      if (typeof configObject.data === 'string') { // eslint-disable-line security/detect-object-injection
        try {
          data = JSON.parse(configObject.data); // eslint-disable-line security/detect-object-injection
        } catch {
          data = undefined;
        }
      }

      if (data) {
        if (Object.keys(data).includes('preChatResponse')) {
          LoggingSanitizer.stripPreChatResponse(data.preChatResponse);
        }

        if (Object.keys(data).includes('customContextData')) {
          LoggingSanitizer.stripCustomContextDataValues(data.customContextData);
        }

        LoggingSanitizer.stripGeolocation(data);
        configObject.data = JSON.stringify(data); // eslint-disable-line security/detect-object-injection
      }
    }
  }

  public static stripAxiosErrorSensitiveProperties(errorObject: any): void { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    if (errorObject.isAxiosError) {
      if (errorObject?.config?.headers) {
        LoggingSanitizer.stripAuthenticationUserToken(errorObject?.config?.headers);
      }

      if (errorObject?.config?.data) {
        this.stripRequestPayloadData(errorObject?.config);
      }

      if (errorObject?.response?.config?.data) {
        this.stripRequestPayloadData(errorObject?.response?.config);
      }

      if (errorObject?.response?.config?.headers) {
        LoggingSanitizer.stripAuthenticationUserToken(errorObject?.response?.config?.headers);
      }
    }
  }

  public static stripErrorSensitiveProperties(errorObject: any): void { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    if (errorObject && typeof errorObject === 'object' && Object.keys(errorObject)?.length > 0) {
      this.stripAxiosErrorSensitiveProperties(errorObject);
    }
  }
}
