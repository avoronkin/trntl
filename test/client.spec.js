const Client = require('../lib/Client')
const assert = require('assert')

describe('client', () => {
    it('should handshake with server', async () => {
        const client = new Client()

        await client.connect()

        assert.equal(!!client.salt, true)
        assert.equal(!!client.greeting, true)

        await client.close()
    })

    it('should ping', async () => {
        const client = new Client()

        await client.connect()

        const res = await client.ping()
        assert.equal(res.head[0], 0)
        assert.equal(res.head[5], 74)

        const res2 = await client.ping()
        assert.equal(res2.head[0], 0)
        assert.equal(res2.head[5], 74)

        const res3 = await client.ping()
        assert.equal(res3.head[0], 0)
        assert.equal(res3.head[5], 74)

        await client.close()
    })
})
