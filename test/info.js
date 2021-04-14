var assert = require('assert');
const {xstep, step} = require("mocha-steps");

// @ts-ignore
const Api = require('./common/api.js')


describe('Info', async function () {
    this.timeout(10000);

    const api = new Api()

    before(async function () {
        await api.auth()
    })

    step('Server info', async function () {
        const info = await api.getServerInfo()
        assert(info.ready)
        assert(info.core_endpoint_url)
        assert(info.socket_endpoint)

    })

    step('Localization', async function () {
        const en = await api.getLocalizationStrings('en')
        assert(Object.keys(en).length > 10, 'no language info')
        assert.deepStrictEqual(en['CREATE'].toLowerCase(),'create')

        const ru = await api.getLocalizationStrings('ru')
        assert(Object.keys(ru).length > 10, 'no language info')
        assert.deepStrictEqual(ru['CREATE'].toLowerCase(),'создать')
    })


    step('Emojis', async function () {
        const res = await api.getEmojis()
        assert(res)
        assert(res.flag_fo)
    })


});