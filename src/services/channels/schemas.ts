export const channelsGetSchema = {
    tags: ['Channels'],
    summary: 'List of public/private channels',
    querystring: {
        type: 'object',
        "required": ['company_id', 'workspace_id'],
        "properties": {"company_id": {"type": "string"}, "workspace_id": {"type": "string"}}
    }
}


export const channelsPostSchema = {
    tags: ['Channels'],
    summary: 'Add new channel',
    body: {
        type: 'object', "required": ['company_id', 'workspace_id', 'visibility'],
        properties: {
            "company_id": {"type": "string"},
            "workspace_id": {"type": "string"},
            "name": {"type": "string"},
            "visibility": {"type": "string", "enum": ["public", "private", "direct"]},
            "icon": {"type": "string"},
            "description": {"type": "string"},
            "channel_group": {"type": "string"},
            "members": {"type": "array", "items": {"type": "string"}}
        }
    }
}

export const channelsPutSchema = {
    tags: ['Channels'],
    summary: 'Update a channel',
    body: {
        type: 'object', "required": ['company_id', 'workspace_id', 'name'],
        properties: {
            "company_id": {"type": "string"},
            "workspace_id": {"type": "string"},
            "name": {"type": "string"},
            "icon": {"type": "string"},
            "description": {"type": "string"}
        }
    }
}


export const channelsDeleteSchema = {
    tags: ['Channels'],
    summary: 'Delete a channel',
    body: {
        type: 'object', "required": ['company_id', 'workspace_id', "channel_id"],
        properties: {
            "company_id": {"type": "string"},
            "workspace_id": {"type": "string"},
            "channel_id": {"type": "string"},
        }
    }
}


export const channelsMembersPostSchema = {
    tags: ['Channels'],
    summary: 'Add members to a channel',
    body: {
        type: 'object', "required": ['company_id', 'workspace_id', "channel_id", "members"],
        properties: {
            "company_id": {"type": "string"},
            "workspace_id": {"type": "string"},
            "channel_id": {"type": "string"},
            "members": {"type": "array", "items": {"type": "string"}}
        }
    }
}




export const directGetSchema = {
    tags: ['Channels'],
    summary: 'List of direct channels',
    querystring: {type: 'object', "required": ['company_id'], "properties": {"company_id": {"type": "string"}}}
}

export const channelsMembersGetSchema = {
    tags: ['Channels'],
    summary: 'List of the channel members',
    querystring: {
        type: 'object',
        "required": ['company_id', 'workspace_id', 'channel_id'],
        "properties": {
            "company_id": {"type": "string"},
            "workspace_id": {"type": "string"},
            "channel_id": {"type": "string"},
        }
    }
}
