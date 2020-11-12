import Base from './base.js'

/**
 * Channels methods
 */
export default class extends Base {
  /**
   * List public channels /workspace/<workspace_id>/channels
   * @param {string} workspaceId
   * @return {Promise< {private, last_activity, name, direct, description, members_count, id}[] >}
   */
  async listPublic(workspaceId) {
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

    return data['get'].filter((a) => a.name).map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      members_count: a.members_count,
      private: a.private,
      direct: a.direct,
      last_activity: a.last_activity,
    }))
  }
}
