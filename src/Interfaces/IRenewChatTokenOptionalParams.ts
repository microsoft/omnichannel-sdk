export default interface IRenewChatTokenOptionalParams {
  /**
   * JWT token from the portal. When set, the authenticated renewal endpoint is used.
   */
  authenticatedUserToken?: string;
}
