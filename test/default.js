var assert = require('assert');
const {xstep, step} = require("mocha-steps");

// @ts-ignore
const Api = require('./common/api.js')


describe('Default behaviour', async function () {
    this.timeout(100000);

    const api = new Api()

    step('Auth', async function () {
        await api.auth()
    })

    step('List of companies', async function(){
        await api.selectCompany('LINAGORA')
    })
    step('List of workspaces', async function(){
        await api.selectWorkspace('Software')
    })
    step('List of channels', async function(){
        await api.getChannels()
    })


});
