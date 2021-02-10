import Api from "../../common/twakeapi2";
import {ChannelsTypes} from "./types";

export default class ChannelsService {

    constructor(protected api: Api) {
    }

    getMembers(token: string, req: ChannelsTypes.ChannelParameters) {
        return this.api.withToken(token).get(`/internal/services/channels/v1/companies/${req.company_id}/workspaces/${req.workspace_id}/channels/${req.channel_id}/members`, {"limit": 1000}).then(a => a.resources)
    }

    update(token: string, req: ChannelsTypes.UpdateRequest) {
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

    async delete(token: string, req: ChannelsTypes.ChannelParameters) {
        await this.api.withToken(token).delete(`/internal/services/channels/v1/companies/${req.company_id}/workspaces/${req.workspace_id}/channels/${req.channel_id}`)
        return {success: true}
    }

    init(token: any, req: ChannelsTypes.ChannelParameters) {
        const params = {
            "multiple": [{
                "collection_id": `updates/${req.channel_id}`,
                "options": {"type": "updates"},
                "_grouped": true
            }]
        }
        return this.api.withToken(token).post('/ajax/core/collections/init', params).then(a => {
            return {
                notification_rooms: a.data.map((a: any) => 'previous:collections/' + a.data.room_id)
            }
        })
    }
}