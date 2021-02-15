import Fastify, {FastifyInstance} from 'fastify'
import {BadRequest, Forbidden} from './common/errors';
import {AssertionError} from "assert";
import Authorization, {InitParams, ProlongParams} from './controllers/authorization'
import Settings from './controllers/settings'
import Companies from './controllers/companies'
import Info from './controllers/info'
import config from './common/config'

if(!process.env.CORE_HOST){
    console.error('Missing CORE_HOST env variable')
    process.exit(1)
}
config.core_host = process.env.CORE_HOST.replace(/\/$/, "");

const fastify: FastifyInstance = Fastify({logger: false})

declare module "fastify" {
    export interface FastifyRequest {
        jwtToken: string
    }
}

fastify.addHook("onRequest", async (request, reply) => {
    try {
        if (request.routerPath !== '/' && request.routerPath !== '/authorize' && request.routerPath !== '/authorization/prolong' && request.routerPath !== '/documentation/json') {

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


const initSchema = {
    tags: ['User related'],
    summary: 'Initial method',
    body: {
        type: 'object', "required": ["fcm_token", "timezoneoffset"],
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
                token: {type: 'string'},
                expiration: {type: 'integer'},
                refresh_token: {type: 'string'},
                refresh_expiration: {type: 'integer'}
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


const companiesSchema = {
    tags: ['Companies'],
    summary: "List of user's companies",
    querystring: {type: 'object', required: [], "properties": {}}
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


export const emojiSchema = {
    tags: ['References'],
    summary: 'List of available emojis',
    querystring: {
        type: 'object', "required": [],
        properties: {}
    }
}

fastify.get('/', {schema: {hide: true} as any}, async (request, reply) => new Info(request).info())
fastify.post('/authorize', async (request, reply) => await new Authorization(request).auth(request.body as AuthParams))
fastify.post('/init', {schema: initSchema}, async (request, reply) => new Authorization(request).init(request.body as InitParams))
fastify.post('/authorization/prolong', {schema: prolongSchema}, async (request, reply) => new Authorization(request).prolong(request.body as ProlongParams))
fastify.get('/companies', {schema: companiesSchema}, async (request, reply) => new Companies(request).list())


fastify.get('/settings/emoji', {schema: emojiSchema}, async (request) => new Settings(request).emoji())


import channelsServiceRoutes from './services/channels/routes'
import workspacesServiceRoutes from './services/workspaces/routes'
import usersServiceRoutes from './services/users/routes'
import messagesServiceRoutes from './services/messages/routes'
import AuthParams from "./models/auth_params";

channelsServiceRoutes(fastify)
workspacesServiceRoutes(fastify)
usersServiceRoutes(fastify)
messagesServiceRoutes(fastify)


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


const io = require('socket.io')(fastify.server);

// @ts-ignore
io.on('connection', function (socket) {
    console.log('on connection')
    socket.send('HELLO!')
    setInterval(() => {
        socket.send('PING ' + new Date().toISOString())
    }, 5000)
    socket.on('message', function () {
        console.log('on message')
    });
    socket.on('disconnect', function () {
        console.log('on disconnect')
    });
})


const start = async () => {
    try {
        await fastify.listen(3123, '::')


    } catch (err) {
        console.error(err)
        // fastify.log.error(err)
        process.exit(1)
    }
}


start()
