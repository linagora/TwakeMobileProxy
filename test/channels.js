var assert = require('assert');
const {xstep, step} = require("mocha-steps");

// @ts-ignore
const Api = require('./common/api.js')

const deleteTestChannels = async (api)=>{
    const channels = await api.getChannels().then(a => a.filter(a => a.name.startsWith('AutoCreationChanne')))
    if(channels){
        for (let ch of channels){
            await api.deleteChannel(ch.id)
        }
    }
}

describe('Channels', async function () {
    this.timeout(10000);

    const api = new Api()

    let last_inserted_channel_id = null
    let my_channels_count = null

    before(async function () {
        await api.auth()
        await api.selectCompany('TestCompany')
        await api.selectWorkspace('Main2', true)
        await deleteTestChannels(api)
    })



    step('Create direct channel', async function () {
        const channels = await api.getDirectChannels()
        const existed_channels = channels.filter(a => a.name === 'Babur Makhmudov')
        const new_channel = await api.addDirectChannel(existed_channels[0].members[0])
        assert.deepStrictEqual(existed_channels[0], new_channel)
    })


    step('Get list of channels', async function () {
        const channels = await api.getChannels()
        channels.forEach(a => assert(a.is_member))
        let exist = channels.find(a => a.name.startsWith('AutoCreationChannelTest'))
        assert(!exist, 'channel exists even after deleting' + JSON.stringify(exist, null, 2))
        assert(channels.length > 0)
    });

    step('Add an existing channel', async function () {
        const channels = await api.getChannels()
        const firstChannel = channels[0]

        const newChannel = await api.addChannel(firstChannel.name, firstChannel.visibility)

        assert.deepStrictEqual(firstChannel, newChannel)

    });

    step('Add a new channel', async function () {
        const {id, visibility} = await api.addChannel('AutoCreationChannelTest', 'private')
        assert(id, 'channel is not created')
        assert.strictEqual(visibility,'private')
        last_inserted_channel_id = id
    });

    step('Change privacy', async function () {
        const {visibility,is_default} = await api.updateChannel(last_inserted_channel_id, 'AutoCreationChannelTest', 'public',null,true)
        assert.strictEqual(visibility,'public')
        assert.strictEqual(is_default,true)
    });


    step('Rename the created channel', async function () {
        const new_name = 'AutoCreationChannelTest-rename'
        const {id,name} = await api.updateChannel(last_inserted_channel_id, new_name)
        assert.strictEqual(name, new_name, 'rename failed')
        last_inserted_channel_id = id
    });



    step('Mark messages read', async function () {
        const res = await api.markChannelRead(last_inserted_channel_id)
    });


    step('Delete the channel', async function () {
        const res = await api.deleteChannel(last_inserted_channel_id)
        assert.ok(res.success, 'channel delete faled')

    })

    step('Check channel not exists', async function () {
        const res = await api.getChannels()
        my_channels_count = res.length
        const found = res.find(a => a.id === last_inserted_channel_id)
        assert(!found, 'channel is expected to be deleted, but is still exists')
    })

    step('All channels (not only mine)', async function () {
        const res = await api.getChannels({all: true})
        // assert(res.length > my_channels_count)
    })


    after(async function(){
         await deleteTestChannels(api)
    })

});
