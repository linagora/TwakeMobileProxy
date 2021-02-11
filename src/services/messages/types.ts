export namespace MessagesTypes{
    export interface InsertMessageRequest {
        company_id: string,
        workspace_id: string,
        channel_id: string,
        thread_id: string
        original_str: string
        prepared: Array<Object>
    }

    export interface UpdateMessageRequest {
        company_id: string,
        workspace_id: string,
        channel_id: string,
        thread_id: string
        message_id: string,
        original_str: string
        prepared: Array<Object>
    }


    export interface GetMessagesRequest {
        company_id: string,
        workspace_id: string,
        channel_id: string,
        thread_id: string
        message_id: string,
        before_message_id: string,
        limit: number
    }

    export interface DeleteMessageRequest {
        company_id: string
        workspace_id: string,
        channel_id: string
        message_id: string
        thread_id: string
    }

    export interface ReactionsRequest {
        company_id: string
        workspace_id: string,
        channel_id: string
        message_id: string
        thread_id: string
        reaction: string
    }

    export interface WhatsNewRequest {
        "company_id": string
        "workspace_id": string
    }

}