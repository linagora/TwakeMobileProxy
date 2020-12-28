import Fastify, {FastifyInstance} from 'fastify'

// import {HandledException} from "./common/helpers";
import {BadRequest, Forbidden} from './common/errors';
import assert, {AssertionError} from "assert";

import Authorization, {ProlongParams} from './controllers/authorization'
import Users from './controllers/users'
import Channels, {ChannelsListRequest} from './controllers/channels'
import Messages, {
    DeleteMessageRequest,
    GetMessagesRequest,
    ReactionsRequest,
    UpsertMessageRequest
} from './controllers/messages'
import {authCache} from "./common/simplecache";
import AuthParams from "./models/auth_params";
import UserProfile, {UserProfileMock} from "./models/user_profile";
import Settings from './controllers/settings'
import Companies from './controllers/companies'
import Workspaces, {WorkspaceListRequest} from './controllers/workspaces'
import {toTwacode} from "./common/twacode";

const fastify: FastifyInstance = Fastify({logger: false})


// const x = toTwacode("hello *my friend* \n> something is here\n")
// console.log(x);


declare module "fastify" {
    export interface FastifyRequest {
        jwtVerify: any,
        user: UserProfile,
    }
}

function validQuery(listOfFields: string[]): object {
    return {
        querystring: {
            type: 'object',
            required: listOfFields
        }
    }
}

function validBody(listOfFields: string[]): object {
    return {
        body: {
            type: 'object',
            required: listOfFields
        }
    }
}


fastify.addHook("onRequest", async (request, reply) => {
    try {
        if (request.routerPath !== '/' && request.routerPath !== '/authorize' && request.routerPath !== '/authorization/prolong') {

            if (request.headers.authorization && request.headers.authorization.toLowerCase().indexOf('bearer') > -1) {
                const token = request.headers.authorization.substring(7).trim()

                if (!authCache[token]) {
                    return reply
                        .code(401)
                        .header('Content-Type', 'application/json; charset=utf-8')
                        .send({"error": "Wrong token"})
                }
                const user = authCache[token]

                request.user = {
                    jwtToken: token,
                    userId: user.id,
                    timeZoneOffset: user.timeZoneOffset || 0
                }

                // console.log(request.user)
            }
        }
    } catch (err) {
        reply.send(err)
    }
})
//

fastify.get('/', async (request, reply) => ({"ready": true}))
fastify.post('/authorize', async (request, reply) => await new Authorization(request).auth(request.body as AuthParams))
fastify.post('/authorization/prolong', async (request, reply) => new Authorization(request).prolong(request.body as ProlongParams))
fastify.get('/user', async (request, reply) => new Users(request).getCurrent(request.user.timeZoneOffset))
fastify.get('/users', async (request, reply) => new Users(request).getUsers((request.query as any).id))
fastify.get('/companies', async (request, reply) => new Companies(request).list())
fastify.get('/workspaces', {schema: validQuery(['company_id'])}, async (request, reply) => new Workspaces(request).list(request.query as WorkspaceListRequest))
fastify.get('/channels', {schema: validQuery(['company_id', 'workspace_id'])}, async (request) => new Channels(request).listPublic(request.query as ChannelsListRequest))
fastify.get('/messages', {schema: validQuery(['company_id', 'workspace_id', 'channel_id'])}, async (request) => new Messages(request).get(request.query as any))
fastify.post('/messages', {schema: validBody(['company_id', 'workspace_id', 'channel_id', 'original_str'])}, async (request) => new Messages(request).upsertMessage(request.body as UpsertMessageRequest))
fastify.delete('/messages', {schema: validBody(['company_id', 'workspace_id', 'channel_id', 'message_id'])}, async (request) => new Messages(request).deleteMessage(request.body as DeleteMessageRequest))
fastify.post('/reactions', {schema: validBody(['company_id', 'workspace_id', 'channel_id', 'message_id', 'reaction'])}, async (request) => new Messages(request).reactions(request.body as ReactionsRequest))
fastify.get('/direct', {schema: validQuery(['company_id'])}, async (request) => new Channels(request).listDirect((request.query as any).company_id))
fastify.get('/settings/emoji',  async (request) => new Settings(request).emoji())


// fastify.get('/company/:company_id/workspace/:workspace_id/channels', async (request) => {
//     const company_id = (request.params as any).company_id
//     const workspace_id = (request.params as any).workspace_id
//     return new Channels(request.user).listPublic2(company_id, workspace_id)
// })
//
// fastify.get('/company/:company_id/workspace/:workspace_id/channels/:channel_id/members', async (request) => {
//     const companyId = (request.params as any).company_id
//     const workspaceId = (request.params as any).workspace_id
//     const channelId = (request.params as any).channel_id
//     return new Channels(request.user).members(companyId, workspaceId, channelId)
// })


// fastify.get('/channels/:channel_id/init', async (request) => {
//     const channel_id = (request.params as any).channel_id
//     return new Messages(request.user).init(channel_id)
// })


fastify.setErrorHandler(function (error: Error, request, reply) {
    // if (error instanceof HandledException) {
    //     reply.status(400).send({"error": (error as HandledException).message})
    // }


    if (error instanceof AssertionError) {
        reply.status(400).send({"error": (error as AssertionError).message})
    } else if (error instanceof Forbidden) {
        reply.status(403).send({"error": error.message})
    } else if (error instanceof BadRequest) {
        reply.status(400).send({"error": error.message})
    } else if ((error as any).validation) {
        reply.status(400).send({"error": error.message})
    } else {
        console.error(error)
        reply.status(500).send({"error": "something went wrong"})
    }
})

const start = async () => {
    try {
        await fastify.listen(3123, '::')
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()
