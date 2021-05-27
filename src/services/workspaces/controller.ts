import {WorkspacesTypes} from "./types";
import ChannelsService from "../channels/service";
import {ChannelsTypes} from "../channels/types";


import {FastifyRequest} from "fastify";
import WorkspaceService from "./service";
import UsersService from "../users/service";
import WorkspaceRequest = WorkspacesTypes.WorkspaceRequest;
import WorkspaceMembersPostRequest = WorkspacesTypes.WorkspaceMembersPostRequest;
import Workspace = WorkspacesTypes.Workspace;


export class WorkspaceController {

    constructor(protected workspaceService: WorkspaceService, protected channelsService: ChannelsService, protected usersService: UsersService) {
    }

    async list(request: FastifyRequest<{ Querystring: WorkspacesTypes.WorkspaceBaseRequest }>): Promise<Workspace[]> {
        const data = await this.usersService.getCurrent()

        return data.workspaces?.filter((a: any) => a.group.id == request.query.company_id)
            .map((a: any) => {
                // console.log(a)
                let tm = a.total_members || a.stats?.total_members || 0
                return {
                    id: a.id,
                    private: a.private,
                    logo: a.logo || 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTGyI3IzeJ0NMtz2CJnuolnLc_WFyVHtMffwg&usqp=CAU',
                    color: a.color,
                    company_id: a.group.id,
                    name: a.name,
                    total_members: tm,
                    is_archived: a.is_archived,
                    user_last_access: a._user_last_access,
                    // user_is_admin: a._user_is_admin
                    permissions: data.is_admin ? ['EDIT_WORKSPACE'] : []
                } as Workspace
            }).sort((a: Workspace, b: Workspace) => a.name.localeCompare(b.name)) as Workspace[]

    }


    async add(request: FastifyRequest<{ Body: WorkspacesTypes.WorkspacePostRequest }>): Promise<Workspace> {
        const req = request.body
        return this.workspaceService.add(req.company_id, req.name, req.members || [])
    }

    async notifications(request: FastifyRequest<{ Querystring: ChannelsTypes.ChannelParameters }>) {

        const currentUser = await this.usersService.getCurrent()

        const rooms = [] as {  type: string, id: string, key: string }[]

        rooms.push({
            key: `/companies/${request.query.company_id}/workspaces/${request.query.workspace_id}/channels?type=public`,
            type: "CHANNELS_LIST",
            id: 'PUBLIC'
        })
        rooms.push({
            key: `/companies/${request.query.company_id}/workspaces/${request.query.workspace_id}/channels?type=private&user=${currentUser.id}`,
            type: 'CHANNELS_LIST',
            id: 'PRIVATE'
        })

        rooms.push({
            key: `/companies/${request.query.company_id}/workspaces/direct/channels?type=direct&user=${currentUser.id}`,
            type: 'DIRECTS_LIST',
            id: 'DIRECT'
        })

        // Listen for badge updates
        rooms.push({
            key: `/notifications?type=private&user=${currentUser.id}`,
            type: 'NOTIFICATIONS',
            id: 'PRIVATE'
        })

        const allChannelsIds = await this.channelsService.all(request.query as ChannelsTypes.BaseChannelsParameters).then(channel => {
            return channel.map((a: any) => {
                return {id: a.id, direct: a.visibility === 'direct'}
            })
        })


        allChannelsIds.forEach((channel: { id: string, direct: boolean }) => {
            rooms.push({
                key: `previous::channels/${channel.id}/messages/updates`,
                type: channel.direct ? 'DIRECT' : 'CHANNEL',
                id: channel.id
            })
        })


        return rooms
    }

    async delete({body: req}: FastifyRequest<{ Body: WorkspaceRequest }>): Promise<any> {
        await this.workspaceService.deleteWorkspace(req.company_id, req.workspace_id)
        return {"success": true}
    }

    async listMembers({query: req}: FastifyRequest<{ Querystring: WorkspaceRequest }>) {
        const users = await this.workspaceService.listWorkspaceMembers(
            req.company_id, 
            req.workspace_id
        )
        return users
    }

    async addMembers({body: req}: FastifyRequest<{ Body: WorkspaceMembersPostRequest }>): Promise<any> {
        await this.workspaceService.addWorkspaceMember(req.company_id, req.workspace_id, req.members)
        return {"success": true}
    }

    async removeMembers({body: req}: FastifyRequest<{ Body: WorkspaceMembersPostRequest }>): Promise<any> {
        await this.workspaceService.deleteWorkspaceMember(req.company_id, req.workspace_id, req.members)
        return {"success": true}
    }


}
