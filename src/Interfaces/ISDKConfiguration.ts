export default interface ISDKConfiguration {
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
}
