import assert from "assert";
import Api from "../../common/twakeapi2";
import {UsersTypes} from "./types";
import {BadRequest} from "../../common/errors";

import {usersCache} from '../../common/simplecache'

export default class UsersService {

    constructor(protected api: Api) {
    }

    getJwtToken(){
        return this.api.token
    }

    async getCurrent(timeZoneOffset?: number) {
        const params = {} as any
        if (timeZoneOffset) {
            assert(!isNaN(+timeZoneOffset), 'timezone should be numeric (i.e. -180 for Moscow)')
            params.timezone = timeZoneOffset
        }
        return this.api.post('/ajax/users/current/get', params).then(a => a.data)
    }

    async getUserById(id: string) {

        // if (usersCache[id]) return usersCache[id]

        return this.api.post('/ajax/users/all/get', {'id': id}).then(a=>{
            if (a.errors && a.errors.length){
                throw new BadRequest(`User id ${id} not found`)
            }
            // usersCache[id] = a.data
            return a.data
        })
    }

    setJWTToken(token:string){
        this.api.token = token
        return this
    }

}