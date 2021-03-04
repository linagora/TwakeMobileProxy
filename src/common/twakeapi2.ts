import Axios from 'axios'

const https = require('https');

const fetch = require('node-fetch');


const axios = Axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});


import {BadRequest, Forbidden} from "./errors";
import assert from "assert";
import {required} from "./helpers";
import config from './config'

import ApiType from "./types/api";

export default class Api implements ApiType {

    token: string = ""
    host: string = ""

    constructor(token?: string) {
        this.host = config.core_host
        if (token)
            this.token = token
    }


    private async __action(method: string, url: string, params: any, headers : any = null): Promise<any> {

        if(!headers){
            headers = this.token ? {"Authorization": "Bearer " + this.token} : {}
        }

        // console.log(`CURL -x ${method} '${url}' -d ${JSON.stringify(params)}`)

        // let log = `curl '${HOST}${url}' -X '${method}' -H 'authorization: Bearer ${this.token}' -H 'content-type: application/json'`
        //
        // if (method == 'POST') {
        //     log += `-d ${JSON.stringify(params)}}`
        // }
        //
        // console.log(log)

        console.log(method, url, JSON.stringify(params, null, 2))

        let res = null

        try {
            if (method == 'GET')
                res = await axios.get(this.host + url, {params, headers})
            else if (method == 'POST')
                res = await axios.post(this.host + url, params, {headers})
            else if (method == 'DELETE') {

                const x = await fetch(this.host + url, {method: 'DELETE', body: params, headers})
                console.log(x)
                if (x.status >= 200 && x.status < 400) {
                    res = {data: {"success": true}}
                } else {
                    console.log(x)
                    throw new Error('something went wrong')
                }
            } else
                throw new Error('wrong api method type')

        } catch (e) {
            if (e.response && e.response.status === 401) {
                throw new Forbidden('Wrong token')
            }

            console.error(e)
            throw new BadRequest(e.response.data.message)
        }

        if (res.data.errors && res.data.errors.includes('user_not_connected')) {
            throw new Forbidden('Wrong token')
        }

        return res.data as any || {}

    }

    async get(url: string, params: any): Promise<any> {
        return this.__action('GET', url, params)
    }

    async post(url: string, params: any, headers: any = null): Promise<any> {
        return this.__action('POST', url, params, headers)
    }

    async delete(url: string): Promise<any> {
        return this.__action('DELETE', url, null)
    }

    withToken(token: string): Api {
        this.token = token
        return this
    }

}