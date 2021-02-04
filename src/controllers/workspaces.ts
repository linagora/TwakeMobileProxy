import Base from '../common/base'
import {BadRequest} from "../common/errors";

export interface WorkspaceListRequest {
    company_id: string
}

export interface WorkspacePostRequest {
    company_id: string
    name: string
    members: string[]
}

export interface WorkspaceDeleteRequest {
    company_id: string
    workspace_id: string
}

export interface WorkspaceMembersPostRequest {
    company_id: string
    workspace_id: string
    members: string[] // тут email'ы
}

export interface WorkspaceMembersGetRequest {
    company_id: string
    workspace_id: string
}


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
    async list(request: WorkspaceListRequest): Promise<Workspace[]> {

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

    async delete(request: WorkspaceDeleteRequest): Promise<any> {
        await this.api.deleteWorkspace(request.company_id, request.workspace_id)
        return {"success": true}
    }

    async listMembers(request: WorkspaceMembersGetRequest) {
        return this.api.listWorkspaceMembers(request.company_id, request.workspace_id)
            .then(a => a?a.list: [])
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

}
