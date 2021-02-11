import assert from "assert";
import Api from "../../common/twakeapi2";
import {MessagesTypes} from "./types";
import WhatsNewRequest = MessagesTypes.WhatsNewRequest;

export default class MessagesService {

    constructor(protected api: Api) {
    }

    whatsNew(jwtToken: string, req: WhatsNewRequest){
        return this.api.get(`/internal/services/notifications/v1/badges`, {"company_id": req.company_id}).then(a=>a.resources)
    }


}