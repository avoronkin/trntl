const Client = require('../../lib/Client')
const assert = require('assert')
const { TARANTOOL_HOST:host = 'localhost', TARANTOOL_PORT:port = 3301 } = process.env
const helpers = require('../helpers')

describe('select', () => {
    let client, getIds

    beforeEach(async () => {
        client = new Client({ host, port})
        await client.connect()
        getIds = await helpers.loadSchema(client)
    })

    afterEach(async () => {
        await client.close()
    })

    it('should select', async () => {
        const id = 495
        const [spaceId, indexId] = getIds('test', 'primary')

        const [res] = await client.select(spaceId, indexId, 'eq', id)

        assert.deepEqual(res, [id, 'created'])
    })
})
