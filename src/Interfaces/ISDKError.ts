import { AxiosError } from "axios";

export default interface ISDKError extends Error{
    /**
     * Error Code
     */
    code: number;
    /**
     * Error Message
     */
    message: string;
    /**
     * Encapsulating Error Object
     */
    object?: AxiosError;
    /**
     * Convert error object to string
     */
    toString: () => string;
}