import {FastifyInstance, FastifyRequest} from "fastify";
import {WorkspaceController} from "./controller";
import WorkspaceService from "./service";
import Api from "../../common/twakeapi2";
import {
    workspaceMembersDeleteSchema,
    workspaceMembersGetSchema,
    workspaceMembersPostSchema,
    workspacesDeleteSchema,
    workspacesPostSchema,
    workspacesSchema,
    workspaceNotificationsSchema
} from "./schemas";

import Workspaces from './controller'
import {WorkspacesTypes} from "./types";
import ChannelsService from "../channels/service";
import UsersService from "../users/service";
import {MessagesController} from "../messages/controller";
import MessagesService from "../messages/service";
import {ChannelsTypes} from "../channels/types";
// import Channels, {Test} from './controller'
// import  {ChannelsTypes} from "./types";
// import {
//     channelsDeleteSchema,
//     channelsGetSchema,
//     channelsMembersPostSchema,
//     channelsPostSchema,
//     directGetSchema,
//     channelsMembersGetSchema,
//     channelsPutSchema, channelsInitSchema
// } from "./schemas";
// import Api from "../../common/twakeapi2";
// import ChannelsService from "./service";


export default function (fastify: FastifyInstance) {



    fastify.delete('/workspaces', {schema: workspacesDeleteSchema}, async (request, reply) => new Workspaces(request).delete(request.body as WorkspacesTypes.WorkspaceRequest))

    fastify.get('/workspaces/members', {schema: workspaceMembersGetSchema}, async (request, reply) => new Workspaces(request).listMembers(request.query as WorkspacesTypes.WorkspaceRequest))
    fastify.post('/workspaces/members', {schema: workspaceMembersPostSchema}, async (request, reply) => new Workspaces(request).addMembers(request.body as WorkspacesTypes.WorkspaceMembersPostRequest))
    fastify.delete('/workspaces/members', {schema: workspaceMembersDeleteSchema}, async (request, reply) => new Workspaces(request).removeMembers(request.body as WorkspacesTypes.WorkspaceMembersPostRequest))

    // fastify.get('/workspaces/members', {schema: workspaceNotificationsSchema}, async (request, reply) => new Workspaces(request).notifications(request.query as WorkspaceRequest))

    function ctrl(request: FastifyRequest) {
        const api = new Api(request.jwtToken)
        return new WorkspaceController(new WorkspaceService(api), new ChannelsService(api), new UsersService(api))
    }


    fastify.route({
        method: "GET",
        url: '/workspaces',
        schema: workspacesSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: (request) =>
            ctrl(request).list(request as FastifyRequest<{ Querystring: WorkspacesTypes.WorkspaceBaseRequest  }>)
    });


    fastify.route({
        method: "GET",
        url: '/workspace/notifications',
        schema: workspaceNotificationsSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: (request) => ctrl(request).notifications(request as FastifyRequest<{ Querystring: ChannelsTypes.ChannelParameters }>)
    });

    fastify.route({
        method: "POST",
        url: '/workspaces',
        schema: workspacesPostSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: (request) => ctrl(request).add(request as FastifyRequest<{ Body: WorkspacesTypes.WorkspacePostRequest }>)
    });


}
