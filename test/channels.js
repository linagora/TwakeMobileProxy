var assert = require('assert');
const {xstep, step} = require("mocha-steps");

// @ts-ignore
const Api = require('./common/api.js')

const host = 'http://localhost:3123'
const username = "testbot"
const password = "12345678"



describe('Channels', async function () {
    this.timeout(10000);

    const api = new Api(host)

    let last_inserted_channel_id = null

    step('Authorization', async function () {
        await api.auth(username, password)
    })

    step('Select company TestCompany', async function () {
        await api.selectCompany('TestCompany')
    })

    step('Select workspace Main', async function () {
        await api.selectWorkspace('Main')
    })

    step('Get list of channels', async function () {
        const channels = await api.getChannels()
        let exist = channels.find(a=>a.name.startsWith('AutoCreationChannelTest'))
        assert(!exist,'channel exists even after deleting' + JSON.stringify(exist,null,2))
        assert(channels.length > 0)
    });

    step('Add a new channel', async function () {
        const channel = await api.addChannel('AutoCreationChannelTest', 'public')
        assert(channel.id, 'channel is not created')
        last_inserted_channel_id = channel.id
    });

    step('Rename the created channel', async function () {
        const new_name = 'AutoCreationChannelTest-rename'
        const channel = await api.updateChannel(last_inserted_channel_id, new_name)
        assert.strictEqual(channel.name, new_name, 'rename failed')
        last_inserted_channel_id = channel.id
    });

    step('Delete the channel', async function(){
        const res = await api.deleteChannel(last_inserted_channel_id)
        assert.ok(res.success, 'channel delete faled')

    })

    step('Check channel not exists', async function(){
        const res = await api.getChannels()
        const found = res.find(a=>a.id===last_inserted_channel_id)
        assert(!found, 'channel is expected to be deleted, but is still exists')
    })


});