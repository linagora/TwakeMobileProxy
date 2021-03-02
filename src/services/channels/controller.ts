import Base from '../../common/base'
import Users from '../users/controller'
import {arrayToObject} from "../../common/helpers";
import {authCache} from "../../common/simplecache";
// import {BadRequest} from "../common/errors";
import {ChannelsTypes} from "./types";
import {FastifyRequest} from "fastify";
import ChannelsService from "./service";
import UsersService from "../users/service";
import {BadRequest} from "../../common/errors";


function __channelFormat(a: any): ChannelsTypes.Channel {
    return {
        id: a.id,
        name: a.name ? a.name.charAt(0).toUpperCase() + a.name.slice(1) : a.name,
        icon: a.icon,
        company_id: a.company_id,
        workspace_id: a.workspace_id,
        description: a.description,
        channel_group: a.channel_group,
        last_activity: +a.last_activity,
        has_unread: +a.last_activity > +a.user_member.last_access,
        user_last_access: +a.user_member.last_access,
        members: a.members,
        members_count: a.members ? a.members.length : a.members_count,
        visibility: a.visibility
    } as ChannelsTypes.Channel
}

function __channelsFormat(source: any): ChannelsTypes.Channel[] {
    return source.map((a: any) => {
        return __channelFormat(a)
    })
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
            .then(data => data
                .filter((a: any) => a.visibility == visibility)
                .find((a: any) => {
                        return (name && a.name.toLocaleLowerCase() == name.toLocaleLowerCase())
                            || (!a.name && a.members.length && eqArrays(members || [], a.members))

                    }
                )
            )

    }


    async add(request: ChannelsTypes.AddRequest): Promise<any> {

        if (!request.members) request.members = []
        if (!request.workspace_id) request.workspace_id = 'direct'
        if (request.workspace_id === 'direct') {
            const user = await new Users(this.request).getCurrent()
            if (request.members.indexOf(user.id) === -1)
                request.members.push(user.id)
        }
        // console.log(request)

        let channel = await this.__findChannel(request.company_id, request.workspace_id, request.visibility, request.name, request.members)

        console.log('FOUND', channel)
        if (channel) {
            return __channelFormat(channel)
        }

        channel = await this.api.addChannel(request.company_id, request.workspace_id, request.name, request.visibility, request.members, request.channel_group, request.description, request.icon)
        return __channelFormat(channel)
    }


}


export class ChannelsController {

    constructor(protected channelsService: ChannelsService, protected usersService: UsersService) {
    }

    async addEmailsToMembers(members: any) {

        const promises = members.map((member: any) => this.usersService.getUserById(member.id))
        const users = await Promise.all(promises.map((p: any) => p.catch(() => null))).then(a => a.filter(a => a))

        const membersMap = {} as { [key: string]: any }
        members.forEach((member: any) => {
            membersMap[member.id] = member
        })

        const res = [] as any[]
        users.forEach((user: any) => {
            const member = membersMap[user.id]
            console.log('adding email', user.email)
            member['email'] = user.email
            res.push(member)
        })

        return res
    }

    async public(request: FastifyRequest<{ Querystring: ChannelsTypes.BaseChannelsParameters }>): Promise<ChannelsTypes.Channel[]> {
        const {company_id, workspace_id} = request.query
        const channels = await this.channelsService.public(request.query) as any[]

        const counts = await Promise.all(channels.map((c) => this.channelsService.getMembers(company_id, workspace_id, c.id).then(a => a.length)))

        channels.forEach((ch: any) => ch.members_count = counts.shift())

        return __channelsFormat(channels).sort((a: any, b: any) => a.name.localeCompare(b.name))
    }

    getMembers(request: FastifyRequest<{ Querystring: ChannelsTypes.ChannelParameters }>) {
        const {company_id, workspace_id, channel_id} = request.query
        return this.channelsService.getMembers(company_id, workspace_id, channel_id).then(a => this.addEmailsToMembers(a))
    }

    async addMembers(request: FastifyRequest<{ Body: ChannelsTypes.ChangeMembersRequest }>): Promise<any> {
        const {company_id, workspace_id, channel_id} = request.body
        await this.channelsService.addMembers(request.body)
        return this.channelsService.getMembers(company_id, workspace_id, channel_id).then(a => this.addEmailsToMembers(a))
    }

    async removeMembers(request: FastifyRequest<{ Body: ChannelsTypes.ChangeMembersRequest }>): Promise<any> {
        const {company_id, workspace_id, channel_id} = request.body

        await this.channelsService.removeMembers(request.body)
        return this.channelsService.getMembers(company_id, workspace_id, channel_id).then(a => this.addEmailsToMembers(a))
    }

    edit(request: FastifyRequest<{ Body: ChannelsTypes.UpdateRequest }>) {
        return this.channelsService.update(request.body)
    }

    async delete(request: FastifyRequest<{ Body: ChannelsTypes.ChannelParameters }>) {
        // channel deletion has a bug we need to double check the deletion

        const res = await this.channelsService.delete(request.body)

        let done = false
        let attempts = 0
        while (!done) {
            const channels = await this.channelsService.all(request.body)
            const found = channels.find(a => a.id === request.body.channel_id)
            if (found) {
                if (attempts>2) throw new BadRequest("Can't delete channel after 3 requests")
                await this.channelsService.delete(request.body)
                attempts++
            } else {
                done = true
            }
        }

        return res
    }

    init(request: FastifyRequest<{ Querystring: ChannelsTypes.ChannelParameters }>) {
        return this.channelsService.init(request.query)
    }


    async direct(request: FastifyRequest<{ Querystring: ChannelsTypes.BaseChannelsParameters }>) {
        const data = await this.channelsService.getDirects(request.query.company_id)
        const res = __channelsFormat(data).filter(a => a.members.length > 0)
        const usersIds = new Set()

        res.forEach((c: any) => {
            c.members.forEach((m: string) => {
                usersIds.add(m)
            })
        })

        const usersHash = arrayToObject(await Promise.all(Array.from(usersIds.values()).map((user_id) => this.usersService.getUserById(user_id as string))), 'id')

        const currentUserToken = authCache[this.usersService.getJwtToken()] ? authCache[this.usersService.getJwtToken()]['id'] : await this.usersService.getCurrent().then(a => a.id)

        return res.map((a: ChannelsTypes.Channel) => {
            if (a.members) {
                const members = (a.members.length > 1) ? a.members.filter((a: string) => a != currentUserToken) : a.members
                a.name = members.map((a: string) => {
                    const u = usersHash[a]
                    return u.firstname + ' ' + u.lastname
                }).join(', ')
                a.members = members as any
            }
            return a
        })
    }


    async markRead(request: FastifyRequest<{ Body: ChannelsTypes.ChannelParameters }>) {
        const req = request.body
        return this.channelsService.markRead(req.company_id, req.workspace_id, req.channel_id)
    }

}