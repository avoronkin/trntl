const Client = require('../../lib/Client')
const assert = require('assert')
const { TARANTOOL_HOST:host = 'localhost', TARANTOOL_PORT:port = 3301 } = process.env
const helpers = require('../helpers')

describe('replace', () => {
    let client, getIds

    beforeEach(async () => {
        client = new Client({ host, port})
        await client.connect()
        getIds = await helpers.loadSchema(client)
    })

    afterEach(async () => {
        await client.close()
    })

    it('should replace', async () => {
        const id = 498
        const [spaceId, indexId] = getIds('test', 'primary')
        const [before] = await client.select(spaceId, indexId, 'eq', id)
        assert.deepEqual(before, [id, 'created'])

        await client.replace(spaceId, [id, 'replaced'])
        const [replaced] = await client.select(spaceId, indexId, 'eq', id)
        assert.deepEqual(replaced, [id, 'replaced'])
    })
})
