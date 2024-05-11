/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError, AxiosResponse } from "axios";
import Constants from "../Common/Constants";
import IAxiosRetryOptions from "../Interfaces/IAxiosRetryOptions";
import { IAxiosRetryConfig } from "axios-retry";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const sessionInitRetryHandler = (error:AxiosError,retryOn429:boolean|undefined) => {
    if (error.response?.status) {
        switch (error.response.status) {
            case Constants.tooManyRequestsStatusCode:
                if (!retryOn429) {
                    return false;
                }
                break;
            case Constants.badRequestStatusCode:
                if (parseInt(error.response.headers.errorcode) === Constants.outOfOfficeErrorCode) {
                    return false;
                }
                break;
            default: return true;
        }
    }
    return true;
}
export default sessionInitRetryHandler;