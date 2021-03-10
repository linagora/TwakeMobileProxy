import {FastifyInstance, FastifyRequest} from "fastify";
import Api from "../../common/twakeapi2";
import {InfoTypes} from "./types";
import { localizationGetSchema} from "./schemas";
import { InfoController} from "./controller";
import InfoService from "./service";

export default function (fastify: FastifyInstance) {

    function ctrl(request: FastifyRequest) {
        const api = new Api(request.jwtToken)
        return new InfoController(new InfoService(api))
    }

    fastify.route({
        method: "GET",
        url: '/info/localization',
        schema: localizationGetSchema,
        handler: (request) =>
            ctrl(request).localization(request as FastifyRequest<{ Querystring: InfoTypes.LocalizationGetParams }>)
    });


    fastify.route({
        method: "GET",
        url: '/',
        schema: {hide: true} as any,
        handler: (request) =>
            ctrl(request).info()
    });

}

