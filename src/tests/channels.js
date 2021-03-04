'use strict'



// test('channels', async t => {
//
//     const request = new Request(t)
//
//     await auth()
//
//     t.test('getting public channels', async t=>{
//
//         const res = await request.get('/channels', {company_id:1})
//         console.log(res)
//         // t.strictEqual(response.status, 200, 'returns a status code of 200')
//         // const res = await response.json()
//         // console.log(res)
//     })
//
//
// })

var assert = require('assert');
describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
    });
});