import axios from 'axios'
import config from 'config'

/**
 * TwakeApi connector
 */
export default class {
  #userProfile

  /**
   * @param {object} userProfile
   */
  constructor(userProfile) {
    this.#userProfile = userProfile
  }

  /** POST to Twake API
   * @param {string} url
   * @param {object} params
   * @return {Promise<object>}
   */
  async post(url, params) {
    let headers = {}
    if (this.#userProfile) {
      headers = {Cookie: `SESSID=${this.#userProfile['SESSID']}; REMEMBERME=${this.#userProfile['REMEMBERME']};`}
    }
    // console.log(cookies)

    const res = await axios.post(config.twake.host + url, params, {headers})
    if (res.data.status && res.data.status === 'error') {
      console.log(res.data)
      throw new Error('Unknown error')
    }
    return res.data.data
  }

  /**
   * Direct post (no data unwrapping)
   * @param {string} url
   * @param {object} params
   * @param {object} [headers]
   * @return {Promise<AxiosResponse<T>>}
   */
  async postDirect(url, params, headers) {
    return await axios.post(config.twake.host + url, params, {headers})
  }
}
