import {FastifyInstance, FastifyRequest} from "fastify";
import {
    getUsersProfileSchema,
    patchUsersProfilePictureSchema,
    patchUsersProfileSchema,
    userSchema,
    usersSchema,
    usersSearchSchema
} from "./schemas";

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

    fastify.route({
        method: "GET",
        url: '/users/profile',
        schema: getUsersProfileSchema,
        handler: (request) =>
            ctrl(request).getProfile()
    });

    fastify.route({
        method: "PATCH",
        url: '/users/profile',
        schema: patchUsersProfileSchema,
        handler: (request) =>
            ctrl(request).updateProfile(request as FastifyRequest<{ Body: UsersTypes.UpdateProfileRequest }>)
    });

    fastify.route({
        method: "POST",
        url: '/users/profile/picture',
        schema: patchUsersProfilePictureSchema,
        handler: (request) =>
            ctrl(request).updateProfilePicture(request)
    });

    next()

}