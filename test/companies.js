var assert = require('assert');
const {xstep, step} = require("mocha-steps");

// @ts-ignore
const Api = require('./common/api.js')


describe('Companies', async function () {
    this.timeout(10000);

    const api = new Api()
    let selected_company_id = null

    before(async function () {
        await api.auth()
    })

    step('Get companies', async function () {
        const companies = await api.getCompanies()
        console.log(companies[1])
        selected_company_id = companies[1].id
    })


    step('Badges', async function () {
        const badges = await api.getCompanyBadges(selected_company_id, true)
        assert(badges)
        console.log(badges)
    })

    step('Applications', async function () {
        let applications = await api.getApplications()
        assert(applications)
    })


});