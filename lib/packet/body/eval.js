const msgpack = require('msgpack-lite')
const { IPROTO } = require('../../constants')
const BufferMaker = require('../BufferMaker')

module.exports = function (expession, ...args) {
    const writer = new BufferMaker()

    const body = writer
        .uint8(0x82)

        .uint8(IPROTO.EXPR)
        .buffer(msgpack.encode(expession))

        .uint8(IPROTO.TUPLE)
        .buffer(msgpack.encode(args))

        .create()

    return body
}
