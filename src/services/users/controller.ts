import UsersService from './service'
import { UsersGetRequest, User } from './types'
import { FastifyRequest } from 'fastify'

export class UsersController {
    constructor(protected usersService: UsersService) {}

    async getUser({
        query,
    }: FastifyRequest<{ Querystring: UsersGetRequest }>) {
        let user: User
        if (query.id) {
            user = await this.usersService.getUserById(query.id)
        } else {
            user = await this.usersService.getCurrent(query.timezoneoffset)
        }
        return user
    }
}
