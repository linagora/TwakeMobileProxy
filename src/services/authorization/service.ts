import Api from "../../common/twakeapi";
import {Forbidden} from "../../common/errors";
import assert from "assert";


const getLoginObject = (username: string, password: string | null, token: string | null, fcm_token: string ) => {
    const loginObj =  { _username : username,  _remember_me: true,  'device': { 'type': "fcm",  'value': fcm_token,  'version': '2020.Q3.107'}} as any
    assert(password || token, 'password or token are required')
    if (password){ loginObj._password = password } else { loginObj._token = token }
    return loginObj
}


export default class AuthorizationService {

    constructor(protected api: Api) {
    }


    async __login(loginObject: any, headers: any){
        const res = await this.api.post('/ajax/users/login', loginObject, headers)

        if (res.data.status != "connected") {
            throw new Forbidden('Wrong credentials')
        }
        return res.access_token
    }

    async loginByToken(username:string, auth_token: string, fcm_token: string, jwtToken : any) : Promise<any>{
        return this.__login(getLoginObject(username,null,auth_token,fcm_token), jwtToken ? {"Authorization": "Bearer " + jwtToken} : {})
    }

    async loginByPassword(username: string, password: string, fcm_token: string): Promise<any> {
        return this.__login(getLoginObject(username,password,null,fcm_token), {})
    }

    async prolong(refresh_token: string, fcm_token: string): Promise<any> {

        const loginObject = {
            'device': {
                'type': "fcm",
                'value': fcm_token,
                'version': '2020.Q3.107',
            },
        }
        return this.__login(loginObject, {"Authorization": "Bearer " + refresh_token})
    }

    async logout(fcm_token: string): Promise<any> {
        const logoutObject = {
            'device': {
                'type': "fcm",
                'value': fcm_token,
                'version': '2020.Q3.107',
            },
        }
        const res = await this.api.post('/ajax/users/logout', logoutObject)
        return res
    }
}
