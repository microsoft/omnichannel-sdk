/* eslint-disable @typescript-eslint/no-explicit-any*/
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

// Ported from https://dev.azure.com/dynamicscrm/OneCRM/_git/CRM.Omnichannel.IC3Client?path=/src/Common/EventManager.ts&version=GBmaster

export default class EventManager {
  public static raiseCustomEvent(eventName: string, payload?: any): void {
    const event = EventManager.createCustomEvent(eventName, payload);
    window.dispatchEvent(event);
  }

  /**
   * Creates a custom event based on the eventName and payload
   * The custom event is dispatch-compatible across browsers
   * @param {string} eventName: Name of the event.
   * @param {any} payload: The event payload.
   * @returns {CustomEvent}: CustomEvent instance.
   */
  private static createCustomEvent(eventName: string, payload?: any): CustomEvent {
    const eventDetails = payload ? {
      detail: payload
    } : undefined;

    let event = null;
    try {
      // For non IE11 scenarios, customevent object can be dispatched
      event = new CustomEvent(eventName, eventDetails);
    } catch (e) {
      // Special handling for IE11 scenario, where customevent object cannot be dispatched
      event = document.createEvent("CustomEvent");
      event.initCustomEvent(eventName, true, true, eventDetails);
    }
    return event;
  }
}
