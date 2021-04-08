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

