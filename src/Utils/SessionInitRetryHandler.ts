/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError } from "axios";
import Constants from "../Common/Constants";
import { isNetworkError } from "axios-retry"
import { isRetryableError } from "../Utils/axiosRetryHandler";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const sessionInitRetryHandler = (error: AxiosError, retryOn429: boolean | undefined) => {
    if (error?.response?.status) {
        switch (error.response.status) {
            case Constants.tooManyRequestsStatusCode:
                if (retryOn429 === false) {
                    return false;
                }
                break;
            case Constants.badRequestStatusCode:
                if (parseInt(error.response.headers.errorcode) === Constants.outOfOfficeErrorCode) {
                    return false;
                }
                break;
            default: return isRetryableError(error) || isNetworkError(error) || error.response?.status == 0 || !error.response?.status;
        }
    }
    return isRetryableError(error) || isNetworkError(error) || error.response?.status == 0 || !error.response?.status;
}
export default sessionInitRetryHandler;