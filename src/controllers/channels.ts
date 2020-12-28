import Base from './base'
import assert from "assert";
import User from "../models/user";
import Users from "./users";
import {arrayToObject} from "../common/helpers";


export interface ChannelsListRequest{
    company_id: string
    workspace_id: string
}

export interface Channel {
    id: string
    name: string
    icon: string
    description: string
    members_count: number
    private: boolean
    workspace_id: string | null
    last_activity: number
    messages_unread: number
    company_id: string
    members? : any[]
}


/**
 * Channels methods
 */
export default class extends Base {
    /**
     * List public channels /workspace/<workspace_id>/channels
     * @return {Promise< {private, last_activity, name, direct, description, members_count, id}[] >}
     * @param request
     */
    async listPublic(request: ChannelsListRequest): Promise<Channel[]> {

        const j = {
            'collection_id': `channels/workspace/${request.workspace_id}`,
            'options': {
                'type': 'channels/workspace',
                'get_options': {
                    'company_id': request.company_id,
                    'workspace_id': request.workspace_id,
                },
            },
        }

        const data = await this.api.post('/ajax/core/collections/init', j)

        const filterOnlyNamed = data['get'].filter((a: any) => a.name) as any[]


        const channels = filterOnlyNamed.map((a: any) => (
                {
                    id: a.id,
                    name: a.name,
                    icon: a.icon,
                    description: a.description,
                    members_count: a.members.length,
                    private: a.private,
                    workspace_id: request.workspace_id,
                    last_activity: a.last_activity,
                    messages_total: a.messages_increment,
                    messages_unread: a.messages_increment - a._user_last_message_increment,
                    company_id: request.company_id
                } as Channel
            )
        );


        return channels.sort((a: any, b: any) => a.name.localeCompare(b.name))
    }


    /**
     * List public channels /company/<company_id>/direct
     * @return {Promise< {private, last_activity, name, direct, description, members_count, id}[] >}
     * @param companyId
     */
    async listDirect(companyId: string): Promise<Channel[]> {

        const j = {
            "collection_id": `channels/direct_messages/${this.userProfile.userId}`,
            "options": {
                "type": "channels/direct_messages",
                "get_options": {}
            },
            "_grouped": true
        }

        const data = await this.api.post('/ajax/core/collections/init', j)

        const usersIds = new Set()

        // for channel name
        data['get'].forEach((c:any) =>{
            c.members.forEach((m:string)=>{usersIds.add(m)})
        })

        const usersCtrl = new Users(this.request)
        const usersHash = arrayToObject(await Promise.all(Array.from(usersIds.values()).map((user_id) => usersCtrl.getUser(user_id as string))), 'userId')

        // console.log(usersHash)

        return data['get'].map((a: any) => (
                {
                    id: a.id,
                    name:a.name || Object.values(usersHash).map((a:any)=>a.firstname + ' ' + a.lastname).join(', '),
                    members:
                        this.versionFrom("2.0.0")? a.members :
                        a.members.map( (u:string) =>{
                        return usersHash[u]
                    }) as any,
                    icon: a.icon,
                    description: a.description,
                    members_count: a.members.length,
                    private: a.private,
                    workspace_id: null,
                    last_activity: a.last_activity,
                    messages_total: a.messages_increment,
                    messages_unread: a.messages_increment - a._user_last_message_increment,
                    company_id: companyId
                } as Channel
            )
        )
    }


    async listPublic2(companyId: string, workspaceId: string) {
        const res = await this.api.get(`/internal/services/channels/v1/companies/${companyId}/workspaces/${workspaceId}/channels`,
            {
                "mine": true,
                "limit": 100,
                "websockets": true
            })
        console.log(res)
        return res
    }


    async members(companyId: string, workspaceId: string, channelId: string) {

        const res = await this.api.get(`/internal/services/channels/v1/companies/${companyId}/workspaces/${workspaceId}/channels/${channelId}/members`,
            {
                "limit": 100,
                "websockets": true
            })
        console.log(res)
        return res
    }
}
