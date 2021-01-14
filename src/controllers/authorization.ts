import Base from './base'
import assert from "assert";
import Users from './users'
import {authCache} from "../common/simplecache";
import AuthParams from "../models/auth_params";
import {Forbidden} from '../common/errors';
import {UserProfileMock} from "../models/user_profile";


export interface ProlongParams {
    refresh_token: string
    timezoneoffset: number
    fcm_token: string
}

export interface InitParams {
    timezoneoffset: number
    fcm_token: string
    username: string
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
    async init(params: InitParams): Promise<any> {

        const loginObject = {
            _username: params.username,
            _token: this.request.jwtToken,
            _remember_me: true,
            'device': {
                'type': "fcm",
                'value': params.fcm_token,
                'version': '2020.Q3.107',
            },
        }

        const res = await this.api.postDirect('/ajax/users/login', loginObject, {"Authorization": "Bearer " + this.request.jwtToken})

        authCache[this.request.jwtToken] = await new Users(this.request).getCurrent(params.timezoneoffset);

        return {"success": res.data.data.status == 'connected'}
    }


    // async auth(params: AuthParams) {
    //
    //     const types = {'apple': 'apns', 'android': 'fcm'} as any
    //
    //     assert(params.username, 'username is required');
    //     assert(params.password, 'password is required');
    //     assert(params.device, 'device is required');
    //     assert(Object.keys(types).includes(params.device), "device should be in [" + Object.keys(types) + "]");
    //     assert(params.timezoneoffset, 'timezoneoffset is required');
    //     // assert(params.fcm_token, 'fcm_token is required');
    //
    //     const loginObject = {
    //         '_username': params.username,
    //         '_password': params.password,
    //         '_remember_me': true,
    //         'device': {
    //             'type': "fcm",
    //             'value': params.fcm_token,
    //             'version': '2020.Q3.107',
    //         },
    //     }
    //
    //     const res = await this.api.postDirect('/ajax/users/login', loginObject)
    //
    //     // let profile = {
    //     //     'SESSID': null,
    //     //     'REMEMBERME': null,
    //     // } as any
    //
    //
    //     // const cookies = res.headers['set-cookie']
    //
    //     // assert(cookies, 'Wrong credentials')
    //
    //     // cookies.forEach((c: string) => {
    //     //     const kv = c.split(';')[0].split('=')
    //     //     profile[kv[0]] = kv[1]
    //     // })
    //
    //     return this.doAuth(res.data, params.timezoneoffset)
    // }

    async prolong(params: ProlongParams) {

        assert(params.refresh_token, 'refresh_token is required')
        assert(params.timezoneoffset, 'timezoneoffset is required')
        // assert(params.fcm_token, 'fcm_token is required')

        const loginObject = {
            'device': {
                'type': "fcm",
                'value': params.fcm_token,
                'version': '2020.Q3.107',
            },
        }

        const res = await this.api.postDirect('/ajax/users/login', loginObject, {"Authorization": "Bearer " + params.refresh_token})

        return this.doAuth(res.data, params.timezoneoffset)
    }

    async doAuth(data: any, timezoneoffset: number) {

        if (!data.access_token) {
            throw new Forbidden('Authorization failed')
        }

        const token = data.access_token.value;

        if (this.request.jwtToken) {
            delete authCache[this.request.jwtToken]
        }

        authCache[token] = await new Users(this.request).getCurrent()

        return {
            "token": token,
            "expiration": data.access_token.expiration,
            "refresh_token": data.access_token.refresh,
            "refresh_expiration": data.access_token.refresh_expiration
        }
    }
}
