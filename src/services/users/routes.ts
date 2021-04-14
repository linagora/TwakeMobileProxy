import {FastifyInstance, FastifyRequest} from "fastify";
import {userSchema, usersSchema, usersSearchSchema} from "./schemas";

import {UsersController} from "./controller";

import {UsersTypes} from "./types";
import Api from '../../common/twakeapi'
import UsersService from "./service";

export default function (fastify: FastifyInstance,opts: any, next: () => void)  {

    function ctrl(request: FastifyRequest) {
        const api = new Api(request)
        const service = new UsersService(api)
        return new UsersController(service)
    }


    fastify.route({
        method: "GET",
        url: '/user',
        schema: userSchema,
        handler: (request) =>
            ctrl(request).getCurrent(request as FastifyRequest<{ Querystring: UsersTypes.CurrentUserRequest }>)
    });


    fastify.route({
        method: "GET",
        url: '/users',
        schema: usersSchema,
        handler: (request) =>
            ctrl(request).getUsers(request as FastifyRequest<{ Querystring: UsersTypes.UsersGetRequest }>)
    });


    fastify.route({
        method: "GET",
        url: '/users/search',
        schema: usersSearchSchema,
        handler: (request) =>
            ctrl(request).searchUsers(request as FastifyRequest<{ Querystring: UsersTypes.UsersSearchRequest }>)
    });

    next()

}