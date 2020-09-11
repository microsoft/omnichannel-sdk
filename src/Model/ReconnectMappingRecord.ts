export default class ReconnectMappingRecord {
    /**
     *  Reconnect Id used for chat reconnection
     */
    public reconnectid!: string;
    /**
     * ConversationThreadId of the original chat
     */
    public conversationthreadid!: string;
    /**
     * The OrganisationId
     */
    public orgid!: string;
    /**
     * The WidgetAppId which denotes the widget
     */
    public widgetappid!: string;
    /**
     * The User Info
     */
    public userid!: string;
    /**
     * PartitionKey for the reconnect mapping record.
     */
    public partitionkey!: string;
}
