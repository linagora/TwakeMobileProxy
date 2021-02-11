import assert from "assert";
import Api from "../../common/twakeapi2";
import {UsersTypes} from "./types";

export default class UsersService {

    constructor(protected api: Api) {
    }

    async getCurrent(jwtToken:string, timeZoneOffset?: number) {
        const params = {} as any
        if (timeZoneOffset) {
            assert(!isNaN(+timeZoneOffset), 'timezone should be numeric (i.e. -180 for Moscow)')
            params.timezone = timeZoneOffset
        }
        return this.api.withToken(jwtToken).post('/ajax/users/current/get', params).then(a=>a.data)
    }

}