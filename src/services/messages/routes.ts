import {FastifyInstance, FastifyRequest} from "fastify";

import {MessagesController} from "./controller";

import {MessagesTypes} from "./types";
import {
    messagesDeleteSchema,
    messagesGetSchema,
    messagesPostSchema,
    messagesPutSchema,
    reactionsSchema,
    whatsNewSchema
} from "./schemas";
import ChannelsService from "../channels/service";
import UsersService from "../users/service";
import Api from '../../common/twakeapi'
import MessagesService from "./service";


export default function (fastify: FastifyInstance,opts: any, next: () => void)  {


    // fastify.get('/messages/whatsnew', {schema: whatsNewSchema}, async (request) => new Messages(request).whatsNew(request.query as MessagesTypes.UpdateMessageRequest))


    // const accessControl = async (request:FastifyRequest<any>) => {};

    function ctrl(request: FastifyRequest) {
        const api = new Api(request)
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

    fastify.route({
        method: "PUT",
        url: '/messages',
        schema: messagesPutSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: (request) => ctrl(request).insert(request as FastifyRequest<{ Body: MessagesTypes.InsertMessageRequest }>)
    });


    fastify.route({
        method: "POST",
        url: '/reactions',
        schema: reactionsSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: (request) =>
            ctrl(request).reactions(request as FastifyRequest<{Body:MessagesTypes.ReactionsRequest}>)
    });

    fastify.route({
        method: "DELETE",
        url: '/messages',
        schema: messagesDeleteSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: (request) =>
            ctrl(request).deleteMessage(request as FastifyRequest<{Body:MessagesTypes.MessageRequest}>)
    });

    next()
}

