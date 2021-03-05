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

    step('localization', async function () {
        const en = await api.getLocalizationStrings('en')
        assert(Object.keys(en).length > 10, 'no language info')
        assert.deepStrictEqual(en['CREATE'].toLowerCase(),'create')

        const ru = await api.getLocalizationStrings('ru')
        assert(Object.keys(ru).length > 10, 'no language info')
        assert.deepStrictEqual(ru['CREATE'].toLowerCase(),'создать')

    })


});