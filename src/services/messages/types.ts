export namespace MessagesTypes{

    export interface MessageRequest {
        company_id: string,
        workspace_id: string,
        channel_id: string,
        thread_id: string
        message_id: string
    }


    export interface InsertMessageRequest extends MessageRequest{
        original_str: string
        prepared: Array<Object>
    }

    export interface UpdateMessageRequest  extends MessageRequest{
        original_str: string
        prepared: Array<Object>
    }

    export interface GetMessagesRequest  extends MessageRequest{
        before_message_id: string,
        limit: number,
        after_date: number
    }


    export interface ReactionsRequest  extends MessageRequest {
        reaction: string
    }

    export interface WhatsNewRequest {
        "company_id": string
        "workspace_id": string
    }

}