import axios from 'axios'
import User from "../models/user";

const HOST = 'https://api.twake.app/ajax'
/**
 * TwakeApi connector
 */
export default class {
  private readonly userProfile: any

  /**
   * @param {object} userProfile
   */
  constructor(userProfile?: User) {
    this.userProfile = userProfile
  }

  /** POST to Twake API
   * @param {string} url
   * @param {object} params
   * @return {Promise<object>}
   */
  async post(url: string, params: any): Promise<any> {
    let headers = {}
    if (this.userProfile) {
      headers = {Cookie: `SESSID=${this.userProfile['SESSID']}; REMEMBERME=${this.userProfile['REMEMBERME']};`}
    }
    // console.log(cookies)

    const res = await axios.post(HOST + url, params, {headers})
    if (res.data.status && res.data.status === 'error') {
      console.log(res.data)
      throw new Error('Unknown error')
    }
    return res.data.data as any
  }

  /**
   * Direct post (no data unwrapping)
   * @param {string} url
   * @param {object} params
   * @param {object} [headers]
   * @return {Promise<AxiosResponse<T>>}
   */
  async postDirect(url: string, params: any, headers: any = undefined) {
    return await axios.post(HOST + url, params, {headers})
  }
}
