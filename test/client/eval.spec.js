const Client = require('../../lib/Client')
const assert = require('assert')
const { TARANTOOL_HOST:host = 'localhost', TARANTOOL_PORT:port = 3301 } = process.env

describe('eval', () => {
    let client

    beforeEach(async () => {
        client = new Client({ host, port})
        await client.connect()
    })

    afterEach(async () => {
        await client.close()
    })

    it('should evaulate lua expression', async () => {
        const [res] = await client.eval('local json = require("json"); return json.decode("[123, 234, 345]")')

        assert.deepEqual(res, [123, 234, 345])
    })

    it('should evaulate lua expression with params', async () => {
        const [res] = await client.eval('local json = require("json"); return json.decode(...)', '[123, 234, 345]')

        assert.deepEqual(res, [123, 234, 345])
    })
})
