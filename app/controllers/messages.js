import Base from './base.js'
import {arrayToObject} from '../common/helpers.js'
import Messages from './messages.js'
/**
 * Messages methods
 */
export default class extends Base {
  // async init(channelId) {
  //   return await this.api.post('/core/collections/init', {
  //     'collection_id': `messages/${channelId}`,
  //     'options': {
  //       'type': 'messages',
  //       'get_options': {
  //         'channel_id': ':channel_id',
  //         'limit': 20,
  //         'offset': false,
  //         'parent_message_id': '',
  //       },
  //     },
  //     '_grouped': true,
  //   })
  // }

  /**
   * Get messages GET /channels/<channel_id>/messages
   * @param {string} channelId
   * @param {int} [limit]
   * @param {string} [beforeMessageId]
   * @return {Promise<object[]>}
   */
  async get(channelId, limit = 50, beforeMessageId = null) {
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

    const filteredMessages = messages.filter((a) =>
      !(a['hidden_data'] instanceof Object && a['hidden_data']['type'] === 'init_channel')).map((a) => {
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
          prepared: a.content.prepared || [a.content.formatted],
        // files: a.files
        },
        reactions: a.reactions,

      }

      if (!a.parent_message_id) {
        r.responses = []
      } else {
        r.parent_message_id = a.parent_message_id
      }

      return r
    })

    const messagesCtrl = new Messages(this.userProfile)
    const usersHash = arrayToObject(await Promise.all([...usersIds].map((u) => messagesCtrl.getUser(u))), 'id')
    const messagesHash = arrayToObject(filteredMessages, 'id')

    filteredMessages.forEach((a) => {
      if (a.sender.user_id) {
        const user = usersHash[a.sender.user_id]
        if (user) {
          a.sender = user
        } else {
          console.log('Not found for', a.sender)
        }
      }

      if (a['parent_message_id']) {
        messagesHash[a['parent_message_id']].responses.push(a)
        delete messagesHash[a.id]
      }
    })

    filteredMessages.forEach((a) => {
      if (a.responses) {
        a.responses = a.responses.sort((a, b) => {
          return a.creation_date - b.creation_date
        })
      } else {
        delete a['parent_message_id']
      }
    })

    return Object.values(messagesHash).sort((a, b) => a.creation_date - b.creation_date)
  }


  /**
   * Update message POST /channels/<channel_id>/messages
   * @param {string} channelId
   * @param {object} message
   * @return {Promise<{object}>}
   */
  async update(channelId, message) {
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
