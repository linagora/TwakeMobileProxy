import Api from "../../common/twakeapi2";
import {ChannelsTypes} from "./types";

export default class ChannelsService {

    constructor(protected api: Api) {
    }

    getMembers(companyId: string, workspaceId: string, channelId: string) {
        return this.api.get(`/internal/services/channels/v1/companies/${companyId}/workspaces/${workspaceId}/channels/${channelId}/members`, {"limit": 1000}).then(a => a.resources)
    }

    update( req: ChannelsTypes.UpdateRequest) {
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
        return this.api.post(`/internal/services/channels/v1/companies/${req.company_id}/workspaces/${req.workspace_id}/channels/${req.channel_id}`, params).then(a => a.resource)
    }

    async delete( req: ChannelsTypes.ChannelParameters) {
        await this.api.delete(`/internal/services/channels/v1/companies/${req.company_id}/workspaces/${req.workspace_id}/channels/${req.channel_id}`)
        return {success: true}
    }

    init( req: ChannelsTypes.ChannelParameters) {
        const params = {
            "multiple": [{
                "collection_id": `updates/${req.channel_id}`,
                "options": {"type": "updates"},
                "_grouped": true
            }]
        }
        return this.api.post('/ajax/core/collections/init', params).then(a => {
            return {
                notification_rooms: a.data.map((a: any) => 'previous:collections/' + a.data.room_id)
            }
        })
    }


    public( req: ChannelsTypes.BaseChannelsParameters) {
        return this.api.get(`/internal/services/channels/v1/companies/${req.company_id}/workspaces/${req.workspace_id}/channels`, {"mine": true}).then(a=>a['resources'])
    }

    direct( req: ChannelsTypes.BaseChannelsParameters) {
        return this.api.get(`/internal/services/channels/v1/companies/${req.company_id}/workspaces/direct/channels`, {"mine": true}).then(a=>a['resources'])
    }

    all( req: ChannelsTypes.BaseChannelsParameters) {
        return Promise.all([this.public(req),this.direct(req)]).then(res =>[...res[0], ...res[1]])
    }



    async addMembers(req: ChannelsTypes.ChangeMembersRequest) {
        const promises = req.members.map(user_id => this.api.post(`/internal/services/channels/v1/companies/${req.company_id}/workspaces/${req.workspace_id}/channels/${req.channel_id}/members`,
            {"resource": {"user_id": user_id, "type": "member"}}
        ))

        return Promise.all(promises.map(p=>p.catch(e=>e)))
    }

    async removeMembers( req: ChannelsTypes.ChangeMembersRequest) {
        const promises = req.members.map(user_id => this.api.delete(`/internal/services/channels/v1/companies/${req.company_id}/workspaces/${req.workspace_id}/channels/${req.channel_id}/members/${user_id}`))
        return Promise.all(promises.map(p=>p.catch(e=>e)))
    }

    async getDirects(companyId: string) {
        return await this.api.get(`/internal/services/channels/v1/companies/${companyId}/workspaces/direct/channels`, {}).then(a=>a['resources'])
    }
}