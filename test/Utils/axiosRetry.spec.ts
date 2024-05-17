/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import { AxiosInstance, AxiosResponse } from "axios";
import axiosRetryHandler from "../../src/Utils/axiosRetryHandler";

xdescribe("axiosRetry unit tests", () => {
    let axiosMock: any;
    let axiosError: any;

    beforeAll(() => {
        axiosMock = { interceptors: { response: { use(success, error) { } } } } as AxiosInstance;
        axiosError = {} as AxiosResponse;
    });

    it("Test axiosRetry", () => {
        const useSpy = spyOn<any>(axiosMock.interceptors.response, "use").and.callFake(() => { });
        axiosRetryHandler(axiosMock, { retries: 2 } as any);
        expect(useSpy).toHaveBeenCalled();
    });

    it("Test axiosRetry with errors", () => {
        const useSpy = spyOn<any>(axiosMock.interceptors.response, "use").and.callFake((success: any, error: any) => { error(axiosError); });
        axiosRetryHandler(axiosMock, { retries: 2 } as any);
        expect(useSpy).toHaveBeenCalled();
    });
});
