export const initSchema = {
    tags: ['User related'],
    summary: 'Initial method',
    body: {
        type: 'object', "required": ["fcm_token", "timezoneoffset"],
        "properties": {
            "fcm_token": {"type": "string"},
            "timezoneoffset": {"type": "integer"},
            "username": {type: "string"},
            "token": {type: "string"}
        }
    },
    response: {
        200: {
            description: 'Successful response',
            type: 'object',
            properties: {
                token: {type: 'string'},
                expiration: {type: 'integer'},
                refresh_token: {type: 'string'},
                refresh_expiration: {type: 'integer'}
            }
        }
    }

}


export const prolongSchema = {
    tags: ['User related'],
    summary: 'Prolong security token',
    body: {
        type: 'object', "required": ["fcm_token", "timezoneoffset", "refresh_token"],
        "properties": {
            "fcm_token": {"type": "string"},
            "timezoneoffset": {"type": "integer"},
            "refresh_token": {"type": "string"}
        }
    }
}
