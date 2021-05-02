import {FastifyInstance, FastifyRequest} from "fastify";
import Api from '../../common/twakeapi'
import UsersService from "../users/service";
import CompaniesService from "./service";
import {applicationsSchema, badgesSchema, companiesSchema} from "./schemas";
import {CompaniesController} from "./controller";
import {CompanyTypes} from "./types";

export default function (fastify: FastifyInstance, opts: any, next: () => void) {

    function ctrl(request: FastifyRequest) {
        const api = new Api(request)
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
            ctrl(request).badges(request as FastifyRequest<{ Querystring: CompanyTypes.GetBadges }>)
    });

    fastify.route({
        method: "GET",
        url: '/companies/applications',
        schema: applicationsSchema,
        // preHandler: accessControl,
        // preValidation: [fastify.authenticate],
        handler: (request) => ctrl(request).applications(request as FastifyRequest<{ Querystring: CompanyTypes.Applications }>)
    });

    next()
}
