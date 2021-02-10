import Base from '../../common/base'
import Users from '../../controllers/users'
import {arrayToObject} from "../../common/helpers";
import {authCache} from "../../common/simplecache";
// import {BadRequest} from "../common/errors";
import {ChannelsTypes} from "./types";
import {FastifyRequest} from "fastify";
import ChannelsService from "./service";


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
            .then(data => data
                .filter((a: any) => a.visibility == visibility)
                .find((a: any) => {
                        return (name && a.name.toLocaleLowerCase() == name.toLocaleLowerCase())
                            || (a.members && eqArrays(members || [], a.members))

                    }
                )
            )

    }


    async add(request: ChannelsTypes.AddRequest): Promise<any> {

        if (!request.members) request.members = []
        if (!request.workspace_id) request.workspace_id = 'direct'
        if (request.workspace_id === 'direct')  {
            const user = await new Users(this.request).getCurrent()
            if (request.members.indexOf(user.id)===-1)
                request.members.push(user.id)
        }

        let channel = await this.__findChannel(request.company_id, request.workspace_id, request.visibility, request.name, request.members)
        if (channel) {
            return this.__channelFormat(channel)
        }

        channel = await this.api.addChannel(request.company_id, request.workspace_id, request.name, request.visibility, request.members, request.channel_group, request.description, request.icon)
        return this.__channelFormat(channel)
    }

    async addChannelMember(request: ChannelsTypes.MemberAddRequest): Promise<any>{
        await this.api.addChannelMember(request.company_id, request.workspace_id, request.channel_id, request.members)
        return {"success":true}
    }

    async delete(request: ChannelsTypes.ChannelParameters): Promise<any>{
        return this.api.deleteChannel(request.company_id, request.workspace_id, request.channel_id)
    }

    __channelFormat(a: any): ChannelsTypes.Channel {
        return {
            id: a.id,
            name: a.name ? a.name.charAt(0).toUpperCase() + a.name.slice(1) : a.name,
            icon: a.icon,
            company_id: a.company_id,
            workspace_id: a.workspace_id,
            description: a.description,
            channel_group: a.channel_group,
            direct_channel_members: a.direct_channel_members,  // используются в директах
            last_activity: +a.last_activity,
            has_unread: +a.last_activity > + a.user_member.last_access,
            members:  a.direct_channel_members,
            members_count: a.direct_channel_members ? a.direct_channel_members.length : 0,
            visibility: a.visibility
        } as ChannelsTypes.Channel
    }

    __channelsFormat = (source: any): ChannelsTypes.Channel[] =>
        source.map((a: any) => {return this.__channelFormat(a)})


    listPublic = (request: ChannelsTypes.BaseChannelsParameters): Promise<ChannelsTypes.Channel[]> =>
        this.api.getChannels(request.company_id, request.workspace_id)
            .then(data => this.__channelsFormat(data)
                .sort((a: any, b: any) => a.name.localeCompare(b.name)))


    async listDirect(companyId: string): Promise<ChannelsTypes.Channel[]> {
        const data = await this.api.getDirects(companyId)
        const res = this.__channelsFormat(data).filter(a => a.direct_channel_members.length > 0)
        const usersIds = new Set()

        res.forEach((c: any) => {
            c.direct_channel_members.forEach((m: string) => {
                usersIds.add(m)
            })
        })
        const usersCtrl = new Users(this.request)
        const usersHash = arrayToObject(await Promise.all(Array.from(usersIds.values()).map((user_id) => usersCtrl.getUser(user_id as string))), 'id')

        const currentUserToken = authCache[this.request.jwtToken] ? authCache[this.request.jwtToken]['id'] : ""

        return res.map((a: ChannelsTypes.Channel) => {
            if (a.direct_channel_members) {
                const members = (a.direct_channel_members.length > 1) ? a.direct_channel_members.filter((a: string) => a != currentUserToken) : a.direct_channel_members
                a.name = members.map((a: string) => {
                    const u = usersHash[a]
                    return u.firstname + ' ' + u.lastname
                }).join(', ')
            }
            return a
        })
    }



}


export class Test{

    constructor(protected service: ChannelsService) {}

    getChannelMembers( request: FastifyRequest<{  Querystring: ChannelsTypes.ChannelParameters}>) {
        return this.service.getMembers(request.jwtToken, request.query)
    }


    edit(request: FastifyRequest<{ Body: ChannelsTypes.UpdateRequest }>) {
        return this.service.update(request.jwtToken, request.body)
    }

    delete(request: FastifyRequest<{ Body: ChannelsTypes.ChannelParameters }>){
        return this.service.delete(request.jwtToken, request.body)
    }

    init( request: FastifyRequest<{  Querystring: ChannelsTypes.ChannelParameters}>) {
        return this.service.init(request.jwtToken, request.query)
    }
}