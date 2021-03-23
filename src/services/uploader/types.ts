export interface UploadedFile {
    filepath: string,
    filename: string,
    encoding?: string,
    mimetype?: string,
    workspace_id?: string,
    upload_id?: string,
    fields: {[key: string]: string | number},
}

export interface PreprocessResponse {
    identifier: string
}

export const FILE_SIZE = 50000000
