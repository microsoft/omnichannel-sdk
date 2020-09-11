export default class ReconnectAvailability {
  /**
   * Reconnect Id used for Reconnection chat
   */
  public reconnectId!: string;
  
  /**
   * Boolean to check if the reconnect available for the reconnect Id 
   */
  public isReconnectAvailable!: boolean;

  /**
   * Redirection URL while the reconnect is expired
   */
  public reconnectRedirectionURL!: string;
}