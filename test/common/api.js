const {URL, URLSearchParams} = require('url');
const fetch = require('node-fetch');
const assert = require("assert");

class Request {
    constructor(host) {
        this.host = host
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
        const url = new URL(this.host + path)
        url.search = new URLSearchParams(params).toString()
        return fetch(url, {method: 'GET', headers: this.headers()}).then(async response => {
            if (response.status !== 200) throw new Error(await response.json().then(a => a.error))
            return response.json()
        })
    }

    __action(method, path, params) {
        return fetch(this.host + path, {
            method: method,
            headers: this.headers(),
            body: JSON.stringify(params)
        }).then(async response => {
            if (response.status !== 200) throw new Error(await response.json().then(a => a.error))
            return response.json()
        })
    }

    post(path, params) {
        return this.__action('POST', path, params)
    }

    delete(path, params) {
        return this.__action('DELETE', path, params)
    }

    put(path, params) {
        return this.__action('PUT', path, params)
    }
}

class Api {

    constructor(host) {
        this.request = new Request(host)
        this.token = null
        this.company_id = null
        this.workspace_id = null
        this.channel_id = null
    }

    async auth(username, password) {
        this.token = await this.request.post('/authorize', {
            "fcm_token": "123",
            "timezoneoffset": -180,
            "device": "apple",
            "username": username,
            "password": password
        }).then(a => a.token)
        this.request.token = this.token
        return this.token
    }


    async selectCompany(name) {
        const res = await this.request.get('/companies')
        const company = res.find(a => a.name === name)
        assert(company, `Company ${name} not found`)
        this.company_id = company.id
        return this.company_id
    }



    async selectWorkspace(name) {
        const workspace = await this.getWorkspaces().then(a=>a.find(a => a.name === name))
        assert(workspace, `Workspace ${name} not found`)
        this.workspace_id = workspace.id
        return this.workspace_id
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

    async getChannels() {
        const res = await this.request.get('/channels', {
            company_id: this.company_id,
            workspace_id: this.workspace_id
        })
        assert(res.length, 'channels not found')
        return res
    }

    async addChannel(name, visibility, members) {
        assert(['public', 'private', 'direct'].includes(visibility), 'wrong visibility type')
        assert(!members || members.isArray(), 'members is not array')
        const params = {
            company_id: this.company_id,
            workspace_id: this.workspace_id,
            name, visibility, members
        }
        return await this.request.post('/channels', params)
    }

    async updateChannel(channel_id, name, visibility, members) {
        assert(!visibility || ['public', 'private', 'direct'].includes(visibility), 'wrong visibility type')
        assert(!members || members.isArray(), 'members is not array')
        const params = {
            company_id: this.company_id,
            workspace_id: this.workspace_id,
            channel_id,
            name, visibility, members
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
}

module.exports = Api