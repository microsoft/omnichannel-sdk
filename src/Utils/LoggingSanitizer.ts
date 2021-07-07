import Constants from "../Common/Constants";

export class LoggingSanitizer  {
  public static stripErrorSensitiveProperties(errorObject: any): void { // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    if(errorObject && typeof errorObject === 'object' && Object.keys(errorObject)?.length > 0) {
      Object.keys(errorObject)?.forEach( (key) => {
          if (Constants.sensitiveProperties.indexOf(key) !== -1) {
            // remove sensitive properties from error object
            delete errorObject[`${key}`];
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
