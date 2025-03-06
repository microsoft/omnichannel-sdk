export enum BrowserVendor {
  IE = "IE",
  CHROME = "Chrome",
  FIREFOX = "Firefox",
  SAFARI = "Safari",
  EDGE = "Edge",
  EDGE_CHROMIUM = "Edg",
  OPERA = "Opera",
  UNKNOWN = "Unknown"
}

export enum Browser {
  Chrome,
  Firefox,
  Ie,
  Edge,
  Safari,
  None
}

export enum DeviceType {
  Desktop = "Desktop",
  Mobile = "Mobile",
  Tablet = "Tablet"
}

export enum OperatingSystem {
  WINDOWS = "Windows",
  MACOSX = "Mac OS X",
  WINDOWS_PHONE = "Windows Phone",
  WINDOWS_RT = "Windows RT",
  IOS = "iOS",
  ANDROID = "Android",
  LINUX = "Linux",
  UNKNOWN = "Unknown"
}

export enum ChannelId {
  LCW = "lcw",
  SMS = "sms",
  FACEBOOK = "facebook",
  WECHAT = "wechat"
}

export enum OCSDKTelemetryEvent {
  GETLCWFCSDETAILSSTARTED = "GetLcwFcsDetailsStarted",
  GETLCWFCSDETAILSSUCCEEDED = "GetLcwFcsDetailsSucceeded",
  GETLCWFCSDETAILSFAILED = "GetLcwFcsDetailsFailed",
  GETCHATCONFIGFSTARTED = "GetChatConfig",
  GETCHATCONFIGSUCCEEDED = "GetChatConfigSucceeded",
  GETCHATCONFIGFAILED = "GetChatConfigFailed",
  GETRECONNECTABLECHATSSTARTED = "GetReconnnectableChatsStarted",
  GETRECONNECTABLECHATSSUCCEEDED = "GetReconnnectableChatsSucceeded",
  GETRECONNECTABLECHATSFAILED = "GetReconnnectableChatsFailed",
  GETRECONNECTAVAILABILITYSUCCEEDED = "GetReconnnectableAvailabilitySucceeded",
  GETRECONNECTAVAILABILITYSTARTED = "GetReconnnectableAvailabilityStarted",
  GETRECONNECTAVAILABILITYFAILED = "GetReconnnectableAvailabilityFailed",
  GETCHATTOKENSTARTED = "GetChatTokenStarted",
  GETCHATTOKENSUCCEEDED = "GetChatTokenSucceeded",
  GETCHATTOKENFAILED = "GetChatTokenFailed",
  GETLWISTATUSSTARTED = "GetLwiStatusStarted",
  GETLWISTATUSSUCCEEDED = "GetLwiStatusSucceeded",
  GETLWISTATUSFAILED = "GetLwiStatusFailed",
  SESSIONINITSTARTED = "SessionInitStarted",
  SESSIONINITV2STARTED = "SessionInitV2Started",
  SESSIONINITSUCCEEDED = "SessionInitSucceeded",
  SESSIONINITV2SUCCEEDED = "SessionInitV2Succeeded",
  SESSIONINITFAILED = "SessionInitFailed",
  SESSIONINITV2FAILED = "SessionInitV2Failed",
  SESSIONCLOSESTARTED = "SessionCloseStarted",
  SESSIONCLOSESUCCEEDED = "SessionCloseSucceeded",
  SESSIONCLOSEFAILED = "SessionCloseFailed",
  SUBMITPOSTCHATSTARTED = "SubmitPostChatStarted",
  SUBMITPOSTCHATSUCCEEDED = "SubmitPostChatSucceeded",
  SUBMITPOSTCHATFAILED = "SubmitPostChatFailed",
  GETCHATTRANSCRIPTSTARTED = "GetChatTranscriptStarted",
  GETCHATTRANSCRIPTSUCCEEDED = "GetChatTranscriptSucceeded",
  GETCHATTRANSCRIPTFAILED = "GetChatTranscriptFailed",
  EMAILTRANSCRIPTSTARTED = "EmailTranscriptStarted",
  EMAILTRANSCRIPTSUCCEEDED = "EmailTranscriptSucceeded",
  EMAILTRANSCRIPTFAILED = "EmailTranscriptFailed",
  FETCHDATAMASKINGSTARTED = "FetchDataMaskingStarted",
  FETCHDATAMASKINGSUCCEEDED = "FetchDataMaskingSucceeded",
  FETCHDATAMASKINGFAILED = "FetchDataMaskingFailed",
  SECONDARYCHANNELEVENTREQUESTSTARTED = "SecondaryChannelEventRequestStarted",
  SECONDARYCHANNELEVENTREQUESTSUCCEEDED = "SecondaryChannelEventRequestSucceeded",
  SECONDARYCHANNELEVENTREQUESTFAILED = "SecondaryChannelEventRequestFailed",
  GETSURVEYINVITELINKSTARTED="GetSurveyInviteLinkStarted",
  GETSURVEYINVITELINKSUCCEEDED ="GetSurveyInviteLinkSucceeded",
  GETSURVEYINVITELINKFAILED = "GetSurveyInviteLinkFailed",
  VALIDATEAUTHCHATRECORDSTARTED = "ValidateAuthChatRecordStarted",
  VALIDATEAUTHCHATRECORDSUCCEEDED = "ValidateAuthChatRecordSucceeded",
  VALIDATEAUTHCHATRECORDFAILED = "ValidateAuthChatRecordFailed",
  GETAGENTAVAILABILITYSTARTED = "GetAgentAvailabilityStarted",
  GETAGENTAVAILABILITYSUCCEEDED = "GetAgentAvailabilitySucceeded",
  GETAGENTAVAILABILITYFAILED = "GetAgentAvailabilityFailed",
  SENDTYPINGINDICATORFAILED = "SendTypingIndicatorFailed",
  SENDTYPINGINDICATORSUCCEEDED = "SendTypingIndicatorSucceeded"
}

export enum LiveChatVersion {
  // IC3 live chat
  V1 = 1,

  // ACS live chat
  V2 = 2,

  V3 = 3
}

export enum SDKError {
  ClientHTTPTimeoutErrorName = "ClientHTTPTimeoutError",
  ClientHTTPTimeoutErrorMessage = "Server took too long to respond"
}
