import Api from "../../common/twakeapi2";
import {ChannelsTypes} from "./types";
import MemberGetRequest = ChannelsTypes.MemberGetRequest;

export default class ChannelsService {

    constructor(protected api: Api) {}

    getMembers(token: string, req: MemberGetRequest) {
        return this.api.withToken(token).get(`/internal/services/channels/v1/companies/${req.company_id}/workspaces/${req.workspace_id}/channels/${req.channel_id}/members`, {"limit": 1000}).then(a=>a.resources)
    }

}