import { FastifyInstance, FastifyRequest } from 'fastify'
import {
    userSchema,
} from './schemas'

import { UsersController } from './controller'

import { UsersGetRequest } from './types'
import Api from '../../common/twakeapi'
import UsersService from './service'

export default function (
    fastify: FastifyInstance,
    _opts: any,
    next: () => void
) {
    function ctrl(request: FastifyRequest) {
        const api = new Api(request)
        const service = new UsersService(api)
        return new UsersController(service)
    }

    fastify.route({
        method: 'GET',
        url: '/user',
        schema: userSchema,
        handler: (request) =>
            ctrl(request).getUser(
                request as FastifyRequest<{ Querystring: UsersGetRequest }>
            ),
    })

    next()
}
