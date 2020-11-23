import jwt from 'jsonwebtoken'
import Base, {UserProfile} from './base'
import assert from "assert";
import Users from './users'

export interface AuthParams {
    username: string
    password: string
    device: string
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

        const res = await this.api.postDirect('/users/login', loginObject)

        let profile = {
            'SESSID': null,
            'REMEMBERME': null,
        } as any

        console.log(res.data)

        const cookies = res.headers['set-cookie']

        assert(cookies, 'Wrong credentials')

        cookies.forEach((c: string) => {
            const kv = c.split(';')[0].split('=')
            profile[kv[0]] = kv[1]
        })

        profile = profile as UserProfile;

        let user = await new Users(profile).getCurrent(params.timezoneoffset)
        profile.userId = user.user_id

        return {"token": jwt.sign(profile, "supersecret", {expiresIn: 60 * 60 * 24 * 7})}
    }

    async prolong() {
        const profile = {
            'SESSID': this.userProfile?.SESSID,
            'REMEMBERME': this.userProfile?.REMEMBERME,
        } as UserProfile

        const token = jwt.sign(profile, "supersecret", {expiresIn: 60 * 60 * 24 * 7})

        return {"token":token}

    }
}
