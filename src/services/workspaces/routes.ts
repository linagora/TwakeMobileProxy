import {FastifyInstance, FastifyRequest} from "fastify";
import {WorkspaceController} from "./controller";
import WorkspaceService from "./service";
import Api from '../../common/twakeapi'
import {
    workspaceMembersDeleteSchema,
    workspaceMembersGetSchema,
    workspaceMembersPostSchema,
    workspaceNotificationsSchema,
    workspacesDeleteSchema,
    workspacesPostSchema,
    workspacesSchema
} from "./schemas";
import {WorkspacesTypes} from "./types";
import ChannelsService from "../channels/service";
import UsersService from "../users/service";
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


export default function (fastify: FastifyInstance, opts: any, next: () => void) {


    // fastify.get('/workspaces/members', {schema: workspaceNotificationsSchema}, async (request, reply) => new Workspaces(request).notifications(request.query as WorkspaceRequest))

    function ctrl(request: FastifyRequest) {
        const api = new Api(request)
        return new WorkspaceController(new WorkspaceService(api), new ChannelsService(api), new UsersService(api))
    }


    fastify.route({
        method: "GET",
        url: '/workspaces',
        schema: workspacesSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: (request) =>
            ctrl(request).list(request as FastifyRequest<{ Querystring: WorkspacesTypes.WorkspaceBaseRequest }>)
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


    fastify.route({
        method: "DELETE",
        url: '/workspaces',
        schema: workspacesDeleteSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: (request) =>
            ctrl(request).delete(request as FastifyRequest<{ Body: WorkspacesTypes.WorkspaceRequest }>)
    });


    fastify.route({
        method: "GET",
        url: '/workspaces/members',
        schema: workspaceMembersGetSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: (request) =>
            ctrl(request).listMembers(request as FastifyRequest<{ Querystring: WorkspacesTypes.WorkspaceRequest }>)
    });

    fastify.route({
        method: "POST",
        url: '/workspaces/members',
        schema: workspaceMembersPostSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: (request) =>
            ctrl(request).addMembers(request as FastifyRequest<{ Body: WorkspacesTypes.WorkspaceMembersPostRequest }>)
    });

    fastify.route({
        method: "DELETE",
        url: '/workspaces/members',
        schema: workspaceMembersDeleteSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: (request) =>
            ctrl(request).removeMembers(request as FastifyRequest<{ Body: WorkspacesTypes.WorkspaceMembersPostRequest }>)
    });


    next()

}
