const Client = require('../../lib/Client')
const assert = require('assert')
const { TARANTOOL_HOST:host = 'localhost', TARANTOOL_PORT:port = 3301 } = process.env

describe('select', () => {
    let client

    beforeEach(async () => {
        client = new Client({ host, port})
        await client.connect()
    })

    afterEach(async () => {
        await client.close()
    })

    it('should select', async () => {
        const id = 495
        const [spaceId, indexId] = client.getIds('test', 'primary')

        const [res] = await client.select(spaceId, indexId, 'eq', id)

        assert.deepEqual(res, [id, 'created'])
    })
})
