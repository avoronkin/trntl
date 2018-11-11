const Protocol = require('../../lib/protocol')
const assert = require('assert')
const { TARANTOOL_HOST:host = 'localhost', TARANTOOL_PORT:port = 3301 } = process.env

describe('handshake', () => {
    let protocol

    beforeEach(async () => {
        protocol = new Protocol()
        await protocol.connect(port, host)
    })

    afterEach(async () => {
        await protocol.close()
    })

    it('should handshake with server', async () => {
        assert.equal(!!protocol.salt, true)
        assert.equal(!!protocol.greeting, true)
    })
})
