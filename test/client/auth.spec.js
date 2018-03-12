const Client = require('../../lib/Client')
const assert = require('assert')
const { TARANTOOL_HOST:host = 'localhost', TARANTOOL_PORT:port = 3301 } = process.env

describe('auth', () => {
    let client

    before(async () => {
        client = new Client({ host, port})
        await client.connect()
    })

    after(async () => {
        await client.close()
    })

    it('should auth user by login and password', async () => {
        await client.auth('test', 'pass')
    })

    it('should auth guest user', async () => {
        await client.auth('guest')
    })

    it('should throw error when password is incorrect', async () => {
        try {
            await client.auth('test', 'wrong')
        }
        catch (error) {
            assert(error)
        }
    })

    it('should throw error when user does not exist', async () => {
        try {
            await client.auth('wrong', 'pass')
        }
        catch (error) {
            assert(error)
        }
    })
})
