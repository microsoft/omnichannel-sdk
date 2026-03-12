export type RequestTimeoutConfig = {
    [key: string]: number;

    getChatConfig: number;
    getLWIDetails: number;
    getChatToken: number;
    sessionInit: number;
    sessionClose: number;
    getReconnectableChats: number;
    getReconnectAvailability: number;
    submitPostChatResponse: number;
    getSurveyInviteLink: number;
    getChatTranscripts: number;
    emailTranscript: number;
    fetchDataMaskingInfo: number;
    makeSecondaryChannelEventRequest: number;
    getAgentAvailability: number;
    sendTypingIndicator: number;
    validateAuthChatRecordTimeout: number;
    getPersistentChatHistory: number;
    midConversationAuthenticateChat: number;
}
