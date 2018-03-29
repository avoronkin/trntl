const msgpack = require('msgpack-lite')
const { IPROTO } = require('../../constants')
const BufferMaker = require('../BufferMaker')

module.exports = function (expession, ...args) {
    const body = new BufferMaker()

    body
        .uint8(0x82)

        .uint8(IPROTO.EXPR)
        .buffer(msgpack.encode(expession))

        .uint8(IPROTO.TUPLE)
        .buffer(msgpack.encode(args))

    return body.create()
}
