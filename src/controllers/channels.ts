import Base from './base'
import Users from './users'
import {arrayToObject} from "../common/helpers";
import {authCache} from "../common/simplecache";
import assert from 'assert';

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


    listPublic = (request: ChannelsListRequest): Promise<Channel[]> =>
        this.api.getChannels(request.company_id, request.workspace_id)
            .then(data => this.__channelFormat(data)
                .sort((a: any, b: any) => a.name.localeCompare(b.name)))




    async listDirect(companyId: string): Promise<Channel[]> {
        const data = await this.api.getDirects(companyId)
        const res = this.__channelFormat(data, true).filter(a=>a.members.length > 0)
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
                const members = (a.members.length>1) ? a.members.filter((a: string) => a != currentUserToken) : a.members
                a.name = members.map((a: string) => {
                    const u = usersHash[a]
                    return u.firstname + ' ' + u.lastname
                }).join(', ')
            }
            return a
        })
    }



}
