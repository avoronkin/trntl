const Transport = require('../../lib/transport')
const assert = require('assert')
const { TARANTOOL_HOST:host = 'localhost', TARANTOOL_PORT:port = 3301 } = process.env

describe('handshake', () => {
    let transport

    beforeEach(async () => {
        transport = new Transport()
        await transport.connect(port, host)
    })

    afterEach(async () => {
        await transport.close()
    })

    it('should handshake with server', async () => {
        assert.equal(!!transport.salt, true)
        assert.equal(!!transport.greeting, true)
    })
})
