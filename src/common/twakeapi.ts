import Axios from 'axios'
import {BadRequest, Forbidden} from "./errors";
import config from './config'

import ApiType from "./types/api";
import {FastifyRequest} from "fastify";

const https = require('https');

const fetch = require('node-fetch');


const axios = Axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});


export default class Api implements ApiType {

    token: string = ""
    host: string = ""

    constructor(request: FastifyRequest) {

        let host = config.core_host ? config.core_host : ('https://' + request.hostname)

        this.host = host
        // console.log('API: ' + this.host)
        if (request.jwtToken)
            this.token = request.jwtToken
    }


    private async __action(method: string, url: string, params: any, headers : any = null): Promise<any> {

        if(!headers){
            headers = this.token ? {"Authorization": "Bearer " + this.token} : {}
        } else if (this.token) {
            headers["Authorization"] = "Bearer " + this.token
        }

        // console.log(`CURL -x ${method} '${url}' -d ${JSON.stringify(params)}`)

        // let log = `curl '${HOST}${url}' -X '${method}' -H 'authorization: Bearer ${this.token}' -H 'content-type: application/json'`
        //
        // if (method == 'POST') {
        //     log += `-d ${JSON.stringify(params)}}`
        // }
        //
        // console.log(log)

        console.log('\x1b[33m' + method, '\x1b[0m', url, '\x1b[2m', Object.keys(params).length ? JSON.stringify(params, null, 1) : '', '\x1b[0m')
        // console.log(method, url)

        let res = null

        try {
            if (method == 'GET') 
            res = await axios.get(this.host + url, {params, headers})
            else if (method == 'POST') {
                res = await axios.post(this.host + url, params, {headers})
            }
            else if (method == 'DELETE') {

                const x = await fetch(this.host + url, {method: 'DELETE', body: params, headers})
                // console.log(x)
                if (x.status >= 200 && x.status < 400) {
                    res = {data: {"success": true}}
                } else {
                    if (x.status === 404){
                        throw new Error('Object not found')
                    }
                    throw new Error('something went wrong')
                }
            } else
                throw new Error('wrong api method type')

        } catch (e) {
            if (e.response && e.response.status === 401) {
                throw new Forbidden('Wrong token')
            }

            if(e.response && e.response.status === 404){
                throw  new BadRequest('Object not found')
            }
            console.log(e)

            throw new BadRequest( e.response ? e.response.data.message : e.message)
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
