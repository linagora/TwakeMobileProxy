var assert = require('assert');
const {xstep, step} = require("mocha-steps");

// @ts-ignore
const Api = require('./common/api.js')

const host = 'http://localhost:3123'
const username = "testbot"
const password = "12345678"

const CHANNEL_NAME = 'TestChannel'


describe('Messages', async function () {
    this.timeout(10000);

    const api = new Api(host)

    let last_inserted_channel_id = null

    before(async function () {
        await api.auth(username, password)
    })


    step('Select company TestCompany', async function () {
        await api.selectCompany('TestCompany')
    })

    step('Select workspace Main', async function () {
        await api.selectWorkspace('Main')
    })

    step('Select channel TestChannel', async function () {
         await api.selectChannel('TestChannel')
    })

    step('Get channel messages after date', async function () {
        const messages = await api.getMessages()
        assert(messages.length>0, 'No messages in the channel')
        const randomNumber =  Math.floor(Math.random() * Math.floor(messages.length-2))+2;
        const last_n_messages = messages.slice(Math.max(messages.length - randomNumber, 0))
        const first_date_of_the_slice =  last_n_messages[0].modification_date
        const messagesAfter = await api.getMessages({after_date: first_date_of_the_slice})
        assert(messagesAfter.length>0, `No messages after the date ${first_date_of_the_slice}`)

        // console.log(messagesAfter.map(a=>a.modification_date))

        assert.strictEqual(last_n_messages.length-1,messagesAfter.length, `got ${messagesAfter.length} instaed of ${last_n_messages.length-1}`)

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


});