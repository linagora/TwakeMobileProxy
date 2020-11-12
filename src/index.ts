import Fastify, {FastifyInstance} from 'fastify'

// import {HandledException} from "./common/helpers";
import {AssertionError} from "assert";

import Authorization, {AuthParams} from './controllers/authorization'
import Users from './controllers/users'
import Channels from './controllers/channels'
import Messages from './controllers/messages'

import User from "./models/user";

const fastify: FastifyInstance = Fastify({ logger: true })

declare module "fastify" {
    export interface FastifyInstance {
        jwt: any
    }

    export interface FastifyRequest {
        jwtVerify: any,
        user: User,

    }
}
fastify.register(require('fastify-jwt'), {secret: 'supersecret'})


fastify.addHook("onRequest", async (request, reply) => {
    try {
        if (request.routerPath !== '/authorize') {
            await request.jwtVerify()
        }
    } catch (err) {
        reply.send(err)
    }
})

fastify.post('/authorize', async (request, reply) => await new Authorization().auth(request.body as AuthParams))
fastify.get('/users/current/get', async (request) =>
    await new Users(request.user).getCurrent((request.query as any).timezoneoffset))
fastify.get('/workspace/:workspace_id/channels', async (request) =>
    new Channels(request.user).listPublic((request.params as any).workspace_id)
)
fastify.get('/channels/:channel_id/messages', async (request) => {
    const channel_id = (request.params as any).channel_id
    const before = (request.query as any).before as string
    const limit = (request.query as any).limit as number
    return new Messages(request.user).get(channel_id, limit, before)
})
fastify.post('/channels/:channel_id/message', async (request) => {
    const channel_id = (request.params as any).channel_id
    return new Messages(request.user).update(channel_id, request.body)
})

fastify.setErrorHandler(function (error: Error, request, reply) {
    // if (error instanceof HandledException) {
    //     reply.status(400).send({"error": (error as HandledException).message})
    // }
    if (error instanceof AssertionError) {
        reply.status(400).send({"error": (error as AssertionError).message})
    } else {
        console.error(error)
        reply.status(500).send({"error": "something went wrong"})
    }
})

const start = async () => {
    try {
        await fastify.listen(3123, '::')
        // console.log(`fastify listening on 3123`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()
