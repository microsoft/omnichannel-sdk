/* eslint-disable @typescript-eslint/no-explicit-any*/
import { AxiosError } from "axios";
import { SDKError } from "../../Common/Constants";
import { SDKErrorCodes } from "../../Common/Enums";
import ISDKError from "../../Interfaces/ISDKError";

export default class HTTPTimeoutError implements ISDKError {
    readonly code: number;
    readonly message: string;
    readonly name: string;
    public stack?: string | undefined;
    public object: AxiosError<any> | undefined;
    
    public constructor(error: AxiosError, message?: string) {
        this.name = SDKError.HTTPTimeoutErrorName;
        this.code = SDKErrorCodes.HTTPTIMEOUTERRORCODE;
        this.message = message ?? SDKError.HTTPTimeoutErrorMessage;
        this.object = error;
        this.stack = error.stack;
    }

    public toString() {
        return this.code + ":" + this.name +"-"+ this.message;
    }
}