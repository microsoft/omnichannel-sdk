export default interface ISDKConfiguration {
  /**
   * Number of times a getchattoken request is retried.
   */
  getChatTokenRetryCount: number;
  /**
   * Time in milliseconds between two successive getchattoken retry requests.
   */
  getChatTokenTimeBetweenRetriesOnFailure: number;
  /**
   * Maximum number of request retries before failing.
   */
  maxRequestRetriesOnFailure: number;
}
