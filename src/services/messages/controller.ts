import {arrayToObject} from '../../common/helpers'
// import Users from '../../services/users/controller'
import assert from "assert";
import {toTwacode} from "../../common/twacode"
import {BadRequest} from "../../common/errors";
import {MessagesTypes} from "./types";
import UsersService from "../users/service";
import MessagesService from "./service";
// import {ChannelsTypes} from "../channels/types";
import {FastifyRequest} from "fastify";
import ChannelsService from "../channels/service";
import GetMessagesRequest = MessagesTypes.GetMessagesRequest;


import emojis from '../../resources/emojis';


export class MessagesController {

    // constructor(protected service: WorkspaceService, protected channelsService: ChannelsService, protected usersService: UsersService) {}
    constructor(
        protected messagesService: MessagesService,
        protected channelsService: ChannelsService,
        protected usersService: UsersService
    ) {
    }

    async get(request: FastifyRequest<{ Querystring: MessagesTypes.GetMessagesRequest }>): Promise<any> {
        const req = request.query

        assert(req.company_id, 'company_id is required');
        assert(req.workspace_id, 'workspace_id is required');
        assert(req.channel_id, 'channel_id is required');

        if (req.after_date)
            return this.__getAfterDate(req)

        return this.__get(req)
    }

    async __getAfterDate(req: MessagesTypes.GetMessagesRequest): Promise<any> {

        let messages = [] as any[]

        const getMessages = (offset?: string): Promise<any[]> => this.messagesService.getMessages(req.company_id, req.workspace_id, req.channel_id, undefined, undefined, 20, offset)
        const minDateMessage = (messages: any[]) =>
            messages.reduce((previous, current) => previous.modification_date < current.modification_date ? previous : current);

        const getPart = async (offsetMessageId?: string) => {
            const part = await getMessages(offsetMessageId) // console.log('got', part.length,'messages')
            if (part.length) {
                const min_date = minDateMessage(part) // console.log(req.after_date < min_date.modification_date)
                messages = [...messages, ...part]
                if (req.after_date < min_date.modification_date)
                    await getPart(min_date.id)
            }
        }
        await getPart()
        return this.__formatMessage(req, messages.filter(m => m.modification_date > req.after_date))
    }


    async __get(req: MessagesTypes.GetMessagesRequest): Promise<any> {

        let messages = await this.messagesService.getMessages(req.company_id, req.workspace_id, req.channel_id, req.thread_id, req.message_id, req.limit, req.before_message_id) as any[]

        if (!req.thread_id) {
            for (const m of messages) {
                if (m.responses_count) {
                    const replies = messages.filter(r => r.thread_id === m.id || r.parent_message_id === m.id)
                    if (replies.length < m.responses_count) {
                        const existed_replies = replies.reduce((acc, curr) => (acc[curr.id] = true, acc), {});
                        const all_thread_replies = await this.messagesService.getMessages(req.company_id, req.workspace_id, req.channel_id, m.id, undefined, m.responses_count, undefined) as any[]
                        messages = [...messages, ...all_thread_replies.filter(a => !existed_replies[a.id])]
                    }
                }
            }
        }

        if (!messages) {
            console.log('GOT NO MESSAGES FROM CORE')
            messages = []
        }

        return this.__formatMessage(req, messages)

    }

    async __formatMessage(req: MessagesTypes.GetMessagesRequest, messages: any[]): Promise<any> {


        // const getPreview = async (elementId: string) =>
        // this.messagesService.getDriveObject(req.company_id,
        // req.workspace_id, elementId).then(a => a.preview_link)

        const formatMessages = async (a: any) => {
            if (a.sender) {
                usersIds.add(a.sender)
            }

            if (!a.content) {
                a.content = {}
            }

            let processedReactions: Record<string, {users: Array<string>, count: number}> = {}
            // Messaging API is changing reactions format, so we now support old formats and new ones
            // see https://github.com/linagora/Twake-Mobile/issues/508
            if (!Array.isArray(a.reactions)) {
                const newReactions = []
                for (const key in a.reactions) {
                    let newEntry = {
                        name: key,
                        users: a.reactions[key]['users'],
                        count: a.reactions[key]['count'],
                    }
                    newReactions.push(newEntry)
                }

                // update reactions to new format
                a.reactions = newReactions
            }
            for (const r of (a.reactions as Array<{[key: string]: any}>)) {
                r.name = r.name.startsWith(':') ? emojis[r.name.substring(1, r.name.length - 1)] || '👍' : r.name        

                // processedReactions[emoji] = {
                    // users: (v as any).users,
                    // count: (v as any).count
                // }
            }

            const r = {
                id: a.id,
                // parent_message_id: a.thread_id || a.parent_message_id || null, // backward compatibility
                thread_id: a.thread_id || a.parent_message_id || null,
                responses_count: a.responses_count || 0,
                sender: a.sender ? {user_id: a.sender} : {},
                application_id: a.application_id,
                creation_date: this.messagesService.fixDate(a.creation_date),
                modification_date: this.messagesService.fixDate(a.modification_date),
                content: {
                    original_str: a.content.original_str,
                    prepared: null
                    // files: a.files
                },
                reactions: a.reactions,
                // user_reaction: a._user_reaction

            } as any

            let prepared = a.content.prepared || a.content.formatted || a.content
            if (!Array.isArray(prepared)){
                prepared = [prepared]
            }
            // const last = (prepared as Array<string | {[key: string]: any}>).pop()
            const fileMetadataAdd = async (prepared: Array<any>) => {
                for (let item of prepared) {
                    if (item instanceof String) continue;
                    if (item instanceof Object && item.type === 'file') {
                        const file = await this.messagesService.getDriveObject(
                            req.company_id,
                            req.workspace_id == 'direct' 
                                ? req.fallback_ws_id // temporary, will be removed in future API
                                : req.workspace_id, 
                            item.content
                        )
                        if (!file) return

                        // Grab the latest version of the file
                        const latest = file.path.pop()
                        item.metadata = {
                            name: latest.name,
                            size: file.size,
                            preview: latest.preview_has_been_generated
                                ? latest.preview_link
                                : null,
                            download: '/ajax/drive/download?workspace_id=' +
                                `${file.workspace_id}&element_id=${file.id}` +
                                '&download=1'
                        }
                    } else if (item instanceof Object && item.type === 'nop') {
                        // if the item is nop which is always in the end, then recurse on its content
                        await fileMetadataAdd(item.content)
                    }
                }
            }
            // call the function on prepared
            await fileMetadataAdd(prepared)
            
            r.content.prepared = prepared

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

        filteredMessages = filteredMessages.filter((a:any)=>a.application_id || a.sender)
        // filteredMessages = filteredMessages.filter((a: any) => a.content && a.content.original_str)



        filteredMessages = await Promise.all(filteredMessages.map((a: any) => formatMessages(a)))

        filteredMessages = filteredMessages.filter((a: any) => a && a.id)

        // const usersHash = arrayToObject(await Promise.all(Array.from(usersIds.values()).map((user_id) => this.usersService.getUserById(user_id as string))), 'id')

        const messagesHash = arrayToObject(filteredMessages, 'id')
        filteredMessages.forEach((a: any) => {
            delete a.responses
            a.user_id = a.sender.user_id
            delete a.sender

            if (a.application_id) {
                a.app_id = a.application_id
            }
            delete a.application_id

        })

        if (req.before_message_id) {
            delete messagesHash[req.before_message_id]
        }

        return Object.values(messagesHash).sort((a: any, b: any) => a.creation_date - b.creation_date)
    }

    async whatsnew(request: FastifyRequest<{ Querystring: MessagesTypes.WhatsNewRequest }>): Promise<any> {
        const req = request.query
        if (req.workspace_id) {
            let channels = await this.channelsService.all(req)

            console.log('channel_name\tlast_channel_activity\tlast_user_access')

            const stat = [] as any[]

            channels.forEach((channel: any) => {
                stat.push({
                    'name': channel.name,
                    last_channel_activity: +channel.last_activity,
                    last_user_access: +channel.user_member.last_access,
                    greater: +channel.last_activity > +channel.user_member.last_access
                })
            })

            channels = channels.filter((channel: any) => +channel.last_activity > +channel.user_member.last_access)
                .map(({company_id, workspace_id, id}: any) => ({company_id, workspace_id, channel_id: id}))


            const messages = await this.messagesService.whatsNew(request.query)

            return [...channels, ...messages]
        } else
            return await this.messagesService.whatsNew(request.query)

    }

    async insert(request: FastifyRequest<{ Body: MessagesTypes.InsertMessageRequest }>): Promise<any> {
        const req = request.body
        assert(req.company_id, 'company_id is required');
        assert(req.workspace_id, 'workspace_id is required');
        assert(req.channel_id, 'channel_id is required');

        const prepared = req.prepared || toTwacode(req.original_str)

        if (!prepared || prepared?.length === 0) {
            throw new BadRequest('Unparseable message')
        }

        const msg = await this.messagesService.addMessage(req.company_id, req.workspace_id, req.channel_id, req.original_str, prepared, req.thread_id, req.message_id).then(a => a.object)

        return (await this.__formatMessage(req as any as GetMessagesRequest, [msg]))[0]


    }

    async reactions({body}: FastifyRequest<{Body:MessagesTypes.ReactionsRequest}>) {

        const res = await this.messagesService.addReaction(body.company_id, body.workspace_id, body.channel_id, body.message_id, body.reaction, body.thread_id)

        return {
            id: res.object.id,
            reactions: res.object.reactions
        }

    }


    async deleteMessage({body}: FastifyRequest<{Body: MessagesTypes.MessageRequest}>) {

        try {
            const data = await this.messagesService.deleteMessage(body.company_id, body.workspace_id, body.channel_id, body.message_id, body.thread_id)
            console.log('DONE', data)
        } catch (e) {
            //
            console.log('\n\n-----------\nError deleting message')
            const res = await this.messagesService.getMessages(body.company_id, body.workspace_id, body.channel_id, body.thread_id, body.message_id, 1)
            console.log(res)
            console.log('GOT:', e)
            assert(false, 'Something went wrong')
        }

        return {"success": true}
    }
}
