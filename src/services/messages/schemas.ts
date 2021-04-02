export const messagesGetSchema = {
    // description: 'Get list of messages',
    tags: ['Messages'],
    summary: 'List of messages',
    querystring: {
        type: 'object',
        required: ['company_id', 'workspace_id', 'channel_id'],
        properties:
            {
                "company_id": {"type": "string"},
                "workspace_id": {"type": "string"},
                "channel_id": {"type": "string"},
                "thread_id": {"type": "string"},
                "message_id": {"type": "string"},
                "before_message_id": {"type": "string"},
                "limit": {"type": "integer"},
                "after_date": {"type": "integer"}
            }
    },
    // response: {
    //     200: {
    //         description: 'Successful response',
    //         type: 'object',
    //         properties: {
    //             hello: { type: 'string' }
    //         }
    //     }
    // }
}


export const messagesPostSchema = {
    tags: ['Messages'],
    summary: 'Add new message',
    body: {
        type: 'object', "required": ['company_id', 'workspace_id', 'channel_id', 'original_str'],
        properties: {
            "company_id": {"type": "string"},
            "workspace_id": {"type": "string"},
            "channel_id": {"type": "string"},
            "thread_id": {"type": "string"},
            "message_id": {"type": "string"},
            "original_str": {"type": "string"},
            "prepared": {"type": "array"},

        }
    }
}

export const messagesPutSchema = {
    tags: ['Messages'],
    summary: 'Update a message',
    body: {
        type: 'object', "required": ['company_id', 'workspace_id', 'channel_id', 'message_id', 'original_str'],
        properties: {
            "company_id": {"type": "string"},
            "workspace_id": {"type": "string"},
            "channel_id": {"type": "string"},
            "thread_id": {"type": "string"},
            "message_id": {"type": "string"},
            "original_str": {"type": "string"},
            "prepared": {"type": "array"},

        }
    }
}


export const messagesDeleteSchema = {
    tags: ['Messages'],
    summary: 'Delete a message',
    body: {
        type: 'object', "required": ['company_id', 'workspace_id', 'channel_id', 'message_id'],
        properties: {
            "company_id": {"type": "string"},
            "workspace_id": {"type": "string"},
            "channel_id": {"type": "string"},
            "thread_id": {"type": "string"},
            "message_id": {"type": "string"}
        }
    }
}

export const reactionsSchema = {
    tags: ['Messages'],
    summary: 'Add message reaction a message',
    body: {
        type: 'object', "required": ['company_id', 'workspace_id', 'channel_id', 'message_id', 'reaction'],
        properties: {
            "company_id": {"type": "string"},
            "workspace_id": {"type": "string"},
            "channel_id": {"type": "string"},
            "thread_id": {"type": "string"},
            "message_id": {"type": "string"},
            "reaction": {"type": "string"}
        }
    }
}


export const whatsNewSchema = {
    tags: ['Messages'],
    summary: 'List of unretrieved messages',
    querystring: {
        type: 'object', "required": ['company_id'],
        properties:
            {"company_id": {type: "string"}, "workspace_id": {type: "string"}},
    }
}

