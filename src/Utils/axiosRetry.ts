import { AxiosInstance, AxiosResponse } from "axios";
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
  const { retries } = axiosRetryOptions;

  let currentTry = 0;

  // Method to intercepts responses within range of 2xx
  const onSuccess = undefined;

  // Method to intercepts responses outside range of 2xx
  const onError = (error: AxiosResponse) => {
    const {config} = error;

    // If we have no information of the request to retry
    if (!config) {
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
