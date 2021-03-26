var assert = require('assert');
const {xstep, step} = require("mocha-steps");

// @ts-ignore
const Api = require('./common/api.js')

const host = 'http://localhost:3123'
const username = "testbot"
const password = "12345678"


describe('Workspaces', async function () {
    this.timeout(10000);

    const api = new Api(host)

    let workspaces_length = undefined
    let last_created_workspace_id = undefined

    before(async function () {
        await api.auth()
        await api.selectCompany('TestCompany')
    })

    step('List of workspaces', async function () {
        const workspaces = await api.getWorkspaces()
        // console.log(workspaces)
        workspaces_length = workspaces.length
    })

    step('Creating a workspace', async function () {
        const workspace = await api.addWorkspace({name: 'AutoTestWorkspace'})
        assert(workspace.id, 'workspace is not created')
        assert.strictEqual('AutoTestWorkspace', workspace.name)
        // assert.strictEqual('wrench', workspace.icon)
        last_created_workspace_id = workspace.id
    })

    xstep('Rename the created workspace', async function () {

        // TODO: implement in API

        let workspaces = await api.getWorkspaces()
        let workspace = workspaces.find(a => a.id === last_created_workspace_id)
        assert(workspace, 'workspace is not found')
        assert.strictEqual(workspace.name, 'AutoTestWorkspace', "Original name doesn't match")
        const updated_workspace = await api.updateWorkspace(workspace.id, {name: "AutoTestWorkspace-rename"})
        assert.strictEqual(updated_workspace.name, 'AutoTestWorkspace-rename', "New name doesn't match")

        workspaces = await api.getWorkspaces()
        workspace = workspaces.find(a => a.id === last_created_workspace_id)

        assert.deepStrictEqual(workspace, updated_workspace, `Workspaces doesn't match\noriginal\n${JSON.stringify(workspace, null, 2)}\nnew:\n${JSON.stringify(workspace, null, 2)}`)

        // console.log(updated_workspace)
    })

    step('Delete the workspace', async function () {
        let workspace = await api.deleteWorkspace(last_created_workspace_id)
        assert.ok(workspace.success)
        const workspaces = await api.getWorkspaces()
        // console.log(workspaces.find(a=>a.name.startsWith('AutoTestWorkspace')))
        workspace = workspaces.find(a => a.id === last_created_workspace_id)
        assert(!workspace, 'Workspace was not deleted')
    })

    after(async function () {
        api.getWorkspaces().then(ws =>
            ws.filter(a => a.name.startsWith('AutoTestWorkspace'))
                .forEach(a => api.deleteWorkspace(a.id)))
    })


});
