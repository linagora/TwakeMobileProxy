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
import WorkspaceService from "../workspaces/service";
import ChannelsService from "../channels/service";
import UsersService from "../users/service";
import Api from "../../common/twakeapi2";
import MessagesService from "./service";


export default function (fastify: FastifyInstance) {
    fastify.get('/messages', {schema: messagesGetSchema}, async (request) => new Messages(request).get(request.query as any))
    fastify.post('/messages', {schema: messagesPostSchema}, async (request) => new Messages(request).insertMessage(request.body as MessagesTypes.InsertMessageRequest))
    fastify.put('/messages', {schema: messagesPutSchema}, async (request) => new Messages(request).updateMessage(request.body as MessagesTypes.UpdateMessageRequest))
    fastify.delete('/messages', {schema: messagesDeleteSchema}, async (request) => new Messages(request).deleteMessage(request.body as MessagesTypes.DeleteMessageRequest))
    fastify.post('/reactions', {schema: reactionsSchema}, async (request) => new Messages(request).reactions(request.body as MessagesTypes.ReactionsRequest))
    // fastify.get('/messages/whatsnew', {schema: whatsNewSchema}, async (request) => new Messages(request).whatsNew(request.query as MessagesTypes.UpdateMessageRequest))


    // const accessControl = async (request:FastifyRequest<any>) => {};

    const api = new Api()
    const controller = new MessagesController(new MessagesService(api), new ChannelsService(api))

    fastify.route({
        method: "GET",
        url: '/messages/whatsnew',
        schema: whatsNewSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: controller.whatsnew.bind(controller),
    });

}

