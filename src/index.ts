import Fastify, {FastifyInstance} from 'fastify'
// import {HandledException} from "./common/helpers";
import {BadRequest, Forbidden} from './common/errors';
import {AssertionError} from "assert";

import Authorization, {InitParams, ProlongParams} from './controllers/authorization'
import Users from './controllers/users'
import Channels, {ChannelsAddRequest, ChannelsListRequest} from './controllers/channels'
import Messages, {DeleteMessageRequest, ReactionsRequest, UpsertMessageRequest} from './controllers/messages'
import Settings from './controllers/settings'
import Companies from './controllers/companies'
import Workspaces, {WorkspaceListRequest} from './controllers/workspaces'

const fastify: FastifyInstance = Fastify({logger: false})


// const x = toTwacode("hello *my friend* \n> something is here\n")
// console.log(x);


declare module "fastify" {
    export interface FastifyRequest {
        // user: UserProfile,
        jwtToken: string
    }
}


fastify.addHook("onRequest", async (request, reply) => {
    try {
        if (request.routerPath !== '/' && request.routerPath !== '/authorize' && request.routerPath !== '/authorization/prolong' && request.routerPath !== '/documentation/json' && request.routerPath !== '/init') {

            if (request.headers.authorization && request.headers.authorization.toLowerCase().indexOf('bearer') > -1) {
                request.jwtToken = request.headers.authorization.substring(7).trim()

                // if (!authCache[token]) {
                //     return reply
                //         .code(401)
                //         .header('Content-Type', 'application/json; charset=utf-8')
                //         .send({"error": "Wrong token"})
                // }
                // const user = authCache[token]
                //
                // request.user = {
                //     jwtToken: token,
                //     userId: user.id,
                //     timeZoneOffset: user.timeZoneOffset || 0
                // }

                // console.log(request.user)
            }
        }
    } catch (err) {
        reply.send(err)
    }
})
//

fastify.addSchema({
    $id: 'commonSchema',
    type: 'object',
    properties: {
        'accept-version': {type: 'string', default: '2.0.0', value: '2'}
    }
})


const initSchema = {
    tags: ['User related'],
    summary: 'Initial method',
    body: {
        type: 'object', "required": ["fcm_token", "timezoneoffset", "username", "token"],
        "properties": {
            "fcm_token": {"type": "string"},
            "timezoneoffset": {"type": "integer"},
            "username": {type: "string"},
            "token": {type: "string"}
        }
    },
    response: {
        200: {
            description: 'Successful response',
            type: 'object',
            properties: {
                success: {type: 'boolean'}
            }
        }
    }

}

const prolongSchema = {
    tags: ['User related'],
    summary: 'Prolong security token',
    body: {
        type: 'object', "required": ["fcm_token", "timezoneoffset", "refresh_token"],
        "properties": {
            "fcm_token": {"type": "string"},
            "timezoneoffset": {"type": "integer"},
            "refresh_token": {"type": "string"}
        }
    }
}


const userSchema = {
    tags: ['User related'],
    summary: 'Get current user',

    querystring: {type: 'object', "required": [], "properties": {"timezoneoffset": {"type": "integer"}}}
}

const usersSchema = {
    tags: ['References'],
    summary: 'Get users by id',
    querystring: {type: 'object', "required": ["id"], "properties": {"id": {"type": "string"}}}
}

const companiesSchema = {
    tags: ['Companies / workspaces'],
    summary: "List of user's companies",
    querystring: {type: 'object', required: [], "properties": {}}
}

const workspacesSchema = {
    tags: ['Companies / workspaces'],
    summary: 'List of company workspaces',
    querystring: {type: 'object', "required": ['company_id'], "properties": {"company_id": {"type": "string"}}}
}

const channelsGetSchema = {
    tags: ['Channels'],
    summary: 'List of public/private channels',
    querystring: {
        type: 'object',
        "required": ['company_id', 'workspace_id'],
        "properties": {"company_id": {"type": "string"}, "workspace_id": {"type": "string"}}
    }
}

const directGetSchema = {
    tags: ['Channels'],
    summary: 'List of direct channels',
    querystring: {type: 'object', "required": ['company_id'], "properties": {"company_id": {"type": "string"}}}
}


const channelsPostSchema = {
    tags: ['Channels'],
    summary: 'Add new channel',
    body: {
        type: 'object', "required": ['company_id', 'workspace_id', 'name', 'visibility'],
        properties: {
            "company_id": {"type": "string"},
            "workspace_id": {"type": "string"},
            "name": {"type": "string"},
            "visibility": {"type": "string", "enum": ["public", "private", "direct"]},
            "icon": {"type": "string"},
            "description": {"type": "string"},
            "channel_group": {"type": "string"},
            "members": {"type": "array", "items": {"type": "string"}}
        }
    }
}


const messagesGetSchema = {
    // description: 'Get list of messages',
    tags: ['Messages'],
    summary: 'List of messages',
    querystring: {
        type: 'object',
        required: ['company_id', 'workspace_id', 'channel_id'],
        properties:
            {
                "company_id": {"type": "string"},
                "workspace_id": {"type": "string"},
                "channel_id": {"type": "string"},
                "thread_id": {"type": "string"},
                "message_id": {"type": "string"},
                "before_message_id": {"type": "string"},
                "limit": {"type": "integer"},
            }
    },
    // response: {
    //     200: {
    //         description: 'Successful response',
    //         type: 'object',
    //         properties: {
    //             hello: { type: 'string' }
    //         }
    //     }
    // }
}


const messagesPostSchema = {
    tags: ['Messages'],
    summary: 'Add new message',
    body: {
        type: 'object', "required": ['company_id', 'workspace_id', 'channel_id', 'original_str'],
        properties: {
            "company_id": {"type": "string"},
            "workspace_id": {"type": "string"},
            "channel_id": {"type": "string"},
            "thread_id": {"type": "string"},
            "message_id": {"type": "string"},
            "original_str": {"type": "string"},
            "prepared": {"type": "object"},

        }
    }
}

const messagesPutSchema = {
    tags: ['Messages'],
    summary: 'Update a message',
    body: {
        type: 'object', "required": ['company_id', 'workspace_id', 'channel_id', 'message_id', 'original_str'],
        properties: {
            "company_id": {"type": "string"},
            "workspace_id": {"type": "string"},
            "channel_id": {"type": "string"},
            "thread_id": {"type": "string"},
            "message_id": {"type": "string"},
            "original_str": {"type": "string"},
            "prepared": {"type": "object"},

        }
    }
}


const messagesDeleteSchema = {
    tags: ['Messages'],
    summary: 'Delete a message',
    body: {
        type: 'object', "required": ['company_id', 'workspace_id', 'channel_id', 'message_id'],
        properties: {
            "company_id": {"type": "string"},
            "workspace_id": {"type": "string"},
            "channel_id": {"type": "string"},
            "thread_id": {"type": "string"},
            "message_id": {"type": "string"}
        }
    }
}

const reactionsSchema = {
    tags: ['Messages'],
    summary: 'Add message reaction a message',
    body: {
        type: 'object', "required": ['company_id', 'workspace_id', 'channel_id', 'message_id', 'reaction'],
        properties: {
            "company_id": {"type": "string"},
            "workspace_id": {"type": "string"},
            "channel_id": {"type": "string"},
            "thread_id": {"type": "string"},
            "message_id": {"type": "string"},
            "reaction": {"type": "string"}
        }
    }
}

const emojiSchema = {
    tags: ['References'],
    summary: 'List of available emojis',
    querystring: {
        type: 'object', "required": [],
        properties: {}
    }
}


fastify.register(require('fastify-swagger'), {
    exposeRoute: true,
    routePrefix: '/documentation',
    swagger: {
        info: {
            title: 'GATEWAY SERVICE',
            description: 'All micro-services',
            version: '1.0.0'
        },
        host: 'localhost:3123',
        schemes: "",
        consumes: ['application/json'],
        produces: ['application/json'],
        securityDefinitions: {
            "Authorization": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header"
            },
            acceptVersion: {
                type: 'apiKey',
                name: 'accept-version',
                description: 'version of API',
                in: 'header'
            }
        },
        security: [
            {'acceptVersion': []},
            {'Authorization': []}
        ]

    }
})


fastify.get('/', {schema: {hide: true} as any}, async (request, reply) => ({"ready": true}))
// fastify.post('/authorize', async (request, reply) => await new Authorization(request).auth(request.body as AuthParams))
fastify.post('/init', {schema: initSchema}, async (request, reply) => new Authorization(request).init(request.body as InitParams))
fastify.post('/authorization/prolong', {schema: prolongSchema}, async (request, reply) => new Authorization(request).prolong(request.body as ProlongParams))
fastify.get('/user', {schema: userSchema}, async (request, reply) => new Users(request).getCurrent((request.query as any).timezoneoffset))
fastify.get('/users', {schema: usersSchema}, async (request, reply) => new Users(request).getUsers((request.query as any).id))
fastify.get('/companies', {schema: companiesSchema}, async (request, reply) => new Companies(request).list())
fastify.get('/workspaces', {schema: workspacesSchema}, async (request, reply) => new Workspaces(request).list(request.query as WorkspaceListRequest))
fastify.get('/direct', {schema: directGetSchema}, async (request) => new Channels(request).listDirect((request.query as any).company_id))
fastify.get('/channels', {schema: channelsGetSchema}, async (request) => new Channels(request).listPublic(request.query as ChannelsListRequest))
fastify.post('/channels', {schema: channelsPostSchema}, async (request) => new Channels(request).addChannel(request.body as ChannelsAddRequest))
fastify.get('/messages', {schema: messagesGetSchema}, async (request) => new Messages(request).get(request.query as any))
fastify.post('/messages', {schema: messagesPostSchema}, async (request) => new Messages(request).upsertMessage(request.body as UpsertMessageRequest))
fastify.put('/messages', {schema: messagesPutSchema}, async (request) => new Messages(request).upsertMessage(request.body as UpsertMessageRequest))
fastify.delete('/messages', {schema: messagesDeleteSchema}, async (request) => new Messages(request).deleteMessage(request.body as DeleteMessageRequest))
fastify.post('/reactions', {schema: reactionsSchema}, async (request) => new Messages(request).reactions(request.body as ReactionsRequest))
fastify.get('/settings/emoji', {schema: emojiSchema}, async (request) => new Settings(request).emoji())


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
