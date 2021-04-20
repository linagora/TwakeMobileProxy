var assert = require('assert');
const {xstep, step} = require("mocha-steps");

// @ts-ignore
const Api = require('./common/api.js')


describe('Users', async function () {
    this.timeout(10000);

    const api = new Api()

    before(async function () {
        await api.auth()
        await api.selectCompany('TestCompany')
    })

    step('Search users', async function () {
        const info = await api.searchUsers('test')
        assert(info.length, 'no users found')

    })


});