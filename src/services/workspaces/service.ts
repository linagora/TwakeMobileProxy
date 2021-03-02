import Api from "../../common/twakeapi2";
import {WorkspacesTypes} from "./types";
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
        }).then(a=>a.data.workspace)
        if (members && members.length) {
            await this.addMember(companyId, ws['id'], members)
        }
        return ws
    }
}