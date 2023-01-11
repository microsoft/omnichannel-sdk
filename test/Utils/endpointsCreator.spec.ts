import { LiveChatVersion } from "../../src/Common/Enums";
import OmnichannelEndpoints from "../../src/Common/OmnichannelEndpoints";
import { createGetChatTokenEndpoint } from "../../src/Utils/endpointsCreators";

describe("endpointsCreators unit tests", () => {
  it("createGetChatTokenEndpoint() should return v2 endpoint by default", async () => {
    const auth = false;
    const expectedEndpoint = OmnichannelEndpoints.LiveChatv2GetChatTokenPath;
    const version = "invalid" as any;
    const endpoint = createGetChatTokenEndpoint(version, auth);
    expect(endpoint).toEqual(expectedEndpoint);
  });

  it("createGetChatTokenEndpoint() with auth should return v2 auth endpoint by default", async () => {
    const auth = true;
    const expectedEndpoint = OmnichannelEndpoints.LiveChatv2AuthGetChatTokenPath;
    const version = "invalid" as any;
    const endpoint = createGetChatTokenEndpoint(version, auth);
    expect(endpoint).toEqual(expectedEndpoint);
  });

  it("createGetChatTokenEndpoint() on v1 should return v1 endpoint", async () => {
    const auth = false;
    const expectedEndpoint = OmnichannelEndpoints.LiveChatGetChatTokenPath;
    const version = LiveChatVersion.V1;
    const endpoint = createGetChatTokenEndpoint(version, auth);
    expect(endpoint).toEqual(expectedEndpoint);
  });

  it("createGetChatTokenEndpoint() on v1 with auth should return v1 auth endpoint", async () => {
    const auth = true;
    const expectedEndpoint = OmnichannelEndpoints.LiveChatAuthGetChatTokenPath;
    const version = LiveChatVersion.V1;
    const endpoint = createGetChatTokenEndpoint(version, auth);
    expect(endpoint).toEqual(expectedEndpoint);
  });

  it("createGetChatTokenEndpoint() on v2 should return v2 endpoint", async () => {
    const auth = false;
    const expectedEndpoint = OmnichannelEndpoints.LiveChatv2GetChatTokenPath;
    const version = 2;
    const endpoint = createGetChatTokenEndpoint(version, auth);
    expect(endpoint).toEqual(expectedEndpoint);
  });

  it("createGetChatTokenEndpoint() on v2 with auth should return v2 auth endpoint", async () => {
    const auth = true;
    const expectedEndpoint = OmnichannelEndpoints.LiveChatv2AuthGetChatTokenPath;
    const version = 2;
    const endpoint = createGetChatTokenEndpoint(version, auth);
    expect(endpoint).toEqual(expectedEndpoint);
  });

  it("createGetChatTokenEndpoint() on v3 should return v3 endpoint", async () => {
    const auth = false;
    const expectedEndpoint = OmnichannelEndpoints.LiveChatv3GetChatTokenPath;
    const version = 3;
    const endpoint = createGetChatTokenEndpoint(version, auth);
    expect(endpoint).toEqual(expectedEndpoint);
  });

  it("createGetChatTokenEndpoint() on v3 with auth should return v3 endpoint", async () => {
    const auth = true;
    const expectedEndpoint = OmnichannelEndpoints.LiveChatv3GetChatTokenPath;
    const version = 3;
    const endpoint = createGetChatTokenEndpoint(version, auth);
    expect(endpoint).toEqual(expectedEndpoint);
  });
});
