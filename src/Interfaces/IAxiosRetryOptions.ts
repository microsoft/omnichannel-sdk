
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
   * 
   * Function to handle logic and evaluate if retry should continue based on response results.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shouldRetry? (response? : any, axiosRetryOptions?: IAxiosRetryOptions)  : boolean
  /**
   * Callback to fetch current auth nonce in case of failure and retry
   */
  fetchAuthCodeNonce?: () => string;
}
