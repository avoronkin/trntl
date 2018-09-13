const Client = require('../../lib/Client')
const assert = require('assert')
const { TARANTOOL_HOST:host = 'localhost', TARANTOOL_PORT:port = 3301 } = process.env
const helpers = require('../helpers')

describe('insert', () => {
    let client, getIds

    beforeEach(async () => {
        client = new Client({ host, port})
        await client.connect()
        getIds = await helpers.loadSchema(client)
    })

    afterEach(async () => {
        await client.close()
    })

    it('should insert', async () => {
        const id = 497
        const [spaceId, indexId] = getIds('test', 'primary')
        const [before] = await client.select(spaceId, indexId, 'eq', id)
        assert.deepEqual(before, undefined)

        await client.insert(spaceId, [id, 'inserted'])
        const [res] = await client.select(spaceId, indexId, 'eq', id)
        assert.deepEqual(res, [id, 'inserted'])
    })
})
