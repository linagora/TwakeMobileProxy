import {FastifyInstance, FastifyRequest} from "fastify";
import Api from '../../common/twakeapi'
import UploadController from "./controller";
import UploadService from "./service";
import {uploadSchema} from "./schemas";

export default function (fastify: FastifyInstance, _opts: any, next: () => void) {

    function ctrl(request: FastifyRequest) {
        const api = new Api(request)
        const service = new UploadService(api)
        return new UploadController(service)
    }

    fastify.route({
        method: "POST",
        url: '/media/upload',
        schema: uploadSchema,
        handler: (request) =>
            ctrl(request).upload(request)
    });

    next()
}
