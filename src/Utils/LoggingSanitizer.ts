import Constants from "../Common/Constants";

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

  public static stripErrorSensitiveProperties(errorObject: any): void { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    if(errorObject && typeof errorObject === 'object' && Object.keys(errorObject)?.length > 0) {
      Object.keys(errorObject)?.forEach((key) => {
          if (Constants.sensitiveProperties.indexOf(key) !== -1) {
            // remove sensitive properties from error object
            delete errorObject[`${key}`];
          }

          if (key === 'data') {
            let data;
            if (typeof errorObject[key] === 'string') { // eslint-disable-line security/detect-object-injection
              try {
                data = JSON.parse(errorObject[key]); // eslint-disable-line security/detect-object-injection
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
              errorObject[key] = JSON.stringify(data); // eslint-disable-line security/detect-object-injection
            }
          }

          if (errorObject[`${key}`] !== null && typeof errorObject[`${key}`] === 'object') {
            // check sensitive properties in nested error object
            this.stripErrorSensitiveProperties(errorObject[`${key}`]);
            return;
          }
      });
    }
  }
}