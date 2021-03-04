export const userSchema = {
    tags: ['User related'],
    summary: 'Get current user',
    querystring: {type: 'object', "required": [], "properties": {"timezoneoffset": {"type": "integer"}}}
}

export const usersSchema = {
    tags: ['References'],
    summary: 'Get users by id',
    querystring: {
        type: 'object', "required": ["id"], "properties": {
            "id":
                {
                    "anyOf": [
                        {"type": "string"},
                        {"type": "array", "items": {"type": "string"}}
                    ]
                }
        }
    }
}

export const usersSearchSchema = {
    tags: ['References'],
    summary: 'Get users by name',
    querystring: {
        type: 'object', "required": ["company_id", "name"], "properties":
            {
                "company_id": {"type": "string"},
                "name": {"type": "string"},
            }
    }
}