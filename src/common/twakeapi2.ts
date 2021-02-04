import axios from 'axios'
import {BadRequest, Forbidden} from "./errors";
import assert from "assert";
import {required} from "./helpers";

const HOST = 'https://beta.twake.app'

import ApiType from "./types/api";

export default class Api implements ApiType {

    token: string = ""
    constructor() {}


    private async __action(method: string, url: string, params: any): Promise<any> {

        let headers = {}

        if (this.token) {
            headers = {"Authorization": "Bearer " + this.token}
        }

        console.log(method, url, JSON.stringify(params))

        let res = null

        try {
            if (method == 'GET')
                res = await axios.get(HOST + url, {params, headers})
            else if (method == 'POST')
                res = await axios.post(HOST + url, params, {headers})
            else if (method == 'DELETE')
                res = await axios.delete(HOST + url, {headers})
            else
                throw new Error('wrong api method type')

        } catch (e) {
            if (e.response && e.response.status === 401){
                throw new Forbidden('Wrong token')
            }

            console.error(e)
            throw new BadRequest(e.response.data.message)
        }

        if (res.data.errors && res.data.errors.includes('user_not_connected')) {
            throw new Forbidden('Wrong token')
        }
        return res.data as any

    }

    async get(url: string, params: any): Promise<any> {
        return this.__action('GET', url,params)
    }

    async post(url: string, params: any): Promise<any> {
        return this.__action('POST', url,params)
    }

    async delete(url: string, params: any): Promise<any> {
        return this.__action('DELETE', url,params)
    }

    withToken(token: string): Api {
        this.token = token
        return this
    }

}