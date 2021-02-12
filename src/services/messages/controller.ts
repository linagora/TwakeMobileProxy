import Base from '../../common/base'
import {arrayToObject} from '../../common/helpers'
import Users from '../../services/users/controller'
import assert from "assert";
import {fixIt, parseCompile, toTwacode} from "../../common/twacode"
import {BadRequest} from "../../common/errors";
import {MessagesTypes} from "./types";
import UsersService from "../workspaces/service";
import MessagesService from "./service";
import {ChannelsTypes} from "../channels/types";

import { FastifyRequest} from "fastify";
import ChannelsService from "../channels/service";


/**
 * Messages methods
 */
export default class extends Base {


    /**
     * Get messages GET /channels/<channel_id>/messages
     * @param {GetMessagesRequest} req
     * @return {Promise<object[]>}
     */
    async get(req: MessagesTypes.GetMessagesRequest) {

        assert(req.company_id, 'company_id is required');
        assert(req.workspace_id, 'workspace_id is required');
        assert(req.channel_id, 'channel_id is required');

        let messages = await this.api.getMessages(req.company_id, req.workspace_id, req.channel_id, req.thread_id, req.message_id, req.limit, req.before_message_id)

        if (!messages) {
            messages = []
        }

        // messages.forEach((m: any)=>{
        //     if(m.id == 'eb948a72-3583-11eb-8d6b-0242ac120004'){
        //         console.log(m.content)
        //         console.log(m.content.prepared[0].content)
        //     }
        // })


        const getPreview = async (elementId: string) => this.api.getDriveObject(req.company_id, req.workspace_id, elementId).then(a => a.preview_link)


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
                creation_date: a.creation_date < 1611830724000 ? a.creation_date * 1000 : a.creation_date,
                content: {
                    original_str: a.content.original_str,
                    prepared: null
                    // files: a.files
                },
                reactions: Object.keys(a.reactions).length ? a.reactions : null,
                // user_reaction: a._user_reaction

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

        filteredMessages = filteredMessages.filter((a:any)=>a.content && a.content.original_str)

        filteredMessages = await Promise.all(filteredMessages.map((a: any) => formatMessages(a)))

        const usersCtrl = new Users(this.request)
        const usersHash = arrayToObject(await Promise.all(Array.from(usersIds.values()).map((user_id) => usersCtrl.getUser(user_id as string))), 'id')
        const messagesHash = arrayToObject(filteredMessages, 'id')
        filteredMessages.forEach((a: any) => {
            if (this.versionFrom("2.0.0")) {
                // const user = usersHash[a.sender.user_id]
                // a.username = user.username
                // a.firstname = user.firstname
                // a.lastname = user.lastname
                // a.sender_thumbnail = user.thumbnail
                // a.sender_name = user.firstname + ' ' + user.lastname
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
                // if (a['thread_id'] && messagesHash[a['thread_id']]) {
                //     delete messagesHash[a.id]
                // }
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

        if (req.before_message_id) {
            delete messagesHash[req.before_message_id]
        }

        // console.log('returning messages:', Object.values(messagesHash).length)
        return Object.values(messagesHash).sort((a: any, b: any) => a.creation_date - b.creation_date)
    }


    /**
     * Update message POST /channels/<channel_id>/messages
     * @return {Promise<{object}>}
     * @param req
     */
    async insertMessage(req: MessagesTypes.InsertMessageRequest) {

        assert(req.company_id, 'company_id is required');
        assert(req.workspace_id, 'workspace_id is required');
        assert(req.channel_id, 'channel_id is required');

        const prepared = req.prepared || toTwacode(req.original_str)

        if (!prepared || prepared?.length === 0) {
            throw new BadRequest('Unparseable message')
        }

        const x = await this.api.addMessage(req.company_id, req.workspace_id, req.channel_id, req.original_str, prepared, req.thread_id)

        const id = x['object']['id']

        await new Promise(((resolve, reject) => {
            setTimeout(resolve, 500)
        }))

        const insertedMessage = await this.get({
            company_id: req.company_id,
            workspace_id: req.workspace_id,
            channel_id: req.channel_id,
            thread_id: req.thread_id,
            message_id: id,
            limit: 1
        } as MessagesTypes.GetMessagesRequest)

        if (!insertedMessage.length) {
            throw Error("Can't get inserted message")
        }

        return insertedMessage[0]


    }

    async updateMessage(req: MessagesTypes.UpdateMessageRequest) {

        return this.api.updateMessage(req.company_id, req.workspace_id, req.channel_id, req.message_id, req.thread_id, req.original_str, toTwacode)

    }

    async deleteMessage(req: MessagesTypes.DeleteMessageRequest) {
        assert(req.company_id, 'company_id is required');
        assert(req.workspace_id, 'workspace_id is required');
        assert(req.channel_id, 'channel_id is required');
        assert(req.message_id, 'message_id is required');

        try {
            const data = await this.api.deleteMessage(req.company_id, req.workspace_id, req.channel_id, req.message_id, req.thread_id)
            console.log('DONE', data)
        } catch (e) {
            //
            console.log('\n\n-----------\nError deleting message')
            const res = await this.api.getMessages(req.company_id, req.workspace_id, req.channel_id, req.thread_id, req.message_id, 1)
            console.log(res)
            console.log('GOT:', e)
            assert(false, 'Something went wrong')
        }

        return {"success": true}

    }

    async reactions(req: MessagesTypes.ReactionsRequest) {

        const res = await this.api.addReaction(req.company_id, req.workspace_id, req.channel_id, req.message_id, req.reaction, req.thread_id)

        return {
            id: res.object.id,
            reactions: res.object.reactions
        }

    }


}


export class MessagesController {

    // constructor(protected service: WorkspaceService, protected channelsService: ChannelsService, protected usersService: UsersService) {}
    constructor(protected messagesService: MessagesService, protected  channelsService: ChannelsService) {
    }

    async whatsnew(request: FastifyRequest<{ Querystring: MessagesTypes.WhatsNewRequest }>):Promise<any> {
        const req = request.query
        if (req.workspace_id) {
            let channels = await this.channelsService.all(request.jwtToken, req)

            console.log('channel_name\tlast_channel_activity\tlast_user_access')

            const stat = [] as any[]

            channels.forEach((channel:any)=>{
                stat.push({'name':channel.name, last_channel_activity: +channel.last_activity, last_user_access: +channel.user_member.last_access, greater: +channel.last_activity > +channel.user_member.last_access})
            })

            channels = channels.filter((channel: any) => +channel.last_activity > +channel.user_member.last_access)
                .map(({company_id, workspace_id, id}: any) => ({company_id, workspace_id, channel_id: id}))


            const messages = await this.messagesService.whatsNew(request.jwtToken, request.query)

            return [...channels, ...messages]
        } else
            return await this.messagesService.whatsNew(request.jwtToken, request.query)

    }

}