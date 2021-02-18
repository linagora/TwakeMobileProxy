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

    step('Get channel messages', async function () {
        const messages = await api.getMessages()
        console.log(messages)
    })



});