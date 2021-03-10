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
import {companiesSchema} from "./schemas";
import {CompaniesController} from "./controller";

export default function (fastify: FastifyInstance) {

    function ctrl(request: FastifyRequest) {
        const api = new Api(request.jwtToken)
        return new CompaniesController(new UsersService(api))
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
}