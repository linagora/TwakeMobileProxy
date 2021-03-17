import {FastifyInstance, FastifyRequest} from "fastify";
import {
    workspaceMembersDeleteSchema,
    workspaceMembersGetSchema,
    workspaceMembersPostSchema,
    workspacesDeleteSchema, workspacesSchema
} from "../workspaces/schemas";
import {WorkspacesTypes} from "../workspaces/types";
import Api from "../../common/twakeapi2";
import ChannelsService from "../channels/service";
import UsersService from "../users/service";
import CompaniesService from "./service";
import {companiesSchema, badgesSchema} from "./schemas";
import {CompaniesController} from "./controller";
import {CompanyTypes} from "./types";

export default function (fastify: FastifyInstance,opts: any, next: () => void)  {

    function ctrl(request: FastifyRequest) {
        const api = new Api(request.jwtToken)
        const service = new CompaniesService(api)
        return new CompaniesController(new UsersService(api), service)
    }


    fastify.route({
        method: "GET",
        url: '/companies',
        schema: companiesSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: (request) =>
            ctrl(request).list()
    });

    fastify.route({
        method: "GET",
        url: '/badges',
        schema: badgesSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: (request) =>
            ctrl(request).badges(request as FastifyRequest<{Querystring: CompanyTypes.GetBadges}>)
    });

    next()
}
