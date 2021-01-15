import Base from './base'
import Users from './users'
import {arrayToObject} from "../common/helpers";
import {authCache, usersCache} from "../common/simplecache";

export interface ChannelsListRequest {
    company_id: string
    workspace_id: string
}

export interface Channel {
    id: string
    name: string
    icon: string
    description: string
    channel_group: string
    members_count: number
    // private: boolean
    workspace_id: string | null
    last_activity: number
    messages_unread: number
    company_id: string
    members: any[]
}

export interface ChannelsAddRequest {
    company_id: string
    workspace_id: string
    name: string
    icon: string
    description: string
    channel_group: string,
    visibility: string
    members: string[]
}

/**
 * Channels methods
 */
export default class extends Base {


    async addChannel(request: ChannelsAddRequest): Promise<any> {
        await this.api.addChannel(request.company_id, request.workspace_id, request.name, request.visibility, request.members, request.channel_group, request.description, request.icon)
        return {"success": true}
    }

    __channelFormat = (source: any, includeMembers: boolean = false): Channel[] =>
        source.resources.map((a: any) => (
                {
                    id: a.id,
                    name: a.name,
                    icon: a.icon,
                    company_id: a.company_id,
                    workspace_id: a.workspace_id,
                    description: a.description,
                    channel_group: a.channel_group,
                    members: includeMembers ? a.members : [],
                    // members_count: a.members.length,
                    members_count: a.members ? a.members.length : 0,
                    // private: a.visibility == 'private',
                    // last_activity: a.last_activity,
                    last_activity: +a.last_activity,
                    // messages_total: a.messages_increment,
                    // messages_unread: a.messages_increment - a._user_last_message_increment,
                    messages_total: 0,
                    messages_unread: 0,
                } as Channel
            )
        );


    async listPublic(request: ChannelsListRequest): Promise<Channel[]> {
        const data = await this.api.getChannels(request.company_id, request.workspace_id)
        const res = this.__channelFormat(data)
        console.log(res)
        return res.sort((a: any, b: any) => a.name.localeCompare(b.name))
    }


    // async listPublicV1(request: ChannelsListRequest): Promise<Channel[]> {
    //
    //     const j = {
    //         'collection_id': `channels/workspace/${request.workspace_id}`,
    //         'options': {
    //             'type': 'channels/workspace',
    //             'get_options': {
    //                 'company_id': request.company_id,
    //                 'workspace_id': request.workspace_id,
    //             },
    //         },
    //     }
    //
    //     const data = await this.api.post('/ajax/core/collections/init', j)
    //
    //     const filterOnlyNamed = data['get'].filter((a: any) => a.name) as any[]
    //
    //
    //     const channels = filterOnlyNamed.map((a: any) => (
    //             {
    //                 id: a.id,
    //                 name: a.name,
    //                 icon: a.icon,
    //                 description: a.description,
    //                 members_count: a.members.length,
    //                 channel_group: '',
    //                 private: a.private,
    //                 workspace_id: request.workspace_id,
    //                 last_activity: a.last_activity,
    //                 messages_total: a.messages_increment,
    //                 messages_unread: a.messages_increment - a._user_last_message_increment,
    //                 company_id: request.company_id
    //             } as Channel
    //         )
    //     );
    //
    //
    //     return channels.sort((a: any, b: any) => a.name.localeCompare(b.name))
    // }


    async listDirect(companyId: string): Promise<Channel[]> {
        const data = await this.api.getDirects(companyId)
        const res = this.__channelFormat(data, true).filter(a=>a.members.length > 1)
        const usersIds = new Set()

        res.forEach((c: any) => {
                    c.members.forEach((m: string) => {
                        usersIds.add(m)
                    })
                })
        const usersCtrl = new Users(this.request)
        const usersHash = arrayToObject(await Promise.all(Array.from(usersIds.values()).map((user_id) => usersCtrl.getUser(user_id as string))), 'id')

        const currentUserToken = authCache[this.request.jwtToken] ? authCache[this.request.jwtToken]['id'] : ""

        return res.map((a: Channel) => {
            if (a.members){
                a.name = a.members.filter((a: string) => a != currentUserToken).map((a: string) => {
                    const u = usersHash[a]
                    return u.firstname + ' ' + u.lastname
                }).join(', ')

            }

            return a
        })
    }


    // /**
    //  * List public channels /company/<company_id>/direct
    //  * @return {Promise< {private, last_activity, name, direct, description, members_count, id}[] >}
    //  * @param companyId
    //  */
    // async _listDirect(companyId: string): Promise<Channel[]> {
    //
    //     const j = {
    //         "collection_id": `channels/direct_messages/${this.userProfile.userId}`,
    //         "options": {
    //             "type": "channels/direct_messages",
    //             "get_options": {}
    //         },
    //         "_grouped": true
    //     }
    //
    //     const data = await this.api.post('/ajax/core/collections/init', j)
    //
    //     const usersIds = new Set()
    //
    //     // for channel name
    //     data['get'].forEach((c: any) => {
    //         c.members.forEach((m: string) => {
    //             usersIds.add(m)
    //         })
    //     })
    //
    //     const usersCtrl = new Users(this.request)
    //     const usersHash = arrayToObject(await Promise.all(Array.from(usersIds.values()).map((user_id) => usersCtrl.getUser(user_id as string))), 'id')
    //
    //     return data['get'].map((a: any) => {
    //
    //             // if (this.versionFrom("2.0.0")){
    //             a.members = a.members.filter((a: string) => a != this.userProfile.userId)
    //             // }
    //
    //             return {
    //                 id: a.id,
    //                 name: a.name || a.members.map((a: string) => {
    //                     const u = usersHash[a]
    //                     return u.firstname + ' ' + u.lastname
    //                 }).join(', '),
    //                 members:
    //                     this.versionFrom("2.0.0") ? a.members :
    //                         a.members.map((u: string) => {
    //                             return usersHash[u]
    //                         }) as any,
    //                 icon: a.icon,
    //                 channel_group: '',
    //                 description: a.description,
    //                 members_count: a.members.length,
    //                 private: a.private,
    //                 workspace_id: null,
    //                 last_activity: a.last_activity,
    //                 messages_total: a.messages_increment,
    //                 messages_unread: a.messages_increment - a._user_last_message_increment,
    //                 company_id: companyId
    //             } as Channel
    //         }
    //     )
    // }

    // async listPublic2(companyId: string, workspaceId: string) {
    //     const res = await this.api.get(`/internal/services/channels/v1/companies/${companyId}/workspaces/${workspaceId}/channels`,
    //         {
    //             "mine": true,
    //             "limit": 100,
    //             "websockets": true
    //         })
    //     console.log(res)
    //     return res
    // }
    //
    // async members(companyId: string, workspaceId: string, channelId: string) {
    //
    //     const res = await this.api.get(`/internal/services/channels/v1/companies/${companyId}/workspaces/${workspaceId}/channels/${channelId}/members`,
    //         {
    //             "limit": 100,
    //             "websockets": true
    //         })
    //     console.log(res)
    //     return res
    // }
}
