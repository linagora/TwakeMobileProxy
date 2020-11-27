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

        const data = await this.api.post('/ajax/core/collections/init', j)

        console.log(data)

        const filterOnlyNamed = data['get'].filter((a: any) => a.name) as any[]

        return filterOnlyNamed.map((a: any) => (
                {
                    id: a.id,
                    name: a.name,
                    icon: a.icon,
                    description: a.description,
                    members_count: a.members_count,
                    private: a.private,
                    direct: a.direct,
                    last_activity: a.last_activity,
                    messages_total: a.messages_increment,
                    messages_unread: a.messages_increment - a._user_last_message_increment
                } as Channel
            )
        )
    }

    async listPublic2(companyId: string, workspaceId: string) {
        const res = await this.api.get(`/internal/services/channels/v1/companies/${companyId}/workspaces/${workspaceId}/channels`,
            {
                "mine":false,
                "limit": 100,
                "websockets": false})
        console.log(res)
        return res
    }
}
