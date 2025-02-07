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

  /**
   * Whether to refresh chat token
   */
  refreshToken?: boolean;

  /**
   * Specifies the bot application id to engage.
   */
  MsOcBotApplicationId?: string;
}
