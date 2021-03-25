import {FastifyInstance, FastifyRequest} from "fastify";
import Api from "../../common/twakeapi2";
import UploadController from "./controller";
import UploadService from "./service";
// import {uploadResponseSchema} from "./schemas";

export default function (fastify: FastifyInstance, _opts: any, next: () => void)  {

    function ctrl(request: FastifyRequest) {
        const api = new Api(request.jwtToken)
        const service = new UploadService(api)
        return new UploadController(service)
    }

    fastify.route({
        method: "POST",
        url: '/media/upload',
        // schema: uploadResponseSchema,
        handler: (request) =>
            ctrl(request).upload(request)
    });

    next()
}
