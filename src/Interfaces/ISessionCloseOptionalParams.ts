export default interface ISessionCloseOptionalParams {
  authenticatedUserToken?: string;
  isReconnectChat?: boolean;
  chatId?: string;
  isPersistentChat?: boolean;
}
