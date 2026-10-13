/* eslint-disable @typescript-eslint/no-explicit-any */

import axios, { AxiosInstance } from "axios";
import MockAdapter from "axios-mock-adapter";
import axiosRetryHandler from "../../src/Utils/axiosRetryHandler";

describe("axiosRetryHandler retry delay and 429 handling", () => {
    const url = "https://contoso.test/livechatconnector/config";
    const jitterRandomValue = 0.5;
    const expectedJitterInMs = 500;
    let axiosInstance: AxiosInstance;
    let mock: MockAdapter;
    let retryDelays: number[];

    beforeEach(() => {
        axiosInstance = axios.create();
        mock = new MockAdapter(axiosInstance);
        retryDelays = [];

        spyOn(Math, "random").and.returnValue(jitterRandomValue);

        // Record the delay axios-retry schedules, but fire immediately so specs don't wait real seconds
        const originalSetTimeout = window.setTimeout.bind(window);
        spyOn(window, "setTimeout").and.callFake(((handler: () => void, timeout?: number) => {
            retryDelays.push(timeout as number);
            return originalSetTimeout(handler, 0);
        }) as any);
    });

    afterEach(() => {
        mock.restore();
    });

    it("waits retry-after seconds (not seconds x waitTime) plus jitter on a 429 with a numeric retry-after", async () => {
        axiosRetryHandler(axiosInstance, { retries: 3, retryOn429: true, waitTimeInMsBetweenRetries: 3000 });
        mock.onGet(url).replyOnce(429, {}, { "retry-after": "2" }).onGet(url).replyOnce(200, { ok: true });

        const response = await axiosInstance.get(url);

        expect(response.status).toBe(200);
        expect(mock.history.get.length).toBe(2);
        expect(retryDelays).toEqual([2000 + expectedJitterInMs]);
    });

    it("waits until the retry-after date plus jitter on a 429 with an HTTP-date retry-after", async () => {
        axiosRetryHandler(axiosInstance, { retries: 3, retryOn429: true, waitTimeInMsBetweenRetries: 1000 });
        const retryAfterDate = new Date(Date.now() + 10000).toUTCString();
        mock.onGet(url).replyOnce(429, {}, { "retry-after": retryAfterDate }).onGet(url).replyOnce(200, { ok: true });

        const response = await axiosInstance.get(url);

        expect(response.status).toBe(200);
        expect(retryDelays.length).toBe(1);
        // HTTP-date has second precision, so the wait is between 9s and 10s before jitter
        expect(retryDelays[0]).toBeGreaterThan(8000 + expectedJitterInMs);
        expect(retryDelays[0]).toBeLessThanOrEqual(10000 + expectedJitterInMs);
    });

    it("falls back to 5s plus jitter on a 429 without a retry-after header", async () => {
        axiosRetryHandler(axiosInstance, { retries: 3, retryOn429: true, waitTimeInMsBetweenRetries: 1000 });
        mock.onGet(url).replyOnce(429).onGet(url).replyOnce(200, { ok: true });

        const response = await axiosInstance.get(url);

        expect(response.status).toBe(200);
        expect(retryDelays).toEqual([5000 + expectedJitterInMs]);
    });

    it("adds jitter to exponential backoff on a 5xx", async () => {
        axiosRetryHandler(axiosInstance, { retries: 3, waitTimeInMsBetweenRetries: 1000 });
        mock.onGet(url).replyOnce(503).onGet(url).replyOnce(503).onGet(url).replyOnce(200, { ok: true });

        await axiosInstance.get(url);

        expect(retryDelays).toEqual([2000 + expectedJitterInMs, 4000 + expectedJitterInMs]);
    });

    it("stops after the configured number of retries when 429s persist", async () => {
        axiosRetryHandler(axiosInstance, { retries: 2, retryOn429: true, waitTimeInMsBetweenRetries: 1000 });
        mock.onGet(url).reply(429);

        await expectAsync(axiosInstance.get(url)).toBeRejected();

        // 1 initial request + 2 retries
        expect(mock.history.get.length).toBe(3);
        expect(retryDelays.length).toBe(2);
    });

    it("does not retry a 429 when retryOn429 is false", async () => {
        axiosRetryHandler(axiosInstance, { retries: 3, retryOn429: false, waitTimeInMsBetweenRetries: 1000 });
        mock.onGet(url).reply(429);

        await expectAsync(axiosInstance.get(url)).toBeRejected();

        expect(mock.history.get.length).toBe(1);
        expect(retryDelays.length).toBe(0);
    });

    it("does not retry a 429 when retryOn429 is not set", async () => {
        axiosRetryHandler(axiosInstance, { retries: 3, waitTimeInMsBetweenRetries: 1000 });
        mock.onGet(url).reply(429);

        await expectAsync(axiosInstance.get(url)).toBeRejected();

        expect(mock.history.get.length).toBe(1);
    });
});
