export default class InitContext {
  public locale?: string;
  public originurl?: string;
  public os?: string;
  public browser?: string;
  public device?: string;
  public longitude?: string;
  public latitude?: string;
  public preChatResponse?: object;
  public chatId?: string;
  public cacheKey?: string;
  public customContextData?: { [key: string]: any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  public portalcontactid?: string;
  public isProactiveChat?: boolean;
}
