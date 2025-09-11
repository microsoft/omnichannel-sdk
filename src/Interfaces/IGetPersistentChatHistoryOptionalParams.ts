export default interface IGetPersistentChatHistoryOptionalParams {
    /**
     * Authenticated user token for the request.
     */
    authenticatedUserToken?: string;

    /**
     * Request ID for the operation (Optional).
     */
    requestId?: string;

    /**
     * Number of messages to retrieve per page (Optional).
     */
    pageSize?: number;

    /**
     * Token for pagination to get the next page of results (Optional).
     */
    pageToken?: string;
}
