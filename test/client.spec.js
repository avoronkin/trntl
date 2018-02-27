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
        console.log('res', res)

        await client.close()
    })

    it('should auth', async () => {
        const client = new Client()

        await client.connect()

        const res = await client.auth()

        console.log('res', res)

        await client.close()
    })
})
