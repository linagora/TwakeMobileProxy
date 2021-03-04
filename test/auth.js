var assert = require('assert');
const {xstep, step} = require("mocha-steps");

// @ts-ignore
const Api = require('./common/api.js')


describe('Auth', async function () {
    this.timeout(10000);

    const api = new Api()

    let refresh_token = null

    step('Simple auth', async function () {
        const x = await api.auth()
        assert(x.token)
        assert(x.expiration)
        assert(x.refresh_token)
        assert(x.refresh_expiration)
        refresh_token = x.refresh_token
    })

    step('Prolong', async function () {
        const x = await api.prolong(refresh_token)
        assert(x.token)
        assert(x.expiration)
        assert(x.refresh_token)
        assert(x.refresh_expiration)
        assert(x.token !== x.refresh_token)
    })


});