import Base from './base'
import {arrayToObject} from '../common/helpers'
import Users from './users'
import assert from "assert";
import {fixIt, parseCompile, toTwacode} from "../common/twacode"
import {BadRequest} from "../common/errors";


export interface UpsertMessageRequest {
    company_id: string,
    workspace_id: string,
    channel_id: string,
    thread_id: string
    message_id: string,
    original_str: string
    prepared: Array<Object>
}

export interface GetMessagesRequest {
    company_id: string,
    workspace_id: string,
    channel_id: string,
    thread_id: string
    message_id: string,
    before_message_id: string,
    limit: number
}

export interface DeleteMessageRequest {
    company_id: string
    workspace_id: string,
    channel_id: string
    message_id: string
    thread_id: string
}

export interface ReactionsRequest {
    company_id: string
    workspace_id: string,
    channel_id: string
    message_id: string
    thread_id: string
    reaction: string
}

/**
 * Messages methods
 */
export default class extends Base {

    async init(channelId: string) {
        const data = await this.api.post('/ajax/core/collections/init', {
            multiple: [
                {
                    "collection_id": "messages/" + channelId,
                    "options": {
                        "type": "messages",

                        //If you let this empty, then you'll retrieve only the websocket information
                        "get_options": {
                            "channel_id": channelId,
                            "limit": 0,
                            "offset": false,
                            "thread_id": ""
                        }
                    },
                    "_grouped": true
                }
            ]
        })

        const wsInfo = data[0].data

        return wsInfo
    }

    /**
     * Get messages GET /channels/<channel_id>/messages
     * @param {GetMessagesRequest} req
     * @return {Promise<object[]>}
     */
    async get(req: GetMessagesRequest) {

        const params = {
            'options': {
                company_id: req.company_id,
                workspace_id: req.workspace_id,
                channel_id: req.channel_id,
                limit: req.limit || 50,
                offset: req.before_message_id,
                parent_message_id: req.thread_id, // backward compatibility
                thread_id: req.thread_id,
                id: req.message_id
            },
        }

        // console.log(JSON.stringify(params))

        let messages = await this.api.post('/ajax/discussion/get', params)

        if (!messages) {
            messages = []
        }

        // messages.forEach((m: any)=>{
        //     if(m.id == 'eb948a72-3583-11eb-8d6b-0242ac120004'){
        //         console.log(m.content)
        //         console.log(m.content.prepared[0].content)
        //     }
        // })


        const getPreview = async (elementId: string) => {
            const x = await this.api.post('/ajax/drive/v2/find', {
                'options': {
                    'element_id': elementId,
                    'workspace_id': "ac6c84e0-1dcc-11eb-82c8-0242ac120004",
                    "public_access_token": null
                },
            })
            return x.preview_link
        }

        const formatMessages = async (a: any) => {
            if (a.sender) {
                usersIds.add(a.sender)
            }

            if (!a.content) {
                a.content = {}
            }

            const r = {
                id: a.id,
                // parent_message_id: a.thread_id || a.parent_message_id || null, // backward compatibility
                thread_id: a.thread_id || a.parent_message_id || null,
                responses_count: a.responses_count || 0,
                sender: a.sender ? {user_id: a.sender} : this.versionFrom("2.0.0") ? {} : {
                    username: 'Bot',
                    img: a.hidden_data.custom_icon,
                },
                application_id: a.application_id,
                creation_date: a.creation_date,
                content: {
                    original_str: a.content.original_str,
                    prepared: null
                    // files: a.files
                },
                reactions: Object.keys(a.reactions).length ? a.reactions : null,
                user_reaction: a._user_reaction

            } as any

            let prepared = a.content.prepared || a.content.formatted || a.content

            // console.log(prepared)
            if (!Array.isArray(prepared)) {
                prepared = [prepared]
            }

            assert(Array.isArray(prepared), 'wrong message content data')

            try {

                for (let i = 0; i < prepared.length; i++) {
                    const p = prepared[i]
                    if (p.type === 'compile') {
                        const compiled = parseCompile(p.content)
                        compiled.forEach(a => prepared.push(a))
                        delete prepared[i]
                    }
                }
            } catch (e) {
                console.log(e)
            }

            const ready = [] as any[]

            prepared.forEach(item => {
                if (Array.isArray(item)) {
                    item.forEach(subitem => ready.push(subitem))
                } else {
                    // NOP also can contains data ...
                    if (item.type == 'nop' && Array.isArray(item.content) && item.content.length) {
                        item.content.forEach((s: any) => {
                            ready.push(s)
                        })
                        // console.log('push', item)
                    } else {
                        ready.push(item)
                    }
                }
            })

            for (let idx in ready) {
                try {

                    ready[idx] = await fixIt(ready[idx], getPreview)
                } catch (e) {
                    console.error('--- GOT ERROR ---')
                    console.log(e)
                    console.error(JSON.stringify(a.content, null, 2))
                    console.error('---')
                    ready[idx] = {"type": "unparseable"}
                }
            }

            r.content.prepared = ready.filter(r => r)

            if (!a.thread_id) {
                r.responses = []
            } else {
                r.thread_id = a.thread_id
            }

            r.channel_id = req.channel_id

            return r
        }


        const usersIds = new Set()
        let filteredMessages =
            messages.filter((a: any) => !(a['hidden_data'] instanceof Object && a['hidden_data']['type'] === 'init_channel'))

        filteredMessages = await Promise.all(filteredMessages.map((a: any) => formatMessages(a)))

        const usersCtrl = new Users(this.request)
        const usersHash = arrayToObject(await Promise.all(Array.from(usersIds.values()).map((user_id) => usersCtrl.getUser(user_id as string))), 'id')
        const messagesHash = arrayToObject(filteredMessages, 'id')
        filteredMessages.forEach((a: any) => {
            if (this.versionFrom("2.0.0")) {
                // not including users anymore
            } else {
                if (a.sender.user_id) {
                    const user = usersHash[a.sender.user_id]
                    if (user) {
                        a.sender = user
                    } else {
                        console.error('Not found for', a.sender)
                    }
                }
            }

            if (this.versionFrom("2.0.0")) {
                delete a.responses
                if (a['thread_id'] && messagesHash[a['thread_id']]) {
                    delete messagesHash[a.id]
                }
            } else {
                if (a['thread_id'] && messagesHash[a['thread_id']]) {
                    messagesHash[a['thread_id']].responses.push(a)
                    delete messagesHash[a.id]
                }
            }
        })
        filteredMessages.forEach((a: any) => {

            if (this.versionFrom("2.0.0")) {

                a.user_id = a.sender.user_id
                delete a.sender

                if (a.application_id) {
                    a.app_id = a.application_id
                }
                delete a.application_id


            } else {
                if (!a.sender.userId) { // Fake ID for bots
                    a.sender.userId = '00000000'
                }
            }

            if (a.responses) {
                a.responses = a.responses.sort((a: any, b: any) => {
                    return a.creation_date - b.creation_date
                })
            } else {
                // pass
            }
        })

        if (req.before_message_id){
            delete messagesHash[req.before_message_id]
        }

        return Object.values(messagesHash).sort((a: any, b: any) => a.creation_date - b.creation_date)
    }


    /**
     * Update message POST /channels/<channel_id>/messages
     * @param {string} channelId
     * @param {object} message
     * @return {Promise<{object}>}
     */
    async upsertMessage(message: UpsertMessageRequest) {


        assert(message.original_str, 'original_str is missing')

        const prepared = message.prepared || toTwacode(message.original_str)

        if (!prepared || prepared?.length === 0) {
            throw new BadRequest('Unparseable message')
        }

        const obj = {
            'object': {
                company_id: message.company_id,
                workspace_id: message.workspace_id,
                channel_id: message.channel_id,
                parent_message_id: message.thread_id, // backward compatibility
                thread_id: message.thread_id,
                content: {
                    original_str: message.original_str,
                    prepared: prepared
                }
            }
        }

        const x = await this.api.post('/ajax/discussion/save', obj)

        // return {
        //     "id": x['object']['id']
        // }
        console.log('server response', x)

        return x['object']
    }

    async deleteMessage(message: DeleteMessageRequest) {
        assert(message.company_id, 'company_id is required');
        assert(message.workspace_id, 'workspace_id is required');
        assert(message.channel_id, 'channel_id is required');
        assert(message.message_id, 'message_id is required');

        const obj = {
            'object': {
                company_id: message.company_id,
                workspace_id: message.workspace_id,
                channel_id: message.channel_id,
                id: message.message_id,
                parent_message_id: message.thread_id, // backward compatibility
                thread_id: message.thread_id
            }
        }

        // console.log(obj)
        const data =  await this.api.post('/ajax/discussion/remove', obj)
        console.log('DONE', data)
        return {"success":true}

    }

    async reactions(req: ReactionsRequest) {
        const obj = {
            'object': {
                company_id: req.company_id,
                workspace_id: req.workspace_id,
                channel_id: req.channel_id,
                id: req.message_id,
                parent_message_id: req.thread_id, // backward compatibility
                thread_id: req.thread_id,
                _user_reaction: req.reaction
            }
        }
        const res = await this.api.post('/ajax/discussion/save', obj)

        return {
            id: res.object.id,
            reactions: res.object.reactions
        }

    }
}
