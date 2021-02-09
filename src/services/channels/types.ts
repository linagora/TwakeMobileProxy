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
        company_id: string
        direct_channel_members: any[]
        visibility: string,
        members: [],
        members_count: number
    }

    export interface ListRequest extends BaseChannelsParameters {
    }


    export interface AddRequest extends BaseChannelsParameters {
        name: string
        icon: string
        description: string
        channel_group: string,
        visibility: string
        members: string[] // direct channels only
    }

    export interface DeleteRequest extends BaseChannelsParameters {
        channel_id: string
    }

    export interface MemberAddRequest extends BaseChannelsParameters {
        channel_id: string
        members: string[]
    }

    export interface MemberGetRequest extends BaseChannelsParameters {
        channel_id: string
    }

    export interface UpdateRequest extends BaseChannelsParameters {
        channel_id: string
        name: string,
        description: string,
        icon: string
    }
}