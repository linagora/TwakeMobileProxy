import Base from './base'
import Users from './users'
import {arrayToObject} from "../common/helpers";
import {authCache} from "../common/simplecache";
import assert from 'assert';
import {BadRequest} from "../common/errors";


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

export interface ChannelsDeleteRequest {
    company_id: string
    workspace_id: string
    channel_id: string
}

export interface ChannelMemberAddRequest {
    company_id: string
    workspace_id: string
    channel_id: string
    members: string[]
}

/**
 * Channels methods
 */
export default class extends Base {

    async __findChannel(company_id: string, workspace_id: string, visibility: string, name?: string, members?: string[]) {

        function eqArrays(as: string[], bs: string[]) {
            if (as.length !== bs.length) return false;
            const bsSet = new Set(bs)
            for (let a of as) if (!bsSet.has(a)) return false;
            return true;
        }

        return await this.api.getChannels(company_id, workspace_id)
            .then(data => {
                return data['resources']
                    .filter((a: any) => a.visibility == visibility)
                    .find((a: any) => {
                            return (name && a.name.toLocaleLowerCase() == name.toLocaleLowerCase())
                                || (a.members && eqArrays(members || [], a.members))

                        }
                    )
            })

    }


    async add(request: ChannelsAddRequest): Promise<any> {

        if (!request.members) request.members = []
        if (!request.workspace_id) request.workspace_id = 'direct'
        if (request.workspace_id === 'direct')  {
            const user = await new Users(this.request).getCurrent()
            if (request.members.indexOf(user.id)===-1)
                request.members.push(user.id)
        }

        let channel = await this.__findChannel(request.company_id, request.workspace_id, request.visibility, request.name, request.members)
        if (channel) {
            return this.__channelFormat(channel, true)
        }

        await this.api.addChannel(request.company_id, request.workspace_id, request.name, request.visibility, request.members, request.channel_group, request.description, request.icon)
        channel = await this.__findChannel(request.company_id, request.workspace_id, request.visibility, request.name, request.members)
        return this.__channelFormat(channel, true)
    }

    async addChannelMember(request: ChannelMemberAddRequest): Promise<any>{
        await this.api.addChannelMember(request.company_id, request.workspace_id, request.channel_id, request.members)
        return {"success":true}
    }

    async delete(request: ChannelsDeleteRequest): Promise<any>{
        return this.api.deleteChannel(request.company_id, request.workspace_id, request.channel_id)
    }

    __channelFormat(a: any, includeMembers: boolean): Channel {
        return {
            id: a.id,
            name: a.name ? a.name.charAt(0).toUpperCase() + a.name.slice(1) : a.name,
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
            has_unread: +a.last_activity > + a.user_member.last_access,
            messages_total: 0,
            messages_unread: 0,
        } as Channel
    }

    __channelsFormat = (source: any, includeMembers: boolean = false): Channel[] =>
        source.resources.map((a: any) => {
            return this.__channelFormat(a, includeMembers)
        })


    listPublic = (request: ChannelsListRequest): Promise<Channel[]> =>
        this.api.getChannels(request.company_id, request.workspace_id)
            .then(data => this.__channelsFormat(data)
                .sort((a: any, b: any) => a.name.localeCompare(b.name)))


    async listDirect(companyId: string): Promise<Channel[]> {
        const data = await this.api.getDirects(companyId)
        const res = this.__channelsFormat(data, true).filter(a => a.members.length > 0)
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
            if (a.members) {
                const members = (a.members.length > 1) ? a.members.filter((a: string) => a != currentUserToken) : a.members
                a.name = members.map((a: string) => {
                    const u = usersHash[a]
                    return u.firstname + ' ' + u.lastname
                }).join(', ')
            }
            return a
        })
    }


}
