import Base from '../../common/base'
import {BadRequest} from "../../common/errors";
import {WorkspacesTypes} from "./types";
import WorkspaceBaseRequest = WorkspacesTypes.WorkspaceBaseRequest;
import WorkspacePostRequest = WorkspacesTypes.WorkspacePostRequest;
import WorkspaceRequest = WorkspacesTypes.WorkspaceRequest;
import WorkspaceMembersPostRequest = WorkspacesTypes.WorkspaceMembersPostRequest;
import ChannelsService from "../channels/service";
import {ChannelsTypes} from "../channels/types";


import {FastifyRequest} from "fastify";
import WorkspaceService from "./service";
import UsersService from "../users/service";


interface Workspace {
    id: string
    private: boolean
    logo: string
    color: string
    company_id: string
    name: string
    total_members: 6
    is_archived: boolean
    user_last_access: number,
    user_is_admin: boolean
}


export default class extends Base {
    async list(request: WorkspaceBaseRequest): Promise<Workspace[]> {

        const data = await this.api.getCurrentUser()
        return data.workspaces
            .filter((a: any) => a.group.id == request.company_id)
            .map((a: any) => {
                return {
                    id: a.id,
                    private: a.private,
                    logo: a.logo || 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTGyI3IzeJ0NMtz2CJnuolnLc_WFyVHtMffwg&usqp=CAU',
                    color: a.color,
                    company_id: a.group.id,
                    name: a.name,
                    total_members: a.total_members,
                    is_archived: a.is_archived,
                    user_last_access: a._user_last_access,
                    user_is_admin: a._user_is_admin
                } as Workspace
            }).sort((a: Workspace, b: Workspace) => a.name.localeCompare(b.name)) as Workspace[]

    }

    async add(request: WorkspacePostRequest): Promise<Workspace> {
        return this.api.addWorkspace(request.company_id, request.name, request.members || [])
    }

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

    async notifications(request: FastifyRequest<{ Querystring: ChannelsTypes.ChannelParameters }>) {

        const currentUser = await this.usersService.getCurrent(request.jwtToken)
        console.log(request.jwtToken)

        const rooms = {} as { [key: string]: { type: string, id: string } }

        rooms[`/companies/${request.query.company_id}/workspaces/${request.query.workspace_id}/channels?type=public`] = {
            type: "CHANNELS_LIST",
            id: 'PUBLIC'
        }
        rooms[`/companies/${request.query.company_id}/workspaces/${request.query.workspace_id}/channels?type=private&user=${currentUser.id}`] = {
            type: 'CHANNELS_LIST',
            id: 'PRIVATE'
        }

        const allChannelsIds = (await this.channelsService.all(request.jwtToken, request.query as ChannelsTypes.BaseChannelsParameters)).map((a: any) => a.id)

        allChannelsIds.forEach((channelId: string) => {
            rooms[`previous::channels/${channelId}/messages/updates`] = {type: 'CHANNEL', id: channelId}
        })


        return rooms
    }

}