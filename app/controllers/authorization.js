import config from 'config'
import jwt from 'jsonwebtoken'
import Base from './base.js'

/**
 * Authorization methods
 */
export default class extends Base {
  /**
   * /authorize method
   * @param {string} username
   * @param {string} password
   * @param {string} device - the device should be "apple" or "android"
   * @return {Promise<{token:string}>}
   */
  async auth({username, password, device}) {
    const loginObject = {
      '_username': username,
      '_password': password,
      '_remember_me': true,
      'device': {
        'type': {'apple': 'apns', 'android': 'fcm'}[device],
        'value': 'some',
        'version': '2020.Q3.107',
      },
    }

    const res = await this.api.postDirect('/users/login', loginObject)

    const profile = {
      'SESSID': null,
      'REMEMBERME': null,
    }

    const cookies = res.headers['set-cookie']

    // console.log(cookies)

    cookies.forEach((c) => {
      const kv = c.split(';')[0].split('=')
      profile[kv[0]] = kv[1]
    })

    return {token: jwt.sign(profile, config.jwt.secret, {expiresIn: 60 * 60})}
  }
}
