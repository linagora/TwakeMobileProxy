import FormData from "form-data";
import Api from "../../common/twakeapi";
import {FILE_SIZE, PreprocessResponse, UploadedFile, UploadResponse} from "./types";
import {createReadStream, Stats, statSync} from "fs";


export default class UploadService {

    constructor(protected api: Api) {}

    async uploadFile(file: UploadedFile): Promise<UploadResponse> {
        const workspace_id = file.fields.workspace_id.value

        const res: PreprocessResponse = await this.api.post(
            '/ajax/driveupload/preprocess', {
            workspace_id: workspace_id,
            name: file.filename,
            extension: file.filename.split('.').reverse().shift(),
        }) 

        // console.log("GOT RESP: " + Object.entries(res))
        // console.log("PATH: " + file.filepath)
        file.upload_id = res.identifier
        const form = this.buildFormData(file)

        let resp: any;
        resp = await this.api.post(
            '/ajax/driveupload/upload', 
            form,
            form.getHeaders()
        )
        const f = resp.data.object
        const upload: UploadResponse = f
        upload.preview = f.has_preview ? f.preview_link : null
        upload.download = '/ajax/drive/download?workspace_id=' +
                          `${f.workspace_id}&element_id=${f.id}` +
                          '&download=1'

        return upload
    }


    private buildFormData(file: UploadedFile): FormData {
        const form = new FormData()
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
        form.append("object", JSON.stringify({
            id: null,
            front_id: null,
            is_directory: false,
            name: file.filename,
            parent_id: null,
            workspace_id: file.fields.workspace_id.value,
            detached: true,
        }))
        form.append("file", createReadStream(file.filepath), 
        {
            filename: file.filename, 
        })

        return form;
    }

}
