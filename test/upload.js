var assert = require('assert');
const {step} = require("mocha-steps");
const fs = require("fs");
const crypto = require("crypto");

// @ts-ignore
const Api = require('./common/api.js')

const host = 'http://localhost:3123'

const fileName = "random-bytes.bin";

describe('Uploads', async function () {
    this.timeout(15000);

    const api = new Api(host)

    before(async function () {
        await api.auth()
        await api.selectCompany('TestCompany')
    })


    step('Upload small file', async function () {
        const size = 1024 * 100
        write(size)
        const res = await api.uploadFile(
            fs.createReadStream(fileName),
            "ac6c84e0-1dcc-11eb-82c8-0242ac120004", // Main (with cat face)
        )
        assert(res.id, 'File was not uploaded')
        assert(res.size == size, 'File size mismatch: ' + `${res.size} == ${size}`)
        fs.truncate(fileName, 0, () => 0)
    })

    step('Upload big file', function () {
        const size = 1024 * 1024 * 51
        write(size)
        assert.rejects(async function () {
            await api.uploadFile(
                fs.createReadStream(fileName),
                "ac6c84e0-1dcc-11eb-82c8-0242ac120004", // Main (with cat face)
            ), "Shouldn't upload more then 50M bytes"
        })
    })

    after(async function () {
        fs.unlink(fileName, () => 0)
    })


});


function write(size) {
    fs.open(fileName, 'w', function (_, fd) {
        const buffer = crypto.randomBytes(size);
        fs.write(
            fd,
            buffer,
            0,
            buffer.length,
            null,
            (_e, _written, _b) => 0
        )
    })
}
