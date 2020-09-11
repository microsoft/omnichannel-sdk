import InitContext from "../Model/InitContext";

export default interface ISessionInitOptionalParams {
  /**
   * Reconnect Id for the chat
   */
  reconnectId?: string;
  /**
   * JWT token from the portal
   */
  authenticatedUserToken?: string;
  /**
   * Whether to get init context from browser.
   */
  getContext?: boolean;
  /**
   * Custom init context.
   */
  initContext?: InitContext;
}
