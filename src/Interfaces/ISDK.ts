import FetchChatTokenResponse from "../Model/FetchChatTokenResponse";
import IDataMaskingInfo from "../Interfaces/IDataMaskingInfo";
import IGetQueueAvailabilityOptionalParams from "./IGetQueueAvailabilityOptionalParams";
import IReconnectableChatsParams from "../Interfaces/IReconnectableChatsParams";

export default interface ISDK {
  getChatConfig(requestId: string, bypassCache?: boolean): Promise<object | void>;
  getLWIDetails(requestId: string): Promise<object>;
  getChatToken(requestId: string): Promise<FetchChatTokenResponse>;
  sessionInit(requestId: string): Promise<void>;
  sessionClose(requestId: string): Promise<void>;
  getReconnectableChats(reconnectableChatsParams: IReconnectableChatsParams): Promise<object | void>;
  getReconnectAvailability(reconnectId: string): Promise<object | void>;
  submitPostChatResponse(requestId: string, postChatResponse: object): Promise<void>;
  getSurveyInviteLink(surveyOwnerId: string, surveyInviteAPIRequestBody: object): Promise<object>;
  getChatTranscripts(requestId: string, chatId: string, token: string): Promise<string>;
  emailTranscript(requestId: string, token: string, emailRequestBody: object): Promise<void>;
  fetchDataMaskingInfo(requestId: string): Promise<IDataMaskingInfo>;
  makeSecondaryChannelEventRequest(requestId: string, secondaryChannelEventRequestBody: object): Promise<void>;
  getAgentAvailability(requestId: string, queueAvailabilityOptionalParams: IGetQueueAvailabilityOptionalParams): Promise<object>
  sendTypingIndicator(requestId: string, currentLiveChatVersion: number): Promise<void>;
}
