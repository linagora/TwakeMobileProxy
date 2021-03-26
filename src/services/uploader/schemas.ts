export const uploadSchema = {
    tags: ['Upload'],
    summary: 'Upload files to drive',
    response: {
        "2xx": {
            type: "object",
            required: ['id'],
            properties: {
                "id": {"type": "string"},
                "name": {"type": "string"},
                "extension": {"type": "string"},
                "size": {"type": "number"}
            }
        }
    }
}
