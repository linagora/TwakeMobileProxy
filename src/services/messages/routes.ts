import {FastifyInstance, FastifyPluginCallback, FastifyRequest, RouteHandlerMethod} from "fastify";

import {MessagesController} from "./controller";

import Messages from './controller'
import {MessagesTypes} from "./types";
import {
    messagesDeleteSchema,
    messagesGetSchema,
    messagesPostSchema,
    messagesPutSchema,
    reactionsSchema, whatsNewSchema
} from "./schemas";
import {workspaceNotificationsSchema} from "../workspaces/schemas";
import {WorkspaceController} from "../workspaces/controller";
import ChannelsService from "../channels/service";
import UsersService from "../users/service";
import Api from "../../common/twakeapi2";
import MessagesService from "./service";
import {ChannelsController} from "../channels/controller";
import {ChannelsTypes} from "../channels/types";


export default function (fastify: FastifyInstance,opts: any, next: () => void)  {
    fastify.put('/messages', {schema: messagesPutSchema}, async (request) => new Messages(request).updateMessage(request.body as MessagesTypes.UpdateMessageRequest))
    fastify.delete('/messages', {schema: messagesDeleteSchema}, async (request) => new Messages(request).deleteMessage(request.body as MessagesTypes.MessageRequest))
    fastify.post('/reactions', {schema: reactionsSchema}, async (request) => new Messages(request).reactions(request.body as MessagesTypes.ReactionsRequest))
    // fastify.get('/messages/whatsnew', {schema: whatsNewSchema}, async (request) => new Messages(request).whatsNew(request.query as MessagesTypes.UpdateMessageRequest))


    // const accessControl = async (request:FastifyRequest<any>) => {};

    function ctrl(request: FastifyRequest) {
        const api = new Api(request.jwtToken)
        return new MessagesController(new MessagesService(api), new ChannelsService(api), new UsersService(api))
    }


    fastify.route({
        method: "GET",
        url: '/messages/whatsnew',
        schema: whatsNewSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: (request) => ctrl(request).whatsnew(request as FastifyRequest<{ Querystring: MessagesTypes.WhatsNewRequest }>)
    });


    fastify.route({
        method: "GET",
        url: '/messages',
        schema: messagesGetSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: (request) => ctrl(request).get(request as FastifyRequest<{ Querystring: MessagesTypes.GetMessagesRequest }>)
    });

    fastify.route({
        method: "POST",
        url: '/messages',
        schema: messagesPostSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: (request) => ctrl(request).insert(request as FastifyRequest<{ Body: MessagesTypes.InsertMessageRequest }>)
    });

    next()
}

