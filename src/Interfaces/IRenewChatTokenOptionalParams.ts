export default interface IRenewChatTokenOptionalParams {
  /**
   * JWT token from the portal. When set, the authenticated renewal endpoint is used.
   */
  authenticatedUserToken?: string;
  /**
   * Retries after the first request for this call only. A nonnegative integer overrides
   * maxRequestRetriesOnFailure; omitted or invalid values keep the configured default.
   */
  maxRetries?: number;
}
