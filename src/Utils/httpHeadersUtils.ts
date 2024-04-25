import { StringMap } from "../Common/Mappings";
import OmnichannelHTTPHeaders from "../Common/OmnichannelHTTPHeaders";

export const addOcUserAgentHeader = (userAgent: string[], headers: StringMap) => {
    const version = require('../../package.json').version;
    const defautUserAgent = `ocsdk/${version}`;
    headers[`${OmnichannelHTTPHeaders.ocUserAgent}`] = [...userAgent, defautUserAgent].join(" ");
};