import assert from 'assert'
import Api from '../../common/twakeapi'
import { User } from './types'
import { BadRequest } from '../../common/errors'

export default class UsersService {
    constructor(protected api: Api) {}

    async getCurrent(timeZoneOffset?: number): Promise<User> {
        const params = {} as any
        if (timeZoneOffset) {
            assert(
                !isNaN(+timeZoneOffset),
                'timezone should be numeric (i.e. -180 for Moscow)'
            )
            params.timezone = timeZoneOffset
        }
        let data = await this.api.post('/ajax/users/current/get', params)

        data = data.data
        data.is_admin =
            data.workspaces &&
            data.workspaces.length &&
            data.workspaces[0]._user_is_organization_administrator

        return {
            id: data.id,
            email: data.email,
            username: data.username,
            firstname: data.firstname,
            lastname: data.lastname,
            thumbnail: data.thumbnail,
            console_id: data.provider_id,
            status_icon: data.status_icon[0],
            status: data.status_icon[1],
            language: data.preference.locale,
            is_admin: data.is_admin,
            workspaces: data.workspaces,
        }
    }

    async getUserById(id: string): Promise<User> {
        let data = await this.api.post('/ajax/users/all/get', { id: id })

        if (data.errors && data.errors.length) {
            throw new BadRequest(`User id ${id} not found`)
        }

        data = data.data

        return {
            id: data.id,
            email: data.email,
            username: data.username,
            firstname: data.firstname,
            lastname: data.lastname,
            thumbnail: data.thumbnail,
            console_id: data.provider_id,
            status_icon: data.status_icon[0],
            status: data.status_icon[1],
            language: data.preference.locale,
            is_admin: false,
        }
    }

    setJWTToken(token: string) {
        this.api.token = token
        return this
    }

    getJwtToken() {
        return this.api.token
    }
}
