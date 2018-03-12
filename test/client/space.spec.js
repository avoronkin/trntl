const Client = require('../../lib/Client')
const assert = require('assert')
const { TARANTOOL_HOST:host = 'localhost', TARANTOOL_PORT:port = 3301 } = process.env

describe('space', () => {
    let client

    beforeEach(async () => {
        client = new Client({ host, port})
        await client.connect()
    })

    afterEach(async () => {
        await client.close()
    })

    it ('should select', async () => {
        const id = 495
        const [res] = await client.space('test').select('primary', 'eq', id)

        assert.deepEqual(res, [id, 'created'])
    })


})
