export default interface IReconnectableChatsParams {
  /**
   * JWT token from the portal
   */
  authenticatedUserToken: string;
  requestId?: string;
}
