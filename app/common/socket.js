import {websocketUsersCache} from './simplecache.js'
import jwt from 'jsonwebtoken'
import config from 'config'
import Users from '../controllers/users.js'

/**
 * SocketProcessor class
 */
export default class SocketProcessor {
  #ws
  #token

  /**
   * @param {WebSocket.Server} ws
   */
  constructor(ws) {
    this.#ws = ws
    this.#token = null
  }

  /**
   * @param {string} message
   */
  onMessage(message) {
    let action; let data
    try {
      [action, data] = JSON.parse(message)
      console.log(`Received action ${action} with data: ${JSON.stringify(data)}`)
    } catch (e) {
      if (e instanceof SyntaxError) {
        this.send('error', {'message': 'wrong format'})
        return
      }
    }

    if (this.methods[action] && this.methods[action] instanceof Function) {
      this.methods[action](this, data)
    } else {
      this.send('error', 'Unknown action')
    }
  }

  methods = {
    init: async (sp, data) => {
      let res = null

      try {
        res = jwt.verify(data.token, config.jwt.secret)
      } catch (e) {
        sp.send('error', {message: 'wrong token'})
      }

      const user = await new Users(res).getCurrent(-180) // TODO: remove hardcode
      websocketUsersCache[user.user_id] = sp
    },
  }


  /**
   * @param {string} action
   * @param {object} payload
   */
  send(action, payload) {
    if (this.#ws.readyState !== 1) {
      delete websocketUsersCache[this.#token]
    }
    this.#ws.send(JSON.stringify([action, payload]))
  }
}
