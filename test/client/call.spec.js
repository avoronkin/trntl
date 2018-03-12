const Client = require('../../lib/Client')
const assert = require('assert')
const { TARANTOOL_HOST:host = 'localhost', TARANTOOL_PORT:port = 3301 } = process.env

describe('call', () => {
    let client

    beforeEach(async () => {
        client = new Client({ host, port})
        await client.connect()
    })

    afterEach(async () => {
        await client.close()
    })

    it('should call function', async () => {
        const [result] = await client.call('math.floor', 5.4)

        assert.equal(result, 5)
    })
})
