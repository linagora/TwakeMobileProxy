import Api from "../../common/twakeapi2";
import {ChannelsTypes} from "./types";
import MemberGetRequest = ChannelsTypes.MemberGetRequest;
import UpdateRequest = ChannelsTypes.UpdateRequest;
import DeleteRequest = ChannelsTypes.DeleteRequest;

export default class ChannelsService {

    constructor(protected api: Api) {
    }

    getMembers(token: string, req: MemberGetRequest) {
        return this.api.withToken(token).get(`/internal/services/channels/v1/companies/${req.company_id}/workspaces/${req.workspace_id}/channels/${req.channel_id}/members`, {"limit": 1000}).then(a => a.resources)
    }

    update(token: string, req: UpdateRequest) {
        const params = {
            "resource": {
                "id": req.channel_id,
                "company_id": req.company_id,
                "workspace_id": req.workspace_id,
                "icon": req.icon,
                "description": req.description,
                "name": req.name,
            }, "options": {}
        }
        return this.api.withToken(token).post(`/internal/services/channels/v1/companies/${req.company_id}/workspaces/${req.workspace_id}/channels/${req.channel_id}`, params).then(a => a.resource)
    }

    async delete(token: string, req: DeleteRequest) {
        await this.api.withToken(token).delete(`/internal/services/channels/v1/companies/${req.company_id}/workspaces/${req.workspace_id}/channels/${req.channel_id}`)
        console.log('aki')
        return {success: true}
    }

}