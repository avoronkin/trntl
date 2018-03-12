const Client = require('../../lib/Client')
// const assert = require('assert')
const { TARANTOOL_HOST:host = 'localhost', TARANTOOL_PORT:port = 3301 } = process.env

describe('ping', () => {
    let client

    beforeEach(async () => {
        client = new Client({ host, port})
        await client.connect()
    })

    afterEach(async () => {
        await client.close()
    })

    it('should ping', async () => {
        await client.ping()
    })
})
