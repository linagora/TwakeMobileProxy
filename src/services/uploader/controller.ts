import {PayloadTooLarge} from "../../common/errors";
import UploadService from "./service";
import {UploadedFile, UploadResponse} from "./types";

export default class UploadController {
    constructor(protected uploadService: UploadService) {
    }

    // request: any, because God knows how to type 
    // this request so that it will have saveRequestToFile() function
    async upload(request: any): Promise<UploadResponse> {
        let file: UploadedFile
        try {
            file = (await request.saveRequestFiles())[0]
        } catch (e) {
            throw new PayloadTooLarge(e.message)
        }
        const upload: UploadResponse = await this.uploadService.uploadFile(file)
        await request.cleanRequestFiles()

        return upload
    }
}


