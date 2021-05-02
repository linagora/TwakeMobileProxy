import Api from "../../common/twakeapi";
import assert from "assert";

export default class WorkspaceService {

    constructor(protected api: Api) {
    }

    async addMember(companyId: string, workspaceId: string, emails: string[]) {
        assert(companyId, 'company id is required')
        assert(workspaceId, 'workspace id is required')
        return Promise.all(emails.map(email => this.api.post('/ajax/workspace/members/addlist', {
            "list": email,
            "workspaceId": workspaceId
        })))
    }

    async add(companyId: string, name: string, members: string[]) {
        const ws = await this.api.post('/ajax/workspace/create', {
            "name": name,
            "groupId": companyId,
            "channels": []
        }).then(a => a.data.workspace)
        if (members && members.length) {
            console.log('adding members')
            await this.addMember(companyId, ws['id'], members)
        }
        return ws
    }

    deleteWorkspace(companyId: string, workspaceId: string) {
        assert(companyId, 'company id is required')
        assert(workspaceId, 'workspace id is required')
        return this.api.post('/ajax/workspace/delete', {"workspaceId": workspaceId})
    }

    listWorkspaceMembers(companyId: string, workspaceId: string) {
        assert(companyId, 'company id is required')
        return this.api.post('/ajax/workspace/members/list', {"max": 10000, "workspaceId": workspaceId})
    }

    async addWorkspaceMember(companyId: string, workspaceId: string, emails: string[]) {
        assert(companyId, 'company id is required')
        assert(workspaceId, 'workspace id is required')
        return Promise.all(emails.map(email => this.api.post('/ajax/workspace/members/addlist', {
            "list": email,
            "workspaceId": workspaceId
        })))
    }

    deleteWorkspaceMember(companyId: string, workspaceId: string, usersIds: string[]) {
        assert(companyId, 'company id is required')
        assert(workspaceId, 'workspace id is required')
        assert(usersIds, 'users ids are required')
        return this.api.post('/ajax/workspace/members/remove', {"ids": usersIds, "workspaceId": workspaceId}
        )
    }


}
