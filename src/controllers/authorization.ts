import jwt from 'jsonwebtoken'
import Base from './base'
import assert from "assert";
import Users from './users'
import {authCache, refreshTokenCache} from "../common/simplecache";
import { v4 as uuidv4 } from 'uuid';
import AuthParams from "../models/auth_params";
import {Forbidden} from '../common/errors';



export interface ProlongParams{
    refresh_token: string
}

/**
 * Authorization methods
 */
export default class extends Base {
    /**
     * /authorize method
     * @param {AuthParams} params
     * @return {Promise<{token:string}>}
     */

    async auth(params: AuthParams) {

        const types = {'apple': 'apns', 'android': 'fcm'} as any

        assert(params.username, 'username is required');
        assert(params.password, 'password is required');
        assert(params.device, 'device is required');
        assert(Object.keys(types).includes(params.device), "device should be in [" + Object.keys(types) + "]");
        assert(params.timezoneoffset, 'timezoneoffset is required');

        const loginObject = {
            '_username': params.username,
            '_password': params.password,
            '_remember_me': true,
            'device': {
                'type': types[params.device],
                'value': 'some',
                'version': '2020.Q3.107',
            },
        }

        const res = await this.api.postDirect('/users/login', loginObject)

        // let profile = {
        //     'SESSID': null,
        //     'REMEMBERME': null,
        // } as any


        // const cookies = res.headers['set-cookie']

        // assert(cookies, 'Wrong credentials')

        // cookies.forEach((c: string) => {
        //     const kv = c.split(';')[0].split('=')
        //     profile[kv[0]] = kv[1]
        // })


        const token = res.data.access_token.value;

        const refreshToken = uuidv4()
        // console.log(profile)

        let user =

        authCache[token] = await new Users({"jwtToken": token, userId:""}).getCurrent(params.timezoneoffset)

        // temporary solution (waiting for full JWT implementation)
        refreshTokenCache[refreshToken] = params as AuthParams

        // return {"token": jwt.sign(profile, "supersecret", {expiresIn: 60 * 60 * 24 * 7})}

        return {
            "token":  token,
            "expiration": res.data.access_token.expiration,
            "refresh_token": refreshToken,
            "refresh_expiration": new Date().getTime() + 1000*60*60*24*30,
        }
    }

    async prolong(params: ProlongParams) {

        assert(params.refresh_token,'refresh_token is required')

        if (!refreshTokenCache[params.refresh_token]){
            throw new Forbidden("Invalid token")
        }
        // temporary solution (waiting for full JWT implementation)
        return this.auth(refreshTokenCache[params.refresh_token])
    }
}
