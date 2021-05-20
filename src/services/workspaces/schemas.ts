export const workspacesSchema = {
    tags: ['Workspaces'],
    summary: 'List of company workspaces',
    querystring: {type: 'object', "required": ['company_id'], "properties": {"company_id": {"type": "string"}}}
}

export const workspacesPostSchema = {
    tags: ['Workspaces'],
    summary: 'Create a workspace',
    body: {
        type: 'object',
        "required": ['company_id', 'name'],
        "properties": {
            "company_id": {"type": "string"},
            "name": {type: "string"},
            "members": {"type": "array", "items": {"type": "string"}}
        }
    }
}

export const workspaceMembersGetSchema = {
    tags: ['Workspaces'],
    summary: 'List of workspaces members',
    response: {
        200: {
            type: 'array',
            items: {
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
                }
            }
        }
    },
    querystring: {
        type: 'object',
        "required": ['company_id', 'workspace_id'],
        "properties": {"company_id": {"type": "string"}, "workspace_id": {type: "string"}}
    }
}

export const workspaceMembersPostSchema = {
    tags: ['Workspaces'],
    summary: 'Add workspace members',
    body: {
        type: 'object',
        "required": ['company_id', 'workspace_id', 'members'],
        "properties": {
            "company_id": {"type": "string"},
            "workspace_id": {type: "string"},
            "members": {"type": "array", "items": {"type": "string"}}
        }
    }
}

export const workspaceMembersDeleteSchema = {
    tags: ['Workspaces'],
    summary: 'Delete workspace members',
    body: {
        type: 'object',
        "required": ['company_id', 'workspace_id', 'members'],
        "properties": {
            "company_id": {"type": "string"},
            "workspace_id": {type: "string"},
            "members": {"type": "array", "items": {"type": "string"}}
        }
    }
}

export const workspaceNotificationsSchema = {
    tags: ['Workspaces'],
    summary: 'Socket notifications rooms for workspace',
    querystring: {
        type: 'object',
        "required": ['company_id', 'workspace_id'],
        "properties": {"company_id": {"type": "string"}, "workspace_id": {type: "string"}}
    }
}


export const workspacesDeleteSchema = {
    tags: ['Workspaces'],
    summary: 'Delete a workspace',
    body: {
        type: 'object',
        "required": ['company_id', 'workspace_id'],
        "properties": {"company_id": {"type": "string"}, "workspace_id": {type: "string"}}
    }
}

