var assert = require('assert');
const {xstep, step} = require("mocha-steps");

// @ts-ignore
const Api = require('./common/api.js')

const host = 'http://localhost:3123'

const CHANNEL_NAME = 'TestChannel'


describe('Messages', async function () {
    this.timeout(50000);

    const api = new Api(host)

    let last_inserted_message_id = null

    before(async function () {
        await api.auth()
        await api.selectCompany('TestCompany')
        await api.selectWorkspace('Main')
    })

    step('Direct messages', async function(){
        const directChannels = await api.getDirectChannels()

        assert(directChannels.length, 'no direct channels available')

        for(const channel of directChannels){
            // const messages = await api.getMessages({workspace_id: 'direct', channel_id: channel.id})
            await api.getChannelsMembers({workspace_id:'direct', channel_id:channel.id})
        }

    })



    step(`Select channel ${CHANNEL_NAME}`, async function () {
        try {
            await api.selectChannel(CHANNEL_NAME)
        } catch(e){
            await api.addChannel(CHANNEL_NAME,'public')
            await api.selectChannel(CHANNEL_NAME)
            const first_message = await api.addMessage("first message")
            await api.addMessage("first reply", {thread_id:first_message.id})
            await api.addMessage("second reply", {thread_id:first_message.id})
        }
    })


    step('Get the messages', async function(){
    const messages = await api.getMessages({limit:50})
        const threads = messages.filter(a=>a.responses_count)
        assert(threads.length)
        threads.forEach(t=>{
            const replies = messages.filter(a=>a.thread_id === t.id)
            assert.strictEqual(replies.length, t.responses_count)
        })
    })

    step('Get channel messages after date', async function () {
        const messages = await api.getMessages()
        assert(messages.length>0, 'No messages in the channel')
        // const randomNumber =  Math.floor(Math.random() * Math.floor(messages.length-2))+2;
        const randomNumber = 4
        const last_n_messages = messages.slice(Math.max(messages.length - randomNumber, 0))
        const first_date_of_the_slice =  last_n_messages[0].modification_date
        const messagesAfter = await api.getMessages({after_date: first_date_of_the_slice})
        assert(messagesAfter.length>0, `No messages after the date ${first_date_of_the_slice}`)

        for(let i = 0; i<messagesAfter.length; i++){
            const message = messagesAfter[i]
            assert(message.modification_date > first_date_of_the_slice, `pos: ${i}: ${message.modification_date} is not after ${first_date_of_the_slice}`)
        }
    })


    step('Get channel messages after future date', async function () {
        const messages = await api.getMessages({limit:1})
        const messagesAfter = await api.getMessages({after_date: messages[0].modification_date + 1000000000000})
        assert.strictEqual(messagesAfter.length,0)
    })

    step('Add message', async function(){
        const message = await api.addMessage("test string")
        const messages = await api.getMessages({limit:1})
        assert.deepStrictEqual(messages[0], message, `Messages doesn't match`)
        last_inserted_message_id = message.id
    })

    step('Delete message', async function(){
        const message = await api.deleteMessage(last_inserted_message_id)
        const messages = await api.getMessages({limit:10})
        const found = messages.find(a=>a.id === last_inserted_message_id)
        assert(!found, 'Message was not deleted')
    })


    step('Bot messages', async function(){

        await api.selectCompany('LINAGORA')
        await api.selectWorkspace('Software')
        // await api.selectChannel('FT - SmartSla')
        await api.selectChannel('FT - Twake')
        const messages = await api.getMessages({limit:100})
        console.log(messages)

        //
        // console.log(channels)
        //
        // const found = messages.find(a=>a.id === last_inserted_message_id)
        // assert(!found, 'Message was not deleted')
    })




});