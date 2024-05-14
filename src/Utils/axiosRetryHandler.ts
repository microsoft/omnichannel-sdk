import { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import axiosRetry from "axios-retry"
import Constants from "../Common/Constants";
import IAxiosRetryOptions from "../Interfaces/IAxiosRetryOptions";
import sleep from "./sleep";

/**
 * Custom handler for HTTP calls with Axios. Handler allows to retry HTTP calls if failed.
 *
 * @param axios Axios instance.
 * @param axiosRetryOptions Options for axios retry.
 */
const axiosRetryHandler = (axios: AxiosInstance, axiosRetryOptions: IAxiosRetryOptions) => { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types

  // Default values
  if (axiosRetryOptions.retryOn429 === undefined || axiosRetryOptions.retryOn429 === null) {
    axiosRetryOptions.retryOn429 = true;
  }


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
  axiosRetry(axios,{
    retries: axiosRetryOptions.retries,
    retryCondition: axiosRetryOptions.shouldRetry,
    onRetry: (retryCount:number,error:AxiosError,requestConfig:AxiosRequestConfig) =>{
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
    retryDelay:(retryCount:number, error:AxiosError) => {
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
      }
      return retryAfterTime;
    },
   
  })
   
};
export default axiosRetryHandler;