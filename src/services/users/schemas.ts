export const userSchema = {
    tags: ['References'],
    summary: 'Get users by id or get current user by token',
    response: {
        200: {
            description: 'OK',
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                },
                email: {
                    type: 'string',
                },
                username: {
                    type: 'string',
                },
                firstname: {
                    type: 'string',
                },
                lastname: {
                    type: 'string',
                },
                thumbnail: {
                    type: 'string',
                },
                last_activity: {
                    type: 'number',
                },
                console_id: {
                    type: 'string',
                },
                status_icon: {
                    type: 'string',
                },
                status: {
                    type: 'string',
                },
                language: {
                    type: 'string',
                },
            },
        },
    },
    querystring: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            timezoneoffset: { type: 'integer' },
        },
    },
}

export const usersSearchSchema = {
    tags: ['References'],
    summary: 'Get users by name',
    querystring: {
        type: 'object',
        required: ['company_id', 'name'],
        properties: {
            company_id: { type: 'string' },
            name: { type: 'string' },
        },
    },
}

export const getUsersProfileSchema = {
    tags: ['User related'],
    summary: 'Get user profile',
    querystring: {},
}

export const patchUsersProfileSchema = {
    tags: ['User related'],
    summary: 'Update user profile',
    body: {
        type: 'object',
        properties: {
            language: { type: 'string' },
            firstname: { type: 'string' },
            lastname: { type: 'string' },
            password: {
                type: 'object',
                properties: {
                    old: { type: 'string' },
                    new: { type: 'string' },
                },
            },
        },
    },
}

export const patchUsersProfilePictureSchema = {
    description: 'Upload a File, the field name should be "file"',
    tags: ['User related'],
    summary: 'Upload user profile picture',
    consumes: ['multipart/form-data'],
    response: {
        201: {
            description: 'Upload OK',
            type: 'object',
        },
        400: {
            description: 'Bad Request',
            type: 'object',
        },
    },
}
