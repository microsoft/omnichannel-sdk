import { AxiosError } from "axios";
import { AxiosInstance, AxiosResponse } from "axios";
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
  const retryInterval = 1000; // 1 second interval between retries

  // Default values
  if (axiosRetryOptions.retryOn429 === undefined || axiosRetryOptions.retryOn429 === null) {
    axiosRetryOptions.retryOn429 = true;
  }

  const { retries } = axiosRetryOptions;

  let currentTry = 0;

  // Method to intercepts responses within range of 2xx
  const onSuccess = undefined;

  // Method to intercepts responses outside range of 2xx
  const onError = (error: AxiosError) => {
    const {config, response} = error;

    // If we have no information of the request to retry
    if (!config) {
      return Promise.reject(error);
    }

    // Stop retry on 429 if set
    if (response && response.status === Constants.tooManyRequestsStatusCode && axiosRetryOptions.retryOn429 === false) {
      return Promise.reject(error);
    }

    // Retry request if below threshold
    const shouldRetry = currentTry < retries;

    if (shouldRetry) {
      currentTry++;
      return new Promise((resolve) => sleep(retryInterval as number| 1000).then(() => resolve(axios(config))));
    }

    return Promise.reject(error);
  };

  axios.interceptors.response.use(onSuccess, onError);
};

export default axiosRetry;
