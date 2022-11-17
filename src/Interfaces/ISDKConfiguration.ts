import { TimeoutMap } from "../Common/TimeoutMap";

export default interface ISDKConfiguration {
  [key: string]: number | string | boolean | TimeoutMap | undefined;

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
  defaultTimeout: number | undefined;
  /**
   * Individual Endpoint timeouts
   */
  endpointTimeouts: TimeoutMap;
}
