const {URL, URLSearchParams} = require('url');
const fetch = require('node-fetch');
const assert = require("assert");
const FormData = require("form-data");
const fs = require('fs');
const prompt = require('prompt-promise');
// @ts-ignore
const config = require('./config.json')

assert(process.env.TWAKE_USERNAME, 'env variable TWAKE_USERNAME is missing')
assert(process.env.TWAKE_PASSWORD, 'env variable TWAKE_PASSWORD is missing')

class Request {

    constructor({host, prefix}) {
        this.host = host
        this.prefix = prefix
        this.token = null

    }

    headers() {
        return {
            'Content-Type': 'application/json',
            'Accept-version': '2.0.0',
            'Authorization': 'Bearer ' + this.token
        }
    }


    get(path, params) {
        const url = new URL(this.host + this.prefix + path)
        url.search = new URLSearchParams(params).toString()
        return fetch(url, {method: 'GET', headers: this.headers()}).then(async response => {
            if (response.status !== 200) throw new Error(await response.json().then(a => a.error))
            return response.json()
        })
    }

    __action(method, path, params, headers, stringify = true) {
        // console.log({method: method, headers: this.headers(), body: JSON.stringify(params)})
        let hdrs = headers ? {...headers, ...this.headers()} : this.headers()
        return fetch(this.host + this.prefix + path, {
            method: method,
            headers: hdrs,
            body: stringify ? JSON.stringify(params) : params
        }).then(async response => {
            if (response.status !== 200) throw new Error(await response.json().then(a => a.error))
            return response.json()
        })
    }

    post(path, params, headers, stringify = true) {
        return this.__action('POST', path, params, headers, stringify)
    }

    delete(path, params) {
        return this.__action('DELETE', path, params)
    }

    put(path, params) {
        return this.__action('PUT', path, params)
    }

    patch(path, params) {
        return this.__action('PATCH', path, params)
    }

}

class Api {

    constructor() {
        this.request = new Request(config)
        this.company_id = null
        this.workspace_id = null
        this.channel_id = null

    }

    __writeConfig(token) {
        delete this.auth_config.token
        delete this.auth_config.auth_token
        if (token) {
            this.auth_config.token = token
        }
        this.auth_config.auth_token = ""
        fs.writeFileSync('./test/common/config.json', JSON.stringify(this.auth_config, null, 2));
    }

    async auth() {
        // @ts-ignore
        this.auth_config = require('./config.json')

        if (this.auth_config.token && !this.auth_config.auth_token) {
            this.request.token = this.auth_config.token

            try {
                await this.request.get('/user')
            } catch (e) {
                this.__writeConfig(null)
                throw e
            }
            return
        }

        if (this.auth_config.auth_token) {

            const params = {
                "fcm_token": "123",
                "timezoneoffset": -180,
                "username": process.env.TWAKE_USERNAME,
                "token": this.auth_config.auth_token
            }
            // console.log(params)
            try {
                const res = await this.request.post('/init', params)
                this.request.token = res['token']
            } catch (e) {
                this.__writeConfig(null)
                throw e
            }
            this.__writeConfig(this.request.token)
            return res

        } else {
            const params = {
                "fcm_token": "123",
                "timezoneoffset": -180,
                "device": "apple",
                "username": process.env.TWAKE_USERNAME,
                "password": process.env.TWAKE_PASSWORD
            }
            // console.log(params)
            const res = await this.request.post('/authorize', params)
            this.request.token = res['token']
            // console.log(res)
            return res
        }

    }

    async prolong(refresh_token) {
        return this.request.post('/authorization/prolong', {refresh_token, fcm_token: "123", timezoneoffset: -180})
    }

    async logout() {
        return this.request.post('/logout', {fcm_token: "123"})
    }

    async selectCompany(name) {
        const res = await this.request.get('/companies')
        const company = res.find(a => a.name === name)
        assert(company, `Company ${name} not found`)
        this.company_id = company.id
        return this.company_id
    }


    async selectWorkspace(name, add_if_not_exists = false) {

        let workspace = await this.getWorkspaces().then(a => a.find(a => a.name === name))

        if (!workspace && add_if_not_exists) {
            workspace = await this.addWorkspace({name})
        }

        assert(workspace, `Workspace ${name} not found`)
        this.workspace_id = workspace.id

        return this.workspace_id
    }

    async getCompanies() {
        return this.request.get('/companies', {})
    }

    async getWorkspaces() {
        return this.request.get('/workspaces', {company_id: this.company_id})
    }


    async selectChannel(name) {
        const channels = await this.getChannels()
        const channel = channels.find(a => a.name === name)
        assert(channel, `Channel ${name} not found`)
        this.channel_id = channel.id
        return channel
    }

    async getChannels(params) {
        const _params = {
            company_id: this.company_id,
            workspace_id: this.workspace_id
        }
        const res = await this.request.get('/channels', {..._params, ...params})
        assert(res.length, 'channels not found')
        return res
    }


    async addChannel(name, visibility, members) {
        assert(['public', 'private', 'direct'].includes(visibility), 'wrong visibility type')
        assert(!members || Array.isArray(members), 'members is not array')
        const params = {
            company_id: this.company_id,
            workspace_id: this.workspace_id,
            name, visibility, members
        }
        return await this.request.post('/channels', params)
    }

    async updateChannel(channel_id, name, visibility, members, is_default) {
        assert(!visibility || ['public', 'private', 'direct'].includes(visibility), 'wrong visibility type')
        assert(!members || Array.isArray(members), 'members is not array')
        const params = {
            company_id: this.company_id,
            workspace_id: this.workspace_id,
            channel_id,
            name, visibility, members,is_default
        }
        return await this.request.put('/channels', params)
    }

    async deleteChannel(channel_id) {
        const params = {
            company_id: this.company_id,
            workspace_id: this.workspace_id,
            channel_id
        }
        return await this.request.delete('/channels', params)
    }

    async getMessages(params) {
        const _params = {
            company_id: this.company_id,
            workspace_id: this.workspace_id,
            channel_id: this.channel_id
        }
        return this.request.get('/messages', {..._params, ...params})
    }

    async addWorkspace(params) {
        const _params = {
            company_id: this.company_id,
        }
        return this.request.post('/workspaces', {..._params, ...params})
    }

    async updateWorkspace(workspace_id, params) {
        const _params = {
            company_id: this.company_id,
            workspace_id: workspace_id
        }
        return this.request.put('/workspaces', {..._params, ...params})

    }

    async deleteWorkspace(workspace_id) {
        const params = {
            company_id: this.company_id,
            workspace_id: workspace_id
        }
        return this.request.delete('/workspaces', params)
    }

    async addMessage(original_str, params) {
        const _params = {
            company_id: this.company_id,
            workspace_id: this.workspace_id,
            channel_id: this.channel_id,
            original_str: original_str
        }
        return this.request.post('/messages', {..._params, ...params})

    }

    async deleteMessage(message_id) {
        const params = {
            company_id: this.company_id,
            workspace_id: this.workspace_id,
            channel_id: this.channel_id,
            message_id: message_id
        }
        return this.request.delete('/messages', params)
    }

    async markChannelRead(channel_id) {
        const params = {
            company_id: this.company_id,
            workspace_id: this.workspace_id,
            channel_id: channel_id,
        }
        return this.request.post('/channels/read', params)
    }

    async getDirectChannels() {
        const res = await this.request.get('/direct', {
            company_id: this.company_id
        })
        assert(res.length, 'channels not found')
        return res

    }


    async addDirectChannel(member) {
        const params = {
            company_id: this.company_id,
            member: member
        }
        return this.request.post('/direct', params)
    }

    async getLocalizationStrings(lang) {
        return this.request.get('/info/localization', {lang})
    }

    async getServerInfo() {
        return this.request.get('/', {})
    }

    async getCompanyBadges(company_id, all_companies = false) {
        return this.request.get('/badges', {
            company_id: company_id,
            all_companies: all_companies
        })
    }

    async uploadFile(file, workspace_id) {
        let form = new FormData()
        form.append('workspace_id', workspace_id);
        form.append('file', file);
        return this.request.post(
            '/media/upload',
            form,
            form.getHeaders(),
            false
        )
    }

    async getApplications() {
        return this.request.get('/companies/applications', {
            company_id: this.company_id
        })

    }

    async getEmojis() {
        return this.request.get('/info/emoji')
    }

    async searchUsers(name) {
        return this.request.get('/users/search', {company_id: this.company_id, name})
    }

    getUserProfile() {
        return this.request.get('/users/profile', {})
    }

    async updateProfile(obj) {
        return this.request.patch('/users/profile', obj)
    }

    async uploadProfilePicture(file) {
        let form = new FormData()
        form.append('file', file);
        return this.request.post(
            '/users/profile/picture',
            form,
            form.getHeaders(),
            false
        )
    }

    async getChannelsMembers(params) {

        const _params = {
            company_id: this.company_id,
            workspace_id: this.workspace_id
        }

        return this.request.get('/channels/members', {..._params, ...params})
    }


    async getWorkspaceMembers(workspace_id) {

        const _params = {
            company_id: this.company_id,
            workspace_id: workspace_id
        }

        return this.request.get('/workspaces/members', _params)
    }
}

module.exports = Api
