import InfoService from "./service";
import {FastifyRequest} from "fastify";
import {InfoTypes} from "./types";

export class InfoController {

    constructor(protected infoService: InfoService) {
    }

    async localization(request: FastifyRequest<{ Querystring: InfoTypes.LocalizationGetParams }>): Promise<any> {
        return this.infoService.getLocalizationStrings(request.query.lang)
    }

    async info(request: FastifyRequest) {
        return this.infoService.serverInfo()
    }

    emoji() {
        return this.infoService.emoji()
    }


}