const Client = require('../lib/Client')
const assert = require('assert')
const { TARANTOOL_HOST:host = 'localhost', TARANTOOL_PORT:port = 3301 } = process.env

describe('client', () => {

    it('should handshake with server', async () => {
        const client = new Client({ host, port})
        await client.connect()

        assert.equal(!!client.salt, true)
        assert.equal(!!client.greeting, true)

        await client.close()
    })

    it('should ping', async () => {
        const client = new Client({ host, port})
        await client.connect()

        await client.ping()

        await client.close()
    })

    describe('eval', () => {

        it('should eval1', async () => {
            const client = new Client({ host, port})
            await client.connect()

            const [res] = await client.eval('return box.cfg')

            assert.equal(Object.keys(res).indexOf('pid_file') !== -1, true)

            await client.close()
        })

        it('should eval2', async () => {
            const client = new Client({ host, port})
            await client.connect()

            const [res] = await client.eval('local json = require("json"); return json.decode("[123, 234, 345]")')

            assert.deepEqual(res, [123, 234, 345])

            await client.close()
        })

        it('should eval3', async () => {
            const client = new Client({ host, port})
            await client.connect()

            const [res] = await client.eval('local json = require("json"); return json.decode(...)', '[123, 234, 345]')

            assert.deepEqual(res, [123, 234, 345])

            await client.close()
        })
    })

    describe('call', () => {
        it('should call1', async () => {
            const client = new Client({ host, port})
            await client.connect()

            const [result] = await client.call('math.floor', 5.4)

            assert.equal(result, 5)

            await client.close()
        })
    })

    describe('select', () => {
        it('should select', async () => {
            const client = new Client({ host, port})
            await client.connect()

            const id = 495
            const [spaceId, indexId] = client.getIds('test', 'primary')

            const [res] = await client.select(spaceId, indexId, 'eq', id)

            assert.deepEqual(res, [id, 'created'])

            await client.close()
        })
    })

    describe('delete', () => {
        it('should delete', async () => {
            const client = new Client({ host, port})
            await client.connect()

            const id = 496
            const [spaceId, indexId] = client.getIds('test', 'primary')

            const [before] = await client.select(spaceId, indexId, 'eq', id)
            assert.deepEqual(before, [id, 'created'])

            await client.delete(spaceId, indexId, id)
            const [deleted] = await client.select(spaceId, indexId, 'eq', id)
            assert.deepEqual(deleted, undefined)

            await client.close()
        })
    })

    describe('insert', () => {
        it('should insert', async () => {
            const client = new Client({ host, port})
            await client.connect()

            const id = 497
            const [spaceId, indexId] = client.getIds('test', 'primary')
            const [before] = await client.select(spaceId, indexId, 'eq', id)
            assert.deepEqual(before, undefined)

            await client.insert(spaceId, [id, 'inserted'])
            const [res] = await client.select(spaceId, indexId, 'eq', id)
            assert.deepEqual(res, [id, 'inserted'])

            await client.close()
        })
    })

    describe('replace', () => {
        it('should replace', async () => {
            const client = new Client({ host, port})
            await client.connect()

            const id = 498
            const [spaceId, indexId] = client.getIds('test', 'primary')
            const [before] = await client.select(spaceId, indexId, 'eq', id)
            assert.deepEqual(before, [id, 'created'])

            await client.replace(spaceId, [id, 'replaced'])
            const [replaced] = await client.select(spaceId, indexId, 'eq', id)
            assert.deepEqual(replaced, [id, 'replaced'])

            await client.close()
        })
    })

    describe('update', () => {
        it('should update', async () => {
            const client = new Client({ host, port})
            await client.connect()

            const id = 499
            const [spaceId, indexId] = client.getIds('test', 'primary')
            const [before] = await client.select(spaceId, indexId, 'eq', id)
            assert.deepEqual(before, [id, 'created'])

            await client.update(spaceId, indexId, [id], [['=', 1, 'updated']])
            const [updated] = await client.select(spaceId, indexId, 'eq', id)
            assert.deepEqual(updated, [id, 'updated'])

            await client.close()
        })
    })

    describe('upsert', () => {
        it('should upsert', async () => {
            const client = new Client({ host, port})
            await client.connect()

            const id = 500
            const [spaceId, indexId] = client.getIds('test', 'primary')

            await client.upsert(spaceId, indexId, [id, 'hello, world', 123], [[':', 1, 2, 3, '---']])
            const [inserted] = await client.select(spaceId, indexId, 'eq', id)
            assert.deepEqual(inserted, [id, 'hello, world', 123])

            await client.upsert(spaceId, indexId, [id, 'hello, world', 123], [[':', 1, 2, 3, '---']])
            const [updated] = await client.select(spaceId, indexId, 'eq', id)
            assert.deepEqual(updated, [id, 'he---, world', 123])

            await client.close()
        })
    })


    it('should auth', async () => {
        const client = new Client({ host, port})

        await client.connect()

        await client.auth('test', 'pass')

        await client.close()
    })

    describe('execute', () => {
        it('should execute sql', async () => {
            const client = new Client({ host, port})
            await client.connect()

            await client.execute('DROP TABLE IF EXISTS table1')

            const result1 = await client.execute('CREATE TABLE IF NOT EXISTS table1 (column1 INTEGER PRIMARY KEY, column2 VARCHAR(100))')
            assert.deepEqual(result1, { info: { row_count: 1 } })

            const result2 = await client.execute('INSERT INTO table1 VALUES (1, \'A\')')
            assert.deepEqual(result2, { info: { row_count: 1 } })

            const result3 = await client.execute('UPDATE table1 SET column2 = \'B\'')
            assert.deepEqual(result3, { info: { row_count: 1 } })

            const result4 = await client.execute('SELECT * FROM table1 WHERE column1 = 1')
            assert.deepEqual(result4, {
                data: [ [ 1, 'B' ] ],
                metadata: [ { fieldName: 'column1' }, { fieldName: 'column2' } ]
            })

            await client.close()
        })
    })

    describe('space', () => {
        it ('should select', async () => {
            const client = new Client({ host, port})
            await client.connect()

            const id = 495
            const [res] = await client.space('test').select('primary', 'eq', id)

            assert.deepEqual(res, [id, 'created'])

            await client.close()
        })

        
    })
})
