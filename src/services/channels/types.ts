export declare namespace ChannelsTypes {

    type DirectChannel = "direct";

    export interface BaseChannelsParameters {
        company_id: string;
        workspace_id: string | DirectChannel;
    }

    export interface ChannelParameters extends BaseChannelsParameters {
        /** the channel id */
        id: string;
    }

    export interface Channel {
        id: string
        name: string
        icon: string
        description: string
        channel_group: string
        workspace_id: string | null
        last_activity: number
        messages_unread: number
        company_id: string
        direct_channel_members: any[]
    }

    export interface ListRequest {
        company_id: string
        workspace_id: string
    }


    export interface AddRequest {
        company_id: string
        workspace_id: string
        name: string
        icon: string
        description: string
        channel_group: string,
        visibility: string
        members: string[] // direct channels only
    }

    export interface DeleteRequest {
        company_id: string
        workspace_id: string
        channel_id: string
    }

    export interface MemberAddRequest {
        company_id: string
        workspace_id: string
        channel_id: string
        members: string[]
    }

    export interface MemberGetRequest {
        company_id: string
        workspace_id: string
        channel_id: string
    }
}