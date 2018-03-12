const Client = require('../../lib/Client')
const assert = require('assert')
const { TARANTOOL_HOST:host = 'localhost', TARANTOOL_PORT:port = 3301 } = process.env

describe('insert', () => {
    let client

    beforeEach(async () => {
        client = new Client({ host, port})
        await client.connect()
    })

    afterEach(async () => {
        await client.close()
    })

    it('should insert', async () => {
        const id = 497
        const [spaceId, indexId] = client.getIds('test', 'primary')
        const [before] = await client.select(spaceId, indexId, 'eq', id)
        assert.deepEqual(before, undefined)

        await client.insert(spaceId, [id, 'inserted'])
        const [res] = await client.select(spaceId, indexId, 'eq', id)
        assert.deepEqual(res, [id, 'inserted'])
    })
})
