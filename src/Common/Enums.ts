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
  GETCHATCONFIG = "GetChatConfig",
  GETCHATCONFIGSUCCESS = "GetChatConfigSucceeded",
  GETRECONNECTABLECHATS = "GetReconnnectableChats",
  GETRECONNECTAVAILABILITY = "GetReconnnectableAvailability",
  GETCHATTOKENSTARTED = "GetChatTokenStarted",
  GETCHATTOKENSUCCEEDED = "GetChatTokenSucceeded",
  GETCHATTOKENFAILED = "GetChatTokenFailed",
  GETLWISTATUSSTARTED = "GetLwiStatusStarted",
  GETLWISTATUSSUCCEEDED = "GetLwiStatusSucceeded",
  GETLWISTATUSFAILED = "GetLwiStatusFailed",
  SESSIONINITSTARTED = "SessionInitStarted",
  SESSIONINITSUCCEEDED = "SessionInitSucceeded",
  SESSIONINITFAILED = "SessionInitFailed",
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
  VALIDATEAUTHCHATRECORDFAILED = "ValidateAuthChatRecordFailed"
}

export enum LiveChatVersionNumber {
  // IC3 live chat
  V1 = "1",
  
  // ACS live chat
  V2 = "2"
}
