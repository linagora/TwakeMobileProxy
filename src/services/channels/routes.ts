import { FastifyInstance, FastifyPluginCallback } from "fastify";


import Channels, {ChannelsController} from './controller'
import  {ChannelsTypes} from "./types";
import {
    channelsDeleteSchema,
    channelsGetSchema,
    channelsMembersPostSchema,
    channelsPostSchema,
    directGetSchema,
    channelsMembersGetSchema,
    channelsPutSchema, channelsInitSchema, channelsMembersDeleteSchema
} from "./schemas";
import Api from "../../common/twakeapi2";
import ChannelsService from "./service";



export default function(fastify: FastifyInstance){
    fastify.get('/channels', {schema: channelsGetSchema}, async (request) => new Channels(request).listPublic(request.query as ChannelsTypes.ChannelParameters))
    fastify.post('/channels', {schema: channelsPostSchema}, async (request) => new Channels(request).add(request.body as ChannelsTypes.AddRequest))

    fastify.get('/direct', {schema: directGetSchema}, async (request) => new Channels(request).listDirect((request.query as any).company_id))



    const channelsController = new ChannelsController(new ChannelsService(new Api()))

    fastify.route({
        method: "GET",
        url: '/channels/members',
        schema: channelsMembersGetSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: channelsController.getChannelMembers.bind(channelsController),
    });


    fastify.route({
        method: "PUT",
        url: '/channels',
        schema: channelsPutSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: channelsController.edit.bind(channelsController),
    });


    fastify.route({
        method: "DELETE",
        url: '/channels',
        schema: channelsDeleteSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: channelsController.delete.bind(channelsController),
    });


    fastify.route({
        method: "GET",
        url: '/channels/init',
        schema: channelsInitSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: channelsController.init.bind(channelsController),
    });

    fastify.route({
        method: "POST",
        url: '/channels/members',
        schema: channelsMembersPostSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: channelsController.addMember.bind(channelsController),
    });

    fastify.route({
        method: "DELETE",
        url: '/channels/members',
        schema: channelsMembersDeleteSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: channelsController.removeMember.bind(channelsController),
    });

}
