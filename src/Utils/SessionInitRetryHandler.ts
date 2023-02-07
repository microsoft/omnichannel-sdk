/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from "axios";
import Constants from "../Common/Constants";
import IAxiosRetryOptions from "../Interfaces/IAxiosRetryOptions";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const sessionInitRetryHandler = (response: AxiosResponse<any> | undefined, axiosRetryOptions: IAxiosRetryOptions) => {
    if (response?.status) {
        switch (response.status) {
            case Constants.tooManyRequestsStatusCode:
                if (axiosRetryOptions && axiosRetryOptions.retryOn429 === false) {
                    return false;
                }
                break;
            case Constants.badRequestStatusCode:
                if (parseInt(response.headers.errorcode) === Constants.outOfOfficeErrorCode) {
                    return false;
                }
                break;
            default: return true;
        }
    }
    return true;
}
export default sessionInitRetryHandler;