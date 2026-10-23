export default class RenewChatTokenResponse {
  public ChatId!: string;
  public VisitorId!: string;
  public Token!: string;
  public ExpiresOn!: string;
  public ExpiresIn!: string;
  public ACSEndpoint!: string;
  public VoiceVideoCallToken!: object;
  public requestId!: string;
}
