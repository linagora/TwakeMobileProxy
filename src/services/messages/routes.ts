import { FastifyInstance, FastifyRequest } from 'fastify'

import { MessagesController } from './controller'

import { MessagesTypes } from './types'
import {
    messagesDeleteSchema,
    messagesGetSchema,
    messagesPostSchema,
    messagesPutSchema,
    reactionsSchema,
} from './schemas'
import ChannelsService from '../channels/service'
import UsersService from '../users/service'
import Api from '../../common/twakeapi'
import MessagesService from './service'
import CompaniesService from '../companies/service'

export default function (
    fastify: FastifyInstance,
    _opts: any,
    next: () => void
) {
    function ctrl(request: FastifyRequest) {
        const api = new Api(request)
        return new MessagesController(
            new MessagesService(api),
            new ChannelsService(api),
            new UsersService(api),
            new CompaniesService(api),
        )
    }

    fastify.route({
        method: 'GET',
        url: '/messages',
        schema: messagesGetSchema,
        handler: (request) =>
            ctrl(request).get(
                request as FastifyRequest<{ Querystring: MessagesTypes.GetMessagesRequest }>
            ),
    })

    fastify.route({
        method: 'POST',
        url: '/messages',
        schema: messagesPostSchema,
        handler: (request) =>
            ctrl(request).insert(
                request as FastifyRequest<{ Body: MessagesTypes.InsertMessageRequest }>
            ),
    })

    fastify.route({
        method: 'PUT',
        url: '/messages',
        schema: messagesPutSchema,
        handler: (request) =>
            ctrl(request).insert(
                request as FastifyRequest<{ Body: MessagesTypes.InsertMessageRequest }>
            ),
    })

    fastify.route({
        method: 'POST',
        url: '/reactions',
        schema: reactionsSchema,
        handler: (request) =>
            ctrl(request).reactions(
                request as FastifyRequest<{ Body: MessagesTypes.ReactionsRequest }>
            ),
    })

    fastify.route({
        method: 'DELETE',
        url: '/messages',
        schema: messagesDeleteSchema,
        handler: (request) =>
            ctrl(request).deleteMessage(
                request as FastifyRequest<{ Body: MessagesTypes.MessageRequest }>
            ),
    })

    next()
}
