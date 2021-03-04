import {BadRequest, Forbidden} from "../../common/errors";
import AuthorizationService from "./service";
import {FastifyRequest} from "fastify";
import {InfoTypes} from "./types";
import assert from "assert";
import {authCache} from "../../common/simplecache";
import UsersService from "../users/service";
import InfoService from "./service";

export class InfoController{

    constructor(protected infoService: InfoService) {
    }

    async localization(request: FastifyRequest<{ Querystring: InfoTypes.LocalizationGetParams }>): Promise<any> {
        return this.infoService.getLocalizationStrings(request.query.lang)
    }

}