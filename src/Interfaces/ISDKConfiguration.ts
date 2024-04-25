import { RequestTimeoutConfig } from "../Common/RequestTimeoutConfig";

export default interface ISDKConfiguration {
  [key: string]: number | string | boolean | RequestTimeoutConfig | undefined | string[];

  /**
   * Number of times a getchattoken request is retried.
   */
  getChatTokenRetryCount: number;
  /**
   * Time in milliseconds between getchattoken retry axios requests.
   */
  getChatTokenTimeBetweenRetriesOnFailure: number;
  /**
   * Whether to retry on getchattoken 429 HTTP status code response.
   */
  getChatTokenRetryOn429: boolean;
  /**
   * Maximum number of request retries before failing.
   */
  maxRequestRetriesOnFailure: number;
  /**
   * Default timeout for all requests
   */
  defaultRequestTimeout: number | undefined;
  /**
   * Individual Request timeouts
   */
  requestTimeoutConfig: RequestTimeoutConfig;
  /**
   * Nonce for Auth V2 requests
   */
  authCodeNonce: string;

  useUnauthReconnectIdSigQueryParam: boolean;

  /**
    * Time in milliseconds between call retries.
    */
  waitTimeBetweenRetriesConfig: RequestTimeoutConfig;

  /**
   * `Ms-Oc-User-Agent` HTTP Request Headers to be sent on every OC request
   */
  ocUserAgent: string[];
}
