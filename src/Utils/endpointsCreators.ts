import { LiveChatVersion } from "../Common/Enums"
import OmnichannelEndpoints from "../Common/OmnichannelEndpoints"

const createGetChatTokenEndpoint = (liveChatVersion: LiveChatVersion, auth: boolean): string => {
  const endpointsMapping: {[key in LiveChatVersion]: string} = {
    [LiveChatVersion.V1]: OmnichannelEndpoints.LiveChatGetChatTokenPath,
    [LiveChatVersion.V2]: OmnichannelEndpoints.LiveChatv2GetChatTokenPath,
    [LiveChatVersion.V3]: OmnichannelEndpoints.LiveChatv3GetChatTokenPath,
  };

  const authEndpointsMapping: {[key in LiveChatVersion]: string} = {
    [LiveChatVersion.V1]: OmnichannelEndpoints.LiveChatAuthGetChatTokenPath,
    [LiveChatVersion.V2]: OmnichannelEndpoints.LiveChatv2AuthGetChatTokenPath,
    [LiveChatVersion.V3]: OmnichannelEndpoints.LiveChatv3AuthGetChatTokenPath,
  };

  if (Object.values(LiveChatVersion).includes(liveChatVersion)) {
    return auth? authEndpointsMapping[(liveChatVersion as LiveChatVersion)]: endpointsMapping[(liveChatVersion as LiveChatVersion)];
  }

  return auth? authEndpointsMapping[LiveChatVersion.V2]: endpointsMapping[LiveChatVersion.V2];
}

export {
  createGetChatTokenEndpoint
}
