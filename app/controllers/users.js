import Base from './base.js'
import {usersCache} from '../common/simplecache.js'

/**
 * Users methods
 */
export default class extends Base {
  /**
   * Get current user /users/current/get
   * @param {int} timeZoneOffset
   * @return {Promise<{firstname: string, thumbnail: string, companies: [], user_id: string, username: string, lastname: string}>}
   */
  async getCurrent(timeZoneOffset) {
    const data = await this.api.post('/users/current/get', {timezone: timeZoneOffset})

    // console.log(data)

    const companiesHash = {}

    data.workspaces.forEach((ws) => {
      if (!companiesHash[ws.group.id]) {
        companiesHash[ws.group.id] = {
          id: ws.group.id,
          name: ws.group.name,
          // unique_name: ws.group.unique_name,
          logo: ws.group.logo,
          workspaces: {},
        }
      }

      companiesHash[ws.group.id].workspaces[ws.id] = {
        id: ws.id,
        name: ws.name,
        // unique_name: ws.unique_name,
        logo: ws.logo ||
        'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTGyI3IzeJ0NMtz2CJnuolnLc_WFyVHtMffwg&usqp=CAU',
      }

      // console.log(ws)
    })

    return {
      user_id: data.id,
      username: data.username,
      firstname: data.firstname,
      lastname: data.lastname,
      thumbnail: data.thumbnail,
      companies: Object.values(companiesHash).map((c) => {
        c.workspaces = Object.values(c.workspaces)
        return c
      }),
    }
  }

  /**
   * Get user by Id
   * @param {string} userId
   * @return {Promise<Object>}
   */
  async getUser(userId) { // TODO: move to users ctrl
    if (usersCache[userId]) {
      return Promise.resolve(usersCache[userId])
    }
    return this.api.post('/users/all/get', {'id': userId}).then((a) => {
      const user = {username: a.username, id: a.id, firstname: a.firstname, lastname: a.lastname, img: a.thumbnail}
      usersCache[a.id] = user
      return user
    })
  }
}
