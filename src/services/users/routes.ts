import { FastifyInstance, FastifyPluginCallback } from "fastify";
import {userSchema, usersSchema, usersSearchSchema} from "./schemas";

import {UsersController} from "./controller";

import Users from './controller'
import {UsersTypes} from "./types";
import UsersSearchRequest = UsersTypes.UsersSearchRequest;

export default function(fastify: FastifyInstance) {
    fastify.get('/user', {schema: userSchema}, async (request, reply) => new Users(request).getCurrent((request.query as any).timezoneoffset))
    fastify.get('/users', {schema: usersSchema}, async (request, reply) => new Users(request).getUsers((request.query as any).id))
    fastify.get('/users/search', {schema: usersSearchSchema}, async (request, reply) => new Users(request).searchUsers(request.query as UsersSearchRequest))
}