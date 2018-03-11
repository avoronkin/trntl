const msgpack = require('msgpack-lite')
const { IPROTO } = require('../../constants')
const BufferMaker = require('../BufferMaker')

module.exports = function (sql, params = []) {
    const writer = new BufferMaker()

    const body = writer
        .uint8(0x82)

        .uint8(IPROTO.SQL_TEXT)
        .buffer(msgpack.encode(sql))

        .uint8(IPROTO.SQL_BIND)
        .buffer(msgpack.encode(params))

        .create()

    return body
}
