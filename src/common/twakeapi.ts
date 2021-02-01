import axios from 'axios'
import {BadRequest, Forbidden} from "./errors";
import assert from "assert";
import {required} from "./helpers";
import workspaces from "../controllers/workspaces";

// const HOST = 'https://devapi.twake.app'
const HOST = 'https://beta.twake.app'
// const HOST = 'http://localhost:8000'
/**
 * TwakeApi connector
 */
export default class {
    private readonly token: any

    /**
     * @param {String} token
     */
    constructor(token: String) {
        this.token = token
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

        const res = await axios.post(HOST + url, params, {headers})

        if (res.data.errors && res.data.errors.includes('user_not_connected')) {
            throw new Forbidden('Wrong token')
        }

        if (res.data.status && res.data.status === 'error') {
            console.log(HOST + url, params)
            console.error(res.data)
            throw new Error('Unknown error')
        }
        return res.data.data as any
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
            const res = await axios.get(HOST + url, {params, headers})

            return res.data as any
        } catch (e) {
            console.error(e)
            throw new BadRequest(e.response.data.message)
        }


    }

    /**
     * Direct post (no data unwrapping)
     * @param {string} url
     * @param {object} params
     * @param {object} [headers]
     * @return {Promise<AxiosResponse<T>>}
     */
    async postDirect(url: string, params: any, headers: any = undefined) {
        return axios.post(HOST + url, params, {headers})
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
                "description": description,
                "channel_group": channelGroup,
                "archived": false,
                "visibility": visibility,
                // "default": true
            }
        }

        if (members) {
            params.options = {"members": members}
        }

        return this.__post(url, params)
    }

    async getChannels(companyId: string, workspaceId: string) {
        assert(companyId)
        assert(workspaceId)
        return this.__get(`/internal/services/channels/v1/companies/${companyId}/workspaces/${workspaceId}/channels`, {"mine": true})
    }

    async getDirects(companyId: string) {
        assert(companyId)
        return this.__get(`/internal/services/channels/v1/companies/${companyId}/workspaces/direct/channels`, {})
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

        const params = {
            "options": {
                "scope": "company",
                "name": name,
                "company_id": companyId
            }
        }
        return this.__post('/ajax/users/all/search', params).then(a => a)
    }

    whatsNew(companyId: string) {
        return this.__get(`/internal/services/notifications/v1/badges`, {"company_id": companyId})
    }

    async addWorkspace(companyId: string, name: string, members: string[]) {
        assert(companyId, 'company_id is required')
        assert(name, 'name id is required')
        const ws= await this.__post('/ajax/workspace/create', {"name": name, "groupId": companyId, "channels": []})
        if (members && members.length){
            await this.addWorkspaceMember(companyId, ws['id'], members)
        }
        return ws
    }

    deleteWorkspace(companyId: string, workspaceId: string) {
        assert(companyId, 'company id is required')
        assert(workspaceId, 'workspace id is required')
        return this.__post('/ajax/workspace/delete', {"workspaceId": workspaceId})
    }


    listWorkspaceMembers(companyId: string, workspaceId: string){
        assert(companyId, 'company id is required')
        return this.__post('/ajax/workspace/members/list', {"limit":1000, workspaceId})
    }

    async addWorkspaceMember(companyId: string, workspaceId: string, usersIds: string[]) {
        assert(companyId, 'company id is required')
        assert(workspaceId, 'workspace id is required')
        assert(usersIds, 'users ids are required')
        const users = await Promise.all(usersIds.map(id=>this.getUserById(id)))
        return Promise.all(users.map(u=>this.__post('/ajax/workspace/members/addlist', {"list": u.email, "workspaceId": workspaceId})))
    }

    deleteWorkspaceMember(companyId: string, workspaceId: string, usersIds: string[]) {
        assert(companyId, 'company id is required')
        assert(workspaceId, 'workspace id is required')
        assert(usersIds, 'users ids are required')
        return this.__post('/ajax/workspace/members/remove', {"ids": usersIds, "workspaceId": workspaceId}
        )
    }
}
