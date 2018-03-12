const Client = require('../../lib/Client')
const assert = require('assert')
const { TARANTOOL_HOST:host = 'localhost', TARANTOOL_PORT:port = 3301 } = process.env

describe('update', () => {
    let client

    beforeEach(async () => {
        client = new Client({ host, port})
        await client.connect()
    })

    afterEach(async () => {
        await client.close()
    })

    it('should update', async () => {
        const id = 499
        const [spaceId, indexId] = client.getIds('test', 'primary')
        const [before] = await client.select(spaceId, indexId, 'eq', id)
        assert.deepEqual(before, [id, 'created'])

        await client.update(spaceId, indexId, [id], [['=', 1, 'updated']])
        const [updated] = await client.select(spaceId, indexId, 'eq', id)
        assert.deepEqual(updated, [id, 'updated'])
    })
})
