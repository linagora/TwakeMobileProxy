var assert = require('assert');
const {xstep, step} = require("mocha-steps");

// @ts-ignore
const Api = require('./common/api.js')




describe('Channels', async function () {
    this.timeout(10000);

    const api = new Api()

    let last_inserted_channel_id = null
    let my_channels_count = null

    before(async function () {
        await api.auth()
    })

    step('Select company TestCompany', async function () {
        await api.selectCompany('TestCompany')
    })

    step('Select workspace Main', async function () {
        try{
            await api.selectWorkspace('Main')
        } catch(e){
            await api.addWorkspace({name:'Main'})
            await api.selectWorkspace('Main')
        }
    })

    step('Create direct channel', async function(){
        const channels = await api.getDirectChannels()
        const existed_channels = channels.filter(a=>a.name === 'Babur Makhmudov')
        const new_channel = await api.addDirectChannel(existed_channels[0].members[0])
        assert.deepStrictEqual(existed_channels[0],new_channel)
    })


    step('Get list of channels', async function () {
        const channels = await api.getChannels()
        channels.forEach(a=> assert(a.is_member))
        let exist = channels.find(a=>a.name.startsWith('AutoCreationChannelTest'))
        assert(!exist,'channel exists even after deleting' + JSON.stringify(exist,null,2))
        assert(channels.length > 0)
    });

    step('Add a existed channel', async function () {
        const channels = await api.getChannels()
        const firstChannel = channels[0]

        const newChannel = await api.addChannel(firstChannel.name, firstChannel.visibility)

        assert.deepStrictEqual(firstChannel, newChannel)

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


    step('Mark messages read', async function () {
        const res = await api.markChannelRead(last_inserted_channel_id)
    });


    step('Delete the channel', async function(){
        const res = await api.deleteChannel(last_inserted_channel_id)
        assert.ok(res.success, 'channel delete faled')

    })

    step('Check channel not exists', async function(){
        const res = await api.getChannels()
        my_channels_count = res.length
        const found = res.find(a=>a.id===last_inserted_channel_id)
        assert(!found, 'channel is expected to be deleted, but is still exists')
    })

    step('All channels (not only mine)', async function(){
        const res = await api.getChannels({all:true})
        assert(res.length>my_channels_count)
    })

});