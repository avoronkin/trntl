const Client = require('../../lib/Client')
const assert = require('assert')
const { TARANTOOL_HOST:host = 'localhost', TARANTOOL_PORT:port = 3301 } = process.env

describe('upsert', () => {
    let client

    beforeEach(async () => {
        client = new Client({ host, port})
        await client.connect()
    })

    afterEach(async () => {
        await client.close()
    })

    it('should upsert', async () => {
        const id = 500
        const [spaceId, indexId] = client.getIds('test', 'primary')

        await client.upsert(spaceId, indexId, [id, 'hello, world', 123], [[':', 1, 2, 3, '---']])
        const [inserted] = await client.select(spaceId, indexId, 'eq', id)
        assert.deepEqual(inserted, [id, 'hello, world', 123])

        await client.upsert(spaceId, indexId, [id, 'hello, world', 123], [[':', 1, 2, 3, '---']])
        const [updated] = await client.select(spaceId, indexId, 'eq', id)
        assert.deepEqual(updated, [id, 'he---, world', 123])
    })
})
