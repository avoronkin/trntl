const msgpack = require('msgpack-lite')
const { IPROTO } = require('../../constants')
const BufferMaker = require('../BufferMaker')

module.exports = function (sql, params = []) {
    const body = new BufferMaker()

    body
        .uint8(0x82)

        .uint8(IPROTO.SQL_TEXT)
        .buffer(msgpack.encode(sql))

        .uint8(IPROTO.SQL_BIND)
        .buffer(msgpack.encode(params))

    return body.create()
}
