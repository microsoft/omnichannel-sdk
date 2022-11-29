/* eslint-disable @typescript-eslint/no-explicit-any*/
import HTTPTimeoutError from "./customErrors/HTTPTimeoutError";

export class AxiosErrorThrower {
    public static getSDKError(error: any) {
        if (error.code === "ECONNABORTED") {
            return new HTTPTimeoutError(error);
        } else {
            return error;
        }
    }
}