import Base from './base'
import assert from "assert";


export interface Channel {
    id: string
    name: string
    description: string
    members_count: number
    private: boolean
    direct: boolean
    last_activity: number
}

/**
 * Channels methods
 */
export default class extends Base {
    /**
     * List public channels /workspace/<workspace_id>/channels
     * @param {string} workspaceId
     * @return {Promise< {private, last_activity, name, direct, description, members_count, id}[] >}
     */
    async listPublic(workspaceId: string): Promise<Channel[]> {
        assert(workspaceId, 'workspace_id in path is required')

        const j = {
            'collection_id': `channels/workspace/${workspaceId}`,
            'options': {
                'type': 'channels/workspace',
                'get_options': {
                    'workspace_id': workspaceId,
                },
            },
        }

        const data = await this.api.post('/core/collections/init', j)

        const filterOnlyNamed = data['get'].filter((a: any) => a.name) as any[]

        return filterOnlyNamed.map((a: any) => (
                {
                    id: a.id,
                    name: a.name,
                    description: a.description,
                    members_count: a.members_count,
                    private: a.private,
                    direct: a.direct,
                    last_activity: a.last_activity
                } as Channel
            )
        )
    }
}
