import assert from "assert";
import Api from "../../common/twakeapi2";
import {MessagesTypes} from "./types";
import WhatsNewRequest = MessagesTypes.WhatsNewRequest;
import {required} from "../../common/helpers";
import {BadRequest} from "../../common/errors";

export default class MessagesService {

    constructor(protected api: Api) {
    }

    whatsNew(req: WhatsNewRequest){
        return this.api.get(`/internal/services/notifications/v1/badges`, {"company_id": req.company_id}).then(a=>a.resources)
    }


    async getMessages(companyId: string, workspaceId: string, channelId: string, threadId?: string, messageId?: string,  limit?: number, offset?: string): Promise<any> {
        required(companyId, 'string')
        required(workspaceId, 'string')
        required(channelId, 'string')

        // if (id || threadId) {

        const params = {
            'options': {
                company_id: companyId,
                workspace_id: workspaceId,
                channel_id: channelId,
                limit: limit || 50,
                offset: offset,
                thread_id: threadId,
                parent_message_id: threadId, // backward compatibility
                id: messageId
            },
        }

        const fixDate = (date: number): number => date < 1611830724000 ? date * 1000 : date

        return this.api.post('/ajax/discussion/get', params).then(a=>{
            if (a && a.status == 'error'){
                console.error('GOT ERROR', a)
                throw new BadRequest("something went wrong")
            }

            return a.data.map((a:any)=>{
                a.modification_date = fixDate(a.modification_date)
                a.creation_date = fixDate(a.creation_date)
                return a
            })
        })
    }

    async addMessage(companyId: string, workspaceId: string, channelId: string, originalString: string, prepared: any, threadId?: string) {

        assert(companyId)
        assert(workspaceId)
        assert(channelId)
        assert(originalString)
        assert(prepared)

        const params = {
            'object': {
                company_id: companyId,
                workspace_id: workspaceId,
                channel_id: channelId,
                thread_id: threadId,
                parent_message_id: threadId, // backward compatibility
                content: {
                    original_str: originalString,
                    prepared: prepared
                }
            }
        }

        return this.api.post('/ajax/discussion/save', params).then(a=>a.data)
    }

    async getDriveObject(companyId: string, workspaceId: string, elementId: string) {
        assert(companyId)
        assert(workspaceId)
        assert(elementId)


        return this.api.post('/ajax/drive/v2/find', {
            'options': {
                'element_id': elementId,
                'company_id': companyId,
                'workspace_id': workspaceId,
                "public_access_token": null
            },
        }).then(a=>a.data)
    }

}