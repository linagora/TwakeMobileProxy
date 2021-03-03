import {FastifyInstance, FastifyRequest} from "fastify";
import Api from "../../common/twakeapi2";
import {AuthTypes} from "./types";
import {initSchema, prolongSchema} from "./schemas";
import {AuthorizationController} from "./controller";
import AuthorizationService from "./service";
import UsersService from "../users/service";

export default function (fastify: FastifyInstance) {

    function ctrl(request: FastifyRequest) {
        const api = new Api(request.jwtToken)
        return new AuthorizationController(new AuthorizationService(api), new UsersService(api))
    }

    fastify.route({
        method: "POST",
        url: '/authorize',
        // schema: AuthParams,
        handler: (request) =>
            ctrl(request).authorize(request as FastifyRequest<{ Body: AuthTypes.AuthParams }>)
    });

    fastify.route({
        method: "POST",
        url: '/init',
        schema: initSchema,
        handler: (request) =>
            ctrl(request).init(request as FastifyRequest<{ Body: AuthTypes.InitParams }>)
    });

    fastify.route({
        method: "POST",
        url: '/prolong',
        schema: prolongSchema,
        handler: (request) =>
            ctrl(request).prolong(request as FastifyRequest<{ Body: AuthTypes.ProlongParams }>)
    });

    fastify.route({
        method: "POST",
        url: '/logout',
        // schema: prolongSchema,
        handler: (request) =>
            ctrl(request).logout(request as FastifyRequest)
    });
}

