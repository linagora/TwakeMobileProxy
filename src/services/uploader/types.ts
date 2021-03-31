export interface UploadedFile {
    filepath: string,
    filename: string,
    encoding?: string,
    mimetype?: string,
    upload_id?: string,
    fields: any,
}

export interface PreprocessResponse {
    identifier: string
}

export interface UploadResponse {
    id: string,
    name: string,
    extension: string,
    size: number
}

export const FILE_SIZE = 50000000
