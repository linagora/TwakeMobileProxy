import axios from 'axios'
import {BadRequest, Forbidden} from "./errors";
import assert from "assert";
import {required} from "./helpers";
import config from './config'

// const HOST = 'https://devapi.twake.app'
// const HOST = 'https://web.qa.twake.app'
// const HOST = 'http://localhost:8000'
/**
 * TwakeApi connector
 */
export default class {
    private readonly token: any
    private readonly host: string;

    /**
     * @param {String} token
     */
    constructor(token: String) {
        this.token = token
        this.host = config.core_host
    }


    /** POST to Twake API
     * @param {string} url
     * @param {object} params
     * @return {Promise<object>}
     */
    private async __post(url: string, params: any): Promise<any> {
        let headers = {}

        // console.log('token: "' + this.userProfile.jwtToken + '"')

        if (this.token) {
            headers = {"Authorization": "Bearer " + this.token}
        }

        // if (this.userProfile) {
        //   headers = {Cookie: `SESSID=${this.userProfile['SESSID']}; REMEMBERME=${this.userProfile['REMEMBERME']};`}
        // }
        // // console.log(cookies)

        console.log('POST', url, JSON.stringify(params, null, 2))

        const res = await axios.post(this.host + url, params, {headers})

        if (res.data.errors && res.data.errors.includes('user_not_connected')) {
            throw new Forbidden('Wrong token')
        }

        if (res.data.status && res.data.status === 'error') {
            console.log(this.host + url, params)
            console.error(res.data)
            throw new Error('Unknown error')
        }

        if(res.data.data){
            return res.data.data as any
        } else {
            return res.data as any
        }
    }


    private async __get(url: string, params: any): Promise<any> {
        let headers = {}

        // console.log('token: "' + this.userProfile.jwtToken + '"')

        if (this.token) {
            headers = {"Authorization": "Bearer " + this.token}
        }

        // if (this.userProfile) {
        //   headers = {Cookie: `SESSID=${this.userProfile['SESSID']}; REMEMBERME=${this.userProfile['REMEMBERME']};`}
        // }
        // // console.log(cookies)

        console.log('GET', url, JSON.stringify(params))

        try {
            // console.log(HOST + url)
            // console.log(headers)
            const res = await axios.get(this.host + url, {params, headers})

            return res.data as any
        } catch (e) {
            console.error(e)
            throw new BadRequest(e.response.data.message)
        }


    }

    private async __delete(url: string, params: any): Promise<any> {
        let headers = {}

        // console.log('token: "' + this.userProfile.jwtToken + '"')

        if (this.token) {
            headers = {"Authorization": "Bearer " + this.token}
        }

        // if (this.userProfile) {
        //   headers = {Cookie: `SESSID=${this.userProfile['SESSID']}; REMEMBERME=${this.userProfile['REMEMBERME']};`}
        // }
        // // console.log(cookies)

        console.log('DELETE', url, JSON.stringify(params, null, 2))

        const res = await axios.post(this.host + url, params, {headers})

        if (res.data.errors && res.data.errors.includes('user_not_connected')) {
            throw new Forbidden('Wrong token')
        }

        if (res.data.status && res.data.status === 'error') {
            console.log(this.host + url, params)
            console.error(res.data)
            throw new Error('Unknown error')
        }
        return res.data.data as any
    }


    /**
     * Direct post (no data unwrapping)
     * @param {string} url
     * @param {object} params
     * @param {object} [headers]
     * @return {Promise<AxiosResponse<T>>}
     */
    async postDirect(url: string, params: any, headers: any = undefined) {
        return axios.post(this.host + url, params, {headers})
    }

    async getCurrentUser(timeZoneOffset?: number) {
        const params = {} as any
        if (timeZoneOffset) {
            assert(!isNaN(+timeZoneOffset), 'timezone should be numeric (i.e. -180 for Moscow)')
            params.timezone = timeZoneOffset
        }
        return this.__post('/ajax/users/current/get', params)
    }

    async getUserById(id: string) {
        assert(id)

        return this.__post('/ajax/users/all/get', {'id': id})
    }


    async addChannel(companyId: string, workspaceId: string, name: string, visibility: string, members?: string[], channelGroup?: string, description?: string, icon?: string) {

        assert(companyId)
        assert(visibility)

        assert(['public', 'private', 'direct'].includes(visibility), "'visibility' should be 'public','private' or 'direct'")

        if (visibility == 'direct') {
            name = ''
            workspaceId = 'direct'
        } else {
            assert(workspaceId, 'workspace_id is required')
            assert(name, 'name is required for non-direct channels')
        }

        const url = `/internal/services/channels/v1/companies/${companyId}/workspaces/${workspaceId}/channels`

        const params = {
            //Only to create or locate a direct channel without its id
            "options": {},
            "resource": {
                "icon": icon,
                "name": name,
                "company_id": companyId,
                "workspace_id": workspaceId,
                "description": description,
                "channel_group": channelGroup,
                "archived": false,
                "visibility": visibility,

                // "default": true
            }
        }


        if (members) {
            params.options = {"members": members}

            if (visibility === 'direct') {
                (params.resource as any).direct_channel_members = members
            }

        }

        return this.__post(url, params).then(a=>a.resource)
    }

    async addChannelMember(companyId: string, workspaceId: string, channelId: string, members: string[]){
        return Promise.all(members.map(user_id => this.__post(`/internal/services/channels/v1/companies/${companyId}/workspaces/${workspaceId}/channels/${channelId}/members`,
            {"resource": {"user_id": user_id, "type": "member"}}
        )))
    }

    async getChannels(companyId: string, workspaceId: string) {
        assert(companyId)
        assert(workspaceId)
        let x=  this.__get(`/internal/services/channels/v1/companies/${companyId}/workspaces/${workspaceId}/channels`, {"mine": true}).then(a=>a['resources'].filter(((a:any)=>
        a.visibility!=='direct')))
        // console.log('GET CHANNELS:', (await x))
        return x
    }

    async getDirects(companyId: string) {
        assert(companyId)
        const x=  this.__get(`/internal/services/channels/v1/companies/${companyId}/workspaces/direct/channels`, {}).then(a=>a['resources'])
        console.log((await x))
        return x
    }

    async getDriveObject(companyId: string, workspaceId: string, elementId: string) {
        assert(companyId)
        assert(workspaceId)
        assert(elementId)


        return this.__post('/ajax/drive/v2/find', {
            'options': {
                'element_id': elementId,
                'company_id': companyId,
                'workspace_id': workspaceId,
                "public_access_token": null
            },
        })
    }

    /*
    company_id: req.company_id,
                workspace_id: req.workspace_id,
                channel_id: req.channel_id,
                limit: req.limit || 50,
                offset: req.before_message_id,
                parent_message_id: req.thread_id, // backward compatibility
                thread_id: req.thread_id,
                id: req.message_id
     */

    async getMessages(companyId: string, workspaceId: string, channelId: string, threadId?: string, id?: string, limit?: number, offset?: string) {

        required(companyId, 'string')
        required(workspaceId, 'string')
        required(channelId, 'string')

        // if (id || threadId) {

        const params = {
            'options': {
                company_id: companyId,
                workspace_id: workspaceId,
                channel_id: channelId,
                limit: limit || 50,
                offset: offset,
                thread_id: threadId,
                parent_message_id: threadId, // backward compatibility
                id: id
            },
        }

        return this.__post('/ajax/discussion/get', params)

        // } else { // all messages for channel
        //
        //
        //     const x= await this.__post('/ajax/core/collections/init',
        //         {
        //
        //             "collection_id": "messages/da671045-83d0-4b06-9e7e-984e8efafb35",
        //             "options": {
        //                 "type": "messages",
        //                 "get_options": {
        //                     "channel_id": "da671045-83d0-4b06-9e7e-984e8efafb35",
        //                     "company_id": "0e9337d6-54eb-11eb-9e45-0242ac120004",
        //                     "workspace_id": "c173dca0-54f2-11eb-94b1-0242ac120004",
        //                     "parent_message_id": "",
        //                     "limit": limit || 50,
        //                     "offset": false
        //                 }
        //             },
        //
        //
        //         }
        //     ).then(a=>a.get)
        //     console.log(x)
        //     return x
        //
        // }

    }

    async addMessage(companyId: string, workspaceId: string, channelId: string, originalString: string, prepared: any, threadId?: string) {

        assert(companyId)
        assert(workspaceId)
        assert(channelId)
        assert(originalString)
        assert(prepared)

        const params = {
            'object': {
                company_id: companyId,
                workspace_id: workspaceId,
                channel_id: channelId,
                thread_id: threadId,
                parent_message_id: threadId, // backward compatibility
                content: {
                    original_str: originalString,
                    prepared: prepared
                }
            }
        }

        return this.__post('/ajax/discussion/save', params)
    }

    async updateMessage(companyId: string, workspaceId: string, channelId: string, messageId: string, threadId: string, original_str: string, toTwacode: (str: string) => Object[] | null) {

        const messages = await this.getMessages(companyId, workspaceId, channelId, threadId, messageId)

        const message = messages[0]

        message.content.original_str = original_str
        message.content.prepared = toTwacode(original_str)

        const params = {
            object: message
        }
        return await this.__post('/ajax/discussion/save', params).then(a => a.object)

    }


    async deleteMessage(companyId: string, workspaceId: string, channelId: string, messageId: string, threadId: string) {
        assert(companyId)
        assert(workspaceId)
        assert(channelId)
        assert(messageId)

        const params = {
            'object': {
                company_id: companyId,
                workspace_id: workspaceId,
                channel_id: channelId,
                id: messageId,
                thread_id: threadId,
                parent_message_id: threadId, // backward compatibility
            }
        }

        return this.__post('/ajax/discussion/remove', params)
    }


    async addReaction(companyId: string, workspaceId: string, channelId: string, messageId: string, reaction: string, threadId?: string) {
        assert(companyId)
        assert(workspaceId)
        assert(channelId)
        assert(messageId)
        assert(reaction)

        const params = {
            'object': {
                company_id: companyId,
                workspace_id: workspaceId,
                channel_id: channelId,
                id: messageId,
                _user_reaction: reaction,
                parent_message_id: threadId, // backward compatibility
                thread_id: threadId
            }
        }

        return this.__post('/ajax/discussion/save', params)
    }

    searchUsers(companyId: string, name: string) {

        const params = {"options":{"scope":"group","name":name,"group_id":companyId,"language_preference":"en"}}
        return this.__post('/ajax/users/all/search', params).then(a => a)
    }

    whatsNew(companyId: string) {
        return this.__get(`/internal/services/notifications/v1/badges`, {"company_id": companyId})
    }

    async addWorkspace(companyId: string, name: string, members: string[]) {
        assert(companyId, 'company_id is required')
        assert(name, 'name id is required')
        const ws = await this.__post('/ajax/workspace/create', {"name": name, "groupId": companyId, "channels": []}).then(a=>a.workspace)
        if (members && members.length) {
            await this.addWorkspaceMember(companyId, ws['id'], members)
        }
        return ws
    }

    deleteWorkspace(companyId: string, workspaceId: string) {
        assert(companyId, 'company id is required')
        assert(workspaceId, 'workspace id is required')
        return this.__post('/ajax/workspace/delete', {"workspaceId": workspaceId})
    }


    listWorkspaceMembers(companyId: string, workspaceId: string) {
        assert(companyId, 'company id is required')
        return this.__post('/ajax/workspace/members/list', {"limit": 1000, workspaceId})
    }

    async addWorkspaceMember(companyId: string, workspaceId: string, emails: string[]) {
        assert(companyId, 'company id is required')
        assert(workspaceId, 'workspace id is required')
        return Promise.all(emails.map(email => this.__post('/ajax/workspace/members/addlist', {
            "list": email,
            "workspaceId": workspaceId
        })))
    }

    deleteWorkspaceMember(companyId: string, workspaceId: string, usersIds: string[]) {
        assert(companyId, 'company id is required')
        assert(workspaceId, 'workspace id is required')
        assert(usersIds, 'users ids are required')
        return this.__post('/ajax/workspace/members/remove', {"ids": usersIds, "workspaceId": workspaceId}
        )
    }

    serverInfo() {
        return this.__get('/ajax/core/version', {}).then(a => a.data).then(a => {
            if (a.auth && a.auth.console) {
                a.auth.console.mobile_endpoint_url = config.core_host + "/ajax/users/console/openid?mobile=1"
            }
            return a
        })
    }

    deleteChannel(companyId: string, workspaceId: string, channelId: string) {
        return this.__delete(`/internal/services/channels/v1/companies/${companyId}/workspaces/${workspaceId}/channels/${channelId}`, {})
    }


}
