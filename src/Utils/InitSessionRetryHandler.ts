/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from "axios";
import Constants from "../Common/Constants";
import IAxiosRetryOptions from "../Interfaces/IAxiosRetryOptions";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const initSessionRetryHandler = (response: AxiosResponse<any> | undefined, axiosRetryOptions: IAxiosRetryOptions) => {
    console.log("ELOPEZANAYA initSessionRetryHandler");
    if (response && response.status) {
        console.log("ELOPEZANAYA initSessionRetryHandler : status :" + response.status);
        switch (response.status) {
            case Constants.tooManyRequestsStatusCode:
                if (axiosRetryOptions && axiosRetryOptions.retryOn429 === false) {
                    console.log("ELOPEZANAYA initSessionRetryHandler : rejecting on 429");

                    return false;
                }
                break;
            case 400:
                if (parseInt(response.headers.errorcode) === Constants.outOfOfficeErrorCode) {
                    console.log("ELOPEZANAYA initSessionRetryHandler : rejecting on 705");
                    return false;
                }
                break;
            default: return true;
        }
    }
    console.log("ELOPEZANAYA initSessionRetryHandler : all good");

    return true;

}
export default initSessionRetryHandler;