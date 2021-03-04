import {FastifyInstance, FastifyRequest} from "fastify";
import Api from "../../common/twakeapi2";
import {InfoTypes} from "./types";
import { localizationGetSchema} from "./schemas";
import { InfoController} from "./controller";
import AuthorizationService from "./service";
import UsersService from "../users/service";
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


}

