import InfoService from "./service";
import {FastifyRequest} from "fastify";
import {InfoTypes} from "./types";

export class InfoController{

    constructor(protected infoService: InfoService) {
    }

    async localization(request: FastifyRequest<{ Querystring: InfoTypes.LocalizationGetParams }>): Promise<any> {
        return this.infoService.getLocalizationStrings(request.query.lang)
    }

    async info(request: FastifyRequest) {
        const r=  await this.infoService.serverInfo() as any
        r.hostname = request.hostname
        return r;
    }

    emoji(){
        return this.infoService.emoji()
    }


}