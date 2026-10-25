/* eslint-disable @typescript-eslint/no-explicit-any */

import * as axiosRetryHandler from "../src/Utils/axiosRetryHandler";

import Constants from "../src/Common/Constants";
import IOmnichannelConfiguration from "../src/Interfaces/IOmnichannelConfiguration";
import { LiveChatVersion } from "../src/Common/Enums";
import SDK from "../src/SDK";
import axios from "axios";

// Every SDK request must build its own header object. If a method writes auth or session
// headers into the shared Constants.defaultHeaders, those values are sent on later requests,
// including anonymous requests and requests for a different chat.
describe("Shared default headers", () => {
  const authenticatedUserToken = "auth-token-chat-A";
  const omnichannelConfig: IOmnichannelConfiguration = {
    channelId: "lcw",
    orgId: "orgId",
    orgUrl: "https://org.test",
    widgetId: "widgetId"
  };

  interface CapturedRequest {
    url: string;
    headersRef: any;
    headers: Record<string, string>;
  }

  let captured: CapturedRequest[];
  let responseHeaders: Record<string, string>;

  const lastRequest = (): CapturedRequest => captured[captured.length - 1];

  beforeEach(() => {
    captured = [];
    responseHeaders = {};
    spyOn(axiosRetryHandler, "default").and.stub();
    spyOn(axiosRetryHandler, "axiosRetryHandlerWithNotFound").and.stub();
    const send = (options: any) => {
      // Snapshot at send time; a shared object would otherwise change after the call.
      captured.push({ url: options.url, headersRef: options.headers, headers: { ...options.headers } });
      return Promise.resolve({ data: { requestId: "reqId", authChatExist: true, Token: "acsToken" }, headers: responseHeaders, status: 200 });
    };
    const axiosInstance: any = jasmine.createSpy("axiosInstance").and.callFake(send);
    axiosInstance.get = (url: string, config: any) => send({ ...config, url });
    spyOn<any>(axios, "create").and.returnValue(axiosInstance);
  });

  const callAllHeaderMethods = async (sdk: SDK, token: string): Promise<void> => {
    await sdk.getLWIDetails("r1", { authenticatedUserToken: token });
    await sdk.getChatToken("r2", { authenticatedUserToken: token });
    await sdk.getReconnectableChats({ authenticatedUserToken: token, requestId: "r3" });
    await sdk.getReconnectAvailability("reconnectId", { requestId: "r4" });
    await sdk.getAgentAvailability("r5", { authenticatedUserToken: token });
    await sdk.sessionClose("r6", { authenticatedUserToken: token });
    await sdk.validateAuthChatRecord("r7", { authenticatedUserToken: token, chatId: "chatId" });
    await sdk.submitPostChatResponse("r8", {}, { authenticatedUserToken: token });
    await sdk.getSurveyInviteLink("ownerId", {}, { authenticatedUserToken: token, requestId: "r9" });
    await sdk.getChatTranscripts("r10", "chatId", "acsToken", { authenticatedUserToken: token });
    await sdk.emailTranscript("r11", "acsToken", {}, { authenticatedUserToken: token });
    await sdk.fetchDataMaskingInfo("r12");
    await sdk.makeSecondaryChannelEventRequest("r13", {}, { authenticatedUserToken: token });
    await sdk.sendTypingIndicator("r14", LiveChatVersion.V2, { customerDisplayName: "name" });
    await sdk.renewChatToken("r15", { authenticatedUserToken: token });
  };

  it("does not send AuthenticatedUserToken on an anonymous call after an authenticated call", async () => {
    const sdk = new SDK(omnichannelConfig);

    await sdk.getLWIDetails("authRequest", { authenticatedUserToken });
    expect(lastRequest().headers["AuthenticatedUserToken"]).toEqual(authenticatedUserToken);

    await sdk.getLWIDetails("anonRequest");
    expect(lastRequest().url).not.toContain("/auth/");
    expect(lastRequest().headers["AuthenticatedUserToken"]).toBeUndefined();
    expect(lastRequest().headers["AuthCodeNonce"]).toBeUndefined();
  });

  it("does not send any earlier auth header on an anonymous call after every authenticated method", async () => {
    await callAllHeaderMethods(new SDK(omnichannelConfig), authenticatedUserToken);

    await new SDK(omnichannelConfig).getChatToken("anonRequest");
    expect(lastRequest().headers["AuthenticatedUserToken"]).toBeUndefined();
    expect(lastRequest().headers["AuthCodeNonce"]).toBeUndefined();
    expect(lastRequest().headers["OrganizationId"]).toBeUndefined();
  });

  it("does not send the first chat's Oc-Sessionid or AuthCodeNonce on the second chat", async () => {
    const firstChat = new SDK(omnichannelConfig, { authCodeNonce: "nonce-chat-A" } as any);
    responseHeaders = { "oc-sessionid": "session-chat-A", authcodenonce: "nonce-chat-A-rotated" };
    await firstChat.getChatToken("chatA-token", { authenticatedUserToken });
    await firstChat.sessionClose("chatA-close", { authenticatedUserToken });
    expect(lastRequest().headers["Oc-Sessionid"]).toEqual("session-chat-A");
    expect(lastRequest().headers["AuthCodeNonce"]).toEqual("nonce-chat-A-rotated");

    responseHeaders = {};
    const secondChat = new SDK(omnichannelConfig);
    await secondChat.getChatToken("chatB-token");
    expect(lastRequest().headers["Oc-Sessionid"]).toBeUndefined();
    expect(lastRequest().headers["AuthCodeNonce"]).toBeUndefined();
    expect(lastRequest().headers["AuthenticatedUserToken"]).toBeUndefined();

    await secondChat.sessionClose("chatB-close");
    expect(lastRequest().headers["Oc-Sessionid"]).toBeUndefined();
    expect(lastRequest().headers["AuthCodeNonce"]).toBeUndefined();
  });

  it("gives every request its own header object and leaves the shared defaults unchanged", async () => {
    const sdk = new SDK(omnichannelConfig);
    responseHeaders = { "oc-sessionid": "session-id", authcodenonce: "nonce" };

    await sdk.getChatConfig("config", true);
    await callAllHeaderMethods(sdk, authenticatedUserToken);

    expect(captured.length).toBe(16);
    captured.forEach((request) => {
      expect(request.headersRef).withContext(request.url).not.toBe(Constants.defaultHeaders);
      expect(request.headersRef).withContext(request.url).not.toBe(Constants.bypassCacheHeaders);
    });
    expect(Constants.defaultHeaders).toEqual({ "Content-Type": "application/json" });
    expect(Constants.bypassCacheHeaders).toEqual({
      "Cache-Control": "no-store, must-revalidate, no-cache",
      "X-Cache-Control": "no-store"
    });
  });

  it("freezes the shared header objects so a by-reference write fails", () => {
    expect(Object.isFrozen(Constants.defaultHeaders)).toBeTrue();
    expect(Object.isFrozen(Constants.bypassCacheHeaders)).toBeTrue();
    expect(() => {
      (Constants.defaultHeaders as any)["AuthenticatedUserToken"] = "token";
    }).toThrowError(TypeError);
  });
});
