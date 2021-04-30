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

export const getUsersProfileSchema = {
    tags: ['User related'],
    summary: 'Get user profile',
    querystring: {}
}


export const patchUsersProfileSchema = {
    tags: ['User related'],
    summary: 'Update user profile',
    body: {
        type: 'object',
        "properties":
            {
                "language": {"type": "string"},
                "firstname": {"type": "string"},
                "lastname": {"type": "string"},
                "password": {"type": "object", "properties": {"old" :{"type":"string"}, "new": {"type":"string"}}},
            }
    }
}

export const patchUsersProfilePictureSchema = {
    description: 'Upload a File, the field name should be "file"',
    tags: ['User related'],
    summary: 'Upload user profile picture',
    consumes: ['multipart/form-data'],
    // body: {
    //     type: 'object',
    //     required: ['file'],
    //     properties: {
    //         file: {$ref: '#mySharedSchema'}
    //     }
    // },
    response: {
        201: {
            description: 'Upload OK',
            type: 'object'
        },
        400: {
            description: 'Bad Request',
            type: 'object'
        }
    }
}
