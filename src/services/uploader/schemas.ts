export const uploadResponseSchema = {
    tags: ['Upload'],
    summary: 'Upload files to drive',
    response: {
        type: 'multipart/form-data', "required": ['id'],
        properties: {
            "id": {"type": "string"},
            "name": {"type": "string"},
            "extension": {"type": "string"},
            "size": {"type": "number"}
        }
    }
}
