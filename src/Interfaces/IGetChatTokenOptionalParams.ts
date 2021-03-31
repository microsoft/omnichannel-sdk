export default interface IGetChatTokenOptionalParams {
  /**
   * Reconnect Id for the chat
   */
  reconnectId?: string;
  /**
   * JWT token from the portal
   */
  authenticatedUserToken?: string;
  /**
   * Current livechatversion
   */
  currentLiveChatVersion?: number;
}
