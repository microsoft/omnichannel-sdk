import { AxiosError, AxiosInstance } from "axios";

import Constants from "../Common/Constants";
import IAxiosRetryOptions from "../Interfaces/IAxiosRetryOptions";
import sleep from "./sleep";

/**
 * Custom handler for HTTP calls with Axios. Handler allows to retry HTTP calls if failed.
 *
 * @param axios Axios instance.
 * @param axiosRetryOptions Options for axios retry.
 */
const axiosRetry = (axios: AxiosInstance, axiosRetryOptions: IAxiosRetryOptions) => { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types

  // Default values
  if (axiosRetryOptions.retryOn429 === undefined || axiosRetryOptions.retryOn429 === null) {
    axiosRetryOptions.retryOn429 = true;
  }

  const { retries, headerOverwrites } = axiosRetryOptions;

  let currentTry = 1; // Executed as soon as after 1st try

  // Method to intercepts responses within range of 2xx
  const onSuccess = undefined;

  // define default behaviour for 429 retries in case the handler was not included by the caller.
  if (!axiosRetryOptions.shouldRetry) {
    axiosRetryOptions.shouldRetry = (response) => {
      if (response?.status && response.status === Constants.tooManyRequestsStatusCode && axiosRetryOptions.retryOn429 === false) {
        return false;
      }
      return true;
    }
  }

  // Method to intercepts responses outside range of 2xx
  const onError = (error: AxiosError) => {

    const { config, response } = error;
    // If we have no information of the request to retry
    if (!config) {
      return Promise.reject(error);
    }

    // Evaluates if execution should stop according to the conditions defined in the handler
    if (axiosRetryOptions.shouldRetry && !axiosRetryOptions.shouldRetry(response)) {
      return Promise.reject(error);
    }
    // Retry request if below threshold
    const shouldRetry = currentTry < retries;

    if (shouldRetry) {
      currentTry++;

      if (headerOverwrites && response?.headers) {
        for (const headerName of headerOverwrites) {
          const responseHeader = response?.headers[headerName.toLocaleLowerCase()];
          if (responseHeader) {
            // eslint-disable-next-line security/detect-object-injection
            config.headers[headerName] = responseHeader;
          }
        }
      }

      return new Promise((resolve) => sleep(axiosRetryOptions.waitTimeInMsBetweenRetries).then(() => resolve(axios(config))));
    }
    return Promise.reject(error);
  };

  axios.interceptors.response.use(onSuccess, onError); // Intercept response before returning
};
export default axiosRetry;