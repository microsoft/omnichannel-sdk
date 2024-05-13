import { StringMap } from "../Common/Mappings";
import OmnichannelHTTPHeaders from "../Common/OmnichannelHTTPHeaders";

export const addOcUserAgentHeader = (userAgent: string[], headers: StringMap): void => {
    const version = require('../../package.json').version; // eslint-disable-line @typescript-eslint/no-var-requires
    const defautUserAgent = `ocsdk/${version}`;
    headers[`${OmnichannelHTTPHeaders.ocUserAgent}`] = [...userAgent, defautUserAgent].join(" ");
};