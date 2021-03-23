import FormData from "form-data";
import Api from "../../common/twakeapi2";
import {UploadedFile, PreprocessResponse, FILE_SIZE} from "./types";
import {createReadStream, ReadStream, Stats, statSync} from "fs";


export default class UploadService {

    constructor(protected api: Api) {}

    async uploadFile(file: UploadedFile) {
        const res: PreprocessResponse = await this.api.post(
            '/ajax/driveupload/preprocess', {
            workspace_id: file.workspace_id,
            name: file.filename,
            extension: file.filename.split('.').reverse().unshift(),
        }) 
        file.upload_id = res.identifier
        const form = this.buildFormData(file)
    }

    async getDriveObject(companyId: string, workspaceId: string, elementId: string): Promise<any> {
        // required(companyId)
        // required(workspaceId)
        // required(elementId)


        return this.api.post('/ajax/drive/v2/find', {
            'options': {
                'element_id': elementId,
                'company_id': companyId,
                'workspace_id': workspaceId,
                "public_access_token": null
            },
        }).then(a=>a.data)
    }

    buildFormData(file: UploadedFile): FormData {
        const form = new FormData()
        const stream: ReadStream = createReadStream(file.filepath)
        const stats: Stats = statSync(file.filepath)

        form.append("resumableChunkNumber", 1)
        form.append("resumableChunkSize", FILE_SIZE)
        form.append("resumableTotalSize", stats.size)
        form.append("resumableCurrentChunkSize", stats.size)
        form.append("resumableType", file.mimetype || 'application/octet-stream')
        form.append("resumableIdentifier", file.upload_id)
        form.append("resumableFilename", file.filename)
        form.append("resumableRelativePath", file.filename)
        form.append("resumableTotalChunks", 1)
        form.append("object", {
            id: null,
            is_directory: false,
            name: file.filename,
            parent_id: null,
            workspace_id: file.workspace_id,
            detached: true,
        })
        form.append("file", stream, {"filename": file.filename})

        return form;
    }

}
// "resumableChunkNumber": "1",
		// "resumableChunkSize": "50000000",
		// "resumableCurrentChunkSize": "724953",
		// "resumableTotalSize": "724953",
		// "resumableType": "image/jpeg",
		// "resumableIdentifier": "ac6c84e0-1dcc-11eb-82c8-0242ac1200041616486113b413c34a7b5b89507b8ddc90cc2bb924e731d65d",
		// "resumableFilename": "147522.jpg",
		// "resumableRelativePath": "147522.jpg",
		// "resumableTotalChunks": "1",
		// "object": "{\"id\":null,\"front_id\":\"04a23318-318d-2744-e158-09b5abf62e69\",\"is_directory\":false,\"name\":\"147522.jpg\",\"parent_id\":null,\"workspace_id\":\"ac6c84e0-1dcc-11eb-82c8-0242ac120004\",\"detached\":true}"
