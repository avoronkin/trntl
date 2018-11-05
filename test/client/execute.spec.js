const Client = require('../../lib/Client')
const assert = require('assert')
const { TARANTOOL_HOST:host = 'localhost', TARANTOOL_PORT:port = 3301 } = process.env

describe.skip('execute', () => {
    let client

    beforeEach(async () => {
        client = new Client({ host, port})
        await client.connect()
    })

    afterEach(async () => {
        await client.close()
    })

    it('should execute sql', async () => {
        await client.execute('DROP TABLE IF EXISTS table1')

        const result1 = await client.execute('CREATE TABLE IF NOT EXISTS table1 (column1 INTEGER PRIMARY KEY, column2 VARCHAR(100))')
        // console.log('result1', result1)
        // assert.deepEqual(result1, { info: { row_count: 1 } })

        const result2 = await client.execute('INSERT INTO table1 VALUES (1, \'A\')')
        // assert.deepEqual(result2, { info: { row_count: 1 } })

        const result3 = await client.execute('UPDATE table1 SET column2 = \'B\'')
        // console.log('result3', result3)
        // assert.deepEqual(result3, { info: { row_count: 1 } })

        const result4 = await client.execute('SELECT * FROM table1 WHERE column1 = 1')
        assert.deepEqual(result4, {
            data: [ [ 1, 'B' ] ],
            metadata: [ { fieldName: 'COLUMN1' }, { fieldName: 'COLUMN2' } ]
        })
    })
})
