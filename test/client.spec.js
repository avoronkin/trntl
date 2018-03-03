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

        await client.ping()

        await client.close()
    })

    describe('eval', () => {

        it('should eval1', async () => {
            const client = new Client()

            await client.connect()

            const [res] = await client.eval('return box.cfg')

            assert.equal(Object.keys(res).indexOf('pid_file') !== -1, true)

            await client.close()
        })

        it('should eval2', async () => {
            const client = new Client()

            await client.connect()

            const [res] = await client.eval('local json = require("json"); return json.decode("[123, 234, 345]")')

            assert.deepEqual(res, [123, 234, 345])

            await client.close()
        })

        it('should eval3', async () => {
            const client = new Client()

            await client.connect()

            const [res] = await client.eval('local json = require("json"); return json.decode(...)', '[123, 234, 345]')

            assert.deepEqual(res, [123, 234, 345])

            await client.close()
        })

        it('should eval4', async () => {
            const client = new Client()

            await client.connect()

            const commands = [
                's = box.schema.space.create(\'tester\', {if_not_exists = true})',
                `s:create_index('primary', {
                    type = 'hash',
                    parts = {1, 'unsigned'},
                    if_not_exists = true
                })`,
                's:truncate()',
                's:insert({1, \'Roxette\'})',
                's:insert({2, \'Scorpions\', 2015})',
                's:insert({3, \'Ace of Base\', 1993})',
                `s:create_index('secondary', {
                    type = 'hash',
                    parts = {2, 'string'},
                    if_not_exists = true
                })`

            ].join('\n')

            const res = await client.eval(commands)

            console.log('res', res)

            await client.close()
        })
    })

    describe('call', () => {
        it('should call1', async () => {
            const client = new Client()

            await client.connect()

            const [res] = await client.call('math.floor', 5.4)

            assert.equal(res, 5)

            await client.close()
        })
    })

    describe('select', () => {
        it('should select', async () => {
            const client = new Client()

            await client.connect()

            const [spaceId, indexId] = client.getIds('tester', 'primary')
            const [res] = await client.select(spaceId, indexId, 'eq', 1)

            assert.deepEqual(res, [1, 'Roxette'])

            await client.close()
        })
    })

    describe('delete', () => {
        it('should delete', async () => {
            const client = new Client()

            await client.connect()

            const [spaceId, indexId] = client.getIds('tester', 'primary')
            const [res] = await client.delete(spaceId, indexId, 2)

            assert.deepEqual(res, [2, 'Scorpions', 2015])

            await client.close()
        })
    })


    it.skip('should auth', async () => {
        const client = new Client()

        await client.connect()

        const res = await client.auth()

        console.log('res', res)

        await client.close()
    })
})
