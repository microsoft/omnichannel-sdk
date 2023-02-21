export default interface IAxiosRetryOptions {
  /**
   * Number of retries before failing.
   */
  retries: number | 0;
  /**
   * Whether to retry on 429 HTTP status code response
   */
  retryOn429?: boolean | true;
  /**
   * Callback to fetch current auth nonce in case of failure and retry
   */
  fetchAuthCodeNonce?: () => string;
}
