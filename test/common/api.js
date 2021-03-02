const {URL, URLSearchParams} = require('url');
const fetch = require('node-fetch');
const assert = require("assert");
const fs = require('fs');
const prompt = require('prompt-promise');

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
        // console.log({method: method, headers: this.headers(), body: JSON.stringify(params)})
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
        this.company_id = null
        this.workspace_id = null
        this.channel_id = null

    }

    __writeConfig(token){
        delete this.auth_config.token
        delete this.auth_config.auth_token
        if(token){
            this.auth_config.token = token
        }
        this.auth_config.auth_token = ""
        fs.writeFileSync('./test/auth.json', JSON.stringify(this.auth_config, null, 2));
    }

    async auth() {
        // @ts-ignore
        this.auth_config = require('../auth.json')

        if (this.auth_config.token && !this.auth_config.auth_token){
            this.request.token = this.auth_config.token

            try {
                await this.request.get('/user')
            } catch(e){
                this.__writeConfig(null)
                throw e
            }
            return
        }

        if (this.auth_config.auth_token) {

            const params = {
                "fcm_token": "123",
                "timezoneoffset": -180,
                "username": this.auth_config.token_username,
                "token": this.auth_config.auth_token
            }
            // console.log(params)
            try {
                this.request.token = await this.request.post('/init', params).then(a => a.token)
            } catch(e){
                this.__writeConfig(null)
                throw e
            }
            this.__writeConfig(this.request.token)
            return this.request.token

        } else {
            const params = {
                "fcm_token": "123",
                "timezoneoffset": -180,
                "device": "apple",
                "username": this.auth_config.username,
                "password": this.auth_config.password
            }
            // console.log(params)
            this.request.token = await this.request.post('/authorize', params).then(a => a.token)
            return this.request.token
        }

    }


    async selectCompany(name) {
        const res = await this.request.get('/companies')
        const company = res.find(a => a.name === name)
        assert(company, `Company ${name} not found`)
        this.company_id = company.id
        return this.company_id
    }


    async selectWorkspace(name) {
        const workspace = await this.getWorkspaces().then(a => a.find(a => a.name === name))
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
}

module.exports = Api