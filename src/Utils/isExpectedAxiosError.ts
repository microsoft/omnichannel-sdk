import axios, { AxiosError } from "axios";

const isExpectedAxiosError = (error: unknown | AxiosError, validationRule: string): boolean => {
    try {
        if (axios.isAxiosError(error) && error.code == validationRule) {
            return true;
        }
    } catch (error) {
        return false;
    }

    return false;
};

export default isExpectedAxiosError;