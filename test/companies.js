
var assert = require('assert');
const {xstep, step} = require("mocha-steps");

// @ts-ignore
const Api = require('./common/api.js')



describe('Companies', async function () {
    this.timeout(10000);

    const api = new Api()


    before(async function () {
        await api.auth()
    })

    step('Get companies', async function () {
        const companies = await api.getCompanies()
        console.log(companies)
    })



});