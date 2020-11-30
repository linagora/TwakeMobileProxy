import axios from 'axios'
import UserProfile from "../models/user_profile";
import {BadRequest} from "./errors";

const HOST = 'https://devapi.twake.app'
/**
 * TwakeApi connector
 */
export default class {
    private readonly userProfile: any

    /**
     * @param {object} userProfile
     */
    constructor(userProfile?: UserProfile) {
        this.userProfile = userProfile
    }

    /** POST to Twake API
     * @param {string} url
     * @param {object} params
     * @return {Promise<object>}
     */
    async post(url: string, params: any): Promise<any> {
        let headers = {}

        // console.log('token: "' + this.userProfile.jwtToken + '"')

        if (this.userProfile && this.userProfile.jwtToken) {
            headers = {"Authorization": "Bearer " + this.userProfile.jwtToken}
        }

        // if (this.userProfile) {
        //   headers = {Cookie: `SESSID=${this.userProfile['SESSID']}; REMEMBERME=${this.userProfile['REMEMBERME']};`}
        // }
        // // console.log(cookies)

        const res = await axios.post(HOST + url, params, {headers})
        if (res.data.status && res.data.status === 'error') {
            console.error(res.data)
            throw new Error('Unknown error')
        }
        return res.data.data as any
    }


    async get(url: string, params: any): Promise<any> {
        let headers = {}

        // console.log('token: "' + this.userProfile.jwtToken + '"')

        if (this.userProfile && this.userProfile.jwtToken) {
            headers = {"Authorization": "Bearer " + this.userProfile.jwtToken}
        }

        // if (this.userProfile) {
        //   headers = {Cookie: `SESSID=${this.userProfile['SESSID']}; REMEMBERME=${this.userProfile['REMEMBERME']};`}
        // }
        // // console.log(cookies)


        try {
          // console.log(HOST + url)
          // console.log(headers)
            const res = await axios.get(HOST + url, {params, headers})

           return res.data as any
        } catch (e) {
          console.error(e)
            throw new BadRequest(e.response.data.message)
        }


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
