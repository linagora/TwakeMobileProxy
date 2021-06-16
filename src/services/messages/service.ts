import assert from "assert";
import Api from "../../common/twakeapi";
import {MessagesTypes} from "./types";
import {required} from "../../common/helpers";
import {BadRequest} from "../../common/errors";
import WhatsNewRequest = MessagesTypes.WhatsNewRequest;

export default class MessagesService {

    constructor(protected api: Api) {
    }

    async whatsNew(req: WhatsNewRequest) {
        return this.api.get(`/internal/services/notifications/v1/badges`, {"company_id": req.company_id}).then(a => a.resources)
    }

    fixDate(date: number): number {
        return String(date).length > 12 ? date : date * 1000
    }

    async getMessages(companyId: string, workspaceId: string, channelId: string, threadId?: string, messageId?: string, limit?: number, offset?: string): Promise<any> {
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
                id: messageId
            },
        }


        return this.api.post('/ajax/discussion/get', params).then(a => {
            if (a && a.status == 'error') {
                console.error('GOT ERROR', a)
                throw new BadRequest("something went wrong")
            }

            if (!a.data) return []

            return a.data.map((a: any) => {
                a.modification_date = this.fixDate(a.modification_date)
                a.creation_date = this.fixDate(a.creation_date)
                return a
            })
        })
    }

    async addMessage(companyId: string, workspaceId: string, channelId: string, originalString: string, prepared: any, threadId?: string, messageId?: string) {

        assert(companyId)
        assert(workspaceId)
        assert(channelId)
        // assert(originalString)
        assert(prepared)

        const params = {
            'object': {
                company_id: companyId,
                workspace_id: workspaceId,
                channel_id: channelId,
                thread_id: threadId,
                content: {
                    original_str: originalString,
                    prepared: prepared
                }
            }
        } as any

        if (messageId) {
            params.object.message_id = messageId
            params.object.id = messageId
        }

        return this.api.post('/ajax/discussion/save', params).then(a => a.data)
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
        }).then(a => a.data)
    }

    async addReaction(companyId: string, workspaceId: string, channelId: string, messageId: string, reaction: string, threadId?: string) {
        assert(companyId)
        assert(workspaceId)
        assert(channelId)
        assert(messageId)

        const params = {
            'object': {
                company_id: companyId,
                workspace_id: workspaceId,
                channel_id: channelId,
                id: messageId,
                _user_reaction: reaction,
                thread_id: threadId
            }
        }

        return this.api.post('/ajax/discussion/save', params).then(a => a.data)
    }

    async deleteMessage(companyId: string, workspaceId: string, channelId: string, messageId: string, threadId: string) {
        assert(companyId)
        assert(workspaceId)
        assert(channelId)
        assert(messageId)

        const params = {
            'object': {
                company_id: companyId,
                workspace_id: workspaceId,
                channel_id: channelId,
                id: messageId,
                thread_id: threadId,
            }
        }

        return this.api.post('/ajax/discussion/remove', params)
    }
}
