import { FastifyInstance, FastifyPluginCallback } from "fastify";


import Channels, {Test} from './index'
import  {ChannelsTypes} from "./types";
import {
    channelsDeleteSchema,
    channelsGetSchema,
    channelsMembersPostSchema,
    channelsPostSchema,
    directGetSchema,
    channelsMembersGetSchema,
    channelsPutSchema
} from "./schemas";
import Api from "../../common/twakeapi2";
import ChannelsService from "./service";



export default function(fastify: FastifyInstance){
    fastify.get('/channels', {schema: channelsGetSchema}, async (request) => new Channels(request).listPublic(request.query as ChannelsTypes.ListRequest))
    fastify.post('/channels', {schema: channelsPostSchema}, async (request) => new Channels(request).add(request.body as ChannelsTypes.AddRequest))

    fastify.get('/direct', {schema: directGetSchema}, async (request) => new Channels(request).listDirect((request.query as any).company_id))



    const channelsController = new Test(new ChannelsService(new Api()))

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

    fastify.post('/channels/members', {schema: channelsMembersPostSchema}, async (request) => new Channels(request).addChannelMember(request.body as ChannelsTypes.MemberAddRequest))


}
