import { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import axiosRetry, { isNetworkError } from "axios-retry";
import Constants from "../Common/Constants";
import IAxiosRetryOptions from "../Interfaces/IAxiosRetryOptions";

/**
 * Determines if the error is retryable.
 *
 * @param error The Axios error.
 * @param retryOn429 Flag to indicate if retries should be attempted on 429 status code.
 * @returns True if the error is retryable, otherwise false.
 */
const shouldRetry = (error: AxiosError, retryOn429: boolean | undefined): boolean => {
  // Define default behavior for 429 retries in case the handler was not included by the caller.
  if (error.response?.status === Constants.tooManyRequestsStatusCode && !retryOn429) {
    return false;
  }
  return isRetryableError(error) || isNetworkError(error) || error.response?.status === 0 || !error.response?.status;
};

/**
 * Custom handler for HTTP calls with Axios. Handler allows retrying HTTP calls if they fail.
 *
 * @param axios Axios instance.
 * @param axiosRetryOptions Options for axios retry.
 */
const axiosRetryHandler = (axios: AxiosInstance, axiosRetryOptions: IAxiosRetryOptions) => { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types

  // Default values
  if (axiosRetryOptions.retryOn429 === undefined || axiosRetryOptions.retryOn429 === null) {
    axiosRetryOptions.retryOn429 = false;
  }


  if (!axiosRetryOptions.shouldRetry) {
    axiosRetryOptions.shouldRetry = (error) => shouldRetry(error, axiosRetryOptions.retryOn429);
  }

  // Method to intercept responses outside the range of 2xx
  axiosRetry(axios, {
    retries: axiosRetryOptions.retries,
    retryCondition: axiosRetryOptions.shouldRetry,
    onRetry: (retryCount: number, error: AxiosError, requestConfig: AxiosRequestConfig) => {
      const { response } = error;
      const { headerOverwrites } = axiosRetryOptions;
      if (headerOverwrites && response?.headers) {
        for (const headerName of headerOverwrites) {
          const responseHeader = response?.headers[headerName.toLocaleLowerCase()];
          if (responseHeader && requestConfig.headers) {
            requestConfig.headers[headerName] = responseHeader;
          }
        }
      }
    },
    retryDelay: (retryCount: number, error: AxiosError) => {
      const timeBetweenRetry = axiosRetryOptions.waitTimeInMsBetweenRetries;
      const retryAfterHeader = error?.response?.headers?.["retry-after"];
      let retryAfterTime = timeBetweenRetry;

      if (retryAfterHeader) {
        const retryAfterValue = parseInt(retryAfterHeader);
        if (!isNaN(retryAfterValue)) {
          retryAfterTime = retryAfterValue * timeBetweenRetry;
        } else {
          const retryAfterDate = new Date(retryAfterHeader);
          const currentTime = new Date().getTime();

          if (retryAfterDate && retryAfterDate instanceof Date && isFinite(retryAfterDate.getTime())) {
            retryAfterTime = Math.max(0, retryAfterDate.getTime() - currentTime);
          }
        }
        return retryAfterTime;
      }
      if (error.response?.status === Constants.tooManyRequestsStatusCode) {
        // Retry after 5 seconds for 429 status code
        return 5000;
      }
      return Math.pow(2, retryCount) * timeBetweenRetry;
    },
  });
};

export function isRetryableError(error: AxiosError): boolean {
  return (
    error.code !== 'ECONNABORTED' &&
    (!error.response ||
      error.response.status === 429 ||
      (error.response.status >= 500 && error.response.status <= 599))
  );
}

export function axiosRetryHandlerWithNotFound(axios: AxiosInstance, axiosRetryOptions: IAxiosRetryOptions): void {
  axiosRetryHandler(axios, {
    retries: axiosRetryOptions.retries,
    waitTimeInMsBetweenRetries: axiosRetryOptions.waitTimeInMsBetweenRetries,
    shouldRetry: (error) => shouldRetry(error, axiosRetryOptions.retryOn429) || error.response?.status === Constants.notFoundStatusCode,
  });
}

export default axiosRetryHandler;
