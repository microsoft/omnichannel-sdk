import InitContext from "../Model/InitContext";

export default interface IGetQueueAvailabilityOptionalParams {
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
