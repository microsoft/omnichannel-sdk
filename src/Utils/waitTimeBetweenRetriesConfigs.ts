import { RequestTimeoutConfig } from "../Common/RequestTimeoutConfig";

export const waitTimeBetweenRetriesConfigs : RequestTimeoutConfig =  {
    getChatConfig: 1000,
    getLWIDetails: 3000,
    getChatToken: 1000,
    sessionInit: 1000,
    sessionClose: 1000,
    getReconnectableChats: 1000,
    getReconnectAvailability: 1000,
    submitPostChatResponse: 1000,
    getSurveyInviteLink: 1000,
    getChatTranscripts: 1000,
    emailTranscript: 1000,
    fetchDataMaskingInfo: 1000,
    makeSecondaryChannelEventRequest: 1000,
    getAgentAvailability: 1000,
    sendTypingIndicator: 1000,
    validateAuthChatRecordTimeout: 1000,
    getPersistentChatHistory: 1000
  };