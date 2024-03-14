import { RequestTimeoutConfig } from "../Common/RequestTimeoutConfig";

export const waitTimeBetweenRetriesConfigs : RequestTimeoutConfig =  {
    getChatConfig: 3000,
    getLWIDetails: 3000,
    getChatToken: 3000,
    sessionInit: 3000,
    sessionClose: 3000,
    getReconnectableChats: 3000,
    getReconnectAvailability: 3000,
    submitPostChatResponse: 3000,
    getSurveyInviteLink: 3000,
    getChatTranscripts: 3000,
    emailTranscript: 3000,
    fetchDataMaskingInfo: 3000,
    makeSecondaryChannelEventRequest: 3000,
    getAgentAvailability: 3000,
    sendTypingIndicator: 3000,
    validateAuthChatRecordTimeout: 3000
  };