const Client = require('../../lib/Client')
const assert = require('assert')
const { TARANTOOL_HOST:host = 'localhost', TARANTOOL_PORT:port = 3301 } = process.env
const helpers = require('../helpers')

describe('delete', () => {
    let client, getIds

    beforeEach(async () => {
        client = new Client({ host, port })
        await client.connect()
        getIds = await helpers.loadSchema(client)
    })

    afterEach(async () => {
        await client.close()
    })

    it('should delete a tuple', async () => {
        const id = 496
        const [spaceId, indexId] = getIds('test', 'primary')

        const [before] = await client.select(spaceId, indexId, 'eq', id)
        assert.deepEqual(before, [id, 'created'])

        await client.delete(spaceId, indexId, id)
        const [deleted] = await client.select(spaceId, indexId, 'eq', id)
        assert.deepEqual(deleted, undefined)
    })
})
