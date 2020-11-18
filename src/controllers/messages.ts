import Base from './base'
import {arrayToObject} from '../common/helpers'
import Users from './users'
import User from "../models/user";
import assert from "assert";
import {fixIt} from "../common/twacode"


/**
 * Messages methods
 */
export default class extends Base {

    /**
     * Get messages GET /channels/<channel_id>/messages
     * @param {string} channelId
     * @param {int} [limit]
     * @param {string} [beforeMessageId]
     * @return {Promise<object[]>}
     */
    async get(channelId: string, limit: number = 50, beforeMessageId?: string) {
        let messages = await this.api.post('/discussion/get', {
            'options': {
                'channel_id': channelId,
                'limit': limit,
                'offset': beforeMessageId,
                'parent_message_id': '',
            },
        })

        if (!messages) {
            messages = []
        }

        const usersIds = new Set()
        const filteredMessages =
            messages.filter((a: any) => !(a['hidden_data'] instanceof Object && a['hidden_data']['type'] === 'init_channel'))
                .map((a: any) => {
                    if (a.sender) {
                        usersIds.add(a.sender)
                    }

                    const r = {
                        id: a.id,
                        responses_count: a.responses_count,
                        sender: a.sender ? {user_id: a.sender} : {
                            username: a.hidden_data.custom_title,
                            img: a.hidden_data.custom_icon,
                        },
                        creation_date: a.creation_date,
                        content: {
                            original_str: a.content.original_str,
                            prepared: null
                            // files: a.files
                        },
                        reactions: a.reactions,

                    } as any


                    let prepared = a.content.prepared || a.content.formatted || a.content

                    assert(Array.isArray(prepared), 'wrong message content data')

                    const ready = [] as any[]

                    prepared.forEach(item => {
                        if (Array.isArray(item)) {
                            item.forEach(subitem => ready.push(subitem))
                        } else {
                            ready.push(item)
                        }
                    })

                    for (let idx in ready) {
                        try {
                            ready[idx] = fixIt(ready[idx])
                        } catch (e) {
                            console.error('---')
                            console.error(JSON.stringify(a.content, null, 2))
                            console.error('---')
                            ready[idx] = {"type": "unparseable"}
                        }
                    }

                    r.content.prepared = ready.filter(r => r)

                    if (!a.parent_message_id) {
                        r.responses = []
                    } else {
                        r.parent_message_id = a.parent_message_id
                    }

                    return r
                })

        const usersCtrl = new Users(this.userProfile)
        const usersHash = arrayToObject(await Promise.all(Array.from(usersIds.values()).map((user_id) => usersCtrl.getUser(user_id as string))), 'id')
        const messagesHash = arrayToObject(filteredMessages, 'id')
        filteredMessages.forEach((a: any) => {
            if (a.sender.user_id) {
                const user = usersHash[a.sender.user_id]
                if (user) {
                    a.sender = user
                } else {
                    console.error('Not found for', a.sender)
                }
            }
            if (a['parent_message_id']) {
                messagesHash[a['parent_message_id']].responses.push(a)
                delete messagesHash[a.id]
            }
        })
        filteredMessages.forEach((a: any) => {
            if (a.responses) {
                a.responses = a.responses.sort((a: any, b: any) => {
                    return a.creation_date - b.creation_date
                })
            } else {
                delete a['parent_message_id']
            }
        })
        return Object.values(messagesHash).sort((a: any, b: any) => a.creation_date - b.creation_date)
    }


    /**
     * Update message POST /channels/<channel_id>/messages
     * @param {string} channelId
     * @param {object} message
     * @return {Promise<{object}>}
     */
    async update(channelId: string, message: any) {
        throw Error('Not implemented')

        const obj = {
            'object': {
                id: '259e3670-1de0-11eb-991a-0242ac120004',
                front_id: '1093c37d-2b09-091e-e235-86c2561c0e29',
                channel_id: 'acf640c2-1dcc-11eb-9aff-0242ac120004',
                parent_message_id: '',
                responses_count: 1,
                message_type: null,
                sender: '46a68a02-1dcc-11eb-95bd-0242ac120004',
                application_id: null,
                edited: false,
                pinned: false,
                hidden_data: [],
                reactions: [],
                modification_date: 1604413410,
                creation_date: 1604413410,
                content: {
                    original_str: 'Hello there2!',
                    fallback_string: 'Hello there!',
                    prepared: ['Hello there'],
                    files: [],
                },
                user_specific_content: [],
                increment_at_time: '1',
                // _user_reaction: ":+1:"
                _user_reaction: '',
            },
        }
        // const x = await this.api.post('/discussion/save', obj)

        /**
         *
         */
        console.log(obj)
        return {'ok': 'ok'}
    }
}
