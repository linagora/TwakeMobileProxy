import {FastifyInstance, FastifyRequest} from "fastify";


import {ChannelsController} from './controller'
import {ChannelsTypes} from "./types";
import {
    channelsDeleteSchema,
    channelsGetSchema,
    channelsInitSchema,
    channelsMarkReadSchema,
    channelsMembersDeleteSchema,
    channelsMembersGetSchema,
    channelsMembersPostSchema,
    channelsPostSchema,
    channelsPutSchema,
    directGetSchema,
    directPostSchema
} from "./schemas";
import Api from '../../common/twakeapi'
import ChannelsService from "./service";
import UsersService from "../users/service";


export default function (fastify: FastifyInstance, _opts: any, next: () => void) {


    function ctrl(request: FastifyRequest) {
        const api = new Api(request)
        return new ChannelsController(new ChannelsService(api), new UsersService(api))
    }


    fastify.route({
        method: "GET",
        url: '/channels',
        schema: channelsGetSchema,
        handler: (request) =>
            ctrl(request).public(request as FastifyRequest<{ Querystring: ChannelsTypes.PublicChannelsListParameters }>)
    });


    fastify.route({
        method: "GET",
        url: '/direct',
        schema: directGetSchema,
        handler: (request) => ctrl(request).direct(request as FastifyRequest<{ Querystring: ChannelsTypes.BaseChannelsParameters }>)
    });

    fastify.route({
        method: "POST",
        url: '/direct',
        schema: directPostSchema,
        handler: (request) =>
            ctrl(request).addDirect(request as FastifyRequest<{ Body: ChannelsTypes.AddDirectRequest }>)
    });


    fastify.route({
        method: "GET",
        url: '/channels/members',
        schema: channelsMembersGetSchema,
        handler: (request) => ctrl(request).getMembers(request as FastifyRequest<{ Querystring: ChannelsTypes.ChannelParameters }>)
    });


    fastify.route({
        method: "POST",
        url: '/channels',
        schema: channelsPostSchema,
        handler: (request) =>
            ctrl(request).add(request as FastifyRequest<{ Body: ChannelsTypes.AddRequest }>)

    });


    fastify.route({
        method: "PUT",
        url: '/channels',
        schema: channelsPutSchema,
        handler: (request) => ctrl(request).edit(request as FastifyRequest<{ Body: ChannelsTypes.UpdateRequest }>)

    });


    fastify.route({
        method: "DELETE",
        url: '/channels',
        schema: channelsDeleteSchema,
        handler: (request) => ctrl(request).delete(request as FastifyRequest<{ Body: ChannelsTypes.ChannelParameters }>)
    });


    fastify.route({
        method: "GET",
        url: '/channels/init',
        schema: channelsInitSchema,
        handler: (request) => ctrl(request).init(request as FastifyRequest<{ Querystring: ChannelsTypes.ChannelParameters }>)
    });

    fastify.route({
        method: "POST",
        url: '/channels/members',
        schema: channelsMembersPostSchema,
        handler: (request) => ctrl(request).addMembers(request as FastifyRequest<{ Body: ChannelsTypes.ChangeMembersRequest }>)
    });


    fastify.route({
        method: "DELETE",
        url: '/channels/members',
        schema: channelsMembersDeleteSchema,
        handler: (request) => ctrl(request).removeMembers(request as FastifyRequest<{ Body: ChannelsTypes.ChangeMembersRequest }>)
    });

    fastify.route({
        method: "POST",
        url: '/channels/read',
        schema: channelsMarkReadSchema,
        handler: (request) => ctrl(request).markRead(request as FastifyRequest<{ Body: ChannelsTypes.ChannelParameters }>)
    });

    next()

}
