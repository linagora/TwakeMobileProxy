import jwt from 'jsonwebtoken'
import Base from './base'
import assert from "assert";
import Users from './users'
import {authCache, refreshTokenCache, usersCache} from "../common/simplecache";
import {v4 as uuidv4} from 'uuid';
import AuthParams from "../models/auth_params";
import {Forbidden} from '../common/errors';
import {UserProfileMock} from "../models/user_profile";


export interface ProlongParams {
    refresh_token: string,
    timezoneoffset: number
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

        const res = await this.api.postDirect('/ajax/users/login', loginObject)

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

        return this.doAuth(res.data, params.timezoneoffset)
    }

    async prolong(params: ProlongParams) {

        assert(params.refresh_token, 'refresh_token is required')
        assert(params.timezoneoffset, 'timezoneoffset is required')

        const res = await this.api.postDirect('/ajax/users/login', {}, {"Authorization": "Bearer " + params.refresh_token})

        return this.doAuth(res.data, params.timezoneoffset)
    }

    async doAuth(data: any, timezoneoffset: number) {

        if (!data.access_token){
            throw new Forbidden('Authorization failed')
        }

        const token = data.access_token.value;

        if(this.userProfile){
            delete authCache[this.userProfile.jwtToken]
        }

        const mock = UserProfileMock
        mock.jwtToken = token

        authCache[token] = await new Users(UserProfileMock).getCurrent(timezoneoffset)

        return {
            "token": token,
            "expiration": data.access_token.expiration,
            "refresh_token": data.access_token.refresh,
            "refresh_expiration": data.access_token.refresh_expiration
        }
    }
}
