import Base from '../../common/base'
import {WorkspacesTypes} from "./types";
import ChannelsService from "../channels/service";
import {ChannelsTypes} from "../channels/types";


import {FastifyRequest} from "fastify";
import WorkspaceService from "./service";
import UsersService from "../users/service";
import WorkspaceRequest = WorkspacesTypes.WorkspaceRequest;
import WorkspaceMembersPostRequest = WorkspacesTypes.WorkspaceMembersPostRequest;
import Workspace = WorkspacesTypes.Workspace;


export default class extends Base {




    async delete(request: WorkspaceRequest): Promise<any> {
        await this.api.deleteWorkspace(request.company_id, request.workspace_id)
        return {"success": true}
    }

    async listMembers(request: WorkspaceRequest) {
        return this.api.listWorkspaceMembers(request.company_id, request.workspace_id)
            .then(a => a ? a.list : [])
            .then(a => Object.values(a))
            .then(a => a.map((u: any) => u.user))
            .then((u: any) => u.map(({id, username, firstname, lastname}: any) => ({
                id,
                username,
                firstname,
                lastname
            })))
    }

    async addMembers(request: WorkspaceMembersPostRequest): Promise<any> {
        await this.api.addWorkspaceMember(request.company_id, request.workspace_id, request.members)
        return {"success": true}
    }

    async removeMembers(request: WorkspaceMembersPostRequest): Promise<any> {
        await this.api.deleteWorkspaceMember(request.company_id, request.workspace_id, request.members)
        return {"success": true}
    }

    // async notifications(request: )


}


export class WorkspaceController {

    // constructor(protected service: WorkspaceService, protected channelsService: ChannelsService, protected usersService: UsersService) {}
    constructor(protected workspaceService: WorkspaceService, protected channelsService: ChannelsService, protected usersService: UsersService) {
    }

    async list(request: FastifyRequest<{ Querystring: WorkspacesTypes.WorkspaceBaseRequest }>): Promise<Workspace[]> {
        const data = await this.usersService.getCurrent()



        return data.workspaces
            .filter((a: any) => a.group.id == request.query.company_id)
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
                    permissions: data.user_is_organization_administrator ? ['EDIT_WORKSPACE'] : []
                } as Workspace
            }).sort((a: Workspace, b: Workspace) => a.name.localeCompare(b.name)) as Workspace[]

    }


    async add(request: FastifyRequest<{ Body: WorkspacesTypes.WorkspacePostRequest }>): Promise<Workspace> {
        const req = request.body
        return  this.workspaceService.add(req.company_id, req.name, req.members || [])
    }

    async notifications(request: FastifyRequest<{ Querystring: ChannelsTypes.ChannelParameters }>) {

        const currentUser = await this.usersService.getCurrent()

        const rooms = {} as { [key: string]: { type: string, id: string } }

        rooms[`/companies/${request.query.company_id}/workspaces/${request.query.workspace_id}/channels?type=public`] = {
            type: "CHANNELS_LIST",
            id: 'PUBLIC'
        }
        rooms[`/companies/${request.query.company_id}/workspaces/${request.query.workspace_id}/channels?type=private&user=${currentUser.id}`] = {
            type: 'CHANNELS_LIST',
            id: 'PRIVATE'
        }
        rooms[`/notifications?type=private&user=${currentUser.id}`] = {
            type: 'NOTIFICATIONS',
            id: 'PRIVATE'
        }

        const allChannelsIds = await this.channelsService.all(request.query as ChannelsTypes.BaseChannelsParameters).then(channel => {
            return channel.map((a: any) => {
                return {id: a.id, direct: a.visibility === 'direct'}
            })
        })


        allChannelsIds.forEach((channel: { id: string, direct: boolean }) => {
            rooms[`previous::channels/${channel.id}/messages/updates`] = {
                type: channel.direct ? 'DIRECT' : 'CHANNEL',
                id: channel.id
            }
        })


        return rooms
    }

}
